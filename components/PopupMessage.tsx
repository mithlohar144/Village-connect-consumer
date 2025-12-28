
import React, { useEffect } from 'react';
import { useStore } from '../store';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const PopupMessage: React.FC = () => {
  const { popup, showPopup } = useStore();

  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => {
        showPopup(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [popup, showPopup]);

  if (!popup) return null;

  const Icon = {
    success: CheckCircle2,
    error: AlertTriangle,
    info: Info
  }[popup.type];

  const colors = {
    success: 'bg-primary/95 text-white ring-primary/20',
    error: 'bg-red-600/95 text-white ring-red-200',
    info: 'bg-blue-600/95 text-white ring-blue-200'
  }[popup.type];

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[200] animate-in slide-in-from-top-10 fade-in duration-300">
      <div className={`backdrop-blur-xl ${colors} p-5 rounded-[32px] shadow-2xl ring-4 flex items-start gap-4 relative overflow-hidden`}>
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-white/10 opacity-20 animate-pulse pointer-events-none" />
        
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
          <Icon size={24} />
        </div>
        
        <div className="flex-1 pr-6">
          <h4 className="font-black text-sm uppercase tracking-tight">{popup.title}</h4>
          <p className="text-xs font-medium opacity-90 mt-1 leading-relaxed">{popup.message}</p>
        </div>

        <button 
          onClick={() => showPopup(null)}
          className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
