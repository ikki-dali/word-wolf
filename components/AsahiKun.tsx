import React from 'react';

interface AsahiKunProps {
  mood?: 'happy' | 'worry' | 'excited';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AsahiKun: React.FC<AsahiKunProps> = ({ mood = 'happy', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} relative animate-bounce-slow`}>
        {/* Sun Rays */}
        <svg viewBox="0 0 100 100" className="w-full h-full text-orange-400 absolute top-0 left-0 animate-spin-slow">
          <path d="M50 0L60 20L85 15L80 40L100 50L80 60L85 85L60 80L50 100L40 80L15 85L20 60L0 50L20 40L15 15L40 20Z" fill="currentColor" opacity="0.3" />
        </svg>
        {/* Face Body */}
        <div className="absolute inset-2 bg-yellow-300 rounded-full border-4 border-orange-400 shadow-lg flex items-center justify-center overflow-hidden">
          {/* Eyes */}
          <div className="absolute top-1/3 left-1/4 w-2 h-3 bg-gray-800 rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-3 bg-gray-800 rounded-full"></div>
          {/* Cheeks */}
          <div className="absolute top-1/2 left-1 w-3 h-2 bg-pink-400 rounded-full opacity-60"></div>
          <div className="absolute top-1/2 right-1 w-3 h-2 bg-pink-400 rounded-full opacity-60"></div>

          {/* Mouth */}
          {mood === 'happy' && (
            <div className="absolute bottom-1/4 w-6 h-3 border-b-4 border-gray-800 rounded-full"></div>
          )}
          {mood === 'worry' && (
            <div className="absolute bottom-1/4 w-4 h-2 bg-gray-800 rounded-full animate-pulse"></div>
          )}
          {mood === 'excited' && (
            <div className="absolute bottom-1/4 w-6 h-4 bg-red-500 rounded-b-full border-2 border-gray-800"></div>
          )}
        </div>
      </div>
      <div className="mt-2 bg-white px-3 py-1 rounded-full border-2 border-orange-300 text-xs font-bold text-orange-600 shadow-sm whitespace-nowrap">
        あさひくん
      </div>
    </div>
  );
};
