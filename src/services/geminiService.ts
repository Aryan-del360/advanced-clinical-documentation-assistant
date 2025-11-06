import { GoogleGenAI, Type } from '@google/genai';
import { SoapNote } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    subjective: {
      type: Type.OBJECT,
      properties: {
        chiefComplaint: { type: Type.STRING },
        historyOfPresentIllness: { type: Type.STRING },
        pastMedicalHistory: { type: Type.ARRAY, items: { type: Type.STRING } },
        medications: { type: Type.ARRAY, items: { type: Type.STRING } },
        allergies: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['chiefComplaint', 'historyOfPresentIllness', 'pastMedicalHistory', 'medications', 'allergies'],
    },
    objective: {
      type: Type.OBJECT,
      properties: {
        vitalSigns: { type: Type.STRING },
        physicalExamination: { type: Type.STRING },
        labResults: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
       required: ['vitalSigns', 'physicalExamination', 'labResults'],
    },
    assessment: {
      type: Type.OBJECT,
      properties: {
        primaryDiagnosis: { type: Type.STRING },
        differentialDiagnoses: { type: Type.ARRAY, items: { type: Type.STRING } },
        icd10Codes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              code: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ['code', 'description'],
          },
        },
      },
      required: ['primaryDiagnosis', 'differentialDiagnoses', 'icd10Codes'],
    },
    plan: {
      type: Type.OBJECT,
      properties: {
        treatmentPlan: { type: Type.STRING },
        medications: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              dosage: { type: Type.STRING },
              duration: { type: Type.STRING },
              dosageValidation: { type: Type.STRING, description: "Validate if the dosage is appropriate, standard, too high, or too low." },
            },
             required: ['name', 'dosage', 'duration'],
          },
        },
        medicationInteractions: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                medicationsInvolved: { type: Type.ARRAY, items: { type: Type.STRING }},
                warning: { type: Type.STRING }
             },
             required: ['medicationsInvolved', 'warning']
          }
        },
        contraindicationWarnings: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        referralSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        followUp: { type: Type.STRING },
        patientEducation: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      // FIX: Ensure all items in the 'required' array are strings.
      required: ['treatmentPlan', 'medications', 'medicationInteractions', 'contraindicationWarnings', 'referralSuggestions', 'followUp', 'patientEducation'],
    },
  },
  required: ['subjective', 'objective', 'assessment', 'plan'],
};

const systemInstruction = `You are an advanced, AI-powered Clinical Documentation Assistant. Your task is to process a raw clinical transcript and generate a structured, accurate, and clinically validated SOAP note in JSON format.
You operate as a multi-agent clinical engine:
1.  **Input Parser:** Meticulously extract all relevant information: chief complaint, history of present illness (HPI), vital signs, physical exam findings, past medical history, current medications, and allergies.
2.  **SOAP Generator:** Organize the extracted information into the four sections of a SOAP note (Subjective, Objective, Assessment, Plan) with clinical coherence.
3.  **Clinical Validator:** This is your most critical function.
    -   Suggest relevant ICD-10 codes for the diagnoses.
    -   For all proposed medications in the plan, perform a \`dosageValidation\`. State if the dosage is standard, appropriate, high, or low.
    -   Cross-reference all patient medications (existing and newly prescribed) to identify and report potential \`medicationInteractions\`.
    -   Check for any \`contraindicationWarnings\` based on the patient's medical history and the proposed treatment.
4.  **Output Formatter:** Ensure the final output is a single, valid JSON object that strictly adheres to the provided schema. Do not include any explanatory text, markdown formatting, or code fences.
Your output must be only the JSON object.`;

export const generateSoapNote = async (transcript: string): Promise<SoapNote> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: transcript,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedNote = JSON.parse(jsonText);
        
        return parsedNote as SoapNote;

    } catch (error) {
        console.error("Error generating SOAP note from Gemini:", error);
        throw new Error("Failed to parse the response from the AI model.");
    }
};
