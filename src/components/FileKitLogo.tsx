import React from 'react';
import logoImg from '../assets/images/filekit_logo_1786798596514.jpg';

interface FileKitLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const FileKitLogo: React.FC<FileKitLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const imgSizeMap = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl',
  };

  const textSizeMap = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative group cursor-pointer">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 rounded-xl blur-[2px] opacity-75 group-hover:opacity-100 transition duration-200"></div>
        <img
          src={logoImg}
          alt="FileKit AI Logo"
          referrerPolicy="no-referrer"
          className={`relative object-cover shadow-md shadow-blue-500/25 border border-white/20 transition-transform duration-200 group-hover:scale-105 ${imgSizeMap[size]}`}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-black text-slate-900 tracking-tight font-display ${textSizeMap[size]}`}>
            FILEKIT <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI</span>
          </span>
        </div>
      )}
    </div>
  );
};
