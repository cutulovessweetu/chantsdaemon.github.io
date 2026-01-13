import React from 'react';

interface HeaderProps {
  onReset: () => void;
  onOpenStats: () => void;
  onToggleAuto: () => void;
  isAuto: boolean;
  currentTime: Date;
}

const Header: React.FC<HeaderProps> = ({ onReset, onOpenStats, onToggleAuto, isAuto, currentTime }) => {
  // Format: "Wed, Oct 25 • 10:30 PM"
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-30 pointer-events-none">
       {/* Left: Stats */}
       <button 
         onClick={onOpenStats}
         className="pointer-events-auto text-gold-500/60 hover:text-gold-400 transition-colors p-3 hover:bg-gold-900/10 rounded-full cursor-pointer"
         aria-label="Statistics"
       >
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
           <line x1="18" y1="20" x2="18" y2="10"></line>
           <line x1="12" y1="20" x2="12" y2="4"></line>
           <line x1="6" y1="20" x2="6" y2="14"></line>
         </svg>
       </button>

       {/* Center: Title & Date */}
       <div className="absolute left-1/2 transform -translate-x-1/2 top-4 flex flex-col items-center">
         <div className="text-gold-500/50 text-xs font-serif italic mb-1">
           Jay Shree Radha
         </div>
         <div className="text-gold-400/80 text-[10px] font-mono tracking-widest uppercase opacity-80">
           {formattedDate} <span className="text-gold-600/50 mx-1">|</span> {formattedTime}
         </div>
       </div>
       
       {/* Right: Controls */}
       <div className="flex flex-col items-end gap-2 pointer-events-auto mt-1">
         <button 
           onClick={onToggleAuto}
           className={`text-[10px] uppercase tracking-widest border rounded-full px-3 py-1.5 transition-all flex items-center gap-2 cursor-pointer ${
             isAuto 
               ? 'bg-gold-600/20 border-gold-500 text-gold-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
               : 'border-gold-900/50 text-gold-500/40 hover:text-gold-500 hover:border-gold-500/50'
           }`}
         >
           <span className={`w-1.5 h-1.5 rounded-full ${isAuto ? 'bg-gold-400 animate-pulse' : 'bg-gold-900'}`}></span>
           {isAuto ? 'Auto On' : 'Auto Off'}
         </button>

         <button 
           onClick={onReset}
           className="text-gold-500/40 hover:text-gold-500 text-[10px] uppercase tracking-widest hover:underline decoration-gold-900/50 underline-offset-4 transition-all px-2 py-1 cursor-pointer"
         >
           Reset
         </button>
       </div>
    </div>
  );
};

export default React.memo(Header);