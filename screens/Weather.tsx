
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { 
  ChevronLeft, 
  Droplets, 
  Wind, 
  Thermometer, 
  Calendar, 
  Sprout, 
  CloudSun, 
  CloudRain, 
  Sun,
  Info,
  AlertCircle,
  Cloud
} from 'lucide-react';

export const Weather: React.FC = () => {
  const navigate = useNavigate();
  const { language, weather, currentVillage } = useStore();
  const t = TRANSLATIONS[language];

  if (!weather) return null;

  const getWeatherIcon = (condition: string, size = 24) => {
    const c = condition.toLowerCase();
    if (c.includes('rain')) return <CloudRain size={size} className="text-blue-400" />;
    if (c.includes('partly')) return <CloudSun size={size} className="text-orange-300" />;
    if (c.includes('clear') || c.includes('sun')) return <Sun size={size} className="text-yellow-500" />;
    return <Cloud size={size} className="text-gray-400" />;
  };

  const getBgGradient = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain')) return 'from-blue-600 to-indigo-800';
    if (c.includes('cloud')) return 'from-slate-400 to-slate-600';
    return 'from-orange-400 to-yellow-600';
  };

  return (
    <div className="min-h-screen bg-neutral pb-24">
      {/* Header Card */}
      <div className={`relative px-6 pt-12 pb-20 text-white bg-gradient-to-br ${getBgGradient(weather.condition)} rounded-b-[48px] shadow-2xl overflow-hidden`}>
        {/* Decorative Circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/20 backdrop-blur-md rounded-2xl mb-8 active:scale-90 transition-all">
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 animate-bounce">
              {getWeatherIcon(weather.condition, 80)}
            </div>
            <h1 className="text-6xl font-black tracking-tight">{weather.temp}°</h1>
            <p className="text-xl font-bold uppercase tracking-widest mt-2 opacity-80">{weather.condition}</p>
            <p className="text-xs font-black uppercase tracking-[0.2em] mt-2 text-white/60">{currentVillage}</p>
            
            <div className="flex gap-8 mt-10 w-full justify-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                   <Droplets size={24} />
                </div>
                <span className="text-xs font-black uppercase mt-1">{weather.humidity}%</span>
                <span className="text-[10px] uppercase font-bold opacity-60">{t.humidity}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                   <Wind size={24} />
                </div>
                <span className="text-xs font-black uppercase mt-1">{weather.windSpeed} km/h</span>
                <span className="text-[10px] uppercase font-bold opacity-60">{t.wind}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advisory Section */}
      <div className="px-6 -mt-10 relative z-20">
        <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                 <Sprout size={20} />
              </div>
              <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">{t.agricultureTip}</h3>
           </div>
           <p className="text-sm font-medium text-gray-600 leading-relaxed italic">
             "{weather.advisory}"
           </p>
           <div className="pt-2 flex items-center gap-2 text-[10px] text-primary font-bold uppercase">
              <Sparkles size={12} />
              AI Insights for {currentVillage}
           </div>
        </div>
      </div>

      {/* 5 Day Forecast */}
      <div className="px-6 mt-8 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs ml-1">5-Day Forecast</h3>
          <Calendar size={16} className="text-gray-400" />
        </div>
        
        <div className="space-y-3">
           {weather.forecast.map((f, i) => (
             <div key={i} className="bg-white p-5 rounded-[28px] border border-gray-50 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center">
                      {getWeatherIcon(f.condition)}
                   </div>
                   <div>
                      <p className="font-bold text-gray-800">{f.day}</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{f.condition}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-xl font-black text-gray-800">{f.temp}°</p>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="px-6 mt-8">
         <div className="p-5 bg-orange-50 border border-orange-100 rounded-[28px] flex gap-4">
            <AlertCircle className="text-orange-500 shrink-0" />
            <div>
               <p className="text-xs font-bold text-orange-800 uppercase">Pro Tip</p>
               <p className="text-[10px] text-orange-700 font-medium leading-relaxed">Check local mandi prices before planning your harvest transport based on this weather.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

const Sparkles = ({ className, size }: { className?: string, size: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/>
  </svg>
);
