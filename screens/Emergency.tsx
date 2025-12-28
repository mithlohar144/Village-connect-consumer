
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, EmergencyRequest } from '../store';
import { TRANSLATIONS } from '../constants';
import { 
  ChevronLeft, 
  Siren, 
  Flame, 
  ShieldAlert, 
  PhoneCall, 
  Navigation, 
  X, 
  MapPin, 
  Clock, 
  ShieldCheck,
  Radio,
  Loader2,
  AlertTriangle
} from 'lucide-react';

export const Emergency: React.FC = () => {
  const navigate = useNavigate();
  const { language, activeEmergency, triggerEmergency, cancelEmergency, updateEmergencyStatus } = useStore();
  const t = TRANSLATIONS[language];
  
  const [loading, setLoading] = useState(false);
  const [showLocationTip, setShowLocationTip] = useState(true);

  // Auto-advance statuses for the mock experience
  useEffect(() => {
    if (activeEmergency?.status === 'Pending') {
      const timer = setTimeout(() => updateEmergencyStatus('Dispatched'), 4000);
      return () => clearTimeout(timer);
    }
    if (activeEmergency?.status === 'Dispatched') {
      const timer = setTimeout(() => updateEmergencyStatus('Arriving'), 10000);
      return () => clearTimeout(timer);
    }
  }, [activeEmergency?.status]);

  const handleTrigger = async (type: EmergencyRequest['type']) => {
    setLoading(true);
    // 1. Capture Location
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 });
      });
      triggerEmergency(type, pos.coords.latitude, pos.coords.longitude);
    } catch (e) {
      // Fallback coordinates if geo fails
      triggerEmergency(type, 28.6139, 77.2090);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    { id: 'ambulance' as const, label: t.ambulance, icon: <Siren size={40} />, color: 'bg-red-500', phone: '102' },
    { id: 'police' as const, label: t.police, icon: <ShieldAlert size={40} />, color: 'bg-blue-600', phone: '112' },
    { id: 'fire' as const, label: t.fire, icon: <Flame size={40} />, color: 'bg-orange-600', phone: '101' },
  ];

  if (activeEmergency) {
    return (
      <div className="min-h-screen bg-red-600 p-6 flex flex-col text-white animate-in fade-in">
        <div className="flex justify-between items-center mb-10">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <Radio size={20} />
              </div>
              <h1 className="text-xl font-black uppercase tracking-widest">Active Alert</h1>
           </div>
           <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full"><ChevronLeft /></button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
           <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-red-600 shadow-2xl animate-bounce">
                {activeEmergency.type === 'ambulance' ? <Siren size={64} /> : 
                 activeEmergency.type === 'police' ? <ShieldAlert size={64} /> : <Flame size={64} />}
              </div>
              <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-white animate-ping opacity-30" />
           </div>

           <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight uppercase">
                {activeEmergency.status === 'Pending' ? t.alertingResponders : 
                 activeEmergency.status === 'Dispatched' ? 'Responder Dispatched' : 'Help is Near!'}
              </h2>
              <p className="text-white/70 font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                 <MapPin size={14} /> Location Shared: {activeEmergency.lat.toFixed(4)}, {activeEmergency.lng.toFixed(4)}
              </p>
           </div>

           {/* Responder Card */}
           <div className="w-full bg-black/20 backdrop-blur-md rounded-[40px] p-6 border border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">Responder</p>
                    <p className="font-black text-lg">{activeEmergency.responderName}</p>
                 </div>
                 <div className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-tighter">
                   ETA: {activeEmergency.status === 'Pending' ? '...' : activeEmergency.status === 'Dispatched' ? '12 Mins' : '3 Mins'}
                 </div>
              </div>
              <div className="flex gap-3">
                 <button className="flex-1 h-14 bg-white text-red-600 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <PhoneCall size={18} /> Call Responder
                 </button>
              </div>
           </div>

           <div className="w-full bg-white/5 p-4 rounded-3xl border border-white/5">
              <p className="text-[10px] font-medium leading-relaxed italic opacity-80">
                Community helpers in your village have also been notified and may arrive sooner.
              </p>
           </div>
        </div>

        <button 
          onClick={() => { if(window.confirm("End emergency session?")) cancelEmergency(); }}
          className="mt-8 text-white/50 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
        >
          {t.cancelAlert}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col pb-24">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 border border-gray-100">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">{t.emergencyServices}</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Immediate Response</p>
        </div>
      </div>

      <div className="space-y-4">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => handleTrigger(s.id)}
            disabled={loading}
            className={`w-full p-8 ${s.color} rounded-[40px] shadow-xl flex items-center gap-6 active:scale-[0.98] transition-all relative overflow-hidden group`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-white shadow-inner group-active:scale-110 transition-transform">
               {loading ? <Loader2 className="animate-spin" /> : s.icon}
            </div>
            <div className="text-left text-white">
              <h3 className="text-2xl font-black tracking-tight">{s.label}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Connect with nearest Unit</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-6 flex-1 flex flex-col">
         {showLocationTip && (
           <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex gap-4 items-start relative">
              <AlertTriangle className="text-orange-500 shrink-0" />
              <div>
                 <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-1">Location Notice</p>
                 <p className="text-xs font-medium text-orange-700 leading-relaxed">
                   GPS Coordinates are sent automatically to responders. Ensure your location is enabled for faster response.
                 </p>
              </div>
              <button onClick={() => setShowLocationTip(false)} className="absolute top-4 right-4 text-orange-300"><X size={16} /></button>
           </div>
         )}

         <div className="mt-auto space-y-4">
            <div className="flex items-center gap-3 justify-center mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Online • Rural Response Mesh</p>
            </div>
            
            <button 
              onClick={() => window.open('tel:112')}
              className="w-full h-18 bg-neutral text-gray-800 border-2 border-gray-100 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <PhoneCall size={24} className="text-primary" />
              {t.callNow} (112)
            </button>
         </div>
      </div>
    </div>
  );
};
