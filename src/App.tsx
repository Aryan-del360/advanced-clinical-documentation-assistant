import React, { useState, useEffect, useRef } from 'react';
import { SoapNote } from './types';
import { Header } from './components/Header';
import { TranscriptInput } from './components/TranscriptInput';
import { SoapNoteDisplay } from './components/SoapNoteDisplay';
import { Footer } from './components/Footer';
import { generateSoapNote } from './services/geminiService';

// Define types for the Web Speech API to prevent TypeScript errors.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  // FIX: Add missing 'resultIndex' property
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
}

declare let window: Window;


const exampleSoapNote: SoapNote = {
  subjective: {
    chiefComplaint: "Fever and dry cough for 3 days.",
    historyOfPresentIllness: "Patient is a 35-year-old male who presents with a fever of 102°F for the past three days, accompanied by a dry cough and generalized body aches.",
    pastMedicalHistory: ["Hypertension (HTN)"],
    medications: ["Lisinopril"],
    allergies: ["No known allergies"],
  },
  objective: {
    vitalSigns: "BP 120/80 mmHg, HR 88 bpm, RR 20 breaths/min, SpO2 98% on room air, Temp 102°F.",
    physicalExamination: "Throat is red and inflamed. Lungs are clear to auscultation bilaterally.",
    labResults: [],
  },
  assessment: {
    primaryDiagnosis: "Acute Viral Upper Respiratory Infection (URI)",
    differentialDiagnoses: ["Streptococcal Pharyngitis", "Influenza"],
    icd10Codes: [
      { code: "J06.9", description: "Acute upper respiratory infection, unspecified" }
    ],
  },
  plan: {
    treatmentPlan: "Supportive care including rest and hydration.",
    medications: [
      {
        name: "Acetaminophen",
        dosage: "650 mg PO q4-6h PRN for fever and body aches",
        duration: "As needed",
        dosageValidation: "Standard adult dosage for PRN use."
      }
    ],
    medicationInteractions: [],
    contraindicationWarnings: [],
    referralSuggestions: [],
    followUp: "Follow up in 2-3 days if symptoms worsen or do not improve. Seek immediate care for difficulty breathing.",
    patientEducation: ["Encouraged hydration and rest.", "Advised on monitoring temperature.", "Explained signs/symptoms that warrant immediate medical attention."],
  },
};

const exampleTranscript = "Patient is a 35-year-old male, presenting with a fever of 102°F for the past 3 days, accompanied by a dry cough and body aches. He reports no known allergies. Vitals are BP 120/80, HR 88, RR 20, SpO2 98%. On examination, his throat appears red and inflamed. He is currently taking lisinopril for hypertension and no other medications. My assessment is a likely acute viral URI, but I need to rule out strep. The plan is supportive care, recommending acetaminophen as needed for fever and aches. He should follow up in 2-3 days if his symptoms worsen.";


const App: React.FC = () => {
  const [transcript, setTranscript] = useState<string>(exampleTranscript);
  const [soapNote, setSoapNote] = useState<SoapNote | null>(exampleSoapNote);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState<boolean>(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Defer speech recognition setup to prevent blocking initial render
    setTimeout(() => {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                console.warn("Speech recognition not supported in this browser.");
                setIsSpeechRecognitionSupported(false);
                return;
            }
            setIsSpeechRecognitionSupported(true);

            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                  setTranscript(prev => prev.trim() ? `${prev.trim()} ${finalTranscript}` : finalTranscript);
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error:', event.error);
                setError(`Speech recognition error: ${event.error}`);
                setIsRecording(false);
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        } catch(err) {
            console.error("Error setting up speech recognition:", err);
            setError("Could not initialize speech recognition.");
            setIsSpeechRecognitionSupported(false);
        }
    }, 0);
  }, []);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setSoapNote(null);
      setError(null);
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };
  
  const handleGenerate = async () => {
    if (!transcript.trim()) {
      setError('Please enter a transcript or record a conversation.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSoapNote(null);
    
    try {
      const note = await generateSoapNote(transcript);
      setSoapNote(note);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unknown error occurred while generating the note.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setTranscript('');
    setSoapNote(null);
    setError(null);
    if(isRecording) {
        handleToggleRecording();
    }
  };

  const handleUseExample = () => {
    if (isRecording) {
      handleToggleRecording();
    }
    setTranscript(exampleTranscript);
    setSoapNote(exampleSoapNote);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          <TranscriptInput
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onSubmit={handleGenerate}
            onClear={handleClear}
            onUseExample={handleUseExample}
            onToggleRecording={handleToggleRecording}
            isLoading={isLoading}
            isRecording={isRecording}
            isSpeechRecognitionSupported={isSpeechRecognitionSupported}
          />
          <SoapNoteDisplay note={soapNote} isLoading={isLoading} error={error} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
