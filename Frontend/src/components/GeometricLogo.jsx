import React from 'react';

export const GeometricLogo = () => {
  return (
    <div className="relative w-[480px] h-[480px] flex items-center justify-center">
      <svg
        width="420"
        height="540"
        viewBox="0 0 280 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute"
      >
        <defs>
          {/* Gradients unchanged */}
          <linearGradient id="topLeftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB3D1" />
            <stop offset="50%" stopColor="#F8BBD9" />
            <stop offset="100%" stopColor="#E8C5E5" />
          </linearGradient>
          <linearGradient id="topRightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8F0F0" />
            <stop offset="50%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          <linearGradient id="middleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0E7FF" />
            <stop offset="30%" stopColor="#C7D2FE" />
            <stop offset="70%" stopColor="#A5B4FC" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="bottomLeftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="50%" stopColor="#FDBA74" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
          <linearGradient id="bottomRightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="50%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>

        {/* Shapes unchanged */}
        <path d="M140 20 L140 180 L40 180 Z" fill="url(#topLeftGradient)" opacity="0.9" />
        <path d="M140 20 L240 180 L140 180 Z" fill="url(#topRightGradient)" opacity="0.9" />
        <path d="M40 180 L140 180 L240 180 L140 220 Z" fill="url(#middleGradient)" opacity="0.95" />
        <path d="M40 180 L140 220 L140 340 Z" fill="url(#bottomLeftGradient)" opacity="0.8" />
        <path d="M240 180 L140 340 L140 220 Z" fill="url(#bottomRightGradient)" opacity="0.8" />
        <path d="M140 180 L190 180 L140 200 Z" fill="url(#topRightGradient)" opacity="0.4" />
        <path d="M140 180 L90 180 L140 200 Z" fill="url(#topLeftGradient)" opacity="0.4" />
      </svg>
    </div>
  );
};
