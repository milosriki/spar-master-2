import React, { useState, useRef, useEffect } from 'react';
import Section from './Section';
import { CliState, QuickAction } from '../types';
import { establishConnection, executeCommand, speakText, LiveSessionController } from '../services/geminiService';
import { 
  Activity, 
  X, 
  ChevronRight, 
  Wifi, 
  Zap, 
  Brain,
  Lock,
  Moon,
  Coffee,
  Terminal,
  Volume2,
  VolumeX,
  Mic,
  Phone,
  PhoneOff
} from 'lucide-react';

const QUICK_ACTIONS: QuickAction[] = [
  { 
    id: 'sleep', 
    label: 'Sleep Audit', 
    icon: <Moon size={14} />, 
    prompt: 'I need to fix my sleep. I wake up tired.', 
    mode: 'SLEEP' 
  },
  { 
    id: 'energy', 
    label: 'Fix The Crash', 
    icon: <Zap size={14} />, 
    prompt: 'I crash at 3pm every day. Give me a protocol.', 
    mode: 'METABOLIC' 
  },
  { 
    id: 'stress', 
    label: 'Stress Killers', 
    icon: <Brain size={14} />, 
    prompt: 'High stress executive environment. Need regulation tools.', 
    mode: 'FOCUS' 
  },
  { 
    id: 'fasting', 
    label: 'Fasting Guide', 
    icon: <Coffee size={14} />, 
    prompt: 'How do I start intermittent fasting safely?', 
    mode: 'METABOLIC' 
  },
];

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface AiAuditProps {
  onBookingRequest?: () => void;
}

