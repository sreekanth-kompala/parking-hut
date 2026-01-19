import React from 'react';
import { X, Hammer, Construction, Zap, BellRing, ArrowLeft } from 'lucide-react';

interface ComingSoonProps {
  onClose: () => void;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ onClose }) => {
  return (
    <div className="w-full max-w-[500px] bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl border border-slate-100 relative animate-in zoom-in duration-300 overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-400 rounded-full blur-[100px] opacity-10"></div>
      
      <button 
        onClick={onClose} 
        className="absolute top-10 right-10 p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-full transition-all z-10"
      >
        <X size={24} />
      </button>

      <div className="text-center relative z-10">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-400 text-slate-900 rounded-[2.5rem] shadow-2xl shadow-yellow-400/30 mb-10 animate-bounce">
          <Construction size={48} strokeWidth={2.5} />
        </div>

        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 leading-none uppercase">
          Under Construction
        </h1>
        
        <p className="text-slate-500 font-medium text-xl mb-12 leading-relaxed">
          We're currently fine-tuning our authentication systems to ensure maximum security for your parking data.
        </p>

        <div className="space-y-6">
          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-left flex gap-6 items-start">
            <div className="p-4 bg-yellow-100 text-yellow-600 rounded-2xl">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg leading-tight mb-1">Coming Next</h3>
              <p className="text-slate-400 text-sm font-medium">Real-time slot tracking and automated billing systems.</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 transition-all flex items-center justify-center gap-4 group active:scale-[0.98] shadow-2xl shadow-slate-900/20"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            BACK TO EXPLORE
          </button>
          
          <div className="pt-8">
            <button className="text-yellow-600 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto hover:text-yellow-700 transition-colors">
              <BellRing size={16} /> Stay Tuned
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
          Version 2.4.0 • Parking Hut Grid
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;