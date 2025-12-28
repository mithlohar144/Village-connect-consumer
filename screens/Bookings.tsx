
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, ServiceBooking } from '../store';
import { TRANSLATIONS } from '../constants';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  Truck, 
  Stethoscope, 
  Users, 
  XCircle,
  MapPin,
  Star,
  Circle,
  FileText,
  Loader2,
  MessageCircle,
  AlertTriangle,
  ArrowRight,
  Info,
  X,
  Banknote,
  Wallet
} from 'lucide-react';

const StatusStepper: React.FC<{ status: ServiceBooking['status'] }> = ({ status }) => {
  const steps: ServiceBooking['status'][] = ['Pending', 'Accepted', 'In Progress', 'Completed'];
  const currentIndex = steps.indexOf(status);

  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100">
        <XCircle size={18} />
        <span className="text-[10px] font-black uppercase tracking-widest">This booking was cancelled</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full px-2 py-4">
      {steps.map((step, idx) => {
        const isPast = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isLast = idx === steps.length - 1;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-2 relative">
              <div className={`w-3.5 h-3.5 rounded-full border-2 z-10 ${
                isPast || isCurrent ? 'bg-primary border-primary' : 'bg-white border-gray-200'
              } ${isCurrent ? 'ring-4 ring-primary/20 animate-pulse' : ''}`} />
              <span className={`text-[8px] font-black uppercase tracking-tighter absolute -bottom-4 whitespace-nowrap ${
                isCurrent ? 'text-primary' : 'text-gray-300'
              }`}>
                {step}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-2 ${
                isPast ? 'bg-primary' : 'bg-gray-100'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const Bookings: React.FC = () => {
  const navigate = useNavigate();
  const { language, serviceBookings, cancelBooking, createDirectThread, showPopup } = useStore();
  const t = TRANSLATIONS[language];
  
  const [confirmCancelBooking, setConfirmCancelBooking] = useState<ServiceBooking | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleCancelClick = (booking: ServiceBooking) => {
    setConfirmCancelBooking(booking);
  };

  const handleConfirmCancel = async () => {
    if (!confirmCancelBooking) return;
    
    setProcessingId(confirmCancelBooking.id);
    // Simulate API delay for realism
    await new Promise(r => setTimeout(r, 1000));
    
    cancelBooking(confirmCancelBooking.id);
    
    setProcessingId(null);
    setConfirmCancelBooking(null);

    showPopup({
      type: 'info',
      title: 'Booking Cancelled',
      message: 'Your booking has been cancelled. Any applicable refund has been added to your wallet.'
    });
  };

  const handleContact = (booking: ServiceBooking) => {
    createDirectThread(booking.providerId, booking.providerName);
    navigate('/chats', { state: { threadId: `direct-${booking.providerId}` } });
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 px-1 pt-2">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 border border-gray-100 active:scale-90 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">My Bookings</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Track your service status</p>
        </div>
      </div>

      <div className="space-y-4">
        {serviceBookings.length > 0 ? serviceBookings.map((booking) => (
          <div key={booking.id} className={`bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all ${booking.status === 'Cancelled' ? 'opacity-70 grayscale' : ''}`}>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={`w-14 h-14 bg-neutral rounded-2xl flex items-center justify-center shadow-inner ${booking.status === 'Cancelled' ? 'text-gray-300' : 'text-primary'}`}>
                    {booking.category === 'transport' ? <Truck size={24} /> : 
                     booking.category === 'medical' ? <Stethoscope size={24} /> : 
                     <Users size={24} />}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 text-lg leading-tight">{booking.providerName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{booking.category}</p>
                      <span className="w-1 h-1 bg-gray-200 rounded-full" />
                      <p className="text-[10px] text-primary font-black uppercase tracking-tighter">#{booking.id.slice(-4)}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-gray-800 tracking-tight">₹{booking.amount}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1">
                    {new Date(booking.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <StatusStepper status={booking.status} />

              <div className="flex items-center justify-between px-2 pt-2">
                 <div className="flex items-center gap-2">
                    {booking.paymentMethod === 'wallet' ? (
                       <div className="flex items-center gap-1.5 bg-primary/5 text-primary px-3 py-1.5 rounded-full border border-primary/10">
                          <Wallet size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Paid Online</span>
                       </div>
                    ) : (
                       <div className="flex items-center gap-1.5 bg-accent/5 text-accent px-3 py-1.5 rounded-full border border-accent/10">
                          <Banknote size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Pay on Delivery</span>
                       </div>
                    )}
                 </div>
              </div>

              {booking.category === 'transport' && booking.pickup && booking.status !== 'Cancelled' && (
                <div className="bg-neutral p-4 rounded-3xl border border-gray-50 space-y-2 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <Circle size={8} className="fill-primary text-primary" />
                    <p className="text-xs font-bold text-gray-600 truncate">{booking.pickup}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={12} className="text-accent" />
                    <p className="text-xs font-bold text-gray-600 truncate">{booking.drop}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-neutral/30 p-4 border-t border-gray-50 flex gap-3">
              {(booking.status === 'Pending' || booking.status === 'Accepted') && (
                <button 
                  onClick={() => handleCancelClick(booking)}
                  className="flex-1 h-12 bg-white text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <XCircle size={14} /> Cancel
                </button>
              )}
              
              {booking.status !== 'Cancelled' && (
                <button 
                  onClick={() => handleContact(booking)}
                  className="flex-[2] h-12 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={14} /> Contact Provider
                </button>
              )}
              
              {booking.status === 'Completed' && (
                <button 
                  className="flex-1 h-12 bg-white text-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Star size={14} className="text-accent fill-accent" /> Rate
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="py-32 text-center text-gray-400 space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto opacity-40">
              <Calendar size={48} />
            </div>
            <p className="font-black uppercase tracking-widest text-xs">No active bookings</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              Discover Services
            </button>
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {confirmCancelBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[48px] overflow-hidden shadow-2xl animate-in zoom-in">
             <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto shadow-inner">
                   <AlertTriangle size={40} />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-gray-800 tracking-tight">Cancel Booking?</h2>
                   <p className="text-sm text-gray-500 font-medium mt-2 leading-relaxed">
                     {confirmCancelBooking.paymentMethod === 'wallet' 
                       ? `Your ₹${confirmCancelBooking.amount} will be instantly refunded to your wallet.` 
                       : "Are you sure you want to cancel this service request?"}
                   </p>
                </div>
                
                <div className="flex flex-col gap-3">
                   <button 
                     onClick={handleConfirmCancel}
                     disabled={!!processingId}
                     className="w-full h-16 bg-red-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                   >
                     {processingId === confirmCancelBooking.id ? <Loader2 size={18} className="animate-spin" /> : "Confirm Cancellation"}
                   </button>
                   <button 
                     onClick={() => setConfirmCancelBooking(null)}
                     disabled={!!processingId}
                     className="w-full h-16 bg-neutral text-gray-600 rounded-[24px] font-black text-sm uppercase tracking-widest border border-gray-100 active:scale-95 transition-all"
                   >
                     Keep Booking
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
      
      {/* Help Section */}
      <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex gap-4 mt-8">
        <Info className="text-orange-500 shrink-0" />
        <div>
          <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-1">Policy Update</p>
          <p className="text-[10px] text-orange-700 font-medium leading-relaxed">
            Cancellations are free up to 30 mins before the scheduled time. Wallet refunds are processed instantly.
          </p>
        </div>
      </div>
    </div>
  );
};
