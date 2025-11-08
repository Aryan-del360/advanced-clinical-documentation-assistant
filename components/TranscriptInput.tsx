import React from 'react';
import { LoadingSpinnerIcon, SparklesIcon, ClearIcon, DocumentIcon, MicrophoneIcon, StopCircleIcon } from './icons';

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
          <p className="text-sm text-slate-500">Paste transcript or record a live consultation</p>
        </div>
        <div className="text-sm text-slate-400">Tip: use example to see output</div>
      </div>

      <div className="flex-grow flex flex-col">
          <textarea
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
              >
                  {isLoading ? <LoadingSpinnerIcon className="h-5 w-5 mr-2" /> : <SparklesIcon className="h-5 w-5 mr-2" />}
                  {isLoading ? 'Generating...' : 'Generate SOAP Note'}
              </button>
            </div>
            <div className="col-span-1 flex gap-2">
              {isSpeechRecognitionSupported && (
                <button
                    onClick={onToggleRecording}
                    disabled={isLoading}
                    aria-pressed={isRecording}
                    className={`inline-flex items-center justify-center px-4 py-3 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-colors ${
                      isRecording 
                      ? 'bg-red-600 text-white hover:bg-red-700 border-transparent relative' 
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                    }`}
                >
                    {isRecording ? <StopCircleIcon className="h-5 w-5 mr-2" /> : <MicrophoneIcon className="h-5 w-5 mr-2" />}
                    {isRecording ? 'Stop' : 'Record'}
                     {isRecording && <span className="absolute h-3 w-3 rounded-full bg-red-400 top-2 right-2 animate-pulse-red" aria-hidden />}
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
                  disabled={isLoading || isRecording}
                  className="inline-flex items-center justify-center px-4 py-3 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                   <ClearIcon className="h-5 w-5 mr-2"/>
                  Clear
              </button>
            </div>
        </div>
    </div>
  );
};