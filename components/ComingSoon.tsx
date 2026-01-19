import React from "react";
import { X, Construction, Zap, BellRing, ArrowLeft } from "lucide-react";

interface ComingSoonProps {
  onClose: () => void;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ onClose }) => {
  return (
    <div className="w-[90%] max-w-[400px] bg-white p-8 sm:p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative animate-in zoom-in duration-300 overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-400 rounded-full blur-[80px] opacity-10"></div>

      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-full transition-all z-10"
      >
        <X size={20} />
      </button>

      <div className="text-center relative z-10">
        {/* Compact Icon Container */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 text-slate-900 rounded-[1.8rem] shadow-2xl shadow-yellow-400/30 mb-6 sm:mb-8 animate-bounce">
          <Construction size={32} strokeWidth={2.5} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter mb-3 leading-none uppercase">
          Under Construction
        </h1>

        <p className="text-slate-500 font-medium text-sm sm:text-base mb-8 sm:mb-10 leading-relaxed">
          We're currently fine-tuning our authentication systems to ensure
          maximum security for your parking data.
        </p>

        <div className="space-y-4 sm:space-y-6">
          {/* Smaller "Coming Next" Box */}
          <div className="p-5 sm:p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-left flex gap-4 items-start">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl flex-shrink-0">
              <Zap size={18} fill="currentColor" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm leading-tight mb-1">
                Coming Next
              </h3>
              <p className="text-slate-400 text-[10px] sm:text-[11px] font-medium leading-normal">
                Real-time slot tracking and automated billing systems.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 sm:py-5 bg-slate-900 text-white font-black rounded-2xl sm:rounded-[1.8rem] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group active:scale-[0.98] shadow-2xl shadow-slate-900/20 text-xs sm:text-sm uppercase tracking-widest"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            BACK TO EXPLORE
          </button>

          <div className="pt-4 sm:pt-6">
            <button className="text-yellow-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto hover:text-yellow-700 transition-colors">
              <BellRing size={14} /> Stay Tuned
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mt-10 text-center">
        <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
          Version 2.4.0 • Parking Hut Grid
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
