import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-[11000] p-6 text-center pt-safe">
      {/* Brand Icon with Glow Effect */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-yellow-400 rounded-[2rem] blur-3xl opacity-20 animate-pulse scale-150"></div>
        <div className="relative w-24 h-24 bg-yellow-400 rounded-[2.2rem] flex items-center justify-center shadow-2xl shadow-yellow-400/30 animate-bounce transition-all duration-1000">
          <span className="text-5xl font-black text-slate-900 select-none">P</span>
        </div>
      </div>

      {/* App Identity */}
      <div className="animate-fade-in-up delay-200">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">Parking Hut</h2>
        <p className="text-slate-400 font-medium mb-6">Peer-to-peer parking network</p>
        
        {/* Animated Dots */}
        <div className="flex gap-2 justify-center mb-10">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
        </div>

        {/* Status Text */}
        <div className="px-6 py-2 bg-white rounded-full border border-slate-100 shadow-sm inline-flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
             Synchronizing Grid...
           </span>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-12 text-slate-300 font-black text-[10px] uppercase tracking-[0.3em] select-none">
        ELEVATING URBAN MOBILITY
      </div>
    </div>
  );
};

export default LoadingScreen;