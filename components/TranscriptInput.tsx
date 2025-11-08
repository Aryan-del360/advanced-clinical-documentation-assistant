import React from 'react';
import { DocumentIcon, MicrophoneIcon, ClearIcon } from './icons';
import type { SoapNote } from '../types';

interface TranscriptInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onClear: () => void;
  onUseExample: () => void;
  onToggleRecording: () => void;
  isLoading: boolean;
  isRecording: boolean;
  isSpeechRecognitionSupported: boolean;
}

export const TranscriptInput: React.FC<TranscriptInputProps> = ({
  value,
  onChange,
  onSubmit,
  onClear,
  onUseExample,
  onToggleRecording,
  isLoading,
  isRecording,
  isSpeechRecognitionSupported,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-700">Consultation Input</h2>
          <p className="text-sm text-slate-500">Paste transcript or record a live consultation. We keep keys on the server.</p>
        </div>
        <div className="text-sm text-slate-400">Tip: use example to see output</div>
      </div>

      <div className="flex-grow flex flex-col">
        <label htmlFor="transcript" className="sr-only">Consultation transcript</label>
        <textarea
          id="transcript"
          aria-label="Consultation transcript"
          value={value}
          onChange={onChange}
          placeholder="Paste consultation text, or use the microphone to transcribe a conversation..."
          className="w-full flex-grow p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow duration-200 resize-none min-h-[260px] lg:min-h-[360px] h-full placeholder:text-slate-400"
          disabled={isLoading || isRecording}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="col-span-1 sm:col-span-2">
          <button
            onClick={onSubmit}
            disabled={isLoading || !value || isRecording}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            aria-label="Generate SOAP note"
          >
            {isLoading ? 'Generating…' : 'Generate SOAP Note'}
          </button>
        </div>

        <div className="col-span-1 flex gap-2 items-center">
          {isSpeechRecognitionSupported && (
            <button
              onClick={onToggleRecording}
              className={`inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                isRecording ? 'bg-rose-500 text-white border-rose-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              aria-pressed={isRecording}
            >
              <MicrophoneIcon className="h-5 w-5" />
              {isRecording ? 'Stop' : 'Record'}
            </button>
          )}

          <button
            onClick={onUseExample}
            disabled={isLoading || isRecording}
            className="inline-flex items-center justify-center px-4 py-3 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <DocumentIcon className="h-5 w-5 mr-2" />
            Example
          </button>
        </div>

        <div className="col-span-1 sm:col-span-3 flex justify-end">
          <button
            onClick={onClear}
            disabled={isLoading || (!value && !isRecording)}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ClearIcon className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};