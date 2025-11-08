import React, { useCallback, useRef, useState } from 'react';
import { ClipboardIcon, PdfIcon, WarningIcon } from './icons';
import { SoapNote, PlanMedication, Icd10Code } from '../types';

interface SoapNoteDisplayProps {
  note: SoapNote | null;
  isLoading: boolean;
  error: string | null;
}

type View = 'formatted' | 'json';

const SectionCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
  <div className={`bg-white p-5 rounded-xl border border-slate-100 shadow-sm ${className}`}>
    <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-700 mb-3">{title}</h3>
    <div className="text-sm text-slate-700 space-y-2">{children}</div>
  </div>
);

const KeyValue: React.FC<{ k: string; v: React.ReactNode }> = ({ k, v }) => (
  <div className="grid grid-cols-4 gap-x-4">
    <div className="text-slate-600 font-medium col-span-1">{k}</div>
    <div className="col-span-3 text-slate-700">{v}</div>
  </div>
);

export const SoapNoteDisplay: React.FC<SoapNoteDisplayProps> = ({ note, isLoading, error }) => {
  const [view, setView] = useState<View>('formatted');
  const formattedRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!note) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(note, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  }, [note]);

  const handleExportPdf = useCallback(async () => {
    if (!formattedRef.current) return;
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
      const canvas = await html2canvas(formattedRef.current as HTMLElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('soap-note.pdf');
    } catch (e) {
      console.error('Export PDF failed', e);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex items-center justify-center h-full">
        <div className="text-slate-600">Generating SOAP note…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <WarningIcon className="h-6 w-6 text-rose-700" />
          <div>
            <div className="font-semibold">Error</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex items-center justify-center h-full text-slate-500">
        No SOAP note generated yet. Enter a transcript and click "Generate".
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">SOAP Note</h2>
          <p className="text-sm text-slate-500">Structured output generated from the transcript</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setView(view === 'formatted' ? 'json' : 'formatted')} className="px-3 py-1 rounded-md text-sm bg-slate-50 border">
            {view === 'formatted' ? 'View JSON' : 'View Formatted'}
          </button>

          <button onClick={handleCopy} className="px-3 py-1 rounded-md text-sm bg-slate-50 border flex items-center gap-2">
            <ClipboardIcon className="h-4 w-4" /> {copied ? 'Copied' : 'Copy'}
          </button>

          <button onClick={handleExportPdf} className="px-3 py-1 rounded-md text-sm bg-slate-50 border flex items-center gap-2">
            <PdfIcon className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {view === 'json' ? (
        <pre className="bg-slate-50 p-4 rounded-md overflow-auto text-sm text-slate-700" style={{ maxHeight: 480 }}>{JSON.stringify(note, null, 2)}</pre>
      ) : (
        <div ref={formattedRef} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="S: Subjective">
              <KeyValue k="Chief complaint" v={note.subjective.chiefComplaint || '—'} />
              <KeyValue k="History" v={note.subjective.historyOfPresentIllness || '—'} />
              <KeyValue k="Past medical" v={(note.subjective.pastMedicalHistory || []).join(', ') || '—'} />
              <KeyValue k="Medications" v={(note.subjective.medications || []).join(', ') || '—'} />
              <KeyValue k="Allergies" v={(note.subjective.allergies || []).join(', ') || '—'} />
            </SectionCard>

            <SectionCard title="O: Objective">
              <KeyValue k="Vitals" v={note.objective.vitalSigns || '—'} />
              <KeyValue k="Exam" v={note.objective.physicalExamination || '—'} />
              <KeyValue k="Labs" v={(note.objective.labResults || []).join('; ') || '—'} />
            </SectionCard>
          </div>

          <SectionCard title="A: Assessment">
            <KeyValue k="Primary diagnosis" v={note.assessment.primaryDiagnosis || '—'} />
            <KeyValue k="Differential" v={(note.assessment.differentialDiagnoses || []).join(', ') || '—'} />
            <div className="mt-2">
              <div className="text-sm font-medium text-slate-600 mb-2">ICD-10</div>
              <div className="space-y-2">
                {(note.assessment.icd10Codes || []).map((c, i) => (
                  <div key={i} className="text-sm text-slate-700">{c.code} — {c.description}</div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="P: Plan">
            <KeyValue k="Treatment" v={note.plan.treatmentPlan || '—'} />
            <div className="mt-2">
              <div className="text-sm font-medium text-slate-600 mb-2">Medications</div>
              <div className="space-y-2">
                {(note.plan.medications || []).map((m, i) => (
                  <div key={i} className="text-sm text-slate-700">{m.name} — {m.dosage} for {m.duration}</div>
                ))}
              </div>
            </div>

            {note.plan.medicationInteractions && note.plan.medicationInteractions.length > 0 && (
              <div className="mt-3 bg-amber-50 p-3 rounded-md border border-amber-100">
                <div className="text-sm font-semibold text-amber-800">Medication interactions / warnings</div>
                <ul className="mt-2 list-disc list-inside text-sm text-amber-800">
                  {note.plan.medicationInteractions.map((m, i) => (
                    <li key={i}>{m.warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {note.plan.contraindicationWarnings && note.plan.contraindicationWarnings.length > 0 && (
              <div className="mt-3 bg-rose-50 p-3 rounded-md border border-rose-100">
                <div className="text-sm font-semibold text-rose-800">Contraindication warnings</div>
                <ul className="mt-2 list-disc list-inside text-sm text-rose-800">
                  {note.plan.contraindicationWarnings.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
};