
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Sprout, Wallet, MessageSquare, UserCircle, Bell, MapPin } from 'lucide-react';
import { useStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { SOSButton } from './SOSButton';
import { PopupMessage } from './PopupMessage';

// Added optional children type to satisfy specific TypeScript environments that fail to detect JSX children
export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, currentVillage, isOffline, notifications } = useStore();
  const t = TRANSLATIONS[language];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { icon: <Home size={24} />, label: t.home, path: '/' },
    { icon: <Sprout size={24} />, label: t.mandi, path: '/mandi' },
    { icon: <Wallet size={24} />, label: t.wallet, path: '/wallet' },
    { icon: <MessageSquare size={24} />, label: t.chats, path: '/chats' },
    { icon: <UserCircle size={24} />, label: t.profile, path: '/profile' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <header className="bg-primary text-white p-4 flex justify-between items-center shadow-md z-50">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-accent" />
          <span className="font-semibold">{currentVillage}</span>
        </div>
        <div className="flex items-center gap-4">
          {isOffline && (
            <span className="text-[10px] bg-red-500 px-2 py-0.5 rounded-full animate-pulse">OFFLINE</span>
          )}
          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2 bg-white/10 rounded-xl active:scale-90 transition-transform"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-primary flex items-center justify-center animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 p-4">
        {children}
      </main>

      <PopupMessage />
      <SOSButton />

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around items-center py-2 px-1 z-40">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-colors min-w-[64px] ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <div className={`${isActive ? 'scale-110 transition-transform' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
