import React from 'react';

interface F1CarSVGProps {
  color?: string;
  isMoving?: boolean;
  className?: string;
}

export const F1CarSVG: React.FC<F1CarSVGProps> = ({
  color = '#FFD700',
  isMoving = false,
  className = '',
}) => {
  return (
    <div
      className={`relative ${className} ${
        isMoving ? 'f1-car-moving' : 'f1-car-idle'
      }`}
    >
      <img
        src="/images/cardF1.svg"
        alt="F1 car"
        className="h-10 w-auto select-none pointer-events-none"
      />
      <div
        className="pointer-events-none absolute inset-x-3 bottom-0 h-4 opacity-70"
        style={{
          background: `radial-gradient(circle, ${color}55 0%, transparent 65%)`,
          filter: 'blur(8px)',
        }}
      />
      <style jsx>{`
        @keyframes f1Idle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-0.8px);
          }
        }
        @keyframes f1Moving {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-1.6px);
          }
        }
        .f1-car-idle {
          animation: f1Idle 2.2s ease-in-out infinite;
        }
        .f1-car-moving {
          animation: f1Moving 0.7s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
