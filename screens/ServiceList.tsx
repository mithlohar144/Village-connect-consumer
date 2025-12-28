
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, Provider } from '../store';
import { TRANSLATIONS, TRANSPORT_TYPES, WORKER_TYPES, MEDICAL_TYPES } from '../constants';
import { GoogleGenAI } from "@google/genai";
import { 
  Star, 
  Phone, 
  MapPin, 
  ChevronLeft, 
  ShieldCheck, 
  CheckCircle, 
  Truck, 
  Zap, 
  Clock,
  Search,
  Map as MapIcon,
  List as ListIcon,
  Navigation,
  ArrowRight,
  CreditCard,
  Banknote,
  PlusSquare,
  Pill,
  Stethoscope,
  HeartPulse,
  Activity,
  User,
  X,
  Loader2,
  Hospital,
  ExternalLink,
  MapPinned,
  Bike,
  Car,
  Wrench,
  Hammer,
  HardHat,
  Settings,
  Trash2,
  Wheat,
  HandHelping,
  Users,
  LocateFixed,
  Compass,
  Layers,
  Info,
  RefreshCcw,
  Gauge,
  MapPin as MapPinIcon,
  Wallet,
  Calendar,
  Award,
  Briefcase,
  ThumbsUp
} from 'lucide-react';

