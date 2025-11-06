import React, { useState, useCallback, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { SoapNote, PlanMedication, Icd10Code, MedicationInteraction } from '../types';
import { LoadingSpinnerIcon, ClipboardIcon, CheckIcon, WarningIcon, PdfIcon } from './icons';

interface SoapNoteDisplayProps {
  note: SoapNote | null;
  isLoading: boolean;
  error: string | null;
}

type View = 'formatted' | 'json';

const SectionCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-slate-50 p-4 rounded-lg border border-slate-200 ${className}`}>
        <h3 className="text-sm font-bold uppercase tracking-wider text-sky-700 mb-3">{title}</h3>
        <div className="space-y-3 text-sm text-slate-600">{children}</div>
    </div>
);

const InfoItem: React.FC<{ label: string; children: React.ReactNode; isList?: boolean }> = ({ label, children, isList = false }) => {
    const isEmpty = !children || (Array.isArray(children) && children.length === 0);

    if (isEmpty && isList) {
        return (
             <div className="grid grid-cols-4 gap-x-4">
                <p className="font-semibold text-slate-800 col-span-1">{label}</p>
                <p className="col-span-3 text-slate-400 italic">None</p>
            </div>
        );
    }
    if (isEmpty) {
        return (
             <div className="grid grid-cols-4 gap-x-4">
                <p className="font-semibold text-slate-800 col-span-1">{label}</p>
                <p className="col-span-3 text-slate-400 italic">Not specified</p>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-4 gap-x-4">
            <p className="font-semibold text-slate-800 col-span-1">{label}</p>
            <div className="col-span-3">{children}</div>
        </div>
    );
};

const NoteView: React.FC<{note: SoapNote}> = ({ note }) => {
    const hasInteractions = note.plan?.medicationInteractions && note.plan.medicationInteractions.length > 0;
    const hasContraindications = note.plan?.contraindicationWarnings && note.plan.contraindicationWarnings.length > 0;
    const hasAlerts = hasInteractions || hasContraindications;
    
    return (
    <div className="space-y-4">
        {hasAlerts && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="flex items-center text-sm font-bold uppercase tracking-wider text-amber-700 mb-3">
                    <WarningIcon className="h-4 w-4 mr-2" />
                    Clinical Alerts
                </h3>
                <div className="space-y-3">
                    {hasInteractions && (
                        <div className="space-y-2">
                            {note.plan.medicationInteractions.map((interaction, i) => (
                                 <div key={`interaction-${i}`} className="text-sm">
                                    <p className="font-semibold text-amber-800">Interaction: {interaction.medicationsInvolved.join(' + ')}</p>
                                    <p className="text-amber-700 ml-4">- {interaction.warning}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {hasContraindications && (
                         <div className="space-y-2">
                            {note.plan.contraindicationWarnings.map((warning, i) => (
                                <div key={`contraindication-${i}`} className="text-sm">
                                    <p className="font-semibold text-amber-800">Contraindication Warning</p>
                                    <p className="text-amber-700 ml-4">- {warning}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        <SectionCard title="S: Subjective">
            <InfoItem label="Chief Complaint">{note.subjective.chiefComplaint}</InfoItem>
            <InfoItem label="HPI">{note.subjective.historyOfPresentIllness}</InfoItem>
            <InfoItem label="Past Medical History" isList><ul>{note.subjective.pastMedicalHistory.map((item, i) => <li key={i}>- {item}</li>)}</ul></InfoItem>
            <InfoItem label="Medications" isList><ul>{note.subjective.medications.map((item, i) => <li key={i}>- {item}</li>)}</ul></InfoItem>
            <InfoItem label="Allergies" isList><ul>{note.subjective.allergies.map((item, i) => <li key={i}>- {item}</li>)}</ul></InfoItem>
        </SectionCard>

        <SectionCard title="O: Objective">
            <InfoItem label="Vital Signs">{note.objective.vitalSigns}</InfoItem>
            <InfoItem label="Physical Exam">{note.objective.physicalExamination}</InfoItem>
            <InfoItem label="Lab Results" isList><ul>{note.objective.labResults.map((item, i) => <li key={i}>- {item}</li>)}</ul></InfoItem>
        </SectionCard>

        <SectionCard title="A: Assessment">
            <InfoItem label="Primary Diagnosis">{note.assessment.primaryDiagnosis}</InfoItem>
            <InfoItem label="Differential Dx" isList><ul>{note.assessment.differentialDiagnoses.map((item, i) => <li key={i}>- {item}</li>)}</ul></InfoItem>
            <InfoItem label="ICD-10 Codes" isList>
                <ul className="space-y-1">
                    {note.assessment.icd10Codes.map((code: Icd10Code, i: number) => <li key={i}>- <strong>{code.code}:</strong> {code.description}</li>)}
                </ul>
            </InfoItem>
        </SectionCard>

        <SectionCard title="P: Plan">
            <InfoItem label="Treatment Plan">{note.plan.treatmentPlan}</InfoItem>
            <InfoItem label="Medications" isList>
                <ul className="space-y-2">
                    {note.plan.medications.map((med: PlanMedication, i: number) => (
                        <li key={i}>
                            - <strong>{med.name}</strong>: {med.dosage}, {med.duration}
                            {med.dosageValidation && <p className="text-xs text-sky-800 italic ml-4">Validation: {med.dosageValidation}</p>}
                        </li>
                    ))}
                </ul>
            </InfoItem>
            <InfoItem label="Referrals" isList><ul>{note.plan.referralSuggestions.map((item, i) => <li key={i}>- {item}</li>)}</ul></InfoItem>
            <InfoItem label="Follow-up">{note.plan.followUp}</InfoItem>
            <InfoItem label="Patient Education" isList><ul>{note.plan.patientEducation.map((item, i) => <li key={i}>- {item}</li>)}</ul></InfoItem>
        </SectionCard>
    </div>
)};


export const SoapNoteDisplay: React.FC<SoapNoteDisplayProps> = ({ note, isLoading, error }) => {
  const [view, setView] = useState<View>('formatted');
  const [copied, setCopied] = useState(false);
  const formattedNoteRef = useRef<HTMLDivElement>(null);

  const handleCopy = useCallback(() => {
    if (note) {
      navigator.clipboard.writeText(JSON.stringify(note, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [note]);

  const handleExportPdf = useCallback(() => {
    if (formattedNoteRef.current) {
        html2canvas(formattedNoteRef.current, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const ratio = imgProps.height / imgProps.width;
            const imgHeight = pdfWidth * ratio;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            pdf.save(`soap-note-${new Date().toISOString().split('T')[0]}.pdf`);
        });
    }
  }, [note]);


  const renderContent = () => {
    if (isLoading) {
      return <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-500"><LoadingSpinnerIcon className="h-8 w-8 mb-4" /> <p>Generating SOAP Note...</p><p className="text-xs mt-2">This may take a moment.</p></div>;
    }
    if (error) {
      return <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-red-600 bg-red-50 p-6 rounded-lg"><WarningIcon className="h-8 w-8 mb-4" /> <p className="font-semibold text-center">{error}</p></div>;
    }
    if (!note) {
      return <div className="flex items-center justify-center h-full min-h-[400px] text-slate-400"><p>The generated clinical note will appear here.</p></div>;
    }
    return (
      <div>
        <div className="mb-4 flex justify-between items-center border-b border-slate-200">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                <button onClick={() => setView('formatted')} className={`${view === 'formatted' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}>Formatted Note</button>
                <button onClick={() => setView('json')} className={`${view === 'json' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}>JSON Output</button>
            </nav>
            {view === 'formatted' && (
                 <button onClick={handleExportPdf} className="bg-white text-slate-700 px-3 py-1.5 rounded-md text-xs hover:bg-slate-100 border border-slate-300 flex items-center transition-colors">
                    <PdfIcon className="h-4 w-4 mr-1.5"/>
                    Export PDF
                </button>
            )}
        </div>
        {view === 'formatted' ? (
            <div ref={formattedNoteRef}>
                 <NoteView note={note} />
            </div>
        ) : (
            <div className="relative">
                <button onClick={handleCopy} className="absolute top-2 right-2 bg-slate-700 text-white px-3 py-1 rounded-md text-xs hover:bg-slate-600 flex items-center z-10">
                    {copied ? <CheckIcon className="h-4 w-4 mr-1"/> : <ClipboardIcon className="h-4 w-4 mr-1"/>}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
                <pre className="bg-slate-800 text-slate-200 p-4 rounded-lg text-xs overflow-auto max-h-[600px]">
                    <code>{JSON.stringify(note, null, 2)}</code>
                </pre>
            </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Generated Clinical Note</h2>
        <div className="min-h-[500px] flex flex-col">{renderContent()}</div>
    </div>
  );
};