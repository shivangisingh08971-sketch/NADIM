import React, { useState, useEffect } from 'react';
import { User, ViewState, Chapter, MCQItem, Subject } from '../types';
import { ArrowLeft, Book, Clock, Trophy, RefreshCw, ArrowRight, Play, CheckCircle, Lock, AlertOctagon } from 'lucide-react';
import { getSubjectsList } from '../constants'; // Ensure you have this or remove if not needed

// --- 1. INTERNAL EXAM COMPONENT (Exam Screen) ---
const StudentExamView = ({ chapterId, isTestMode, onExit, subjectName, board, userClass, stream }: any) => {
    const [questions, setQuestions] = useState<MCQItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    useEffect(() => {
        // Try to find the correct key from Admin Data
        // Pattern: nst_content_BOARD_CLASS-STREAM_SUBJECT_CHAPTERID
        // We try a few variations to be safe
        const streamPart = (userClass === '11' || userClass === '12') ? `-${stream}` : '';
        const key1 = `nst_content_${board}_${userClass}${streamPart}_${subjectName}_${chapterId}`;
        const key2 = `nst_content_${board}_${userClass}_${subjectName}_${chapterId}`; // Fallback for class 10

        const stored = localStorage.getItem(key1) || localStorage.getItem(key2);
        
        if (stored) {
            const data = JSON.parse(stored);
            // If Test Mode -> Load Test Qs, Else -> Load Practice Qs
            const qs = isTestMode ? data.weeklyTestMcqData : data.manualMcqData;
            if (qs && qs.length > 0) setQuestions(qs);
        }
    }, [chapterId, isTestMode]);

    const handleOptionClick = (idx: number) => {
        if (isAnswered) return;
        setSelectedOption(idx);
        setIsAnswered(true);
        if (!isTestMode && idx === questions[currentIndex].correctAnswer) setScore(score + 1);
    };

    const nextQuestion = () => {
        if (isTestMode && selectedOption === questions[currentIndex].correctAnswer) setScore(prev => prev + 1);
        
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    if (questions.length === 0) return (
        <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
            <div className="bg-slate-100 p-4 rounded-full mb-4"><AlertOctagon size={32} className="text-slate-400" /></div>
            <h3 className="text-lg font-bold text-slate-700">No Questions Added Yet</h3>
            <p className="text-sm text-slate-500 mb-6">Admin hasn't uploaded questions for this chapter.</p>
            <button onClick={onExit} className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold">Go Back</button>
        </div>
    );

    if (showResult) return (
        <div className="bg-white p-8 rounded-3xl shadow-lg text-center max-w-sm mx-auto mt-10 border border-slate-100">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600 animate-bounce"><Trophy size={40} /></div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">{isTestMode ? 'Test Submitted!' : 'Practice Complete!'}</h2>
            <div className="text-6xl font-black text-blue-600 mb-2">{score}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Score Out of {questions.length}</div>
            <div className="flex gap-2">
                <button onClick={onExit} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">Exit</button>
                <button onClick={() => window.location.reload()} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"><RefreshCw size={16} /> Retry</button>
            </div>
        </div>
    );

    const currentQ = questions[currentIndex];

    return (
        <div className="max-w-xl mx-auto p-4 bg-white min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <button onClick={onExit} className="bg-slate-100 p-2 rounded-full"><ArrowLeft size={20} /></button>
                <div className="text-xs font-bold text-slate-400 uppercase">Q {currentIndex + 1} / {questions.length}</div>
                {isTestMode && <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-black flex items-center gap-1"><Clock size={10} /> LIVE TEST</span>}
            </div>

            <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6">{currentQ.question}</h3>
                <div className="space-y-3">
                    {currentQ.options.map((opt, idx) => {
                        let btnColor = "bg-white border-slate-200 text-slate-600 hover:bg-slate-50";
                        if (isAnswered && !isTestMode) {
                            if (idx === currentQ.correctAnswer) btnColor = "bg-green-50 border-green-500 text-green-700 font-bold";
                            else if (idx === selectedOption) btnColor = "bg-red-50 border-red-500 text-red-700 font-bold";
                        } else if (selectedOption === idx) {
                            btnColor = "bg-blue-600 border-blue-600 text-white font-bold shadow-lg";
                        }
                        return (
                            <button key={idx} onClick={() => handleOptionClick(idx)} disabled={isAnswered} className={`w-full p-4 rounded-xl text-left border-2 transition-all ${btnColor}`}>
                                <div className="flex gap-3"><span className="opacity-50">{String.fromCharCode(65 + idx)}.</span> {opt}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {!isTestMode && isAnswered && currentQ.explanation && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-20 text-sm text-blue-800">
                    <span className="font-bold">Explanation:</span> {currentQ.explanation}
                </div>
            )}

            <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-slate-100">
                <button onClick={nextQuestion} disabled={!isAnswered} className={`w-full py-3 rounded-xl font-bold text-white shadow-lg ${!isAnswered ? 'bg-slate-300' : 'bg-slate-900'}`}>
                    {currentIndex === questions.length - 1 ? "Finish" : "Next Question"} <ArrowRight size={18} className="inline ml-1" />
                </button>
            </div>
        </div>
    );
};


// --- 2. MAIN STUDENT DASHBOARD (Mix of Dashboard + Exam) ---
interface Props {
  user: User;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<Props> = ({ user, onNavigate, onLogout }) => {
  // State
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [examMode, setExamMode] = useState<'PRACTICE' | 'TEST' | null>(null);
  
  // Data State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Load Subjects on mount
  useEffect(() => {
      // Load standard subjects + custom ones from Admin
      const standard = getSubjectsList(user.classLevel, user.stream);
      const customPool = JSON.parse(localStorage.getItem('nst_custom_subjects_pool') || '{}');
      // Merge logic could go here, for now using standard
      setSubjects(standard);
  }, [user]);

  // Load Chapters when Subject Selects
  useEffect(() => {
      if (selectedSubject) {
          // Try to load syllabus saved by Admin
          const streamKey = (user.classLevel === '11' || user.classLevel === '12') ? `-${user.stream}` : '';
          const key = `nst_custom_chapters_${user.board}-${user.classLevel}${streamKey}-${selectedSubject.name}-English`;
          const savedChapters = localStorage.getItem(key);
          
          if (savedChapters) {
              setChapters(JSON.parse(savedChapters));
          } else {
              // Fallback: Show empty or default
              setChapters([]); 
          }
      }
  }, [selectedSubject]);

  // --- RENDER EXAM IF ACTIVE ---
  if (activeChapter && examMode) {
      return (
          <StudentExamView 
              chapterId={activeChapter}
              isTestMode={examMode === 'TEST'}
              onExit={() => { setActiveChapter(null); setExamMode(null); }}
              subjectName={selectedSubject?.name}
              board={user.board}
              userClass={user.classLevel}
              stream={user.stream}
          />
      );
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50 pb-24 px-4 pt-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
          <div>
              <h1 className="text-2xl font-black text-slate-800">Hi, {user.name.split(' ')[0]} 👋</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.classLevel}th Grade • {user.stream}</p>
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" />
          </div>
      </div>

      {/* Back Button (If Subject Selected) */}
      {selectedSubject && (
          <button onClick={() => { setSelectedSubject(null); setChapters([]); }} className="mb-4 flex items-center gap-2 text-slate-500 font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm w-max">
              <ArrowLeft size={16} /> Back to Subjects
          </button>
      )}

      {/* VIEW 1: SUBJECT SELECTION */}
      {!selectedSubject && (
          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4">
              {subjects.map(sub => (
                  <button 
                    key={sub.id} 
                    onClick={() => setSelectedSubject(sub)}
                    className={`p-6 rounded-[24px] flex flex-col items-center gap-3 bg-white border-2 border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all ${sub.color}`}
                  >
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-2xl">📚</div>
                      <span className="font-bold text-slate-700 text-sm">{sub.name}</span>
                  </button>
              ))}
          </div>
      )}

      {/* VIEW 2: CHAPTER LIST */}
      {selectedSubject && (
          <div className="space-y-4 animate-in slide-in-from-right">
              {chapters.length === 0 && (
                  <div className="text-center py-10 text-slate-400 font-bold">No chapters found for this subject.</div>
              )}
              
              {chapters.map((ch, idx) => (
                  <div key={ch.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded mb-2 inline-block">CHAPTER {idx + 1}</span>
                              <h3 className="font-bold text-slate-800 leading-tight">{ch.title}</h3>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                          {/* PDF Button */}
                          <button className="bg-blue-50 text-blue-700 py-3 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1">
                              <Book size={16} /> PDF
                          </button>
                          
                          {/* Practice Button */}
                          <button 
                              onClick={() => { setActiveChapter(ch.id); setExamMode('PRACTICE'); }}
                              className="bg-green-50 text-green-700 py-3 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 hover:bg-green-100"
                          >
                              <CheckCircle size={16} /> PRACTICE
                          </button>
                          
                          {/* Test Button */}
                          <button 
                              onClick={() => { setActiveChapter(ch.id); setExamMode('TEST'); }}
                              className="bg-orange-50 text-orange-700 py-3 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 hover:bg-orange-100"
                          >
                              <Clock size={16} /> TEST
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};