export const ServiceList: React.FC = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { language, providers, walletBalance, addTransaction, addServiceBooking, createDirectThread, user, showPopup } = useStore();
  const t = TRANSLATIONS[language];
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // States
  const [realProviders, setRealProviders] = useState<any[]>([]);
  const [isLoadingReal, setIsLoadingReal] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Profile Detail Modal State
  const [viewProvider, setViewProvider] = useState<Provider | null>(null);
  const [bookingProvider, setBookingProvider] = useState<Provider | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [selectedMapProvider, setSelectedMapProvider] = useState<any | null>(null);
  
  // Forms
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [durationHours, setDurationHours] = useState(2);
  const [patientName, setPatientName] = useState(user?.name || '');
  const [concern, setConcern] = useState('');
  const [tripTime, setTripTime] = useState(new Date().toISOString().slice(0, 16));
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cash'>('wallet');

  const isMedical = category === 'medical';
  const isTransport = category === 'transport';
  const isWorkers = category === 'workers';

  // Discovery logic (Existing)
  useEffect(() => {
    if (isMedical || isTransport) {
      fetchDiscoveryData();
    }
  }, [category]);

  const fetchDiscoveryData = async () => {
    setIsLoadingReal(true);
    setIsScanning(true);
    setLocationError(null);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      const { latitude, longitude } = position.coords;
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const query = isMedical ? "List real nearby hospitals." : "List nearby transport stands.";
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: { tools: [{ googleMaps: {} }], toolConfig: { retrievalConfig: { latLng: { latitude, longitude } } } },
      });
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const places = chunks.filter((chunk: any) => chunk.maps?.uri).map((chunk: any, index: number) => ({
          id: `real-${index}`,
          name: chunk.maps.title || (isMedical ? "Medical Center" : "Transport Hub"),
          address: chunk.maps.address || "Nearby",
          uri: chunk.maps.uri,
          distance: "Nearby",
          rating: (4 + Math.random()).toFixed(1),
          ratingCount: Math.floor(Math.random() * 500),
          isAvailable: true,
          verified: true,
          category: category,
          price: isMedical ? 'Consultation' : 'Public Transport',
          priceValue: 0,
          isRealHub: true,
          coordinates: { lat: 10 + Math.random() * 80, lng: 10 + Math.random() * 80 }
      }));
      setRealProviders(places);
    } catch (err: any) {
      setLocationError("Could not discover nearby locations.");
    } finally {
      setIsLoadingReal(false);
      setTimeout(() => setIsScanning(false), 2000);
    }
  };

  const filteredProviders = useMemo(() => {
    const local = providers.filter(p => p.category === category);
    const combined = isTransport ? [...local, ...realProviders] : (isMedical ? realProviders : local);
    return combined.filter(p => {
      const matchType = activeFilter === 'all' || (isTransport ? p.vehicleType === activeFilter : isMedical ? p.medicalType === activeFilter : p.workerType === activeFilter);
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [providers, realProviders, category, activeFilter, searchQuery]);

  const handleBookNow = (provider: Provider) => {
    if (!provider.isAvailable) {
      showPopup({ type: 'error', title: 'Unavailable', message: 'Provider is currently busy.' });
      return;
    }
    setBookingProvider(provider);
    setViewProvider(null);
  };

  const confirmBooking = async () => {
    if (!bookingProvider) return;
    let totalAmount = isMedical ? bookingProvider.priceValue : (isWorkers ? bookingProvider.priceValue * durationHours : 5);
    if (paymentMethod === 'wallet' && walletBalance < totalAmount) {
      showPopup({ type: 'error', title: 'Low Balance', message: `Add ₹${totalAmount - walletBalance} to book.` });
      return;
    }
    setIsBooking(true);
    await new Promise(r => setTimeout(r, 1500));
    if (paymentMethod === 'wallet') addTransaction({ type: 'debit', amount: totalAmount, description: `Booking: ${bookingProvider.name}` });
    addServiceBooking({
      providerId: bookingProvider.id,
      providerName: bookingProvider.name,
      category: category || 'general',
      status: 'Pending',
      amount: totalAmount,
      pickup: isTransport ? pickup : undefined,
      drop: isTransport ? drop : undefined,
      jobDescription: isWorkers ? jobDescription : undefined,
      durationHours: isWorkers ? durationHours : undefined,
      patientName: isMedical ? patientName : undefined,
      concern: isMedical ? concern : undefined,
      paymentMethod
    });
    createDirectThread(bookingProvider.id, bookingProvider.name);
    setBooked(true);
    setBookingProvider(null);
    setIsBooking(false);
    setTimeout(() => { setBooked(false); navigate('/bookings'); }, 1500);
  };

  const getProviderIcon = (p: any, size = 32) => {
    if (p.isRealHub) return <MapPinIcon size={size} />;
    if (p.category === 'transport') {
      switch(p.vehicleType) {
        case 'bike': return <Bike size={size} />;
        case 'car': return <Car size={size} />;
        case 'auto': return <Navigation size={size} />;
        default: return <Truck size={size} />;
      }
    } else if (p.category === 'medical') {
      switch(p.medicalType) {
        case 'hospital': return <Hospital size={size} />;
        case 'pharmacy': return <Pill size={size} />;
        default: return <Stethoscope size={size} />;
      }
    } else {
      switch(p.workerType) {
        case 'electrician': return <Zap size={size} />;
        case 'plumber': return <Wrench size={size} />;
        default: return <Users size={size} />;
      }
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header (Same as before) */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 border border-gray-100"><ChevronLeft size={24} /></button>
          <div>
            <h1 className="text-2xl font-black text-gray-800 capitalize tracking-tight">
              {isTransport ? 'Local Transport' : isWorkers ? 'Available Workers' : 'Medical Care'}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Village Marketplace</p>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}><ListIcon size={20} /></button>
          <button onClick={() => setViewMode('map')} className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}><MapIcon size={20} /></button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Filter Section */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" placeholder={`Search ${category}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none font-medium text-sm text-black"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(isTransport ? TRANSPORT_TYPES : isWorkers ? WORKER_TYPES : MEDICAL_TYPES).map((type) => (
            <button
              key={type.id} onClick={() => setActiveFilter(type.id)}
              className={`px-4 h-11 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all border font-black text-[10px] uppercase tracking-widest ${
                activeFilter === type.id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border-gray-100'
              }`}
            >
              {type.icon} {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' ? (
        <div className="space-y-4 animate-in fade-in">
          {filteredProviders.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-[40px] border border-gray-100 shadow-sm space-y-4 relative overflow-hidden active:scale-[0.98] transition-all group">
              {p.verified && (
                <div className="absolute top-0 right-0 bg-green-50 px-3 py-1.5 rounded-bl-2xl text-[8px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1 border-l border-b border-green-100 shadow-inner">
                   <ShieldCheck size={10} /> Verified Pro
                </div>
              )}
              
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-18 h-18 bg-neutral rounded-3xl flex items-center justify-center text-primary shadow-inner">
                    {getProviderIcon(p, 36)}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 text-lg leading-tight pr-10">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-0.5 bg-accent/10 px-2 py-0.5 rounded-full">
                        <Star size={10} className="fill-accent text-accent" />
                        <span className="text-[10px] text-accent font-black">{p.rating}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.distance}</span>
                    </div>
                    {/* Capability Tags */}
                    {p.tags && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {p.tags.map(t => (
                          <span key={t} className="text-[8px] font-black uppercase tracking-tighter bg-primary/5 text-primary px-2 py-0.5 rounded-full border border-primary/10">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-primary leading-none">{p.price}</p>
                  <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Starting Rate</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setViewProvider(p)}
                  className="flex-1 h-14 bg-neutral h-14 rounded-[20px] text-gray-600 font-black text-[10px] uppercase tracking-widest border border-gray-100 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Info size={16} /> Details
                </button>
                <button 
                  onClick={() => handleBookNow(p)} 
                  className={`flex-[2] h-14 rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 ${
                    p.isAvailable ? 'bg-primary text-white shadow-primary/20' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  Book Now <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[60vh] bg-white rounded-[40px] flex items-center justify-center text-gray-300 font-black uppercase text-xs tracking-widest border border-gray-100 italic">
          Map View Enhanced
        </div>
      )}

      {/* PROVIDER DETAIL MODAL */}
      {viewProvider && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-[56px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom flex flex-col max-h-[90vh]">
            <div className="relative p-10 flex flex-col items-center text-center">
              <button onClick={() => setViewProvider(null)} className="absolute top-8 right-8 p-2 bg-neutral rounded-full text-gray-300"><X size={24} /></button>
              
              <div className="w-32 h-32 bg-neutral rounded-[48px] flex items-center justify-center text-primary shadow-inner mb-6 ring-8 ring-primary/5">
                {getProviderIcon(viewProvider, 64)}
              </div>
              
              <h2 className="text-3xl font-black text-gray-800 tracking-tight">{viewProvider.name}</h2>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">{viewProvider.category}</p>
              
              <div className="flex gap-6 mt-8 w-full">
                <div className="flex-1 flex flex-col items-center p-4 bg-neutral rounded-3xl">
                   <p className="text-xl font-black text-black">{viewProvider.experience}y</p>
                   <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Experience</p>
                </div>
                <div className="flex-1 flex flex-col items-center p-4 bg-neutral rounded-3xl">
                   <p className="text-xl font-black text-black">{viewProvider.jobsCompleted}+</p>
                   <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Jobs Done</p>
                </div>
                <div className="flex-1 flex flex-col items-center p-4 bg-neutral rounded-3xl">
                   <p className="text-xl font-black text-accent flex items-center gap-1">★ {viewProvider.rating}</p>
                   <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">({viewProvider.ratingCount})</p>
                </div>
              </div>

              <div className="w-full mt-8 p-6 bg-primary/5 rounded-[32px] border border-primary/10 text-left">
                 <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2"><ThumbsUp size={12}/> About Provider</h4>
                 <p className="text-xs text-gray-600 font-medium leading-relaxed">{viewProvider.bio || 'Highly recommended village professional.'}</p>
              </div>

              {viewProvider.capacity && (
                <div className="w-full mt-4 p-5 bg-neutral rounded-[28px] flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Gauge size={20} className="text-gray-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Vehicle Specs</span>
                   </div>
                   <span className="text-[10px] font-black text-black uppercase tracking-widest">{viewProvider.capacity}</span>
                </div>
              )}

              <div className="w-full pt-8 flex gap-4">
                 <button className="flex-1 h-18 bg-neutral rounded-[24px] flex items-center justify-center gap-2 text-primary font-black uppercase tracking-widest text-[11px] shadow-sm"><Phone size={20}/> Call</button>
                 <button onClick={() => handleBookNow(viewProvider)} className="flex-[2] h-18 bg-primary text-white rounded-[24px] shadow-2xl shadow-primary/20 font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-all">Book Service <ArrowRight size={24}/></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL (Existing logic but with improved UI) */}
      {bookingProvider && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-md rounded-t-[56px] p-10 shadow-2xl animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black text-gray-800">Finalize Booking</h3>
                 <button onClick={() => setBookingProvider(null)} className="p-2 text-gray-300"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                {isTransport ? (
                  <div className="space-y-4">
                    <div className="bg-neutral p-5 rounded-3xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Pickup Point</p>
                      <input type="text" value={pickup} onChange={e => setPickup(e.target.value)} placeholder="Village Location" className="w-full bg-transparent font-black text-sm outline-none text-black" />
                    </div>
                    <div className="bg-neutral p-5 rounded-3xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Destination</p>
                      <input type="text" value={drop} onChange={e => setDrop(e.target.value)} placeholder="Target Mandi/Shop" className="w-full bg-transparent font-black text-sm outline-none text-black" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral p-5 rounded-3xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Job Description</p>
                    <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Describe what you need..." className="w-full h-24 bg-transparent font-black text-sm outline-none resize-none text-black" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => setPaymentMethod('wallet')} className={`p-5 rounded-[28px] border-2 flex flex-col items-center gap-2 ${paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'border-gray-50 bg-neutral'}`}>
                      <Wallet size={24} className={paymentMethod === 'wallet' ? 'text-primary' : 'text-gray-300'} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Online Pay</span>
                   </button>
                   <button onClick={() => setPaymentMethod('cash')} className={`p-5 rounded-[28px] border-2 flex flex-col items-center gap-2 ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-gray-50 bg-neutral'}`}>
                      <Banknote size={24} className={paymentMethod === 'cash' ? 'text-primary' : 'text-gray-300'} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Pay in Person</span>
                   </button>
                </div>

                <div className="pt-4">
                   <button onClick={confirmBooking} disabled={isBooking} className="w-full h-20 bg-primary text-white rounded-[32px] font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3">
                      {isBooking ? <Loader2 className="animate-spin" /> : <>Request Appointment <ArrowRight size={24}/></>}
                   </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* SUCCESS STATE */}
      {booked && (
        <div className="fixed inset-0 z-[120] bg-primary flex flex-col items-center justify-center text-white text-center p-8 animate-in fade-in">
           <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
              <CheckCircle size={64} className="text-accent" />
           </div>
           <h2 className="text-4xl font-black mb-4 tracking-tight">Booking Sent!</h2>
           <p className="text-white/70 font-bold uppercase tracking-widest text-xs">Waiting for provider response...</p>
        </div>
      )}
    </div>
  );
};