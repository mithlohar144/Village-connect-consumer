
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Language } from '../types';
import { Check } from 'lucide-react';

export const LanguageSelection: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useStore();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 items-center justify-center">
      <div className="mb-12 text-center">
        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <img src="https://picsum.photos/id/10/200" className="w-16 h-16 rounded-2xl object-cover" alt="Logo" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">विलेज कनेक्ट</h1>
        <p className="text-gray-500 mt-2">Connecting Rural Communities</p>
      </div>

      <div className="w-full space-y-4">
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">Select Language / भाषा चुनें</h2>
        
        <button
          onClick={() => handleSelect('hi')}
          className={`w-full p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
            language === 'hi' ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50'
          }`}
        >
          <div className="text-left">
            <p className="text-2xl font-bold text-gray-800">हिन्दी</p>
            <p className="text-sm text-gray-500">Hindi</p>
          </div>
          {language === 'hi' && <div className="bg-primary p-2 rounded-full text-white"><Check size={20} /></div>}
        </button>

        <button
          onClick={() => handleSelect('en')}
          className={`w-full p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
            language === 'en' ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50'
          }`}
        >
          <div className="text-left">
            <p className="text-2xl font-bold text-gray-800">English</p>
            <p className="text-sm text-gray-500">English</p>
          </div>
          {language === 'en' && <div className="bg-primary p-2 rounded-full text-white"><Check size={20} /></div>}
        </button>
      </div>

      <p className="mt-12 text-gray-400 text-xs text-center px-8">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};
