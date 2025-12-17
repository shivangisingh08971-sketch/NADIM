
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { LessonContent, Subject, ClassLevel, Chapter, MCQItem, ContentType } from '../types';
import { ArrowLeft, Clock, AlertTriangle, ExternalLink, CheckCircle, XCircle, Trophy, BookOpen } from 'lucide-react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface Props {
  content: LessonContent | null;
  subject: Subject;
  classLevel: ClassLevel;
  chapter: Chapter;
  loading: boolean;
  onBack: () => void;
  onMCQComplete?: (count: number) => void; 
}

export const LessonView: React.FC<Props> = ({ 
  content, 
  subject, 
  classLevel, 
  chapter,
  loading, 
  onBack,
  onMCQComplete
}) => {
  const [mcqState, setMcqState] = useState<Record<number, number | null>>({});
  const [showResults, setShowResults] = useState(false);
  
  // 1. LOADING STATE
  if (loading) {
      return (
          <div className="h-[70vh] flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <h3 className="text-xl font-bold text-slate-800 animate-pulse">Loading Content...</h3>
          </div>
      );
  }

  // 2. NO CONTENT / COMING SOON
  if (!content || content.isComingSoon) {
      return (
          <div className="h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl m-4 border-2 border-dashed border-slate-200">
              <Clock size={64} className="text-orange-400 mb-4 opacity-80" />
              <h2 className="text-2xl font-black text-slate-800 mb-2">Coming Soon</h2>
              <p className="text-slate-500 mb-6">Content is being prepared.</p>
              <button onClick={onBack} className="mt-8 text-slate-400 font-bold hover:text-slate-600">Go Back</button>
          </div>
      );
  }

  // 3. MCQ TEST VIEWER
  if ((content.type === 'MCQ_ANALYSIS' || content.type === 'MCQ_SIMPLE') && content.mcqData) {
      const score = Object.keys(mcqState).reduce((acc, key) => {
          const qIdx = parseInt(key);
          return acc + (mcqState[qIdx] === content.mcqData![qIdx].correctAnswer ? 1 : 0);
      }, 0);

      const handleFinish = () => { setShowResults(true); if (onMCQComplete) onMCQComplete(score); };

      return (
          <div className="flex flex-col h-full bg-slate-50 animate-in fade-in">
               <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                   <button onClick={onBack} className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                       <ArrowLeft size={16} /> Exit
                   </button>
                   <div className="text-right">
                       <h3 className="font-bold text-slate-800 text-sm">MCQ Test</h3>
                       {showResults ? (
                           <span className="text-xs font-bold text-green-600">Score: {score}/{content.mcqData.length}</span>
                       ) : (
                           <span className="text-xs text-slate-400">{Object.keys(mcqState).length}/{content.mcqData.length} Done</span>
                       )}
                   </div>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
                   {content.mcqData.map((q, idx) => {
                       const userAnswer = mcqState[idx];
                       const isAnswered = userAnswer !== undefined;
                       const isCorrect = userAnswer === q.correctAnswer;
                       
                       return (
                           <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                               <h4 className="font-bold text-slate-800 mb-4 flex gap-3">
                                   <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">{idx + 1}</span>
                                   {q.question}
                               </h4>
                               <div className="space-y-2">
                                   {q.options.map((opt, oIdx) => {
                                       let btnClass = "w-full text-left p-3 rounded-xl border transition-all text-sm font-medium relative overflow-hidden ";
                                       if (isAnswered) {
                                           if (oIdx === q.correctAnswer) btnClass += "bg-green-100 border-green-300 text-green-800";
                                           else if (userAnswer === oIdx) btnClass += "bg-red-100 border-red-300 text-red-800";
                                           else btnClass += "bg-slate-50 border-slate-100 opacity-60";
                                       } else {
                                           btnClass += "bg-white border-slate-200 hover:bg-slate-50 hover:border-blue-200";
                                       }
                                       return (
                                           <button key={oIdx} disabled={isAnswered || showResults} onClick={() => setMcqState(prev => ({ ...prev, [idx]: oIdx }))} className={btnClass}>
                                               <span className="flex justify-between items-center">
                                                   {opt}
                                                   {isAnswered && oIdx === q.correctAnswer && <CheckCircle size={16} className="text-green-600" />}
                                                   {isAnswered && userAnswer === oIdx && userAnswer !== q.correctAnswer && <XCircle size={16} className="text-red-500" />}
                                               </span>
                                           </button>
                                       );
                                   })}
                               </div>
                               {(isAnswered || showResults) && (
                                   <div className="mt-4 pt-4 border-t border-slate-100">
                                       <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                                            <span className="font-bold text-slate-800 block text-xs uppercase mb-1">Explanation:</span>
                                            {q.explanation || "No explanation provided."}
                                       </p>
                                   </div>
                               )}
                           </div>
                       );
                   })}
               </div>
               {!showResults && (
                   <div className="p-4 bg-white border-t sticky bottom-0 z-10 flex justify-center shadow-lg">
                       <button onClick={handleFinish} disabled={Object.keys(mcqState).length === 0} className="bg-blue-600 text-white font-bold py-3 px-10 rounded-xl shadow-lg disabled:opacity-50">
                           <Trophy size={18} className="inline mr-2" /> Submit
                       </button>
                   </div>
               )}
          </div>
      );
  }

  // 4. PDF VIEWER (🔥 WITH AD BLOCKER 🔥)
  if (content.type.includes('PDF')) {
      return (
          <div className="flex flex-col h-screen bg-slate-100">
              <div className="p-3 bg-white border-b flex justify-between items-center shadow-sm z-20">
                   <button onClick={onBack} className="flex items-center gap-2 font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg text-sm">
                       <ArrowLeft size={16} /> Back
                   </button>
                   <h3 className="font-bold text-slate-800 text-sm truncate w-40">{chapter.title}</h3>
                   <div className="w-10"></div>
              </div>
              
              <div className="flex-1 w-full bg-white relative overflow-hidden">
                  {/* PDF IFRAME */}
                  <iframe 
                       src={content.content.replace('/view', '/preview').replace('/edit', '/preview')} 
                       className="w-full h-full border-0" 
                       allowFullScreen
                       title="PDF Viewer"
                  />

                  {/* 🔥🔥🔥 BLOCKER CODE: यह वो दीवार है जो लिंक को ढकता है 🔥🔥🔥 */}
                  <div className="absolute top-0 right-0 w-20 h-20 z-50 bg-transparent"></div>
              </div>
          </div>
      );
  }

  // 5. NOTES RENDERER
  return (
    <div className="bg-white min-h-screen pb-20 animate-in fade-in">
       <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between">
           <button onClick={onBack}><ArrowLeft size={20} /></button>
           <span className="font-bold text-sm">{chapter.title}</span>
           <div className="w-6"></div>
       </div>
       <div className="max-w-3xl mx-auto p-6 prose prose-sm max-w-none">
           <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
               {content.content}
           </ReactMarkdown>
           <div className="mt-12 text-center pt-8 border-t">
               <button onClick={onBack} className="bg-slate-900 text-white font-bold py-3 px-8 rounded-full shadow-lg">
                   Complete & Close
               </button>
           </div>
       </div>
    </div>
  );
};
