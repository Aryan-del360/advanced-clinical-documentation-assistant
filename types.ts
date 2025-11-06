export interface SoapNote {
  subjective: SubjectiveSection;
  objective: ObjectiveSection;
  assessment: AssessmentSection;
  plan: PlanSection;
}

export interface SubjectiveSection {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string[];
  medications: string[];
  allergies: string[];
}

export interface ObjectiveSection {
  vitalSigns: string;
  physicalExamination: string;
  labResults: string[];
}

export interface Icd10Code {
  code: string;
  description: string;
}

export interface AssessmentSection {
  primaryDiagnosis: string;
  differentialDiagnoses: string[];
  icd10Codes: Icd10Code[];
}

export interface PlanMedication {
  name: string;
  dosage: string;
  duration: string;
  dosageValidation?: string;
}

export interface MedicationInteraction {
    medicationsInvolved: string[];
    warning: string;
}

export interface PlanSection {
  treatmentPlan: string;
  medications: PlanMedication[];
  medicationInteractions: MedicationInteraction[];
  contraindicationWarnings: string[];
  referralSuggestions: string[];
  followUp: string;
  patientEducation: string[];
}