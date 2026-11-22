import React from 'react';

interface RaceTrackProps {
  progress: number;
  className?: string;
}

export const RaceTrack: React.FC<RaceTrackProps> = ({ progress, className = '' }) => {
  const checkpoints = [0, 50, 100];
  
  return (
    <div className={`relative w-full ${className}`}>
      <svg viewBox="0 0 400 60" className="w-full h-16">
        <defs>
          <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f0f0f" />
            <stop offset="50%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0f0f0f" />
          </linearGradient>
          <pattern id="trackPattern" x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse">
            <rect width="20" height="10" fill="url(#trackGradient)" />
            <rect x="8" y="0" width="4" height="10" fill="#333" opacity="0.8" />
          </pattern>
          <pattern id="startPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="4" height="4" fill="#fff" />
            <rect x="0" y="2" width="4" height="2" fill="#000" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
          <pattern id="checkeredPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="4" height="4" fill="#000" />
            <rect x="4" y="4" width="4" height="4" fill="#000" />
            <rect x="0" y="4" width="4" height="4" fill="#fff" />
            <rect x="4" y="0" width="4" height="4" fill="#fff" />
          </pattern>
        </defs>
        <rect x="0" y="20" width="400" height="20" fill="url(#trackPattern)" rx="2" />
        <line x1="0" y1="20" x2="400" y2="20" stroke="#FFD700" strokeWidth="1" opacity="0.6" />
        <line x1="0" y1="40" x2="400" y2="40" stroke="#FFD700" strokeWidth="1" opacity="0.6" />
        <g>
          <rect x="12" y="15" width="3" height="30" fill="url(#startPattern)" opacity="0.85" />
          <rect x="385" y="15" width="9" height="30" fill="url(#checkeredPattern)" filter="url(#glow)" />
        </g>
        <line x1="16" y1="30" x2="384" y2="30" stroke="#FFD700" strokeWidth="1.2" opacity="0.35" strokeDasharray="8 10" />
        <line x1="0" y1="5" x2="400" y2="5" stroke="#FFD700" strokeWidth="0.5" opacity="0.22" />
        <line x1="0" y1="55" x2="400" y2="55" stroke="#FFD700" strokeWidth="0.5" opacity="0.22" />
        {[50, 100, 150, 250, 300, 350].map((x) => (
          <line 
            key={x}
            x1={x} 
            y1="10" 
            x2={x} 
            y2="50" 
            stroke="#FFD700" 
            strokeWidth="0.3" 
            opacity="0.18"
          />
        ))}
        <rect x="0" y="45" width="400" height="2" fill="#FFD700" opacity="0.08" />
        <rect x="0" y="53" width="400" height="2" fill="#FFD700" opacity="0.05" />
      </svg>
    </div>
  );
};
