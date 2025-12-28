
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore, MandiListing } from '../store';
import { TRANSLATIONS } from '../constants';
import { 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Plus, 
  Camera, 
  CheckCircle2, 
  ShoppingBag, 
  MapPin, 
  X,
  Search,
  ArrowRight,
  History as HistoryIcon,
  Gavel,
  Sparkles,
  Timer,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  LayoutGrid,
  ClipboardList,
  ChevronRight,
  Package,
  Tags,
  Scale,
  Wheat,
  Cherry,
  Leaf,
  Boxes,
  Info,
  Clock,
  User,
  Zap,
  History
} from 'lucide-react';

const CountdownTimer: React.FC<{ endTime: string; onExpire?: () => void }> = ({ endTime, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        if (onExpire) onExpire();
        return setTimeLeft('00:00:00');
      }
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return <span className="text-[10px] font-black text-accent tracking-widest">{timeLeft}</span>;
};

const CROP_CATEGORIES = [
  { id: 'All', label: 'All', icon: <Boxes size={16} /> },
  { id: 'Grains', label: 'Grains', icon: <Wheat size={16} /> },
  { id: 'Vegetables', label: 'Veg', icon: <Leaf size={16} /> },
  { id: 'Fruits', label: 'Fruits', icon: <Cherry size={16} /> },
  { id: 'Pulses', label: 'Pulses', icon: <Package size={16} /> },
];

