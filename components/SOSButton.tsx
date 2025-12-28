
import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { useNavigate } from 'react-router-dom';

export const SOSButton: React.FC = () => {
  const { language } = useStore();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  const startPress = () => {
    setIsPressing(true);
    setProgress(0);
    const startTime = Date.now();
    const duration = 1500; // Faster response: 1.5 seconds

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min((elapsed / duration) * 100, 100);
      setProgress(p);

      if (p === 100) {
        handleSOS();
        stopPress();
      }
    }, 20);
  };

  const stopPress = () => {
    setIsPressing(false);
    setProgress(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleSOS = () => {
    // Navigate to dedicated Emergency screen on long press completion
    navigate('/emergency');
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-center">
      {isPressing && (
        <div className="mb-2 bg-white px-3 py-1 rounded-full shadow-lg border border-red-100 text-[10px] font-bold text-danger animate-bounce uppercase">
          Hold to Alert
        </div>
      )}
      <button
        onMouseDown={startPress}
        onMouseUp={stopPress}
        onMouseLeave={stopPress}
        onTouchStart={startPress}
        onTouchEnd={stopPress}
        className="relative w-16 h-16 bg-danger rounded-full shadow-2xl flex items-center justify-center text-white active:scale-95 transition-transform"
      >
        <div 
          className="absolute inset-0 rounded-full border-4 border-white opacity-20"
        />
        {isPressing && (
          <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="white"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray="175.9"
              strokeDashoffset={175.9 - (175.9 * progress) / 100}
              strokeLinecap="round"
            />
          </svg>
        )}
        <div className="flex flex-col items-center">
          <AlertCircle size={28} />
          <span className="text-[10px] font-bold leading-none mt-0.5">{t.sos}</span>
        </div>
      </button>
    </div>
  );
};
