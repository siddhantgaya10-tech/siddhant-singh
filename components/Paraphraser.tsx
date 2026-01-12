import React, { useState, useRef, useEffect } from 'react';
import { ParaphraseMode, TextStats } from '../types';
import { streamParaphrase } from '../services/geminiService';
import { Copy, RefreshCw, X, ArrowRight, Wand2, SpellCheck, Briefcase, GraduationCap, Zap, Smile } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ParaphraserProps {
  isActive: boolean;
}

const MODES = [
  { id: ParaphraseMode.STANDARD, label: 'Standard', icon: Wand2, color: 'text-brand-600', desc: 'Balanced rewrite' },
  { id: ParaphraseMode.FLUENCY, label: 'Fluency', icon: SpellCheck, color: 'text-orange-500', desc: 'Fix grammar & flow' },
  { id: ParaphraseMode.FORMAL, label: 'Formal', icon: Briefcase, color: 'text-blue-600', desc: 'Professional tone' },
  { id: ParaphraseMode.ACADEMIC, label: 'Academic', icon: GraduationCap, color: 'text-purple-600', desc: 'Scholarly style' },
  { id: ParaphraseMode.SIMPLE, label: 'Simple', icon: Smile, color: 'text-pink-500', desc: 'Easy to understand' },
  { id: ParaphraseMode.CREATIVE, label: 'Creative', icon: Zap, color: 'text-yellow-500', desc: 'Expressive & unique' },
];

export const Paraphraser: React.FC<ParaphraserProps> = ({ isActive }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<ParaphraseMode>(ParaphraseMode.STANDARD);
  const [synonymsLevel, setSynonymsLevel] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use a ref to track if we should clear the output on new input
  const lastProcessedInputRef = useRef<string>('');

  if (!isActive) return null;

  const handleParaphrase = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setOutputText(''); // Clear previous output
    lastProcessedInputRef.current = inputText;

    try {
      await streamParaphrase(
        { text: inputText, mode, synonymsLevel },
        (chunk) => {
          setOutputText(prev => prev + chunk);
        }
      );
    } catch (error) {
      console.error(error);
      setOutputText('An error occurred. Please check your connection or try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStats = (text: string): TextStats => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    return { words, chars };
  };

  const inputStats = getStats(inputText);
  const outputStats = getStats(outputText);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Controls Bar */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Modes */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isSelected 
                    ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-500 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={14} className={isSelected ? m.color : 'text-gray-400'} />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Synonyms Slider */}
        <div className="flex items-center gap-3 w-full md:w-auto px-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Synonyms</span>
          <div className="relative flex items-center w-32 md:w-48">
            <input
              type="range"
              min="0"
              max="100"
              value={synonymsLevel}
              onChange={(e) => setSynonymsLevel(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="absolute -top-5 left-0 w-full flex justify-between text-[10px] text-gray-400 font-medium">
              <span>Few</span>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-[400px]">
        
        {/* Input Card */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Original Text</span>
            {inputText && (
              <button onClick={() => setInputText('')} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          <textarea
            className="flex-1 w-full p-4 resize-none outline-none text-gray-700 text-lg leading-relaxed bg-transparent placeholder-gray-300"
            placeholder="Paste or type your text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            spellCheck="false"
          />
          <div className="p-3 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-xl">
            <div className="text-xs text-gray-500 font-medium">
              {inputStats.words} words <span className="text-gray-300">|</span> {inputStats.chars} chars
            </div>
            <button
              onClick={handleParaphrase}
              disabled={isProcessing || !inputText}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold shadow-sm shadow-brand-200 flex items-center gap-2 transition-all active:scale-95"
            >
              {isProcessing ? <RefreshCw size={18} className="animate-spin" /> : 'Paraphrase'}
            </button>
          </div>
        </div>

        {/* Output Card */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col relative overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
             <span className="text-xs font-bold text-brand-600 uppercase tracking-wide">Paraphrased Output</span>
             {outputText && (
               <div className="flex gap-2">
                 <Tooltip text="Copy text">
                   <button onClick={() => copyToClipboard(outputText)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
                     <Copy size={16} />
                   </button>
                 </Tooltip>
               </div>
             )}
          </div>
          
          <div className="flex-1 w-full p-4 relative bg-gray-50/30">
             {outputText ? (
               <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap animate-in fade-in duration-500">
                 {outputText}
               </p>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-300 pointer-events-none select-none">
                  {isProcessing ? (
                     <div className="flex flex-col items-center gap-3">
                       <RefreshCw size={32} className="animate-spin text-brand-300" />
                       <p className="text-sm font-medium text-gray-400">Rewriting...</p>
                     </div>
                  ) : (
                    <>
                      <ArrowRight size={48} className="mb-2 opacity-20" />
                      <p className="text-sm font-medium">Your output will appear here</p>
                    </>
                  )}
               </div>
             )}
          </div>

          <div className="p-3 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-xl">
            <div className="text-xs text-gray-500 font-medium">
              {outputStats.words} words <span className="text-gray-300">|</span> {outputStats.chars} chars
            </div>
            {/* Hidden spacer to match height of input button */}
            <div className="py-2 opacity-0">Spacer</div>
          </div>
        </div>

      </div>
    </div>
  );
};
