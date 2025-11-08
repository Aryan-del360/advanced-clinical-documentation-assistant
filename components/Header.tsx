import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-sky-700 via-emerald-500 to-teal-400 text-white sticky top-0 z-20 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center text-white font-bold text-lg">AC</div>
          <div className="hidden sm:block">
            <h1 className="text-base sm:text-lg font-semibold leading-tight">Clinical Documentation Assistant</h1>
            <p className="text-xs sm:text-sm text-white/90">AI-assisted SOAP note generation from clinical transcripts</p>
          </div>
        </div>

        <div className="flex-1 hidden md:flex justify-center">
          <div className="w-full max-w-xl">
            <input
              aria-label="Search features"
              placeholder="Search templates, examples, or commands"
              className="w-full px-4 py-2 rounded-md bg-white/10 placeholder-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a href="/docs" className="text-sm bg-white/10 px-3 py-1 rounded-md hover:bg-white/20">Docs</a>
          <a href="/settings" className="text-sm bg-white/10 px-3 py-1 rounded-md hover:bg-white/20">Settings</a>
          <a
            href="https://acda-906934175275.us-central1.run.app"
            target="_blank"
            rel="noreferrer"
            className="text-sm bg-white px-3 py-1 rounded-md text-sky-700 font-medium hover:opacity-95"
          >
            Live Demo
          </a>
        </div>
      </div>
    </header>
  );
};