const AiAudit: React.FC<AiAuditProps> = ({ onBookingRequest }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'chat'>('overview');
  const [handshakePhase, setHandshakePhase] = useState<string>(''); 

  // --- Voice / Live State ---
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false); // Legacy TTS toggle
  const [isLiveActive, setIsLiveActive] = useState(false);     // Live API toggle
  const [isLiveConnecting, setIsLiveConnecting] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const liveSessionRef = useRef<LiveSessionController | null>(null);
  const cliEndRef = useRef<HTMLDivElement>(null);

  const [cli, setCli] = useState<CliState>({
    isOpen: false,
    input: '',
    output: [{ type: 'system', content: 'ANTIGRAVITY STUDIO™: Systems Online.' }],
    loading: false
  });

  useEffect(() => {
    if (activeTab === 'chat') {
        cliEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [cli.output, activeTab]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        liveSessionRef.current?.stop();
        audioContextRef.current?.close();
    };
  }, []);

  const initAudio = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
  };

  const handleLiveAudioData = async (base64Data: string) => {
    if (!audioContextRef.current) return;
    
    // Decode
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const audioBuffer = await decodeAudioData(bytes, audioContextRef.current, 24000, 1);
    
    // Schedule Playback
    const ctx = audioContextRef.current;
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    const now = ctx.currentTime;
    // Ensure we schedule after the previous chunk, or now if we fell behind
    const start = Math.max(now, nextStartTimeRef.current);
    
    source.start(start);
    nextStartTimeRef.current = start + audioBuffer.duration;
    
    setIsPlaying(true);
    source.onended = () => {
        // Simple check: if current time > nextStartTime, we are done
        if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
             setIsPlaying(false);
        }
    };
  };

  const toggleLiveSession = async () => {
    if (isLiveActive) {
        // STOP
        liveSessionRef.current?.stop();
        setIsLiveActive(false);
        setIsLiveConnecting(false);
        setCli(prev => ({
            ...prev,
            output: [...prev.output, { type: 'system', content: 'Voice Session Ended.' }]
        }));
    } else {
        // START
        setActiveTab('chat');
        if (!cli.isOpen) setCli(prev => ({ ...prev, isOpen: true }));
        
        setIsLiveConnecting(true);
        initAudio();
        
        const controller = new LiveSessionController(
            handleLiveAudioData,
            () => { 
                setIsLiveActive(false); 
                setIsLiveConnecting(false); 
            }
        );
        
        liveSessionRef.current = controller;
        try {
            await controller.start();
            setIsLiveActive(true);
            setIsLiveConnecting(false);
            setCli(prev => ({
                ...prev,
                output: [...prev.output, { type: 'system', content: 'Live Voice Protocol Initiated...' }]
            }));
        } catch (e) {
            console.error(e);
            setIsLiveConnecting(false);
            alert("Failed to start live session. Check permissions.");
        }
    }
  };

  // Legacy Handshake for Text Mode
  const triggerHandshake = async () => {
    if (cli.isOpen) return;
    initAudio();
    
    setCli(prev => ({ ...prev, loading: true }));
    
    const phases = ["Resolving Biometrics...", "Loading Habit Libraries...", "Antigravity Link Established"];
    let phaseIndex = 0;
    setHandshakePhase(phases[0]);
    
    const phaseInterval = setInterval(() => {
        phaseIndex = (phaseIndex + 1) % phases.length;
        setHandshakePhase(phases[phaseIndex]);
    }, 800);
    
    try {
        const result = await establishConnection();
        clearInterval(phaseInterval);
        setHandshakePhase('');

        if (result.status === 'ESTABLISHED') {
            const welcomeMsg = "Welcome to the Studio. I am your Antigravity Agent.";
            setCli(prev => ({
                ...prev,
                isOpen: true,
                loading: false,
                output: [
                  ...prev.output, 
                  { type: 'system', content: `> ${result.message}` },
                  { type: 'ai', content: welcomeMsg }
                ]
            }));
            setActiveTab('chat');
        } else {
            setCli(prev => ({ ...prev, loading: false }));
            alert("Connection failed: " + result.message);
        }
    } catch (e) {
        clearInterval(phaseInterval);
        setHandshakePhase('');
        setCli(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCommand = async (commandText: string) => {
    if (!commandText.trim()) return;

    setCli(prev => ({
        ...prev,
        input: '',
        loading: true,
        output: [...prev.output, { type: 'user', content: commandText }]
    }));

    const responseText = await executeCommand(commandText);

    // Check if AI wants to trigger booking
    if (responseText.startsWith('[BOOKING_REQUEST]')) {
      const bookingData = JSON.parse(responseText.substring('[BOOKING_REQUEST]'.length));
      setCli(prev => ({
          ...prev,
          loading: false,
          output: [...prev.output, { type: 'ai', content: 'Great! Let me help you schedule a consultation. Opening the booking system...' }]
      }));
      
      // Trigger booking modal
      if (onBookingRequest) {
        setTimeout(() => onBookingRequest(), 500);
      }
      return;
    }

    setCli(prev => ({
        ...prev,
        loading: false,
        output: [...prev.output, { type: 'ai', content: responseText }]
    }));

    // Legacy TTS fallback if Live is NOT active but Voice Toggle IS on
    if (isVoiceEnabled && !isLiveActive) {
        initAudio();
        const audioData = await speakText(responseText);
        if (audioData) {
            // Re-use logic for playback
            if (audioContextRef.current) {
                const buffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
                const source = audioContextRef.current.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContextRef.current.destination);
                source.start(0);
                setIsPlaying(true);
                source.onended = () => setIsPlaying(false);
            }
        }
    }
  };

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(cli.input);
  };

  return (
    <Section id="audit" className="bg-[#050505] text-white rounded-3xl my-8 md:my-16 mx-4 md:mx-0 shadow-2xl overflow-hidden relative border border-gray-800">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#0A0A0A]">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 tracking-tight">
             <Terminal size={24} className="text-accent" />
             STUDIO
             {(cli.isOpen || isLiveActive) && <span className="text-xs font-mono text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 animate-pulse">ONLINE</span>}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
            {/* Live Call Toggle */}
            <button 
                onClick={toggleLiveSession}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
                    isLiveActive 
                    ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30 animate-pulse'
                    : isLiveConnecting
                        ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                        : 'bg-green-600/20 text-green-500 border border-green-600/50 hover:bg-green-600/30'
                }`}
            >
                {isLiveActive ? (
                    <> <PhoneOff size={16} /> END SESSION </>
                ) : isLiveConnecting ? (
                     <> <Activity size={16} className="animate-spin" /> CONNECTING </>
                ) : (
                    <> <Phone size={16} /> LIVE COACH </>
                )}
            </button>
            
            {!isLiveActive && (
                <button 
                    onClick={triggerHandshake}
                    disabled={cli.isOpen}
                    className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                        cli.isOpen ? 'opacity-50 cursor-default' : 'bg-white text-black hover:bg-gray-200'
                    }`}
                >
                    {cli.isOpen ? 'TEXT READY' : 'TEXT MODE'}
                </button>
            )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row min-h-[600px] relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-10">
        
        {/* Background Visuals for Studio Vibe */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-tr from-accent/5 via-transparent to-purple-900/10"></div>

        {/* Main Content Area */}
        <div className={`flex-1 p-6 transition-all duration-500 ${activeTab === 'chat' ? 'opacity-30 blur-sm pointer-events-none hidden md:block' : 'opacity-100'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* ... Existing Dashboard Cards ... */}
                 <div className="bg-[#111] rounded-xl p-6 border border-gray-800 group">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">
                            <Activity size={14} /> Biometric Stream
                        </div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <div className="text-3xl font-mono font-bold text-white">14.2<span className="text-sm text-gray-500">%</span></div>
                            <div className="text-xs text-gray-500 uppercase">Body Fat</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-mono font-bold text-white">82<span className="text-sm text-gray-500">ms</span></div>
                            <div className="text-xs text-gray-500 uppercase">HRV (Avg)</div>
                        </div>
                    </div>
                </div>
                 <div className="bg-[#111] rounded-xl p-6 border border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <Zap size={40} className="text-gray-800" />
                    </div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Daily Focus</h3>
                    <p className="text-xl font-medium text-white leading-relaxed z-10 relative">
                        "Your cortisol peaks at 07:00. This is your window for <span className="text-accent">high-leverage decisions</span>."
                    </p>
                </div>
            </div>
        </div>

        {/* AI Agent Interface */}
        <div className={`
            absolute md:relative inset-0 md:inset-auto z-20 md:z-0
            flex flex-col bg-[#080808]/95 backdrop-blur-xl border-l border-gray-800
            transition-all duration-500 ease-in-out transform
            ${(activeTab === 'chat' || cli.isOpen || isLiveActive) ? 'translate-x-0 w-full md:w-[450px] opacity-100' : 'translate-x-full w-0 opacity-0 hidden'}
        `}>
             <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0F0F0F]">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-accent'} ${isPlaying ? 'animate-[ping_1s_infinite]' : 'animate-pulse'}`}></div>
                        {isPlaying && <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>}
                    </div>
                    <span className="font-bold text-xs tracking-[0.2em] text-white">
                        {isLiveActive ? 'LIVE VOICE CHANNEL' : 'ANTIGRAVITY AGENT'}
                    </span>
                </div>
                <button onClick={() => { setActiveTab('overview'); if(isLiveActive) toggleLiveSession(); }} className="md:hidden text-gray-500 hover:text-white"><X size={20}/></button>
             </div>
             
             {/* Content Area: Either Chat or Live Visualizer */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent relative">
                
                {isLiveActive ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 animate-fade-in">
                        {/* Live Visualizer */}
                        <div className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 ${isPlaying ? 'scale-110' : 'scale-100'}`}>
                            <div className={`absolute inset-0 rounded-full border border-accent/30 animate-[spin_10s_linear_infinite]`}></div>
                            <div className={`absolute inset-2 rounded-full border border-accent/20 animate-[spin_15s_linear_infinite_reverse]`}></div>
                            <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-accent to-red-600 blur-2xl opacity-20 ${isPlaying ? 'animate-pulse' : 'opacity-10'}`}></div>
                            <Mic size={40} className={`relative z-10 text-white ${isPlaying ? 'text-accent' : 'text-gray-400'}`} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-white font-bold tracking-widest text-sm mb-2">LISTENING</h3>
                            <p className="text-gray-500 text-xs">Speak naturally. Interrupt anytime.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {cli.output.map((line, i) => (
                            <div key={i} className={`flex flex-col ${line.type === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                                <div className={`
                                    max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed
                                    ${line.type === 'user' 
                                        ? 'bg-[#222] text-white rounded-br-none border border-gray-700' 
                                        : line.type === 'system'
                                            ? 'bg-transparent text-green-500 font-mono text-xs pl-0 border-l-2 border-green-500 pl-3 py-1'
                                            : 'bg-gradient-to-b from-[#151515] to-[#111] text-gray-200 rounded-bl-none border border-gray-800 shadow-xl'}
                                `}>
                                    {line.content}
                                </div>
                            </div>
                        ))}
                        {cli.loading && (
                            <div className="flex items-center space-x-2 text-accent text-xs px-4 py-2 font-mono uppercase tracking-widest animate-pulse">
                                <Activity size={12} />
                                <span>Calculating...</span>
                            </div>
                        )}
                        <div ref={cliEndRef} />
                    </>
                )}
             </div>

             {/* Input Area (Only for Text Mode) */}
             {!isLiveActive && (
                 <div className="p-4 bg-[#0F0F0F] border-t border-gray-800 space-y-4">
                    {/* Agentic Flow Chips */}
                    {!cli.loading && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {QUICK_ACTIONS.map((action) => (
                                <button
                                    key={action.id}
                                    onClick={() => handleCommand(action.prompt)}
                                    className="flex-shrink-0 flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#252525] border border-gray-700 hover:border-accent/50 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200"
                                >
                                    {action.icon}
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleCliSubmit}>
                        <div className="relative group">
                            <input 
                                type="text" 
                                value={cli.input}
                                onChange={(e) => setCli(prev => ({...prev, input: e.target.value}))}
                                className="w-full bg-[#050505] border border-gray-700 text-white rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 text-sm transition-all font-medium placeholder-gray-600"
                                placeholder="Describe your goal..."
                            />
                            <button 
                                type="submit" 
                                disabled={!cli.input.trim()}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-accent rounded-lg text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </form>
                    
                    {/* Legacy TTS Toggle */}
                    <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] text-gray-600 uppercase tracking-widest">Studio v2.1</span>
                         <button 
                            onClick={() => { setIsVoiceEnabled(!isVoiceEnabled); initAudio(); }}
                            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${isVoiceEnabled ? 'text-accent' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                            {isVoiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                            Auto-Read
                        </button>
                    </div>
                 </div>
             )}
        </div>
      </div>
    </Section>
  );
};

export default AiAudit;