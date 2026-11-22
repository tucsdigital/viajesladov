import React, { useState, useEffect } from 'react';
import { F1CarSVG } from './F1CarSVG';
import { RaceTrack } from './RaceTrack';
import { Checkpoint } from './RaceComponents';

interface RaceProgressCardProps {
  progress: number;
  currentLevel: 'base' | 'plus' | 'elite';
  lapsToNext?: number;
  className?: string;
}

export const RaceProgressCard: React.FC<RaceProgressCardProps> = ({ 
  progress, 
  currentLevel, 
  lapsToNext,
  className = '' 
}) => {
  const [isMoving, setIsMoving] = useState(false);
  const [prevProgress, setPrevProgress] = useState(progress);

  useEffect(() => {
    if (progress !== prevProgress) {
      setIsMoving(true);
      const timer = setTimeout(() => setIsMoving(false), 1000);
      setPrevProgress(progress);
      return () => clearTimeout(timer);
    }
  }, [progress, prevProgress]);

  const getCarColor = () => {
    switch (currentLevel) {
      case 'elite': return '#8B5CF6';
      case 'plus': return '#0EA5E9';
      default: return '#F59E0B';
    }
  };

  const getNextLevelText = () => {
    if (currentLevel === 'elite') return '¡Nivel máximo alcanzado!';
    if (lapsToNext) return `Te faltan ${lapsToNext} vueltas para llegar a ${currentLevel === 'base' ? 'Plus' : 'Elite'}`;
    return 'Sigue acumulando vueltas';
  };

  const carPosition = Math.max(5, Math.min(95, progress));

  return (
    <div className={`relative rounded-2xl border border-white/20 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 ${className}`}>
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-10" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-10" />
      </div>

      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          <h3 className="text-sm font-bold text-white tracking-wider uppercase">Carrera de nivel</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-mono font-bold text-yellow-400">{Math.round(progress)}%</span>
          <div className="w-3 h-3 border border-yellow-400 rounded-sm animate-spin" style={{ borderTopColor: 'transparent' }} />
        </div>
      </div>

      <div className="relative z-10 mb-6 pb-5">
        <RaceTrack progress={progress} />
        <div 
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{ left: `${carPosition}%` }}
        >
          <F1CarSVG color={getCarColor()} isMoving={isMoving} />
          {isMoving && (
            <div className="absolute top-1/2 left-0 -translate-x-full -translate-y-1/2">
              <div className="w-8 h-1 bg-gradient-to-l from-transparent to-white/40 rounded-full" />
              <div className="w-6 h-0.5 bg-gradient-to-l from-transparent to-white/20 rounded-full mt-1" />
            </div>
          )}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-12 rounded-full opacity-30"
            style={{
              background: `radial-gradient(circle, ${getCarColor()}40 0%, transparent 70%)`,
              filter: 'blur(8px)'
            }}
          />
        </div>

        <div className="absolute left-0 w-full flex justify-between px-2" style={{ top: '42px' }}>
          <Checkpoint active={progress >= 0} label="BASE" position={0} />
          <Checkpoint active={progress >= 50} label="PLUS" position={50} />
          <Checkpoint active={progress >= 100} label="ELITE" position={100} />
        </div>
      </div>

      <div className="relative z-10 text-center">
        <p className="text-xs text-white/80 font-medium tracking-wide">{getNextLevelText()}</p>
        {progress >= 100 && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-semibold">¡Meta alcanzada!</span>
          </div>
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-full bg-gradient-to-b from-transparent via-blue-400/10 to-transparent"
            style={{
              left: `${20 + i * 30}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};
