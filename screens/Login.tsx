
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { Phone, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { language, setUser } = useStore();
  const t = TRANSLATIONS[language];
  
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '']);

  const handleSendOtp = () => {
    if (phone.length === 10) {
      setStep('otp');
    }
  };

  const handleVerifyOtp = () => {
    // Simulated OTP verification
    if (otp.join('').length === 4) {
      setUser({
        id: '123',
        phone,
        role: 'user', // Default, will change during role selection
        kycStatus: 'none'
      });
      navigate('/onboarding-provider'); // Or direct to dashboard if returning
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Auto-focus next input
      if (value && index < 3) {
        const next = document.getElementById(`otp-${index + 1}`);
        next?.focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <div className="mt-12 mb-12">
        <h1 className="text-3xl font-bold text-gray-800">{t.login}</h1>
        <p className="text-gray-500 mt-2">
          {step === 'phone' ? t.enterPhone : t.verifyOtp}
        </p>
      </div>

      {step === 'phone' ? (
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-black">
              <Phone size={20} />
              <span className="ml-2 border-r pr-2 border-gray-200">+91</span>
            </div>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="00000 00000"
              className="w-full h-16 pl-24 pr-4 text-black bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl font-semibold tracking-widest focus:border-primary focus:bg-white transition-all outline-none"
            />
          </div>

          <button
            onClick={handleSendOtp}
            disabled={phone.length !== 10}
            className={`w-full h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
              phone.length === 10 ? 'bg-primary text-white shadow-primary/20' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {t.sendOtp}
            <ArrowRight size={20} />
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between gap-4">
            {otp.map((val, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="tel"
                // Fixed syntax error: replaced semicolon with closing brace
                maxLength={1}
                value={val}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                className="w-full h-16 text-black bg-gray-50 border-2 border-gray-100 rounded-2xl text-center text-3xl font-bold focus:border-primary focus:bg-white transition-all outline-none"
              />
            ))}
          </div>

          <button
            onClick={handleVerifyOtp}
            className="w-full h-16 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
          >
            {t.verifyOtp}
          </button>

          <button 
            onClick={() => setStep('phone')}
            className="w-full text-center text-primary font-medium"
          >
            Change Phone Number
          </button>
        </div>
      )}

      <div className="mt-auto mb-6 flex items-center justify-center gap-2 text-xs text-gray-400">
        <span className="w-8 h-[1px] bg-gray-100"></span>
        Secure OTP Verification
        <span className="w-8 h-[1px] bg-gray-100"></span>
      </div>
    </div>
  );
};
