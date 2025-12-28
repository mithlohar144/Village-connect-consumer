
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { useStore, ChatThread, ChatMessage } from '../store';
import { TRANSLATIONS } from '../constants';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  Sparkles, 
  Wifi, 
  WifiOff, 
  ChevronLeft,
  Users,
  MessageCircle,
  Loader2,
  Search,
  ArrowRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// --- HELPERS ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const int16 = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}

// --- SUB-COMPONENTS ---

const ChatRoom: React.FC<{ thread: ChatThread; onBack: () => void }> = ({ thread, onBack }) => {
  const { user, addMessage } = useStore();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [thread.messages]);

  const handleSend = () => {
    if (!inputText.trim() || !user) return;
    addMessage(thread.id, {
      senderId: user.id,
      senderName: user.name || 'Me',
      text: inputText,
      role: 'user'
    });
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-neutral animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 p-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400"><ChevronLeft size={24} /></button>
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl overflow-hidden">
          {thread.avatar?.startsWith('http') ? <img src={thread.avatar} className="w-full h-full object-cover" /> : thread.avatar}
        </div>
        <div>
          <h3 className="font-black text-gray-800 text-sm">{thread.title}</h3>
          <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{thread.type}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {thread.messages.map((msg, i) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {!isMe && <span className="text-[9px] font-black text-gray-400 uppercase mb-1 ml-1">{msg.senderName}</span>}
              <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium shadow-sm ${
                isMe ? 'bg-accent text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
              }`}>
                {msg.text}
              </div>
              <span className="text-[8px] text-gray-300 mt-1 uppercase font-bold">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 flex gap-3 pb-8">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Message..."
          className="flex-1 h-12 bg-neutral px-5 rounded-2xl outline-none border border-gray-50 focus:border-primary font-medium text-sm text-black"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export const Chats: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, isOffline, threads, user } = useStore();
  const t = TRANSLATIONS[language];

  const [activeMode, setActiveMode] = useState<'ai' | 'community' | 'direct'>('ai');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  
  // AI State
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [inputText, setInputText] = useState('');

  // Audio Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const aiClient = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY || '' }));

  // Auto-select thread from navigation state
  useEffect(() => {
    if (location.state?.threadId) {
      setSelectedThreadId(location.state.threadId);
      setActiveMode('direct');
      // Clear state after reading to prevent re-opening on back/refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const stopAllAudio = () => {
    sourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const startLiveSession = async () => {
    if (isLive || isConnecting) return;
    setIsConnecting(true);
    try {
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const sessionPromise = aiClient.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          outputAudioTranscription: {},
          systemInstruction: 'You are Gaon Sathi. Helpful Hinglish AI for rural India.',
        },
        callbacks: {
          onopen: () => {
            setIsLive(true); setIsConnecting(false);
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(s => s.sendRealtimeInput({ media: createBlob(inputData) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.outputTranscription) setCurrentTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            if (message.serverContent?.turnComplete) {
              setAiMessages(prev => [...prev, { id: Math.random().toString(), senderId: 'ai', senderName: 'Sathi', text: currentTranscription, timestamp: new Date().toISOString(), role: 'ai' }]);
              setCurrentTranscription('');
            }
            if (message.serverContent?.interrupted) stopAllAudio();
          },
          onerror: () => endLiveSession(),
          onclose: () => endLiveSession()
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) { setIsConnecting(false); alert('Mic Access Required'); }
  };

  const endLiveSession = () => {
    setIsLive(false); setIsConnecting(false); stopAllAudio();
    if (sessionRef.current) sessionRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
  };

  const handleSendAi = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setAiMessages(prev => [...prev, { id: Math.random().toString(), senderId: 'u', senderName: 'Me', text, timestamp: new Date().toISOString(), role: 'user' }]);
    setInputText('');
    try {
      const response = await aiClient.current.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: text,
        config: { systemInstruction: 'Village helpful AI. Practical and local.' }
      });
      setAiMessages(prev => [...prev, { id: Math.random().toString(), senderId: 'ai', senderName: 'Sathi', text: response.text || '', timestamp: new Date().toISOString(), role: 'ai' }]);
    } catch (e) {}
  };

  const filteredThreads = threads.filter(t => t.type === activeMode);
  const selectedThread = threads.find(t => t.id === selectedThreadId);

  if (selectedThreadId && selectedThread) {
    return <ChatRoom thread={selectedThread} onBack={() => setSelectedThreadId(null)} />;
  }

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between px-1 pt-2">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Village {t.chats}</h1>
        {isOffline ? <WifiOff size={20} className="text-gray-300" /> : <Wifi size={20} className="text-primary" />}
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-2xl">
        <button onClick={() => setActiveMode('ai')} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${activeMode === 'ai' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>
          <Sparkles size={14} /> Gaon Sathi
        </button>
        <button onClick={() => setActiveMode('community')} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${activeMode === 'community' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>
          <Users size={14} /> Community
        </button>
        <button onClick={() => setActiveMode('direct')} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${activeMode === 'direct' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>
          <MessageCircle size={14} /> Direct
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeMode === 'ai' ? (
          <div className="flex flex-col h-full space-y-4">
             <div className="flex-1 overflow-y-auto space-y-4 px-1 py-2 no-scrollbar">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium shadow-sm ${
                      msg.role === 'user' ? 'bg-accent text-white rounded-tr-none' : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {currentTranscription && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] p-4 rounded-3xl rounded-tl-none bg-white/60 backdrop-blur-sm text-gray-500 italic text-sm border border-gray-100/50">
                      {currentTranscription} <Loader2 size={12} className="inline animate-spin ml-2" />
                    </div>
                  </div>
                )}
             </div>

             <div className="pb-4 space-y-3">
               <div className="flex items-center gap-3">
                  <input 
                    type="text" value={inputText} onChange={e => setInputText(e.target.value)} disabled={isLive}
                    onKeyDown={e => e.key === 'Enter' && handleSendAi()}
                    className="flex-1 h-14 px-5 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none font-medium text-sm text-black" placeholder="Ask anything..."
                  />
                  <button onClick={handleSendAi} className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90"><Send size={18} /></button>
                  <button 
                    onClick={isLive ? endLiveSession : startLiveSession} disabled={isConnecting}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all ${isLive ? 'bg-red-500 text-white' : 'bg-primary text-white'}`}
                  >
                    {isConnecting ? <Loader2 className="animate-spin" /> : (isLive ? <MicOff /> : <Mic />)}
                  </button>
               </div>
             </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {filteredThreads.length > 0 ? filteredThreads.map(t => (
              <button 
                key={t.id} 
                onClick={() => setSelectedThreadId(t.id)}
                className="w-full p-5 bg-white rounded-[32px] border border-gray-50 shadow-sm flex items-center justify-between hover:border-primary/20 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-neutral rounded-2xl flex items-center justify-center text-2xl shadow-inner overflow-hidden">
                    {t.avatar?.startsWith('http') ? <img src={t.avatar} className="w-full h-full object-cover" /> : t.avatar}
                  </div>
                  <div className="text-left">
                    <h4 className="font-black text-gray-800 text-sm tracking-tight">{t.title}</h4>
                    <p className="text-[11px] text-gray-400 font-medium truncate max-w-[150px] mt-0.5">{t.lastMessage || 'No messages yet'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   {t.unreadCount > 0 && <span className="w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md">{t.unreadCount}</span>}
                   <ArrowRight size={16} className="text-gray-200" />
                </div>
              </button>
            )) : (
              <div className="py-24 text-center text-gray-300">
                <MessageCircle size={48} className="mx-auto opacity-20" />
                <p className="font-black uppercase tracking-widest text-[10px] mt-4">No active conversations</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};