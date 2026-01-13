import React from 'react';

interface CounterProps {
  count: number;
}

const Counter: React.FC<CounterProps> = ({ count }) => {
  // Format number with commas for better readability (e.g., 1,000)
  // use memo if this becomes expensive, but for simple numbers it is fast.
  const formattedCount = new Intl.NumberFormat('en-IN').format(count);

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-gold-200 text-xs tracking-widest uppercase opacity-70">
        Total Chants
      </div>
      {/* 
        Key is set to count so React remounts/retriggers the animation on every change. 
        Using CSS animation 'animate-bump' (100ms) defined in tailwind config.
      */}
      <div 
        key={count}
        className="text-5xl font-mono font-medium tracking-tight tabular-nums drop-shadow-md animate-bump text-gold-100"
      >
        {formattedCount}
      </div>
    </div>
  );
};

export default React.memo(Counter);