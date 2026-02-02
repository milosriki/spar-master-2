import { GoogleGenAI, FunctionDeclaration, Type, FunctionCallingConfigMode, Modality, LiveServerMessage } from "@google/genai";
import { AuditGoal } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- HELPERS FOR LIVE API ---

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  
  // Custom base64 encode for Uint8Array
  let binary = '';
  const bytes = new Uint8Array(int16.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return {
    data: btoa(binary),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export class LiveSessionController {
  private session: any = null;
  private inputContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  
  constructor(
    private onAudioData: (base64: string) => void,
    private onClose: () => void
  ) {}

  async start() {
    if (!apiKey) throw new Error("No API Key");

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: async () => {
          console.log("Gemini Live Session Opened");
          // Initialize Microphone Stream
          try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = this.inputContext.createMediaStreamSource(this.mediaStream);
            
            // Buffer size 4096, 1 input channel, 1 output channel
            this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);
            
            this.processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              // Send to Gemini
              sessionPromise.then(session => {
                 session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(this.processor);
            this.processor.connect(this.inputContext.destination);

          } catch (err) {
            console.error("Microphone Access Error:", err);
            this.stop();
          }
        },
        onmessage: (msg: LiveServerMessage) => {
          // Extract Audio
          const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData) {
            this.onAudioData(audioData);
          }
          
          if (msg.serverContent?.turnComplete) {
            // Turn complete logic if needed
          }
        },
        onclose: () => {
          console.log("Gemini Live Session Closed");
          this.onClose();
        },
        onerror: (e) => {
          console.error("Gemini Live Session Error", e);
          this.stop();
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
        },
        systemInstruction: `You are the Antigravity Habit Coach (Voice Mode). 
        You are speaking to a high-net-worth executive. 
        Keep responses concise (1-2 sentences). 
        Be energetic, authoritative, and inspiring. 
        Focus on immediate physiological protocols for energy, sleep, and focus.
        Do not lecture. Coach.`
      }
    });

    this.session = await sessionPromise;
  }

  stop() {
    if (this.processor) {
        this.processor.disconnect();
        this.processor.onaudioprocess = null;
    }
    if (this.inputContext) {
        this.inputContext.close();
    }
    if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.session) {
        this.session.close();
    }
    this.onClose();
  }
}

// --- EXISTING TOOLS ---

const handshakeTool: FunctionDeclaration = {
  name: "handshake",
  description: "Initiates a secure handshake protocol with the client application to verify connection.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      status: { 
        type: Type.STRING, 
        enum: ["ESTABLISHED", "DENIED"],
        description: "The status of the connection attempt."
      },
      message: {
        type: Type.STRING,
        description: "A brief system message to display to the user."
      }
    },
    required: ["status", "message"]
  }
};

const generateAudit = async (age: number, goal: AuditGoal): Promise<string> => {
  try {
     return await executeCommand(`Generate initial audit for Age: ${age}, Goal: ${goal}`);
  } catch (e) {
      return "System busy.";
  }
};

const establishConnection = async (): Promise<{ status: string; message: string }> => {
  try {
    if (!apiKey) throw new Error("API Key not found");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "The user is requesting a system handshake to initialize the PTD Elite AI Coach. Please confirm the connection by calling the handshake tool with a status of ESTABLISHED.",
      config: {
        tools: [{ functionDeclarations: [handshakeTool] }],
        toolConfig: { functionCallingConfig: { mode: FunctionCallingConfigMode.ANY } } 
      }
    });

    const functionCall = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;
    
    if (functionCall && functionCall.name === 'handshake') {
       const args = functionCall.args as any;
       return {
         status: args.status || 'ESTABLISHED',
         message: args.message || 'PTD Elite System Online.'
       };
    }
    
    return { status: 'FAILED', message: 'Handshake protocol failed.' };
  } catch (error) {
    console.error("Handshake Error:", error);
    return { status: 'ERROR', message: 'System unreachable.' };
  }
};

const executeCommand = async (command: string): Promise<string> => {
  try {
    if (!apiKey) throw new Error("API Key not found");
    
    const prompt = `
      You are the **Antigravity Habit Agent**.
      Goal: Build trust via "Micro-Wins".
      User Input: "${command}"
      
      Response Protocol:
      1. Validate.
      2. Provide immediate specific protocol (Micro-Win).
      3. Hook to paid service (Spark Protocol).
      
      Keep it executive, precision-focused.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { maxOutputTokens: 600 }
    });
    return response.text || "Computing optimal path...";
  } catch (error) {
    return "Connection interrupted. Re-establishing link...";
  }
}

const speakText = async (text: string): Promise<Uint8Array | null> => {
  try {
    if (!apiKey) return null;
    const speechText = text.replace(/\[.*?\]\(.*?\)/g, '').replace(/https?:\/\/\S+/g, 'link').replace(/[*#]/g, '');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: speechText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error("TTS Failed", e);
    return null;
  }
};

export { generateAudit, establishConnection, executeCommand, speakText };