import React, { useState } from 'react';
import { User, Subject, StudentTab, SystemSettings, LessonContent, MCQItem, CreditPackage } from '../types';
import { getSubjectsList } from '../constants';
import { RedeemSection } from './RedeemSection';
import { Calendar, History, Gift, Sparkles, MessageCircle, Gamepad2, Trophy, ArrowRight, Activity, ShieldAlert, Rocket, BookOpen, Ban, ShoppingBag, Lock } from 'lucide-react';
import { HistoryPage } from './HistoryPage';
import { UniversalChat } from './UniversalChat';
import { SpinWheel } from './SpinWheel';
import { Leaderboard } from './Leaderboard';

interface Props {
  user: User;
  dailyStudySeconds: number;
  onSubjectSelect: (subject: Subject) => void;
  onRedeemSuccess: (user: User) => void;
  settings?: SystemSettings;
}

export const StudentDashboard: React.FC<Props> = ({ user, dailyStudySeconds, onSubjectSelect, onRedeemSuccess, settings }) => {
  const [activeTab, setActiveTab] = useState<StudentTab | 'LEADERBOARD'>('ROUTINE');
  const [megaTestContent, setMegaTestContent] = useState<LessonContent | null>(null);

  const startMegaTest = () => {
      const questionsStr = localStorage.getItem('nst_mega_test_questions');
      if (!questionsStr || JSON.parse(questionsStr).length === 0) {
          alert("Admin is currently setting up the global questions. Check back soon!");
          return;
      }
      
      const allQs: MCQItem[] = JSON.parse(questionsStr);
      const limit = settings?.megaTestQuestionLimit || 50;
      const selection = allQs.sort(() => 0.5 - Math.random()).slice(0, limit);

      setMegaTestContent({
          id: 'MEGA_TEST_LIVE',
          title: "MEGA WEEKLY EXAM",
          subtitle: `Live Global Ranking`,
          content: '',
          type: 'WEEKLY_TEST',
          dateCreated: new Date().toISOString(),
          subjectName: 'Mega Exam',
          mcqData: selection
      });
  };

  const handleBuyPackage = (pkg: CreditPackage) => {
    // Check if UPI is configured
    if (!settings?.upiId) {
        alert("Payment Gateway Error: Admin UPI not configured.");
        return;
    }

    const message = `I want to buy ${pkg.name} for ₹${pkg.price}. My User ID: ${user.id}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const RoutineView = () => {
    const subjects = getSubjectsList(user.classLevel || '10', user.stream || null);
    const isExamLive = settings?.isMegaTestLive;

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* GLOBAL MEGA EXAM BANNER */}
            <div className={`rounded-[40px] p-8 text-white mb-10 shadow-2xl relative overflow-hidden group transition-all transform hover:scale-[1.01] ${isExamLive ? 'bg-gradient-to-br from-indigo-700 via-blue-800 to-purple-900 ring-8 ring-blue-500/20' : 'bg-slate-200 text-slate-500'}`}>
                <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform rotate-12"><Rocket size={200} /></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className={`p-3 rounded-2xl ${isExamLive ? 'bg-white text-blue-700 shadow-2xl animate-pulse' : 'bg-slate-300 text-slate-500'}`}>
                            {isExamLive ? <Activity size={32} /> : <ShieldAlert size={32} />}
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter leading-none">{isExamLive ? 'MEGA WEEKLY EXAM LIVE' : 'EXAM CLOSED'}</h3>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${isExamLive ? 'text-blue-200' : 'text-slate-400'}`}>Eligibility: Class {user.classLevel} Student</p>
                        </div>
                    </div>
                    
                    {isExamLive ? (
                        <div className="mt-8 flex flex-col md:flex-row md:items-center gap-8">
                            <button onClick={startMegaTest} className="bg-white text-blue-900 px-10 py-5 rounded-[24px] font-black text-xl shadow-2xl shadow-blue-950/40 hover:scale-105 active:scale-95 transition-all">ENTER EXAM HALL</button>
                            <div className="flex gap-6">
                                <div className="text-center bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl border border-white/10">
                                    <div className="text-xl font-black text-yellow-400">{settings?.megaTestPrizes.rank1} CR</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-blue-100">Rank 1 Prize</div>
                                </div>
                                <div className="text-center bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl border border-white/10">
                                    <div className="text-xl font-black text-blue-100">{settings?.megaTestQuestionLimit}</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-blue-100">Questions</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-6 text-sm font-bold italic opacity-60">The global exam room is currently locked. Admin will open it on the scheduled date.</p>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">Standard Syllabus</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((subj, idx) => (
                    <div key={idx} onClick={() => onSubjectSelect(subj)} className="p-6 rounded-[32px] border-2 bg-white border-slate-100 hover:border-blue-500 hover:shadow-xl flex items-center gap-5 transition-all cursor-pointer group">
                        <div className={`h-14 w-14 ${subj.color.split(' ')[0]} rounded-2xl flex items-center justify-center text-current group-hover:scale-110 transition-transform shadow-sm`}>
                            <BookOpen size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-black text-lg text-slate-800 leading-none mb-1">{subj.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Chapters & Practice</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors"><ArrowRight size={20} /></div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  if (megaTestContent) {
      // Use standard LessonView for MegaTest
      const LessonView = require('./LessonView').LessonView;
      return <LessonView content={megaTestContent} subject={{id:'mega', name:'Mega Exam', color:'bg-blue-600', icon:'rocket'} as any} classLevel={user.classLevel || '10'} chapter={{id:'mega', title: 'Global Mega Exam Live'}} loading={false} onBack={() => setMegaTestContent(null)} />;
  }
  
  // Use packages from settings or fallback
  const packages: CreditPackage[] = settings?.packages?.length ? settings.packages : [
      { id: 'starter', name: 'Starter Pack', credits: 50, price: 10 },
      { id: 'pro', name: 'Pro Pack', credits: 200, price: 30 },
      { id: 'ultra', name: 'Ultra Pack', credits: 500, price: 50 },
      { id: 'mega', name: 'Mega Pack', credits: 1200, price: 100 },
      { id: 'god', name: 'God Mode', credits: 5000, price: 400 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-2">
        <div className={`grid ${settings?.isGameEnabled ? 'grid-cols-7' : 'grid-cols-6'} gap-2 bg-white p-3 rounded-[32px] border border-slate-200 shadow-sm mb-10 sticky top-20 z-20 overflow-x-auto scrollbar-hide`}>
            <button onClick={() => setActiveTab('ROUTINE')} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[75px] ${activeTab === 'ROUTINE' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><Calendar size={20} /><span className="text-[9px] font-black uppercase mt-1">Syllabus</span></button>
            <button onClick={() => setActiveTab('CHAT')} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[75px] ${activeTab === 'CHAT' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}><MessageCircle size={20} /><span className="text-[9px] font-black uppercase mt-1">Chat</span></button>
            <button onClick={() => setActiveTab('LEADERBOARD')} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[75px] ${activeTab === 'LEADERBOARD' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}><Trophy size={20} /><span className="text-[9px] font-black uppercase mt-1">Ranking</span></button>
            {settings?.isGameEnabled && <button onClick={() => setActiveTab('GAME')} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[75px] ${activeTab === 'GAME' ? 'bg-orange-100 text-orange-600' : 'text-slate-400 hover:bg-slate-50'}`}><Gamepad2 size={20} /><span className="text-[9px] font-black uppercase mt-1">Game</span></button>}
            <button onClick={() => setActiveTab('HISTORY')} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[75px] ${activeTab === 'HISTORY' ? 'bg-slate-100 text-slate-600' : 'text-slate-400 hover:bg-slate-50'}`}><History size={20} /><span className="text-[9px] font-black uppercase mt-1">Library</span></button>
            <button onClick={() => setActiveTab('REDEEM')} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[75px] ${activeTab === 'REDEEM' ? 'bg-slate-100 text-slate-600' : 'text-slate-400 hover:bg-slate-50'}`}><Gift size={20} /><span className="text-[9px] font-black uppercase mt-1">Gift</span></button>
            <button onClick={() => setActiveTab('PREMIUM')} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[75px] ${activeTab === 'PREMIUM' ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><Sparkles size={20} /><span className="text-[9px] font-black uppercase mt-1">Store</span></button>
        </div>

        <div className="min-h-[500px] pb-24">
            {activeTab === 'ROUTINE' && <RoutineView />}
            {activeTab === 'CHAT' && <UniversalChat currentUser={user} onUserUpdate={onRedeemSuccess} settings={settings} />}
            {activeTab === 'LEADERBOARD' && <Leaderboard />}
            {activeTab === 'GAME' && settings?.isGameEnabled && (user.isGameBanned ? <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100"><Ban size={48} className="mx-auto text-red-500 mb-4" /><h3 className="text-lg font-bold text-red-700">Access Denied</h3><p className="text-sm text-red-600">Admin has disabled the game for your account.</p></div> : <SpinWheel user={user} onUpdateUser={onRedeemSuccess} settings={settings} />)}
            {activeTab === 'HISTORY' && <HistoryPage />}
            {activeTab === 'REDEEM' && <div className="animate-in fade-in slide-in-from-bottom-2 duration-300"><RedeemSection user={user} onSuccess={onRedeemSuccess} /></div>}
            
            {activeTab === 'PREMIUM' && (
                <div className="animate-in zoom-in duration-300 pb-10">
                    <div className="bg-slate-900 rounded-2xl p-6 text-center text-white mb-8">
                        <h2 className="text-2xl font-bold mb-2">Buy Credits</h2>
                        <p className="text-slate-400 text-sm">Tap a package to open WhatsApp & Pay.</p>
                    </div>

                    {settings?.isPaymentEnabled === false ? (
                        <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-10 rounded-3xl border-2 border-slate-300 text-center shadow-inner">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"><Lock size={40} className="text-slate-400" /></div>
                            <h3 className="text-2xl font-black text-slate-700 mb-2">Store Locked</h3>
                            <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">{settings.paymentDisabledMessage || "Purchases are currently disabled by the Admin. Please check back later."}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {packages.map((pkg) => (
                                <div key={pkg.id} className="relative group">
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <button 
                                        onClick={() => handleBuyPackage(pkg)}
                                        className="relative w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-center hover:border-blue-500 hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden"
                                    >
                                        <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
                                            <ShoppingBag size={24} />
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-sm mb-1">{pkg.name}</h3>
                                        <div className="text-2xl font-black text-blue-600 mb-1">₹{pkg.price}</div>
                                        <div className="text-xs font-bold text-slate-400 mb-3">{pkg.credits} Credits</div>
                                        
                                        <div className="bg-slate-900 text-white text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1 group-hover:bg-blue-600 transition-colors">
                                            BUY <ArrowRight size={10} />
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="mt-8 text-center text-xs text-slate-400 max-w-md mx-auto">
                        <p>After clicking "Buy", you will be redirected to WhatsApp. Send the message and complete payment to Admin.</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
