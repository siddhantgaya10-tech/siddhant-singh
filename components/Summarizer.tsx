import React, { useState } from 'react';
import { TextStats, SummaryRequest } from '../types';
import { streamSummary } from '../services/geminiService';
import { Copy, RefreshCw, X, FileText, List, AlignLeft, AlignCenter, AlignJustify } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface SummarizerProps {
  isActive: boolean;
}

export const Summarizer: React.FC<SummarizerProps> = ({ isActive }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [length, setLength] = useState<SummaryRequest['length']>('medium');
  const [format, setFormat] = useState<SummaryRequest['format']>('paragraph');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isActive) return null;

  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setOutputText('');

    try {
      await streamSummary(
        { text: inputText, length, format },
        (chunk) => {
          setOutputText(prev => prev + chunk);
        }
      );
    } catch (error) {
      console.error(error);
      setOutputText('An error occurred while summarizing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
  };

  const getStats = (text: string): TextStats => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    return { words, chars };
  };
  
  const inputStats = getStats(inputText);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Controls */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Length Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Length</span>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['short', 'medium', 'long'] as const).map((l) => (
               <button
                 key={l}
                 onClick={() => setLength(l)}
                 className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                   length === l 
                     ? 'bg-white text-brand-600 shadow-sm' 
                     : 'text-gray-500 hover:text-gray-700'
                 }`}
               >
                 {l.charAt(0).toUpperCase() + l.slice(1)}
               </button>
            ))}
          </div>
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Format</span>
          <div className="flex gap-2">
             <button
               onClick={() => setFormat('paragraph')}
               className={`p-2 rounded-lg transition-all ${
                 format === 'paragraph'
                   ? 'bg-brand-50 text-brand-600 ring-1 ring-brand-200'
                   : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
               }`}
             >
               <AlignLeft size={18} />
             </button>
             <button
               onClick={() => setFormat('bullets')}
               className={`p-2 rounded-lg transition-all ${
                 format === 'bullets'
                   ? 'bg-brand-50 text-brand-600 ring-1 ring-brand-200'
                   : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
               }`}
             >
               <List size={18} />
             </button>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col gap-4">
         {/* Input */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[200px] focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
             <div className="p-3 border-b border-gray-100 flex justify-between items-center">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Text to Summarize</span>
               {inputText && (
                 <button onClick={() => setInputText('')} className="text-gray-400 hover:text-gray-600">
                   <X size={16} />
                 </button>
               )}
             </div>
             <textarea
               className="flex-1 w-full p-4 resize-none outline-none text-gray-700 text-lg leading-relaxed bg-transparent placeholder-gray-300"
               placeholder="Paste your long text here to summarize..."
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
             />
             <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-between items-center">
                 <div className="text-xs text-gray-500">{inputStats.words} words</div>
                 <button
                    onClick={handleSummarize}
                    disabled={isProcessing || !inputText}
                    className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-8 py-2 rounded-lg font-semibold shadow-sm flex items-center gap-2 transition-all active:scale-95"
                 >
                    {isProcessing ? <RefreshCw size={18} className="animate-spin" /> : 'Summarize'}
                 </button>
             </div>
         </div>

         {/* Output */}
         {outputText && (
           <div className="bg-white rounded-xl shadow-md border border-brand-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
             <div className="p-3 bg-brand-50/50 border-b border-brand-100 flex justify-between items-center">
               <span className="text-xs font-bold text-brand-700 uppercase tracking-wide flex items-center gap-2">
                 <FileText size={14} /> Summary
               </span>
               <button onClick={copyToClipboard} className="text-brand-600 hover:bg-brand-100 p-1.5 rounded-md transition-colors">
                 <Copy size={16} />
               </button>
             </div>
             <div className="p-6 bg-white">
                <div className="prose prose-brand max-w-none text-gray-800 leading-relaxed">
                  {format === 'bullets' ? (
                     <ul className="list-disc pl-5 space-y-2">
                       {outputText.split('\n').map((line, i) => {
                         const cleanLine = line.replace(/^[\s-•*]+/, '');
                         return cleanLine ? <li key={i}>{cleanLine}</li> : null;
                       })}
                     </ul>
                  ) : (
                    <p>{outputText}</p>
                  )}
                </div>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};
