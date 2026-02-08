import React from 'react';
import { Clock, Star, AlertCircle } from 'lucide-react';
import { TimelineEvent } from '../types';

interface TimelineProps {
  events: TimelineEvent[];
  isLoading: boolean;
}

// Utility to ensure plain text
const cleanText = (text: string) => text.replace(/[\*#$]/g, '');

export const Timeline: React.FC<TimelineProps> = ({ events, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-sky-400 space-y-4 min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        <p>Syncing audio, visuals, and syllabus...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-sky-500/50 border-2 border-dashed border-sky-900/30 rounded-xl min-h-[200px]">
        <Clock className="w-12 h-12 mb-4 opacity-50" />
        <p>Upload files and click "Generate Timeline" to start.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 pl-4 pr-2">
      {/* Vertical Line */}
      <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-sky-900/30" />

      {events.map((event, idx) => (
        <div key={event.id} className="relative flex items-start space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
          {/* Timeline Dot */}
          <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 ${
            event.importance === 'high' ? 'bg-sky-950 border-sky-500 text-sky-400' :
            event.importance === 'medium' ? 'bg-cyan-950 border-cyan-500 text-cyan-400' :
            'bg-blue-950 border-blue-500 text-blue-400'
          }`}>
            {event.importance === 'high' && <AlertCircle className="w-3 h-3" />}
            {event.importance === 'medium' && <Star className="w-3 h-3" />}
            {event.importance === 'low' && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
          </div>

          {/* Content Card */}
          <div className="flex-1 bg-[#1e293b] rounded-xl p-4 border border-sky-800/20 shadow-sm hover:border-sky-500/50 hover:shadow-sky-900/20 transition-all">
            <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
              <h3 className="text-lg font-semibold text-sky-50 break-words">{cleanText(event.title)}</h3>
              <span className="text-xs font-mono text-sky-300 bg-[#0f172a] px-2 py-1 rounded whitespace-nowrap">{cleanText(event.timestamp)}</span>
            </div>
            <p className="text-sky-200 text-sm leading-relaxed">{cleanText(event.description)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};