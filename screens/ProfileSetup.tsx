
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { 
  User, 
  MapPin, 
  Camera, 
  ArrowRight, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, language, updateUserProfile } = useStore();
  const t = TRANSLATIONS[language];

  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !village.trim()) return;

    setLoading(true);
    // Simulate a brief save period
    await new Promise(r => setTimeout(r, 1000));
    
    updateUserProfile({ name, village });
    setLoading(false);

    // Conditional navigation based on role
    if (user.role === 'provider') {
      navigate('/kyc');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center animate-in fade-in duration-500">
      {/* Progress Header */}
      <div className="w-full pt-8 flex flex-col items-center space-y-4">
        <div className="flex items-center gap-2">
           <div className="w-8 h-1 bg-primary rounded-full"></div>
           <div className="w-8 h-1 bg-primary rounded-full"></div>
           <div className="w-8 h-1 bg-primary rounded-full"></div>
        </div>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Step 3: Complete Profile</p>
      </div>

      <div className="mt-10 text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Almost there!</h1>
        <p className="text-gray-400 text-sm font-medium">Tell us a bit more about yourself</p>
      </div>

      <div className="w-full mt-10 space-y-10">
        {/* Avatar Selection Area */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full p-1.5 border-4 border-primary/10 bg-neutral shadow-xl relative overflow-hidden">
               <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone}`} 
                className="w-full h-full rounded-full object-cover" 
                alt="Profile Avatar" 
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full border-4 border-white shadow-lg">
              <Camera size={18} />
            </div>
          </div>
          <p className="mt-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Profile Photo</p>
        </div>

        {/* Form Area */}
        <form onSubmit={handleComplete} className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                <User size={12} className="text-primary" /> Full Name
              </label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Rahul Sharma" 
                className="w-full h-16 bg-neutral border-2 border-gray-50 rounded-2xl px-5 font-bold outline-none focus:border-primary focus:bg-white transition-all text-black" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                <MapPin size={12} className="text-accent" /> Your Village
              </label>
              <input 
                required 
                type="text" 
                value={village} 
                onChange={(e) => setVillage(e.target.value)} 
                placeholder="e.g. Khedi Kalan" 
                className="w-full h-16 bg-neutral border-2 border-gray-50 rounded-2xl px-5 font-bold outline-none focus:border-primary focus:bg-white transition-all text-black" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !name.trim() || !village.trim()}
            className={`w-full h-18 text-white rounded-[24px] font-black text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${
              loading ? 'bg-gray-400' : 'bg-primary shadow-primary/20'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">Saving...</span>
            ) : (
              <>
                Complete Setup <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-auto py-8 text-center px-12">
        <div className="flex items-center justify-center gap-2 text-primary font-bold mb-2">
           <Sparkles size={16} />
           <span className="text-xs uppercase tracking-widest">Village Connect Secure</span>
        </div>
        <p className="text-[9px] text-gray-300 font-medium leading-relaxed">
          Your information is kept private and only shared with verified members of your community.
        </p>
      </div>
    </div>
  );
};