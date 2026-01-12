import React, { useState } from 'react';
import { Header } from './components/Header';
import { Paraphraser } from './components/Paraphraser';
import { Summarizer } from './components/Summarizer';
import { AppTool } from './types';

function App() {
  const [currentTool, setCurrentTool] = useState<AppTool>(AppTool.PARAPHRASER);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans flex flex-col">
      <Header currentTool={currentTool} setTool={setCurrentTool} />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="h-full">
           <Paraphraser isActive={currentTool === AppTool.PARAPHRASER} />
           <Summarizer isActive={currentTool === AppTool.SUMMARIZER} />
        </div>
      </main>

      <footer className="py-6 text-center text-gray-400 text-sm border-t border-gray-200 bg-white">
        <p>Powered by Google Gemini 3 Flash • <span className="hover:text-brand-500 cursor-pointer transition-colors">RePhrase AI</span></p>
      </footer>
    </div>
  );
}

export default App;
