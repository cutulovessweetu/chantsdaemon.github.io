import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CHANT_TEXT, CHANT_RATE_MS } from './constants';
import { RippleData, TouchPosition, DailyHistory } from './types';
import { getTodayKey, loadHistory, saveHistory } from './utils';
import Ripple from './components/Ripple';
import Counter from './components/Counter';
import Header from './components/Header';
import StatsModal from './components/StatsModal';

const App: React.FC = () => {
  // --- State ---
  
  // Current time state to drive clock and auto-reset at midnight
  const [now, setNow] = useState<Date>(new Date());

  // We keep the history object in state
  const [history, setHistory] = useState<DailyHistory>(() => loadHistory());
  
  // Derived state: Today's count
  const todayKey = getTodayKey();
  const todayCount = history[todayKey] || 0;

  const [ripples, setRipples] = useState<RippleData[]>([]);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [isAutoChanting, setIsAutoChanting] = useState<boolean>(false);
  const [touchPos, setTouchPos] = useState<TouchPosition>({ x: 0, y: 0 });
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // --- Refs ---
  const isPressingRef = useRef(isPressing);
  const touchPosRef = useRef(touchPos);
  const intervalRef = useRef<number | null>(null);
  const historyRef = useRef(history);

  // Sync refs
  useEffect(() => { isPressingRef.current = isPressing; }, [isPressing]);
  useEffect(() => { touchPosRef.current = touchPos; }, [touchPos]);
  
  // Keep history ref updated for the save interval
  useEffect(() => { historyRef.current = history; }, [history]);

  // --- Clock Timer ---
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Persistence Timer ---
  // Save to localStorage every 2 seconds to avoid blocking the main thread on every tap
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveHistory(historyRef.current);
    }, 2000);

    // Also save on unmount
    return () => {
      clearInterval(saveInterval);
      saveHistory(historyRef.current);
    };
  }, []);

  // --- Logic ---
  const triggerChant = useCallback((overridePos?: {x: number, y: number}) => {
    // Determine the *current* date key at the moment of chanting.
    const currentKey = getTodayKey();

    setHistory(prevHistory => {
      const currentVal = prevHistory[currentKey] || 0;
      return {
        ...prevHistory,
        [currentKey]: currentVal + 1
      };
    });

    // Use override position (for auto chant) or current touch position
    const pos = overridePos || touchPosRef.current;

    // Add Ripple
    const newRipple: RippleData = {
      id: Date.now() + Math.random(),
      x: pos.x,
      y: pos.y,
      text: CHANT_TEXT
    };
    
    // Use functional update to avoid dependency issues, but limit array size if needed
    setRipples(prev => {
      // Performance safety: don't let ripples grow indefinitely if animation cleanup fails
      if (prev.length > 50) return [...prev.slice(10), newRipple];
      return [...prev, newRipple];
    });

  }, []);

  const removeRipple = useCallback((id: number) => {
    setRipples(prev => prev.filter(r => r.id !== id));
  }, []);

  // --- Auto Chant Effect ---
  useEffect(() => {
    if (!isAutoChanting) return;

    // Center of screen for auto ripples
    const getAutoPos = () => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      // Add slight randomness
      const offset = 60;
      return {
        x: cx + (Math.random() * offset * 2 - offset),
        y: cy + (Math.random() * offset * 2 - offset)
      };
    };

    // Chant interval: 4 times a second
    const chantInterval = setInterval(() => {
      triggerChant(getAutoPos());
    }, CHANT_RATE_MS);

    // Vibration interval: Every 10 seconds
    const vibrationInterval = setInterval(() => {
      if (navigator.vibrate) {
        navigator.vibrate(200); // 200ms vibration
      }
    }, 10000);

    return () => {
      clearInterval(chantInterval);
      clearInterval(vibrationInterval);
    };
  }, [isAutoChanting, triggerChant]);


  // --- Manual Touch Loop ---
  useEffect(() => {
    const startLoop = () => {
      if (intervalRef.current) return;
      
      triggerChant();

      intervalRef.current = window.setInterval(() => {
        if (isPressingRef.current) {
          triggerChant();
        } else {
          stopLoop();
        }
      }, CHANT_RATE_MS);
    };

    const stopLoop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (isPressing) {
      startLoop();
    } else {
      stopLoop();
    }

    return () => stopLoop();
  }, [isPressing, triggerChant]);

  // --- Event Handlers ---
  const updatePosition = (e: React.TouchEvent | React.MouseEvent) => {
    let clientX, clientY;
    let hasData = false;
    
    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        hasData = true;
      }
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
      hasData = true;
    }

    if (hasData) {
      const Y_OFFSET = -50;
      const newPos = { x: clientX!, y: clientY! + Y_OFFSET };
      setTouchPos(newPos);
      touchPosRef.current = newPos;
    }
  };

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    updatePosition(e);
    setIsPressing(true);
  };

  const handleEnd = () => setIsPressing(false);

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (isPressing) updatePosition(e);
  };

  const handleReset = () => {
    if (window.confirm("Reset today's counter to 0?")) {
      const key = getTodayKey();
      const newHistory = { ...history, [key]: 0 };
      setHistory(newHistory);
      // Immediate save on critical action
      saveHistory(newHistory);
    }
  };

  const toggleAutoChant = () => {
    setIsAutoChanting(prev => !prev);
  };

  return (
    <div className="relative h-[100dvh] w-full bg-slate-950 overflow-hidden flex flex-col font-serif select-none">
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-gold-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[10%] w-[400px] h-[400px] bg-gold-500/10 rounded-full blur-[80px]" />
      </div>

      {/* Top Half */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 border-b border-gold-900/30">
        <Header 
          onReset={handleReset} 
          onOpenStats={() => setIsStatsOpen(true)}
          onToggleAuto={toggleAutoChant}
          isAuto={isAutoChanting}
          currentTime={now}
        />
        
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <div className="text-center animate-pulse-slow">
            <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold-300 via-gold-500 to-gold-700 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              {CHANT_TEXT}
            </h1>
          </div>
          <Counter count={todayCount} />
        </div>
      </div>

      {/* Bottom Half: Touch Zone */}
      <div 
        className="relative z-10 flex-1 w-full bg-gradient-to-t from-gold-900/20 to-transparent cursor-pointer active:bg-gold-900/10 transition-colors duration-300"
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onMouseMove={handleMove}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onTouchMove={handleMove}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <p className="text-gold-200 text-sm tracking-[0.2em] uppercase font-light">
            {isAutoChanting ? 'Auto Chanting Active' : 'Touch & Hold to Chant'}
          </p>
        </div>

        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
           {ripples.map(ripple => (
             <Ripple 
               key={ripple.id}
               data={ripple}
               onComplete={() => removeRipple(ripple.id)}
             />
           ))}
        </div>
      </div>

      {/* Stats Modal */}
      <StatsModal 
        isOpen={isStatsOpen} 
        onClose={() => setIsStatsOpen(false)} 
        history={history} 
      />

    </div>
  );
};

export default App;