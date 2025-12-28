
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Notification } from '../store';
import { 
  ChevronLeft, 
  Bell, 
  Trash2, 
  Sprout, 
  Truck, 
  Award, 
  AlertCircle, 
  Info,
  Clock,
  ArrowRight,
  BellOff
} from 'lucide-react';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markNotificationAsRead, clearAllNotifications } = useStore();

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'mandi': return <Sprout className="text-emerald-500" size={24} />;
      case 'service': return <Truck className="text-blue-500" size={24} />;
      case 'reward': return <Award className="text-amber-500" size={24} />;
      case 'emergency': return <AlertCircle className="text-rose-500" size={24} />;
      default: return <Info className="text-slate-400" size={24} />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'mandi': return 'bg-emerald-50';
      case 'service': return 'bg-blue-50';
      case 'reward': return 'bg-amber-50';
      case 'emergency': return 'bg-rose-50';
      default: return 'bg-slate-50';
    }
  };

  const handleNotificationClick = (n: Notification) => {
    markNotificationAsRead(n.id);
    if (n.actionPath) navigate(n.actionPath);
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now.getTime() - then.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col h-screen bg-neutral animate-in fade-in duration-500">
      <div className="p-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 border border-gray-100 active:scale-90 transition-transform">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Notifications</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Village Alerts</p>
          </div>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={() => { if(window.confirm('Clear all notifications?')) clearAllNotifications(); }}
            className="p-3 text-red-400 bg-red-50 rounded-2xl active:scale-90 transition-transform"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`w-full text-left p-5 rounded-[32px] border transition-all active:scale-[0.98] relative flex gap-4 ${
                n.isRead ? 'bg-white border-gray-50 opacity-70' : 'bg-white border-primary/20 shadow-md ring-1 ring-primary/5'
              }`}
            >
              {!n.isRead && (
                <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-primary rounded-full shadow-lg shadow-primary/40 animate-pulse" />
              )}
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${getBgColor(n.type)}`}>
                {getIcon(n.type)}
              </div>

              <div className="flex-1 space-y-1 pr-4">
                <div className="flex justify-between items-center">
                  <h3 className={`text-sm font-black tracking-tight ${n.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                    {n.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  {n.message}
                </p>
                <div className="flex items-center gap-1.5 pt-1.5">
                  <Clock size={10} className="text-gray-300" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{formatTime(n.timestamp)}</span>
                </div>
              </div>

              {n.actionPath && (
                <div className="absolute bottom-5 right-5 text-primary opacity-30">
                  <ArrowRight size={16} />
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center text-gray-200">
              <BellOff size={48} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">Nothing New</h3>
              <p className="text-xs text-gray-300 font-bold px-12">We'll let you know when there's an update for your village.</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 pt-0 pb-12">
        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white/50 flex items-center gap-3 justify-center">
          <Info size={14} className="text-gray-300" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
            You are currently receiving all village alerts
          </p>
        </div>
      </div>
    </div>
  );
};
