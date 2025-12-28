
import React from 'react';
import { useStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { 
  ShieldCheck, 
  LogOut, 
  ChevronRight, 
  Settings, 
  Bell, 
  HelpCircle, 
  CalendarCheck, 
  Award, 
  MapPin, 
  Phone, 
  Edit3, 
  ShieldAlert,
  FileText,
  Lock,
  Share2,
  Info,
  Loader2,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, language, setLanguage, setUser, walletBalance, serviceBookings } = useStore();
  const t = TRANSLATIONS[language];

  if (!user) return null;

  const handleLogout = () => {
    setUser(null);
    navigate('/language');
  };

  const isProvider = user.role === 'provider';

  const menuSections = [
    {
      title: 'Activity',
      items: [
        { icon: <CalendarCheck size={20} />, label: 'My Bookings', color: 'text-primary bg-primary/10', path: '/bookings' },
        { icon: <Award size={20} />, label: 'Rewards & Earnings', color: 'text-accent bg-accent/10', path: '/wallet' },
      ]
    },
    {
      title: 'Account Settings',
      items: [
        { icon: <Bell size={20} />, label: 'Notifications', color: 'text-blue-500 bg-blue-50', path: '/notifications' },
        { icon: <Lock size={20} />, label: 'Privacy & Security', color: 'text-purple-500 bg-purple-50', path: '#' },
        { icon: <Settings size={20} />, label: 'App Settings', color: 'text-gray-500 bg-gray-100', path: '#' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: <HelpCircle size={20} />, label: 'Help Center', color: 'text-green-500 bg-green-50', path: '#' },
        { icon: <FileText size={20} />, label: 'Terms of Service', color: 'text-orange-500 bg-orange-50', path: '#' },
        { icon: <Share2 size={20} />, label: 'Share App', color: 'text-pink-500 bg-pink-50', path: '#' },
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Premium Header Card */}
      <div className="relative pt-8 pb-6 px-6 bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full -ml-12 -mb-12 blur-xl"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full p-1.5 border-4 border-primary/10 bg-white shadow-xl relative overflow-hidden">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone}`} 
                className="w-full h-full rounded-full object-cover bg-neutral" 
                alt="Avatar" 
              />
            </div>
            <button 
              onClick={() => navigate('/profile/edit')}
              className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full border-2 border-white shadow-lg active:scale-90 transition-transform"
            >
              <Edit3 size={14} />
            </button>
            {user.kycStatus === 'verified' && (
              <div className="absolute -top-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white shadow-md">
                <ShieldCheck size={12} />
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
              {user.name || 'Village Member'}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
              <Phone size={10} className="text-primary" />
              <span>+91 {user.phone}</span>
            </div>
            <div className="flex items-center justify-center gap-2 mt-0.5 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
              <MapPin size={10} className="text-accent" />
              <span>{user.village || 'Khedi Kalan'}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
             <div className="flex gap-3">
               <span className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full border border-primary/5 tracking-wider">
                 {user.role === 'provider' ? 'Service Provider' : 'Village Member'}
               </span>

               {/* Verification Badges only for Providers */}
               {isProvider ? (
                 <>
                   {user.kycStatus === 'verified' ? (
                     <span className="px-4 py-2 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-full border border-green-100 tracking-wider flex items-center gap-1.5">
                       <ShieldCheck size={12} />
                       Verified
                     </span>
                   ) : user.kycStatus === 'pending' ? (
                     <span className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full border border-blue-100 tracking-wider flex items-center gap-1.5 animate-pulse">
                       <Loader2 size={12} className="animate-spin" />
                       Reviewing
                     </span>
                   ) : (
                     <span className="px-4 py-2 bg-orange-50 text-orange-600 text-[10px] font-black uppercase rounded-full border border-orange-100 tracking-wider flex items-center gap-1.5">
                       <ShieldAlert size={12} />
                       Unverified
                     </span>
                   )}
                 </>
               ) : (
                 <span className="px-4 py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-full border border-red-100 tracking-wider flex items-center gap-1.5">
                    <Heart size={12} fill="currentColor" />
                    Community Hero
                 </span>
               )}
             </div>
             
             {/* Show KYC prompt ONLY for providers who haven't started it */}
             {isProvider && user.kycStatus === 'none' && (
               <button 
                onClick={() => navigate('/kyc')}
                className="mt-2 text-primary text-[11px] font-black uppercase tracking-[0.1em] underline underline-offset-4"
               >
                 Verify Your Provider Account
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Bookings', value: serviceBookings.length, icon: <CalendarCheck size={16} />, color: 'text-blue-500' },
          { label: 'Earnings', value: `₹${walletBalance}`, icon: <Award size={16} />, color: 'text-accent' },
          { label: 'Rating', value: '5.0', icon: <StarIcon />, color: 'text-green-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className={`${stat.color} mb-2 opacity-80`}>{stat.icon}</div>
            <p className="text-lg font-black text-gray-800">{stat.value}</p>
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Account Settings List */}
      <div className="space-y-6">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-3">
            <h3 className="px-4 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">{section.title}</h3>
            <div className="bg-white rounded-[32px] border border-gray-50 shadow-sm overflow-hidden">
              {section.items.map((item, iIdx) => (
                <button 
                  key={iIdx} 
                  onClick={() => item.path !== '#' && navigate(item.path)}
                  className={`w-full p-4 flex items-center justify-between hover:bg-neutral active:bg-neutral transition-colors ${
                    iIdx !== section.items.length - 1 ? 'border-b border-gray-50/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.color}`}>
                      {item.icon}
                    </div>
                    <span className="font-bold text-gray-700 text-sm">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Language Toggle Inside Profile */}
      <div className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral rounded-2xl flex items-center justify-center text-primary">
            <Info size={20} />
          </div>
          <div>
             <p className="font-bold text-gray-800 text-sm">App Language</p>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{language === 'en' ? 'English' : 'हिन्दी'}</p>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setLanguage('hi')}
            className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${language === 'hi' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
          >
            हिन्दी
          </button>
          <button 
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${language === 'en' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
          >
            EN
          </button>
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full h-16 bg-red-50 text-red-600 rounded-[28px] border border-red-100/50 flex items-center justify-center gap-3 font-black text-sm transition-all active:scale-[0.98] mt-4"
      >
        <LogOut size={20} />
        Log Out From Device
      </button>

      <div className="text-center pt-4 pb-8">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
          Village Connect Super App
        </p>
        <p className="text-[9px] text-gray-200 font-bold uppercase tracking-tighter mt-1">
          v1.0.8-PROD-STABLE • Build 42
        </p>
      </div>
    </div>
  );
};

// Simple Star Icon for Stats
const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
);
