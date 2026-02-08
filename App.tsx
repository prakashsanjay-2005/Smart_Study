import React, { useState } from 'react';
import { Layers, Activity, Cpu, Menu, X } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { Timeline } from './components/Timeline';
import { DeepStudy } from './components/DeepStudy';
import { NanoImageEditor } from './components/NanoImageEditor';
import { UploadedFile, TimelineEvent } from './types';
import { generateTimeline } from './services/geminiService';

const App = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleFileUpload = (file: UploadedFile) => {
    setFiles(prev => [...prev, file]);
  };

  const handleFileRemove = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleGenerateTimeline = async () => {
    if (files.length === 0) {
      alert("Please upload at least one file (Audio, PDF, or Image).");
      return;
    }
    
    setIsTimelineLoading(true);
    setIsMobileMenuOpen(false); // Close menu on action
    try {
      const events = await generateTimeline(files);
      setTimelineEvents(events);
    } catch (e) {
      console.error(e);
      alert("Error generating timeline. Please check your API Key and try again.");
    } finally {
      setIsTimelineLoading(false);
    }
  };

  const imageFiles = files.filter(f => f.type === 'image');

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
         <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
            <h2 className="text-sm font-bold text-sky-400 uppercase tracking-wider mb-6">Study Materials</h2>
            
            <FileUpload 
                label="Lecture Audio" 
                accept="audio/*" 
                fileType="audio" 
                onUpload={handleFileUpload}
                currentFiles={files}
                onRemove={handleFileRemove}
            />
            
            <FileUpload 
                label="Whiteboard / Slides" 
                accept="image/*" 
                fileType="image" 
                onUpload={handleFileUpload}
                currentFiles={files}
                onRemove={handleFileRemove}
            />
            
            <FileUpload 
                label="Syllabus PDF" 
                accept=".pdf" 
                fileType="pdf" 
                onUpload={handleFileUpload}
                currentFiles={files}
                onRemove={handleFileRemove}
            />
        </div>

        {/* Nano Image Editor (Contextual in left panel) */}
        <div className="p-4 border-t border-sky-900/30 bg-[#172554]/20">
            <NanoImageEditor images={imageFiles} />
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#020617] text-sky-100 font-sans">
      {/* Navbar */}
      <header className="h-16 bg-[#0f172a] border-b border-sky-900/30 flex items-center px-4 md:px-6 justify-between flex-shrink-0 z-20 relative">
        <div className="flex items-center space-x-3">
          <button 
            className="md:hidden p-2 text-sky-400 hover:bg-sky-900/20 rounded-lg min-h-[48px] min-w-[48px] flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-sky-600 p-2 rounded-lg shadow-lg shadow-sky-500/20 hidden md:block">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Smart <span className="text-sky-400">Study</span>
            </h1>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-4 text-xs font-mono text-sky-400/60">
            <span className="flex items-center"><Cpu className="w-3 h-3 mr-1" /> Gemini 3 Pro</span>
            <span className="flex items-center"><Activity className="w-3 h-3 mr-1" /> Gemini 2.5 Flash</span>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
            <div className="absolute inset-0 z-40 md:hidden flex">
                <div className="w-80 bg-[#0f172a] h-full shadow-2xl border-r border-sky-900/30 animate-in slide-in-from-left duration-200">
                    <SidebarContent />
                </div>
                <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            </div>
        )}

        {/* Desktop Left Panel */}
        <div className="hidden md:flex w-80 flex-shrink-0 bg-[#0f172a] border-r border-sky-900/30 flex-col">
            <SidebarContent />
        </div>

        {/* Responsive Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-[#020617] scroll-smooth">
            
            {/* Center Panel: Timeline */}
            <div className="flex-1 flex flex-col relative min-h-[50vh] md:h-full">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                
                <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between border-b border-sky-900/30 backdrop-blur-sm z-10 gap-4 md:gap-0 sticky top-0 md:relative bg-[#020617]/90 md:bg-transparent">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">Dynamic Timeline</h2>
                        <p className="text-sky-300/60 text-sm hidden md:block">Chronological sync of audio concepts and visual data.</p>
                    </div>
                    <button 
                        onClick={handleGenerateTimeline}
                        disabled={isTimelineLoading}
                        className="bg-sky-600 hover:bg-sky-500 text-white px-5 rounded-lg font-medium transition-all shadow-lg shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 min-h-[48px] w-full md:w-auto"
                    >
                        {isTimelineLoading ? 'Processing...' : 'Generate Timeline'}
                    </button>
                </div>

                <div className="flex-1 md:overflow-y-auto p-4 md:p-8 custom-scrollbar z-10">
                    <Timeline events={timelineEvents} isLoading={isTimelineLoading} />
                </div>
            </div>

            {/* Right Panel: Deep Study (Stacked on mobile) */}
            <div className="w-full md:w-96 flex-shrink-0 bg-[#0f172a] border-t md:border-t-0 md:border-l border-sky-900/30 flex flex-col md:h-full min-h-[600px]">
                <DeepStudy files={files} />
            </div>

        </div>
      </div>
    </div>
  );
};

export default App;