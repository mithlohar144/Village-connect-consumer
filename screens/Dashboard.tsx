
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { SERVICES, TRANSLATIONS } from '../constants';
import { Search, Sparkles, Navigation, Droplets, Wind, Sun, CloudRain, CloudSun, Cloud, Loader2, RefreshCw, ChevronRight, Award, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const Skeleton = ({ className }: { className: string }) => (
  <div className={`bg-gray-200 animate-pulse rounded-2xl ${className}`} />
);

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { language, walletBalance, addTransaction, weather, setWeather, currentVillage, showPopup } = useStore();
  const t = TRANSLATIONS[language];
  const [search, setSearch] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(!weather);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!weather) fetchWeather();
  }, []);

  const getWeatherCondition = (code: number): string => {
    if (code === 0) return 'Clear Sky';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 71 && code <= 77) return 'Snowy';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Cloudy';
  };

  const fetchWeather = async () => {
    setWeatherLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 });
      }).catch(() => null);

      const lat = pos?.coords.latitude || 28.6139;
      const lng = pos?.coords.longitude || 77.2090;

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=relativehumidity_2m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const data = await weatherRes.json();
      const current = data.current_weather;
      const condition = getWeatherCondition(current.weathercode);
      
      let advisory = language === 'hi' ? 'मौसम के अनुसार अपनी फसलों का ध्यान रखें।' : 'Take care of your crops according to the weather.';

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        const prompt = `Weather: ${condition}, Temp: ${current.temperature}°C. Provide a 1-sentence agricultural advice for a farmer in ${language === 'hi' ? 'Hindi' : 'English'}.`;
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        if (response.text) advisory = response.text.trim();
      } catch (aiErr) { console.error("AI Error:", aiErr); }

      setWeather({
        temp: Math.round(current.temperature), 
        condition, 
        humidity: data.hourly.relativehumidity_2m[0],
        windSpeed: current.windspeed, 
        forecast: [], 
        advisory
      });
    } catch (err) { console.error("Weather failed:", err); } finally { setWeatherLoading(false); setRefreshing(false); }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWeather();
  };

  const handleServiceClick = (id: string) => {
    if (id === 'mandi') navigate('/mandi');
    else if (id === 'wallet') navigate('/wallet');
    else if (id === 'emergency') navigate('/emergency');
    else navigate(`/services/${id}`);
  };

  const WeatherIcon = ({ condition, size }: { condition: string, size: number }) => {
    const c = condition.toLowerCase();
    if (c.includes('clear') || c.includes('sun')) return <Sun size={size} className="text-yellow-500" />;
    if (c.includes('rain')) return <CloudRain size={size} className="text-blue-500" />;
    if (c.includes('partly')) return <CloudSun size={size} className="text-orange-500" />;
    return <Cloud size={size} className="text-gray-400" />;
  };

  const handleReport = (issue: string) => {
    addTransaction({ type: 'credit', amount: 2, description: `Reward: Reported ${issue}` });
    showPopup({
      type: 'success',
      title: 'Report Received!',
      message: `Thanks for reporting ${issue}. ₹2 reward has been added to your wallet.`
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none">Your Village Hub</p>
            <h2 className="text-lg font-black text-gray-800 tracking-tight mt-1">{currentVillage}</h2>
          </div>
        </div>
        <button 
          onClick={handleRefresh} 
          className={`p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-500 active:scale-90 transition-all ${refreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Weather Widget */}
      {weatherLoading ? (
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-4">
           <div className="flex justify-between">
              <div className="flex gap-4">
                 <Skeleton className="w-16 h-16 rounded-3xl" />
                 <div className="space-y-2">
                    <Skeleton className="w-32 h-6" />
                    <Skeleton className="w-20 h-4" />
                 </div>
              </div>
           </div>
           <Skeleton className="w-full h-12" />
        </div>
      ) : (
        <div 
          onClick={() => navigate('/weather')}
          className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm overflow-hidden relative active:scale-[0.98] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
             <div className="flex gap-5">
                <div className="w-16 h-16 bg-neutral rounded-3xl flex items-center justify-center text-primary shadow-inner">
                   <WeatherIcon condition={weather?.condition || 'clear'} size={36} />
                </div>
                <div>
                  <h3 className="font-black text-gray-800 text-4xl leading-none">
                    {weather?.temp}°
                  </h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1.5">{weather?.condition}</p>
                </div>
             </div>
             <div className="flex flex-col items-end gap-2 text-gray-500">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase">
                   <Droplets size={14} className="text-blue-500" /> {weather?.humidity}%
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase">
                   <Wind size={14} className="text-gray-400" /> {weather?.windSpeed}km/h
                </div>
             </div>
          </div>
          {weather?.advisory && (
            <div className="mt-6 p-4 bg-primary/5 rounded-3xl border border-primary/10 flex items-start gap-3">
               <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                  <Sparkles size={16} />
               </div>
               <p className="text-xs font-bold text-gray-700 leading-tight">
                  {weather.advisory}
               </p>
            </div>
          )}
        </div>
      )}

      {/* Main Service Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-end px-2">
           <div>
              <h2 className="text-xl font-black text-gray-800 tracking-tight">Main Services</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Provider Network</p>
           </div>
           <button className="text-primary text-[10px] font-black uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-full">View All</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {SERVICES.map((service) => (
            <button
              key={service.id}
              onClick={() => handleServiceClick(service.id)}
              className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center gap-3 active:scale-95 transition-all aspect-square justify-center hover:border-primary/40 group"
            >
              <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                {service.icon}
              </div>
              <span className="text-[10px] font-black text-gray-700 text-center leading-tight uppercase tracking-widest">
                {language === 'en' ? service.name : service.nameHi}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Wallet Card Polished */}
      <div 
        onClick={() => navigate('/wallet')}
        className="bg-primary rounded-[40px] p-7 text-white shadow-2xl shadow-primary/20 relative overflow-hidden active:scale-[0.98] transition-all group"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl group-hover:bg-white/20 transition-all" />
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{t.currentBalance}</p>
            <p className="text-4xl font-black mt-2 tracking-tighter">₹{walletBalance}</p>
          </div>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
            <ChevronRight size={28} />
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-white/10 flex items-center gap-2">
           <Award size={16} className="text-accent" />
           <span className="text-[10px] font-black uppercase tracking-widest">Rewards Active: +₹2 per report</span>
        </div>
      </div>

      {/* Community Issues */}
      <div className="bg-white rounded-[40px] p-7 border border-gray-100 shadow-sm space-y-5">
        <div>
           <h3 className="text-lg font-black text-gray-800 tracking-tight">{t.reportIssue}</h3>
           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Earn rewards for verification</p>
        </div>
        <div className="flex gap-2">
          {['Power Cut', 'Water Leak', 'Blocked Road'].map(issue => (
            <button 
              key={issue}
              onClick={() => handleReport(issue)}
              className="flex-1 bg-neutral h-14 rounded-2xl text-[10px] font-black text-gray-600 border border-gray-100 active:bg-primary active:text-white transition-all text-center leading-none"
            >
              {issue}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
