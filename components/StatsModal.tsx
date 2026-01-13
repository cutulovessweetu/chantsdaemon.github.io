import React, { useState, useMemo } from 'react';
import { DailyHistory, TimeRange } from '../types';
import { getChartData, getLogData } from '../utils';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DailyHistory;
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, history }) => {
  const [range, setRange] = useState<TimeRange>('week');

  const chartData = useMemo(() => {
    if (range === 'log') return [];
    return getChartData(history, range);
  }, [history, range]);

  const logData = useMemo(() => {
    if (range !== 'log') return [];
    return getLogData(history);
  }, [history, range]);
  
  // Find max value for scaling the bars (prevent divide by zero)
  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-gold-900/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.1)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gold-900/30 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
          <h2 className="text-2xl font-serif text-gold-400">Your Progress</h2>
          <button onClick={onClose} className="p-2 text-gold-600 hover:text-gold-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 bg-slate-950/50">
          {(['week', 'month', 'year', 'log'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`flex-1 py-2 text-xs uppercase tracking-widest rounded-lg transition-all ${
                range === r 
                  ? 'bg-gold-600 text-white shadow-lg' 
                  : 'bg-slate-800 text-gold-500/50 hover:bg-slate-700 hover:text-gold-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-slate-900/50">
          {range === 'log' ? (
            // Log View
            <div className="h-64 min-h-[250px] p-4 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gold-900/50 scrollbar-track-transparent">
               {logData.length === 0 ? (
                 <div className="flex items-center justify-center h-full text-gold-500/30 text-sm italic">
                   No history recorded yet
                 </div>
               ) : (
                 logData.map((entry) => (
                   <div key={entry.dateKey} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/40 border border-gold-900/10 hover:bg-slate-800/80 hover:border-gold-500/20 transition-all">
                     <span className="text-gold-200/80 text-xs font-serif tracking-wide">{entry.formattedDate}</span>
                     <span className="text-gold-400 font-mono font-bold">{entry.count.toLocaleString()}</span>
                   </div>
                 ))
               )}
            </div>
          ) : (
            // Chart View
            <div className="flex-1 p-6 flex items-end justify-between space-x-2 h-64 min-h-[250px] w-full overflow-x-auto">
              {chartData.map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group min-w-[20px]">
                  {/* Tooltip-ish value on hover */}
                  <div className="mb-2 text-[10px] text-gold-200 opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-6 bg-slate-800 px-1 rounded z-10 pointer-events-none whitespace-nowrap border border-gold-900/50">
                    {point.value}
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className={`w-full max-w-[30px] rounded-t-sm transition-all duration-500 ease-out relative ${
                      point.isToday ? 'bg-gold-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-gold-900/40 hover:bg-gold-700/60'
                    }`}
                    style={{ height: `${(point.value / maxValue) * 100}%` }}
                  >
                    {/* Min height for visibility if value is 0 but entry exists */}
                    {point.value === 0 && <div className="h-1 w-full bg-gold-900/20 absolute bottom-0" />}
                  </div>

                  {/* Label */}
                  <div className="mt-2 text-[10px] text-gold-500/50 uppercase truncate w-full text-center">
                    {point.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-950/30 border-t border-gold-900/20 text-center">
            <p className="text-gold-500/60 text-xs italic">
                "Every name is a step closer."
            </p>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;