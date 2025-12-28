
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Fingerprint, 
  UserSquare2, 
  FileText,
  Loader2,
  ArrowRight
} from 'lucide-react';

type KycStep = 'selection' | 'upload' | 'selfie' | 'submitting' | 'success';

export const KycVerification: React.FC = () => {
  const navigate = useNavigate();
  const { language, setKycStatus } = useStore();
  const t = TRANSLATIONS[language];

  const [step, setStep] = useState<KycStep>('selection');
  const [docType, setDocType] = useState<string | null>(null);
  const [files, setFiles] = useState<{ front: boolean; back: boolean }>({ front: false, back: false });
  const [selfieTaken, setSelfieTaken] = useState(false);

  const handleNext = () => {
    if (step === 'selection' && docType) setStep('upload');
    else if (step === 'upload' && files.front && files.back) setStep('selfie');
    else if (step === 'selfie' && selfieTaken) handleSubmit();
  };

  const handleSubmit = async () => {
    setStep('submitting');
    // Simulate API submission
    await new Promise(r => setTimeout(r, 2500));
    setKycStatus('pending');
    setStep('success');
  };

  const renderSelection = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Select Document Type</h3>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">Choose an official ID issued by the Government of India.</p>
      </div>

      <div className="space-y-3">
        {[
          { id: 'aadhaar', label: 'Aadhaar Card', sub: '12-digit Unique ID' },
          { id: 'pan', label: 'PAN Card', sub: 'Income Tax Identity' },
          { id: 'voter', label: 'Voter ID', sub: 'Election Commission Card' },
        ].map((doc) => (
          <button
            key={doc.id}
            onClick={() => setDocType(doc.id)}
            className={`w-full p-6 rounded-[24px] border-2 flex items-center justify-between transition-all active:scale-[0.98] ${
              docType === doc.id ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'
            }`}
          >
            <div className="flex items-center gap-4 text-left">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${docType === doc.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                <FileText size={24} />
              </div>
              <div>
                <p className="font-bold text-gray-800">{doc.label}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{doc.sub}</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${docType === doc.id ? 'bg-primary border-primary' : 'border-gray-200'}`}>
              {docType === doc.id && <CheckCircle2 size={14} className="text-white" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Document Photos</h3>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">Capture clear photos of your {docType} Card.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[
          { key: 'front' as const, label: 'Front Side' },
          { key: 'back' as const, label: 'Back Side' },
        ].map((side) => (
          <button
            key={side.key}
            onClick={() => setFiles(prev => ({ ...prev, [side.key]: true }))}
            className={`h-48 rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${
              files[side.key] ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            {files[side.key] ? (
              <div className="text-green-600 flex flex-col items-center animate-in zoom-in">
                <CheckCircle2 size={48} />
                <span className="text-sm font-bold mt-2">Captured!</span>
              </div>
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <Camera size={48} />
                <span className="text-sm font-bold mt-2">{side.label}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderSelfie = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Liveness Check</h3>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">Take a selfie to verify you are the document holder.</p>
      </div>

      <div className="flex flex-col items-center gap-8 py-4">
        <div className={`w-64 h-64 rounded-full border-4 flex items-center justify-center overflow-hidden transition-all ${
          selfieTaken ? 'border-green-500 bg-green-50' : 'border-primary/20 bg-gray-50'
        }`}>
          {selfieTaken ? (
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=user123" className="w-full h-full object-cover" alt="Selfie" />
          ) : (
            <UserSquare2 size={80} className="text-gray-300" />
          )}
        </div>

        <button
          onClick={() => setSelfieTaken(true)}
          className={`px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all ${
            selfieTaken ? 'bg-green-500 text-white shadow-green-200' : 'bg-primary text-white shadow-primary/20'
          }`}
        >
          <Camera size={20} />
          {selfieTaken ? 'Retake Selfie' : 'Take Selfie'}
        </button>
      </div>
    </div>
  );

  const renderSubmitting = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 animate-in zoom-in duration-500">
      <div className="relative">
        <div className="w-32 h-32 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-primary">
          <Fingerprint size={48} />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Verifying Identity...</h2>
        <p className="text-gray-400 text-sm mt-2 font-medium px-8">Our AI system is cross-checking your documents with official records.</p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-8 animate-in zoom-in duration-500">
      <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-200 ring-8 ring-green-100 animate-pulse">
        <ShieldCheck size={64} />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Submitted!</h2>
        <p className="text-gray-500 text-sm font-medium px-12 leading-relaxed">
          Identity verification usually takes <span className="text-primary font-bold">2-4 hours</span>. We will notify you once completed.
        </p>
      </div>
      <button 
        onClick={() => navigate('/profile')}
        className="w-full h-16 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
      >
        Return to Profile
      </button>
    </div>
  );

  const isStepValid = () => {
    if (step === 'selection') return !!docType;
    if (step === 'upload') return files.front && files.back;
    if (step === 'selfie') return selfieTaken;
    return true;
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center gap-4">
        {step !== 'submitting' && step !== 'success' && (
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 border border-gray-100">
            <ChevronLeft size={24} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">KYC Verification</h1>
          <div className="flex items-center gap-2 mt-1">
             <div className={`w-2 h-2 rounded-full ${step === 'success' ? 'bg-green-500' : 'bg-accent animate-pulse'}`} />
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
               {step === 'selection' ? 'Step 1 of 3' : step === 'upload' ? 'Step 2 of 3' : 'Final Step'}
             </p>
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="px-6 pt-4">
        {step === 'selection' && renderSelection()}
        {step === 'upload' && renderUpload()}
        {step === 'selfie' && renderSelfie()}
        {step === 'submitting' && renderSubmitting()}
        {step === 'success' && renderSuccess()}
      </div>

      {/* Floating Action Button */}
      {step !== 'submitting' && step !== 'success' && (
        <div className="fixed bottom-8 left-6 right-6">
          <button
            disabled={!isStepValid()}
            onClick={handleNext}
            className={`w-full h-18 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 transition-all shadow-2xl ${
              isStepValid() 
                ? 'bg-primary text-white shadow-primary/30' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            {step === 'selfie' ? 'Finish Submission' : 'Continue'}
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