export const Mandi: React.FC = () => {
  const { language, mandiItems, mandiListings, addMandiListing, user, addTransaction, walletBalance, mandiHistory, addMandiHistoryEntry, placeBid, showPopup } = useStore();
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'prices' | 'buy' | 'sell' | 'history'>('prices');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [sellLoading, setSellLoading] = useState(false);
  const [listingType, setListingType] = useState<'fixed' | 'auction'>('fixed');
  const [formData, setFormData] = useState({ 
    crop: '', 
    price: '', 
    qty: '', 
    location: 'Local Field', 
    category: 'Grains' as MandiListing['category'],
    duration: '24' 
  });

  const [selectedListing, setSelectedListing] = useState<MandiListing | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const rivalBidIntervalRef = useRef<number | null>(null);

  // Sync selectedListing with store updates (to see rival bids in modal)
  const currentListing = useMemo(() => {
    if (!selectedListing) return null;
    return mandiListings.find(l => l.id === selectedListing.id) || selectedListing;
  }, [mandiListings, selectedListing]);

  // RIVAL BID SIMULATOR
  useEffect(() => {
    if (currentListing && currentListing.type === 'auction') {
      rivalBidIntervalRef.current = window.setInterval(() => {
        const shouldBid = Math.random() > 0.85; // 15% chance every 8s
        if (shouldBid) {
          const rivalNames = ['Vikram', 'Rajeev', 'Sunil', 'Parth', 'Deepak'];
          const name = rivalNames[Math.floor(Math.random() * rivalNames.length)];
          const increment = 50 + Math.floor(Math.random() * 3) * 50;
          const newBid = currentListing.price + increment;
          placeBid(currentListing.id, newBid, name, false);
        }
      }, 8000);
    }
    return () => {
      if (rivalBidIntervalRef.current) clearInterval(rivalBidIntervalRef.current);
    };
  }, [currentListing?.id]);

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSellLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const newListing: MandiListing = {
      id: Math.random().toString(36).substr(2, 9),
      sellerId: user.id,
      sellerName: user.name || 'Anonymous Farmer',
      cropName: formData.crop,
      category: formData.category,
      price: parseInt(formData.price),
      quantity: formData.qty,
      image: `https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400`,
      location: formData.location,
      status: 'active',
      type: listingType,
      endTime: listingType === 'auction' ? new Date(Date.now() + 86400000).toISOString() : undefined,
      bidsCount: listingType === 'auction' ? 0 : undefined,
      bidHistory: []
    };
    addMandiListing(newListing);
    addMandiHistoryEntry({ type: 'sell', cropName: formData.crop, price: parseInt(formData.price), quantity: formData.qty, status: 'Listed' });
    setSellLoading(false);
    showPopup({
      type: 'success',
      title: 'Listing Live!',
      message: `${formData.crop} is now available in the Mandi for ${listingType} sale.`
    });
    setActiveTab('history');
  };

  const handleBuyOrBid = async () => {
    if (!currentListing) return;
    
    // Validate bid
    const amountToBid = currentListing.type === 'auction' ? bidAmount : currentListing.price;
    if (currentListing.type === 'auction' && amountToBid <= currentListing.price) {
      showPopup({ type: 'error', title: 'Invalid Bid', message: 'Your bid must be higher than current price.' });
      return;
    }

    setActionLoading(true);
    await new Promise(r => setTimeout(r, 800));
    
    // Fee for expressing interest/placing bid
    addTransaction({ type: 'debit', amount: 5, description: `Auction Fee: ${currentListing.cropName}` });
    
    if (currentListing.type === 'auction') {
      placeBid(currentListing.id, amountToBid, user?.name || 'Me', true);
      showPopup({
        type: 'success',
        title: 'Bid Placed!',
        message: `You are now the leading bidder for ${currentListing.cropName} at ₹${amountToBid}.`
      });
    } else {
      addMandiHistoryEntry({ type: 'buy', cropName: currentListing.cropName, price: currentListing.price, quantity: currentListing.quantity, status: 'Completed' });
      setSelectedListing(null);
      showPopup({
        type: 'success',
        title: 'Purchase Requested!',
        message: `Your interest in ${currentListing.cropName} has been shared with the seller.`
      });
      setActiveTab('history');
    }
    setActionLoading(false);
  };

  const filteredListings = useMemo(() => {
    return mandiListings.filter(l => {
      const matchesSearch = l.cropName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || l.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [mandiListings, searchQuery, activeCategory]);

  const isUserWinning = currentListing?.bidHistory?.[0]?.isUser;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center px-1 pt-2">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">{t.mandi}</h1>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Direct Market</p>
        </div>
        <div className="flex gap-2">
          <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-500"><Filter size={20} /></button>
          <button onClick={() => setActiveTab('sell')} className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 transition-transform active:scale-95"><Plus size={20} /></button>
        </div>
      </div>

      <div className="flex bg-gray-100 p-1.5 rounded-[24px] overflow-x-auto no-scrollbar">
        {(['prices', 'buy', 'sell', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[70px] py-3 text-[10px] font-black rounded-[18px] transition-all uppercase tracking-widest px-3 ${
              activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
            }`}
          >
            {tab === 'prices' ? t.mandiPrices : tab === 'buy' ? t.buyProduce : tab === 'sell' ? t.sellProduce : t.history}
          </button>
        ))}
      </div>

      {activeTab === 'prices' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {mandiItems.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-neutral rounded-3xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                  {item.name.includes('Wheat') ? '🌾' : item.name.includes('Mustard') ? '🌼' : '📦'}
                </div>
                <div>
                  <p className="font-black text-gray-800 text-lg leading-tight">{item.name}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-1.5 tracking-widest">per {item.unit}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-gray-800 tracking-tighter">₹{item.price}</p>
                <div className={`flex items-center justify-end gap-1.5 text-[10px] font-black mt-2 ${item.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                  {item.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {item.trend === 'up' ? 'Rising' : 'Falling'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'buy' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" placeholder="Search crops..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none font-medium text-sm focus:border-primary/30 transition-all text-black"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {CROP_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 h-10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                    activeCategory === cat.id 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                      : 'bg-white text-gray-400 border-gray-100 hover:border-primary/30'
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredListings.length > 0 ? filteredListings.map(listing => (
              <div key={listing.id} className="bg-white p-3 rounded-[40px] border border-gray-100 shadow-sm space-y-4 flex flex-col">
                <div className="relative h-36 w-full rounded-3xl overflow-hidden shrink-0">
                  <img src={listing.image} className="w-full h-full object-cover" alt={listing.cropName} />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl text-[8px] font-black uppercase text-primary border border-white shadow-sm">
                    {listing.category}
                  </div>
                  {listing.type === 'auction' && (
                    <div className="absolute top-2 left-2 bg-accent text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                      <Gavel size={10} /> Live
                    </div>
                  )}
                </div>
                <div className="px-2 space-y-1 flex-1">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-black text-gray-800 text-sm truncate">{listing.cropName}</h4>
                    {listing.type === 'auction' && listing.endTime && <CountdownTimer endTime={listing.endTime} />}
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase truncate flex items-center gap-1">
                    <MapPin size={10} className="text-primary" /> {listing.location}
                  </p>
                  <p className="text-xl font-black text-primary pt-2">₹{listing.price}<span className="text-[10px] text-gray-500 ml-1 font-bold">/qtl</span></p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedListing(listing);
                    if (listing.type === 'auction') setBidAmount(listing.price + 50);
                  }}
                  className="w-full h-12 bg-primary text-white text-[10px] font-black uppercase rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all mt-auto"
                >
                  {listing.type === 'auction' ? 'Join Auction' : 'Buy Now'}
                </button>
              </div>
            )) : (
              <div className="col-span-2 py-20 text-center flex flex-col items-center gap-4 text-gray-300">
                <div className="w-16 h-16 bg-neutral rounded-full flex items-center justify-center opacity-40">
                  <Boxes size={32} />
                </div>
                <p className="font-black uppercase tracking-widest text-[10px]">No listings in this category</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SELL TAB (Same as before) */}
      {activeTab === 'sell' && (
        <form onSubmit={handleSellSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
           <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-neutral rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2 active:bg-gray-50 transition-colors">
                <Camera size={28} />
                <span className="text-[9px] font-black uppercase tracking-widest">Add Photo</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Package size={12}/> Crop Name</label>
                <input 
                  type="text" required value={formData.crop} onChange={e => setFormData({...formData, crop: e.target.value})}
                  placeholder="e.g. Organic Wheat"
                  className="w-full h-16 bg-neutral border border-gray-50 rounded-2xl px-6 font-bold text-black outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                   {CROP_CATEGORIES.filter(c => c.id !== 'All').map(cat => (
                     <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({...formData, category: cat.id as any})}
                        className={`h-12 rounded-xl text-[9px] font-black uppercase flex flex-col items-center justify-center gap-1 border transition-all ${formData.category === cat.id ? 'bg-primary text-white border-primary' : 'bg-neutral text-gray-400 border-gray-50'}`}
                     >
                       {cat.icon}
                       {cat.label}
                     </button>
                   ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Tags size={12}/> Price (₹/qtl)</label>
                    <input 
                      type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="2100"
                      className="w-full h-16 bg-neutral border border-gray-50 rounded-2xl px-6 font-bold text-black outline-none focus:border-primary transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Scale size={12}/> Qty (Qtls)</label>
                    <input 
                      type="text" required value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})}
                      placeholder="10"
                      className="w-full h-16 bg-neutral border border-gray-50 rounded-2xl px-6 font-bold text-black outline-none focus:border-primary transition-all"
                    />
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Sale Type</label>
                 <div className="flex bg-neutral p-1.5 rounded-2xl">
                    <button type="button" onClick={() => setListingType('fixed')} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${listingType === 'fixed' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>FIXED PRICE</button>
                    <button type="button" onClick={() => setListingType('auction')} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${listingType === 'auction' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>AUCTION</button>
                 </div>
              </div>
            </div>

            <button 
              type="submit" disabled={sellLoading}
              className="w-full h-18 bg-primary text-white rounded-[28px] font-black text-lg shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
            >
              {sellLoading ? <Loader2 className="animate-spin" /> : <>List Produce For Sale <ArrowRight size={20} /></>}
            </button>
          </div>
        </form>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-in fade-in">
          {mandiHistory.length > 0 ? mandiHistory.map((entry) => (
            <div key={entry.id} className="bg-white p-5 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner transition-transform group-hover:scale-105 ${entry.type === 'sell' ? 'bg-orange-50 text-orange-500' : entry.type === 'buy' ? 'bg-blue-50 text-blue-500' : 'bg-accent/10 text-accent'}`}>
                  {entry.type === 'sell' ? <ArrowUpRight size={24} /> : entry.type === 'buy' ? <ArrowDownLeft size={24} /> : <Gavel size={24} />}
                </div>
                <div>
                  <p className="font-black text-gray-800 text-base leading-tight">{entry.cropName}</p>
                  <p className="text-[9px] text-gray-500 font-black uppercase mt-1.5 tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {entry.status}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-gray-800 tracking-tight">₹{entry.price}</p>
                <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">{new Date(entry.date).toLocaleDateString()}</p>
              </div>
            </div>
          )) : (
            <div className="py-24 text-center text-gray-300 flex flex-col items-center space-y-4">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center opacity-40">
                  <ClipboardList size={40} />
               </div>
               <p className="font-black uppercase tracking-widest text-[10px]">No recent market activity</p>
            </div>
          )}
        </div>
      )}

      {/* AUCTION / BUY MODAL */}
      {currentListing && selectedListing && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-[56px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[95vh] flex flex-col">
             
             {/* Modal Header/Image */}
             <div className="relative h-48 shrink-0">
                <img src={currentListing.image} className="w-full h-full object-cover" alt="Crop" />
                <button onClick={() => setSelectedListing(null)} className="absolute top-6 right-6 bg-black/20 backdrop-blur-md p-3 rounded-full text-white"><X size={20} /></button>
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                   <div className="bg-white/95 px-4 py-2 rounded-2xl shadow-lg border border-white">
                      <p className="text-[8px] font-black text-primary uppercase tracking-widest">In Stock</p>
                      <p className="text-xs font-black text-gray-800">{currentListing.quantity}</p>
                   </div>
                   {currentListing.type === 'auction' && (
                     <div className="bg-accent px-4 py-2 rounded-2xl shadow-lg text-white flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                        <p className="text-[10px] font-black uppercase tracking-widest">LIVE</p>
                     </div>
                   )}
                </div>
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">{currentListing.cropName}</h2>
                    <p className="text-[10px] text-gray-500 font-black uppercase mt-1">
                      Sold by {currentListing.sellerName} • {currentListing.location}
                    </p>
                  </div>
                  {currentListing.type === 'auction' && currentListing.endTime && (
                    <div className="text-right">
                       <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Ends In</p>
                       <div className="bg-accent/10 px-3 py-1.5 rounded-xl border border-accent/20">
                          <CountdownTimer endTime={currentListing.endTime} />
                       </div>
                    </div>
                  )}
                </div>

                {currentListing.type === 'auction' ? (
                  <div className="space-y-6">
                    {/* Bidding Status Indicator */}
                    <div className={`p-5 rounded-[32px] border-2 flex items-center justify-between shadow-sm transition-all ${isUserWinning ? 'border-green-500 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isUserWinning ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                             {isUserWinning ? <CheckCircle2 size={24} /> : <Zap size={24} className="animate-pulse" />}
                          </div>
                          <div>
                             <p className={`text-[10px] font-black uppercase tracking-widest ${isUserWinning ? 'text-green-600' : 'text-red-500'}`}>
                                {isUserWinning ? 'Winning!' : 'Outbid!'}
                             </p>
                             <p className="text-xl font-black text-gray-800">₹{currentListing.price}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bids</p>
                          <p className="text-lg font-black text-gray-800">{currentListing.bidsCount}</p>
                       </div>
                    </div>

                    {/* Quick Bid Selection */}
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Quick Increase</label>
                       <div className="flex gap-2">
                          {[50, 100, 200].map(inc => (
                            <button 
                              key={inc}
                              onClick={() => setBidAmount(currentListing.price + inc)}
                              className={`flex-1 h-14 rounded-2xl font-black text-sm border-2 transition-all ${bidAmount === (currentListing.price + inc) ? 'border-primary bg-primary text-white shadow-lg' : 'border-gray-100 bg-white text-gray-400'}`}
                            >
                              +₹{inc}
                            </button>
                          ))}
                       </div>
                    </div>

                    {/* Live Bid History */}
                    <div className="space-y-3">
                       <div className="flex justify-between items-center px-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                             <History size={12} /> Recent Bids
                          </label>
                          <span className="text-[9px] font-bold text-primary flex items-center gap-1">
                             <span className="w-1 h-1 rounded-full bg-primary animate-ping" /> Updates Live
                          </span>
                       </div>
                       <div className="space-y-2 max-h-40 overflow-y-auto pr-2 no-scrollbar">
                          {currentListing.bidHistory?.map((bid, i) => (
                            <div key={bid.id} className={`flex items-center justify-between p-3 rounded-2xl animate-in slide-in-from-top-2 border ${bid.isUser ? 'bg-primary/5 border-primary/20' : 'bg-neutral border-gray-50'}`}>
                               <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${bid.isUser ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                                     {bid.bidderName[0]}
                                  </div>
                                  <div>
                                     <p className="text-xs font-black text-gray-800">{bid.isUser ? 'You' : bid.bidderName}</p>
                                     <p className="text-[8px] text-gray-400 font-bold uppercase">{new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                                  </div>
                               </div>
                               <p className="text-sm font-black text-gray-800">₹{bid.amount}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral p-6 rounded-[32px] border border-gray-100 flex items-center justify-between shadow-inner">
                     <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Market Price</span>
                        <span className="text-2xl font-black text-gray-800">₹{currentListing.price}</span>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Fee Token</span>
                        <span className="text-2xl font-black text-primary">₹5.00</span>
                     </div>
                  </div>
                )}

                <div className="pt-2">
                  <button 
                    onClick={handleBuyOrBid} disabled={actionLoading}
                    className={`w-full h-20 text-white rounded-[32px] font-black text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${isUserWinning ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-primary shadow-primary/30'}`}
                  >
                     {actionLoading ? <Loader2 className="animate-spin" /> : (
                       isUserWinning ? 'Leading Bidder' : (
                         currentListing.type === 'auction' ? `Place Bid ₹${bidAmount}` : 'Request to Buy'
                       )
                     )}
                     {!actionLoading && !isUserWinning && <ArrowRight size={24} />}
                  </button>
                  <p className="text-center text-[9px] text-gray-400 font-bold uppercase mt-4 tracking-widest">
                     Wallet Balance: ₹{walletBalance} • Bid Fee: ₹5
                  </p>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};