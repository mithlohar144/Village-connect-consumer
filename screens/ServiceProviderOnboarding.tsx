
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { User, Briefcase, CheckCircle2, ShieldCheck, Info } from 'lucide-react';

export const ServiceProviderOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { language, setUser, user } = useStore();
  const t = TRANSLATIONS[language];
  const [role, setRole] = useState<'user' | 'provider' | null>(null);

  const handleProviderSelect = () => {
    if (user) {
      setUser({ ...user, role: 'provider', kycStatus: 'none' });
      navigate('/profile-setup');
    }
  };

  const handleUserSelect = () => {
    if (user) {
      setUser({ ...user, role: 'user', kycStatus: 'none' });
      navigate('/profile-setup');
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <div className="mt-12 mb-8 text-center">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">{t.rolePrompt}</h1>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Join the village network</p>
      </div>

      {!role ? (
        <div className="space-y-4">
          <button
            onClick={() => setRole('user')}
            className="w-full p-8 bg-white border-2 border-gray-100 rounded-[40px] flex flex-col items-center gap-4 hover:border-primary transition-all group active:scale-[0.98] shadow-sm"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
              <User size={48} />
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-800">{t.iAmFarmer}</p>
              <p className="text-[10px] text-primary font-black uppercase mt-2 tracking-widest bg-primary/5 px-3 py-1 rounded-full">No Identity Documents Needed</p>
            </div>
          </button>

          <button
            onClick={() => setRole('provider')}
            className="w-full p-8 bg-white border-2 border-gray-100 rounded-[40px] flex flex-col items-center gap-4 hover:border-accent transition-all group active:scale-[0.98] shadow-sm"
          >
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all shadow-inner">
              <Briefcase size={48} />
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-800">{t.iAmProvider}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Verify ID to Start Earning</p>
            </div>
          </button>
        </div>
      ) : role === 'user' ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-300">
          <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-inner">
            <CheckCircle2 size={80} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Welcome, Friend!</h2>
            <p className="text-gray-500 font-medium px-8 leading-relaxed">
              As a consumer, you can browse mandi prices, book services, and chat with your community <span className="text-primary font-bold">instantly</span>.
            </p>
          </div>
          <div className="w-full pt-8">
            <button 
              onClick={handleUserSelect}
              className="w-full h-18 bg-primary text-white rounded-[24px] font-black text-lg shadow-2xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              Next: Set up Profile
            </button>
            <button 
              onClick={() => setRole(null)}
              className="mt-6 text-gray-300 font-black uppercase tracking-widest text-[10px]"
            >
              Wait, I am a Service Provider
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-6 animate-in zoom-in duration-300">
          <div className="bg-orange-50 p-8 rounded-[40px] border border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full -mr-16 -mt-16 blur-xl" />
            <h3 className="text-xl font-black text-orange-800 mb-2 flex items-center gap-2 relative z-10">
              <ShieldCheck size={24} />
              Identity Check
            </h3>
            <p className="text-sm text-orange-700 leading-relaxed font-bold relative z-10">
              Providers need to verify their Aadhaar or Gov ID to build trust and receive payments.
            </p>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm font-black">1</div>
                <p className="text-sm font-black text-gray-700">Submit ID Documents</p>
             </div>
             <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm font-black">2</div>
                <p className="text-sm font-black text-gray-700">Quick Liveness Selfie</p>
             </div>
             <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm font-black">3</div>
                <p className="text-sm font-black text-gray-700">Accept Bookings</p>
             </div>
          </div>

          <div className="mt-auto space-y-4 pb-4">
            <button
              onClick={handleProviderSelect}
              className="w-full h-18 bg-accent text-white rounded-[24px] font-black text-lg shadow-xl shadow-accent/20 active:scale-95 transition-all"
            >
              Next: Set up Profile
            </button>
            <button 
              onClick={() => setRole(null)}
              className="w-full text-center text-gray-400 font-black uppercase tracking-widest text-[10px]"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
