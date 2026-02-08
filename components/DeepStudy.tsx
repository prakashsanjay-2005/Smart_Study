import React, { useState } from 'react';
import { Brain, ImagePlus, Search, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { UploadedFile, StudyInsight } from '../types';
import { predictExamQuestions, searchConcept, generateVisualAid } from '../services/geminiService';

interface DeepStudyProps {
  files: UploadedFile[];
}

// Utility to ensure plain text
const cleanText = (text: string) => text.replace(/[\*#$]/g, '');

export const DeepStudy: React.FC<DeepStudyProps> = ({ files }) => {
  const [activeTab, setActiveTab] = useState<'exam' | 'visual' | 'search'>('exam');
  const [insights, setInsights] = useState<StudyInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{text: string, sources: any[]} | null>(null);

  // Visual Aid State
  const [visualPrompt, setVisualPrompt] = useState('');
  const [generatedVisual, setGeneratedVisual] = useState<string | null>(null);

  const handlePredict = async () => {
    if (files.length === 0) {
        alert("Please upload files first.");
        return;
    }
    setIsLoading(true);
    try {
      const data = await predictExamQuestions(files);
      setInsights(data);
    } catch (e) {
      console.error(e);
      alert("Error predicting exam. Check API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    try {
      const result = await searchConcept(searchQuery);
      setSearchResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVisual = async () => {
    if (!visualPrompt) return;
    setIsLoading(true);
    try {
      const img = await generateVisualAid(visualPrompt);
      setGeneratedVisual(img);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sky-900/30">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Brain className="w-5 h-5 text-sky-400" />
          <span>Deep Study</span>
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-2 bg-[#020617]/30">
        <button 
            onClick={() => setActiveTab('exam')}
            className={`flex-1 py-3 md:py-2 text-xs font-semibold rounded-lg transition-colors min-h-[48px] md:min-h-0 flex items-center justify-center ${activeTab === 'exam' ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/20' : 'bg-[#1e293b] text-sky-300 hover:bg-[#334155] hover:text-white'}`}
        >
            Predictor
        </button>
        <button 
             onClick={() => setActiveTab('search')}
             className={`flex-1 py-3 md:py-2 text-xs font-semibold rounded-lg transition-colors min-h-[48px] md:min-h-0 flex items-center justify-center ${activeTab === 'search' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'bg-[#1e293b] text-sky-300 hover:bg-[#334155] hover:text-white'}`}
        >
            Search
        </button>
        <button 
             onClick={() => setActiveTab('visual')}
             className={`flex-1 py-3 md:py-2 text-xs font-semibold rounded-lg transition-colors min-h-[48px] md:min-h-0 flex items-center justify-center ${activeTab === 'visual' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-[#1e293b] text-sky-300 hover:bg-[#334155] hover:text-white'}`}
        >
            Visual Aid
        </button>
      </div>

      {/* Content Area - Expanded for Mobile touch targets */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* EXAM PREDICTOR TAB */}
        {activeTab === 'exam' && (
          <div className="space-y-4">
             <div className="text-sm text-sky-300">
                Uses <strong>Thinking Mode</strong> to cross-reference your files and predict exam topics.
             </div>
             
             {insights.length === 0 && !isLoading && (
                 <button 
                    onClick={handlePredict}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium shadow-lg shadow-sky-900/20 transition-all flex items-center justify-center space-x-2 transform hover:translate-y-[-1px] min-h-[56px]"
                 >
                    <BookOpen className="w-5 h-5" />
                    <span>Run Exam Predictor</span>
                 </button>
             )}

             {isLoading && (
                 <div className="flex justify-center py-8">
                     <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                 </div>
             )}

             <div className="space-y-3">
               {insights.map((insight, idx) => (
                 <div key={idx} className="bg-[#1e293b] rounded-lg p-4 border border-sky-500/30 hover:border-sky-500 transition-colors">
                   <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-white text-lg">{cleanText(insight.topic)}</h3>
                     <span className="bg-sky-900/50 text-sky-300 text-xs px-2 py-1 rounded font-mono mt-1">
                        {insight.examProbability}% Prob
                     </span>
                   </div>
                   <p className="text-sm text-sky-200 mb-3 leading-relaxed">{cleanText(insight.summary)}</p>
                   <button 
                    onClick={() => { setActiveTab('search'); setSearchQuery(insight.relatedSearchQuery || ''); }}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1 p-2 -ml-2 rounded-md hover:bg-sky-900/20 min-h-[44px]"
                   >
                     <span>Verify with Search</span>
                     <ArrowRight className="w-3 h-3" />
                   </button>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* SEARCH GROUNDING TAB */}
        {activeTab === 'search' && (
            <div className="space-y-4">
                <div className="relative">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ask Smart (Web Grounded)..."
                        className="w-full bg-[#1e293b] border border-sky-800/40 rounded-lg pl-10 pr-4 py-3 text-base text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all min-h-[56px]"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Search className="absolute left-3 top-4 w-5 h-5 text-sky-500" />
                </div>
                <button 
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-base font-medium transition-colors min-h-[56px]"
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>

                {searchResult && (
                    <div className="bg-[#1e293b] rounded-lg p-4 border border-sky-800/30 animate-in fade-in">
                        <p className="text-sm md:text-base text-sky-100 whitespace-pre-wrap leading-relaxed">{cleanText(searchResult.text)}</p>
                        {searchResult.sources.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-sky-800/30">
                                <span className="text-xs text-sky-400 uppercase font-semibold">Sources</span>
                                <ul className="mt-2 space-y-2">
                                    {searchResult.sources.map((src, i) => (
                                        <li key={i}>
                                            <a href={src.uri} target="_blank" rel="noreferrer" className="text-xs md:text-sm text-cyan-400 hover:underline truncate block p-1 -ml-1">
                                                {src.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* VISUAL AID TAB */}
        {activeTab === 'visual' && (
            <div className="space-y-4">
                 <div className="text-sm text-sky-300">
                    Generate diagrams or visual study aids using <strong>Gemini 2.5 Flash Image</strong>.
                 </div>
                 <textarea 
                    value={visualPrompt}
                    onChange={(e) => setVisualPrompt(e.target.value)}
                    placeholder="Describe the visual aid you need (e.g., 'A flow chart of photosynthesis')"
                    className="w-full bg-[#1e293b] border border-sky-800/40 rounded-lg p-3 text-base text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-32 resize-none transition-all"
                 />
                 <button 
                    onClick={handleGenerateVisual}
                    disabled={isLoading || !visualPrompt}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-base font-medium flex items-center justify-center space-x-2 transition-colors min-h-[56px]"
                 >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <ImagePlus className="w-5 h-5" />}
                    <span>Generate Aid</span>
                 </button>

                 {generatedVisual && (
                     <div className="bg-[#1e293b] p-2 rounded-lg border border-sky-800/40">
                         <img src={generatedVisual} alt="Generated Aid" className="w-full rounded bg-white" />
                         <a href={generatedVisual} download="study_aid.png" className="block text-center mt-3 p-2 bg-blue-900/20 rounded text-sm text-blue-400 hover:text-blue-300 min-h-[48px] flex items-center justify-center">
                             Download Visual
                         </a>
                     </div>
                 )}
            </div>
        )}

      </div>
    </div>
  );
};