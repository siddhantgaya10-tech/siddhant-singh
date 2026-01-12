import React from 'react';
import { AppTool } from '../types';
import { PenLine, FileText } from 'lucide-react';

interface HeaderProps {
  currentTool: AppTool;
  setTool: (tool: AppTool) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTool, setTool }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-500 text-white p-2 rounded-lg shadow-lg shadow-brand-200">
             <PenLine size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Re<span className="text-brand-600">Phrase</span> AI</h1>
        </div>

        <nav className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setTool(AppTool.PARAPHRASER)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              currentTool === AppTool.PARAPHRASER 
                ? 'bg-white text-brand-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <PenLine size={16} /> Paraphraser
          </button>
          <button
            onClick={() => setTool(AppTool.SUMMARIZER)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              currentTool === AppTool.SUMMARIZER 
                ? 'bg-white text-brand-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <FileText size={16} /> Summarizer
          </button>
        </nav>
      </div>
    </header>
  );
};
