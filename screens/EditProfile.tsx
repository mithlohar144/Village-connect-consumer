
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { 
  ChevronLeft, 
  User, 
  MapPin, 
  CheckCircle2, 
  Camera, 
  Loader2,
  Save,
  UserCircle
} from 'lucide-react';

export const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, language, updateUserProfile } = useStore();
  const t = TRANSLATIONS[language];

  if (!user) return null;

  const [name, setName] = useState(user.name || '');
  const [village, setVillage] = useState(user.village || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200));
    
    updateUserProfile({ name, village });
    
    setSaving(false);
    setSaved(true);
    
    setTimeout(() => {
      navigate('/profile');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neutral pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 border border-gray-100 active:scale-90 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Edit Profile</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Update Your Identity</p>
        </div>
      </div>

      <div className="px-6 space-y-8 mt-4">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full p-1.5 border-4 border-primary/10 bg-white shadow-xl relative overflow-hidden">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone}`} 
                className="w-full h-full rounded-full object-cover bg-neutral" 
                alt="Avatar" 
              />
            </div>
            <button className="absolute bottom-1 right-1 bg-primary text-white p-2.5 rounded-full border-2 border-white shadow-lg active:scale-90 transition-transform">
              <Camera size={16} />
            </button>
          </div>
          <p className="mt-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Change Photo</p>
        </div>

        {/* Form Area */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                <User size={12} className="text-primary" /> Full Name
              </label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your name" 
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

            <div className="space-y-2 opacity-60">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Phone Number (Linked)</label>
              <div className="w-full h-16 bg-gray-100 border-2 border-gray-50 rounded-2xl px-5 flex items-center font-bold text-gray-400 cursor-not-allowed">
                +91 {user.phone}
              </div>
              <p className="text-[9px] text-gray-300 font-bold ml-2 uppercase">Phone number cannot be changed once verified.</p>
            </div>
          </div>

          <div className="pt-4">
            {saved ? (
              <div className="w-full h-18 bg-green-500 text-white rounded-[24px] font-black text-lg shadow-xl shadow-green-200 flex items-center justify-center gap-3 animate-in zoom-in">
                <CheckCircle2 size={24} /> Profile Saved!
              </div>
            ) : (
              <button 
                type="submit" 
                disabled={saving || !name.trim()}
                className={`w-full h-18 text-white rounded-[24px] font-black text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${
                  saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary shadow-primary/30'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={24} /> Updating...
                  </>
                ) : (
                  <>
                    Save Changes <Save size={20} />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mt-8 px-12 text-center">
        <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
          Your name and village are used to help service providers and community members identify you.
        </p>
      </div>
    </div>
  );
};