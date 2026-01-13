import React, { useEffect } from 'react';
import { RippleData } from '../types';
import { RIPPLE_DURATION_MS } from '../constants';

interface RippleProps {
  data: RippleData;
  onComplete: () => void;
}

const Ripple: React.FC<RippleProps> = ({ data, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, RIPPLE_DURATION_MS);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: data.x,
        top: data.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="flex items-center justify-center animate-radiate">
        <span className="text-4xl font-bold text-gold-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] whitespace-nowrap">
          {data.text}
        </span>
      </div>
    </div>
  );
};

export default React.memo(Ripple);