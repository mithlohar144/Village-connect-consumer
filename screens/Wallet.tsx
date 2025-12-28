
import React, { useState } from 'react';
import { useStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Coins, 
  History, 
  CreditCard, 
  Landmark, 
  CheckCircle2, 
  Wallet as WalletIcon,
  RefreshCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';

export const Wallet: React.FC = () => {
  const { language, walletBalance, transactions, addTransaction, showPopup } = useStore();
  const t = TRANSLATIONS[language];
  const [showAddMoney, setShowAddMoney] = useState(false);

  const handleAddMoney = () => {
    addTransaction({ type: 'credit', amount: 500, description: 'Top-up: UPI Deposit' });
    setShowAddMoney(false);
    showPopup({
      type: 'success',
      title: 'Money Added!',
      message: '₹500 has been successfully added to your village wallet.'
    });
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">{t.wallet}</h1>
        <div className="bg-primary/5 px-3 py-1.5 rounded-full flex items-center gap-2">
           <ShieldCheck size={14} className="text-primary" />
           <span className="text-[10px] font-black text-primary uppercase tracking-widest">Secure</span>
        </div>
      </div>

      <div className="bg-primary rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl shadow-primary/30 border-b-[10px] border-black/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-[80px]" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-white/10 p-5 rounded-[32px] mb-8 backdrop-blur-md border border-white/20 shadow-inner">
            <Coins size={48} className="text-accent" />
          </div>
          <p className="text-white/60 font-black uppercase tracking-[0.2em] text-[11px]">{t.currentBalance}</p>
          <p className="text-7xl font-black mt-3 tracking-tighter flex items-start">
            <span className="text-2xl mt-4 mr-1 opacity-70">₹</span>
            {walletBalance}
          </p>
          
          <div className="flex gap-4 mt-12 w-full">
            <button 
              onClick={() => setShowAddMoney(true)}
              className="flex-1 bg-white text-primary h-16 rounded-[28px] font-black text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
            >
              Add Money
            </button>
            <button className="flex-1 bg-white/10 backdrop-blur-md text-white h-16 rounded-[28px] font-black text-sm flex items-center justify-center border border-white/20 active:scale-95 transition-all">
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <div className="flex justify-between items-end mb-6 px-2">
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">{t.history}</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-widest">Recent Transactions</p>
          </div>
          <History size={20} className="text-gray-300" />
        </div>
        
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-white p-5 rounded-[36px] border border-gray-100 flex items-center justify-between shadow-sm active:bg-neutral transition-all group">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform ${
                  tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {tx.type === 'credit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                </div>
                <div>
                  <p className="font-black text-gray-800 text-[14px] leading-tight">{tx.description}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-1.5 tracking-widest">
                    {new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black text-xl tracking-tight ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                </p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Success</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddMoney && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-[56px] p-10 shadow-2xl animate-in slide-in-from-bottom">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-10" />
            
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black text-gray-800 tracking-tight">Top-up Wallet</h3>
                 <button onClick={() => setShowAddMoney(false)} className="p-3 bg-neutral rounded-full text-gray-400"><X size={24} /></button>
              </div>

              <div className="bg-neutral p-10 rounded-[40px] border-2 border-gray-100 flex flex-col items-center justify-center">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Recharge Amount</p>
                <p className="text-6xl font-black text-gray-800 tracking-tighter">₹500</p>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Choose UPI App</p>
                <div className="grid grid-cols-3 gap-4">
                  {['GPay', 'PhonePe', 'Paytm'].map(app => (
                     <button key={app} className="h-20 bg-neutral border border-gray-100 rounded-[28px] flex items-center justify-center grayscale hover:grayscale-0 transition-all active:scale-95 active:border-primary">
                        <span className="font-black text-xs text-gray-500">{app}</span>
                     </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAddMoney}
                className="w-full h-20 bg-primary text-white rounded-[32px] font-black text-lg shadow-2xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Confirm & Pay ₹500
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
