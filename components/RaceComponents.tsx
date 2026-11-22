import React from 'react';

interface CheckpointProps {
  active?: boolean;
  label: string;
  position: number;
  className?: string;
}

export const Checkpoint: React.FC<CheckpointProps> = ({ 
  active = false, 
  label, 
  position, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`w-1 h-6 rounded-sm ${active ? 'bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)]' : 'bg-white/20'}`} />
      <div className={`mt-1 text-[10px] font-semibold tracking-wide ${active ? 'text-yellow-400' : 'text-white/50'}`}>{label}</div>
    </div>
  );
};

interface FinishFlagProps {
  className?: string;
}

export const FinishFlag: React.FC<FinishFlagProps> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="w-1 h-16 bg-gradient-to-b from-gray-300 to-gray-600 rounded-sm" />
      <div className="absolute top-0 left-1 w-8 h-6 rounded-sm overflow-hidden shadow-lg">
        <svg viewBox="0 0 32 24" className="w-full h-full">
          <pattern id="checkers" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="4" height="4" fill="#000" />
            <rect x="4" y="4" width="4" height="4" fill="#000" />
            <rect x="0" y="4" width="4" height="4" fill="#fff" />
            <rect x="4" y="0" width="4" height="4" fill="#fff" />
          </pattern>
          <rect width="32" height="24" fill="url(#checkers)" />
        </svg>
      </div>
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50" />
      </div>
    </div>
  );
};
