import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  variant?: 'default' | 'light' | 'white';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  variant = 'default'
}) => {
  const iconSizeClass = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textSizeClass = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';
  const isLight = variant === 'light' || variant === 'white';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Calm Medical Cross Symbol */}
      <div
        className={`relative flex items-center justify-center ${iconSizeClass} rounded-xl shadow-xs shrink-0 ${
          isLight ? 'bg-teal-600 text-white' : 'bg-teal-800 text-white'
        }`}
      >
        <div className="w-3.5 h-1.5 bg-white rounded-xs" />
        <div className="absolute w-1.5 h-3.5 bg-white rounded-xs" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-semibold tracking-tight ${
              isLight ? 'text-white' : 'text-slate-800'
            } ${textSizeClass}`}
          >
            CareOps
            <span
              className={`font-bold ml-0.5 ${
                isLight ? 'text-teal-300' : 'text-teal-700'
              }`}
            >
              Health
            </span>
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-xs font-normal tracking-tight mt-0.5 ${
              isLight ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Healthcare Operations Platform
          </span>
        )}
      </div>
    </div>
  );
};
