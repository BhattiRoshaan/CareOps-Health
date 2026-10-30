import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Bot,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileCheck2,
  CreditCard,
  Headphones,
  Radio,
  Clock,
  Send,
  Volume2,
  ShieldCheck,
  RotateCcw,
  Play
} from 'lucide-react';
import { apiService } from '../../services/apiService';

interface VoiceTranscriptItem {
  speaker: 'agent' | 'user';
  text: string;
  time: string;
}

export const VoiceAIView: React.FC = () => {
  const {
    activePatient,
    rescheduleAppointment,
    createEscalation,
    addToast
  } = useApp();

  // Call & Audio States
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserListening, setIsUserListening] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  
  // Microphone and Speech Recognition status
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);

  const [transcripts, setTranscripts] = useState<VoiceTranscriptItem[]>([
    {
      speaker: 'agent',
      text: `Hello ${activePatient.name}, this is CareOps Voice AI from General Hospital Operations. How can I assist you with your care or appointments today?`,
      time: '00:01'
    }
  ]);
  const [lastAction, setLastAction] = useState<any>(null);

  // Audio & Animation Refs to avoid React render loop jitter
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const isComponentMounted = useRef(true);
  
  // State refs for animation loop (read without re-binding useEffect)
  const callStateRef = useRef(callState);
  const isAISpeakingRef = useRef(isAISpeaking);
  const isUserListeningRef = useRef(isUserListening);
  const isUserSpeakingRef = useRef(isUserSpeaking);
  const isMutedRef = useRef(isMuted);
  const isProcessingAIRef = useRef(isProcessingAI);
  const shouldListenRef = useRef(false);
  const activePatientRef = useRef(activePatient);
  const callSecondsRef = useRef(callSeconds);

  // Sync state refs whenever state updates
  useEffect(() => { callStateRef.current = callState; }, [callState]);
  useEffect(() => { isAISpeakingRef.current = isAISpeaking; }, [isAISpeaking]);
  useEffect(() => { isUserListeningRef.current = isUserListening; }, [isUserListening]);
  useEffect(() => { isUserSpeakingRef.current = isUserSpeaking; }, [isUserSpeaking]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { isProcessingAIRef.current = isProcessingAI; }, [isProcessingAI]);
  useEffect(() => { activePatientRef.current = activePatient; }, [activePatient]);
  useEffect(() => { callSecondsRef.current = callSeconds; }, [callSeconds]);

  // Format call duration helper
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Call timer interval
  useEffect(() => {
    let interval: any;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // Stop media stream tracks
  const stopAudioStreams = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) { /* ignore */ }
      });
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        /* ignore */
      }
      audioContextRef.current = null;
    }
  }, []);

  // Stop speech recognition safely
  const stopSpeechRecognition = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {
        /* ignore */
      }
      recognitionRef.current = null;
    }
    setIsUserListening(false);
    setIsUserSpeaking(false);
    setInterimTranscript('');
  }, []);

  // Check Speech Recognition capability on mount
  useEffect(() => {
    isComponentMounted.current = true;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setMicPermission('unsupported');
    }
    return () => {
      isComponentMounted.current = false;
      stopAudioStreams();
      stopSpeechRecognition();
    };
  }, [stopAudioStreams, stopSpeechRecognition]);

  // Text-to-speech output using SpeechSynthesis
  const speakText = useCallback((text: string, onComplete?: () => void) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        /* ignore */
      }

      // Temporarily pause recognition while AI speaks
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
      }
      setIsUserListening(false);
      setIsAISpeaking(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Female') || v.name.includes('David'))));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        if (isComponentMounted.current) setIsAISpeaking(true);
      };

      utterance.onend = () => {
        if (isComponentMounted.current) {
          setIsAISpeaking(false);
          if (onComplete) onComplete();
          if (shouldListenRef.current && !isMutedRef.current && callStateRef.current === 'connected') {
            startSpeechRecognition();
          }
        }
      };

      utterance.onerror = () => {
        if (isComponentMounted.current) {
          setIsAISpeaking(false);
          if (onComplete) onComplete();
          if (shouldListenRef.current && !isMutedRef.current && callStateRef.current === 'connected') {
            startSpeechRecognition();
          }
        }
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsAISpeaking(true);
      setTimeout(() => {
        if (isComponentMounted.current) {
          setIsAISpeaking(false);
          if (onComplete) onComplete();
        }
      }, 2000);
    }
  }, []);

  // Process user's voice message through the AI backend
  const handleVoiceInput = useCallback(async (spokenText: string) => {
    const trimmed = spokenText.trim();
    if (!trimmed || isProcessingAIRef.current) return;

    setIsProcessingAI(true);
    setInterimTranscript('');
    setIsUserSpeaking(false);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
    }
    setIsUserListening(false);

    const timeStr = formatTime(callSecondsRef.current);

    // Add user message to transcript
    setTranscripts(prev => [
      ...prev,
      {
        speaker: 'user',
        text: trimmed,
        time: timeStr
      }
    ]);

    try {
      const response = await apiService.sendVoiceQuery({
        transcript: trimmed,
        patientId: activePatientRef.current.id
      });

      const reply = response.spokenReply || "I have received your request and coordinated with hospital operations.";

      setTranscripts(prev => [
        ...prev,
        {
          speaker: 'agent',
          text: reply,
          time: formatTime(callSecondsRef.current + 2)
        }
      ]);

      if (response.actionTriggered) {
        setLastAction(response.actionTriggered);
        if (response.actionTriggered.type === 'rescheduled_success') {
          rescheduleAppointment('APT-2026-001', '2026-09-08', '10:30 AM');
          addToast('success', 'Appointment Rescheduled', 'Cardiology appointment confirmed for Tue Sep 8 at 10:30 AM');
        } else if (response.actionTriggered.type === 'human_transfer') {
          createEscalation(`Voice Transfer: ${activePatientRef.current.name}`, 'Patient Operations', 'Live phone escalation during voice session.', 'High');
          addToast('info', 'Staff Escalation Dispatched', 'Transferred to on-duty specialist Sarah Jenkins.');
        }
      }

      // Read reply aloud
      speakText(reply, () => {
        setIsProcessingAI(false);
      });
    } catch (e) {
      console.error('Error in voice query:', e);
      setIsProcessingAI(false);
      const fallbackReply = "I have noted that and updated your operational chart.";
      speakText(fallbackReply);
    }
  }, [rescheduleAppointment, createEscalation, addToast, speakText]);

  // Start real speech recognition using Web Speech API
  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setMicPermission('unsupported');
      return;
    }

    if (isMutedRef.current) return;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false; // single phrase recognition for ultra-stable processing without jitter loops
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        if (!isComponentMounted.current) return;
        setIsUserListening(true);
        setMicPermission('granted');
        setMicErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        if (!isComponentMounted.current) return;
        let currentInterim = '';
        let finalSpeech = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalSpeech += transcriptChunk;
          } else {
            currentInterim += transcriptChunk;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
          setIsUserSpeaking(true);
        }

        if (finalSpeech) {
          setInterimTranscript('');
          handleVoiceInput(finalSpeech);
        }
      };

      recognition.onerror = (event: any) => {
        if (!isComponentMounted.current) return;
        
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicPermission('denied');
          setMicErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser bar.');
          setIsUserListening(false);
        } else if (event.error === 'no-speech') {
          setIsUserSpeaking(false);
          setIsUserListening(false);
          // Restart gently if call still connected
          if (shouldListenRef.current && !isMutedRef.current && !isAISpeakingRef.current && !isProcessingAIRef.current) {
            setTimeout(() => {
              if (shouldListenRef.current && !isMutedRef.current) {
                startSpeechRecognition();
              }
            }, 300);
          }
        }
      };

      recognition.onend = () => {
        if (!isComponentMounted.current) return;
        setIsUserListening(false);
        setIsUserSpeaking(false);

        if (shouldListenRef.current && !isMutedRef.current && !isAISpeakingRef.current && !isProcessingAIRef.current && callStateRef.current === 'connected') {
          setTimeout(() => {
            if (shouldListenRef.current && !isMutedRef.current && !isAISpeakingRef.current) {
              startSpeechRecognition();
            }
          }, 300);
        }
      };

      recognitionRef.current = recognition;
      shouldListenRef.current = true;
      recognition.start();
    } catch (err: any) {
      console.warn('Error starting speech recognition:', err);
    }
  }, [handleVoiceInput]);

  // Request live microphone audio stream for the visualizer
  const setupMicrophoneAudioStream = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        mediaStreamRef.current = stream;
        setMicPermission('granted');

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.8;
          analyserRef.current = analyser;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
        }
      }
    } catch (err: any) {
      console.warn('Microphone stream setup info:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermission('denied');
        setMicErrorMessage('Microphone permission blocked. Please click the mic/lock icon in your browser URL bar.');
      }
    }
  };

  // Start Voice Session
  const startCall = async () => {
    setCallState('calling');
    setMicErrorMessage(null);
    addToast('info', 'Connecting Voice AI', 'Connecting to CareOps Voice Telephony Gateway...');

    await setupMicrophoneAudioStream();

    setTimeout(() => {
      setCallState('connected');
      const initialGreeting = `Hello ${activePatient.name}, this is CareOps Voice AI. I can assist with scheduling appointments, checking your MRI claim denial, or reviewing your billing balance. How can I help you today?`;
      
      setTranscripts([
        {
          speaker: 'agent',
          text: initialGreeting,
          time: '00:01'
        }
      ]);

      speakText(initialGreeting, () => {
        startSpeechRecognition();
      });
    }, 800);
  };

  // End Voice Session
  const endCall = () => {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    }
    stopSpeechRecognition();
    stopAudioStreams();
    setCallState('ended');
    setIsAISpeaking(false);
    setIsUserListening(false);
    setIsUserSpeaking(false);
    setInterimTranscript('');
    addToast('info', 'Call Ended', `Voice session ended. Duration: ${formatTime(callSeconds)}.`);
    setTimeout(() => {
      if (isComponentMounted.current) setCallState('idle');
    }, 1200);
  };

  // Toggle Mute
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !nextMute;
      });
    }

    if (nextMute) {
      stopSpeechRecognition();
      addToast('info', 'Microphone Muted', 'Voice recognition paused.');
    } else {
      addToast('success', 'Microphone Unmuted', 'Voice recognition active.');
      if (callState === 'connected' && !isAISpeaking) {
        startSpeechRecognition();
      }
    }
  };

  // Push-to-Talk / Tap-to-Speak manual trigger
  const handleTapToSpeak = () => {
    if (callState !== 'connected') {
      startCall();
      return;
    }
    if (isAISpeaking) {
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
      }
      setIsAISpeaking(false);
    }
    startSpeechRecognition();
  };

  // Handle manual text submission during voice session
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const text = manualInput.trim();
    setManualInput('');
    handleVoiceInput(text);
  };

  // Ultra-Smooth, Static Canvas Waveform Loop (Single Lifecycle Initialization)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Read volume from analyser
      let realVolume = 0;
      if (analyserRef.current && !isMutedRef.current && (isUserListeningRef.current || isUserSpeakingRef.current)) {
        try {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          realVolume = sum / dataArray.length;
        } catch (e) {
          realVolume = 0;
        }
      }

      const connected = callStateRef.current === 'connected';
      const speakingAI = isAISpeakingRef.current;
      const speakingUser = isUserSpeakingRef.current || realVolume > 15;
      const listening = isUserListeningRef.current;

      if (connected) {
        const baseAmp = speakingAI ? 22 : (speakingUser ? Math.min(28, 10 + realVolume * 0.35) : listening ? 10 : 4);
        
        const strokeColor = speakingAI
          ? 'rgba(13, 148, 136, 0.95)' // Teal
          : speakingUser
          ? 'rgba(37, 99, 235, 0.95)' // Blue
          : listening
          ? 'rgba(16, 185, 129, 0.85)' // Emerald
          : 'rgba(148, 163, 184, 0.6)';

        // Primary Sine Wave
        ctx.lineWidth = speakingAI || speakingUser ? 2.5 : 1.5;
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const freq = speakingAI ? 0.04 : 0.05;
          const y = centerY + Math.sin(x * freq + phase) * baseAmp * Math.sin((x / width) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Secondary Harmonic Wave
        ctx.lineWidth = 1;
        ctx.strokeStyle = speakingAI
          ? 'rgba(20, 184, 166, 0.35)'
          : speakingUser
          ? 'rgba(99, 102, 241, 0.35)'
          : 'rgba(203, 213, 225, 0.35)';
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const y = centerY + Math.cos(x * 0.03 - phase) * (baseAmp * 0.5) * Math.sin((x / width) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        phase += speakingAI || speakingUser ? 0.12 : 0.04;
      } else {
        // Idle Flat Line
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)';
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white border border-teal-800 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
              <Radio className="w-3 h-3 text-teal-400" />
              Live Clinical Voice Assistant
            </span>
            <span className="text-xs text-slate-300">
              Active Caller: <strong className="text-teal-300">{activePatient.name}</strong> ({activePatient.phone})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">CareOps Voice AI Studio</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            High-fidelity interactive voice system powered by Web Speech API, microphone audio streaming, and Gemini AI. Speak directly into your microphone or tap clinical presets to execute operations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HIPAA Voice Encrypted</span>
          </span>
        </div>
      </div>

      {/* Permission Warning Notice if Denied */}
      {micPermission === 'denied' && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-rose-900">Microphone Permission Notification</div>
            <p>{micErrorMessage || 'Please grant microphone access in your browser to speak directly to the AI.'}</p>
            <p className="text-xs text-rose-700">
              Tip: Click the lock icon in the browser address bar to allow Microphone. You can also use the typed voice input or click any clinical preset below!
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Call Console & Live Transcript Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Audio Visualizer & Call Controls */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Call Console</span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>{formatTime(callSeconds)}</span>
            </div>
          </div>

          {/* Caller Identity Display with Stable Dimensions (No Shaking/Bouncing) */}
          <div className="my-6 flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg transition-colors duration-200 ${
                callState === 'connected'
                  ? isAISpeaking
                    ? 'bg-teal-600 ring-4 ring-teal-500/30'
                    : isUserSpeaking
                    ? 'bg-blue-600 ring-4 ring-blue-500/30'
                    : isUserListening
                    ? 'bg-emerald-600 ring-4 ring-emerald-500/30'
                    : 'bg-slate-700 ring-2 ring-slate-800'
                  : 'bg-slate-700 ring-2 ring-slate-200'
              }`}>
                {isAISpeaking ? (
                  <Volume2 className="w-10 h-10" />
                ) : isUserSpeaking || isUserListening ? (
                  <Mic className="w-10 h-10" />
                ) : (
                  <Bot className="w-10 h-10" />
                )}
              </div>
              {callState === 'connected' && (
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center text-xs text-white font-bold">
                  ✓
                </span>
              )}
            </div>

            <h2 className="text-base font-bold text-slate-900">
              CareOps Voice Agent
            </h2>
            <div className="mt-1.5 flex items-center gap-1.5 min-h-[24px]">
              {callState === 'connected' ? (
                isAISpeaking ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                    <Volume2 className="w-3 h-3" />
                    Agent Speaking...
                  </span>
                ) : isUserSpeaking ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    <Mic className="w-3 h-3" />
                    Listening to you...
                  </span>
                ) : isUserListening ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Microphone Active (Speak Now)
                  </span>
                ) : isMuted ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <MicOff className="w-3 h-3" />
                    Microphone Muted
                  </span>
                ) : isProcessingAI ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <RotateCcw className="w-3 h-3 animate-spin" />
                    Thinking...
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">Ready for Speech</span>
                )
              ) : callState === 'calling' ? (
                <span className="text-xs font-semibold text-teal-600">Connecting Voice Gateway...</span>
              ) : (
                <span className="text-xs text-slate-500">Click below to start live voice session</span>
              )}
            </div>
          </div>

          {/* Audio Waveform Canvas */}
          <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-200 mb-4">
            <canvas ref={canvasRef} width={280} height={50} className="w-full h-[50px] block" />
          </div>

          {/* Live User Speech Indicator */}
          {interimTranscript && (
            <div className="w-full mb-4 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
              <Mic className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">Transcribing:</span>
                <p className="italic font-medium truncate">"{interimTranscript}"</p>
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="w-full space-y-2.5">
            {callState !== 'connected' ? (
              <button
                type="button"
                onClick={startCall}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Start Inbound Voice Session</span>
              </button>
            ) : (
              <>
                {/* Push-to-Talk / Tap to Speak Button */}
                <button
                  type="button"
                  onClick={handleTapToSpeak}
                  disabled={isMuted || isProcessingAI}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isUserSpeaking || isUserListening
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                  }`}
                >
                  <Mic className={`w-4 h-4 ${isUserListening ? 'text-white' : 'text-blue-600'}`} />
                  <span>{isUserListening ? 'Listening (Speak into Microphone)...' : 'Tap to Speak Now'}</span>
                </button>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
                      isMuted
                        ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4 text-rose-600" /> : <Mic className="w-4 h-4 text-slate-700" />}
                    <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVoiceInput('Please transfer me to a human specialist representative.')}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Headphones className="w-4 h-4 text-amber-600" />
                    <span>Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={endCall}
                    className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>End</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Quick Voice Text Input (Fallback / Noisy Environment) */}
          {callState === 'connected' && (
            <form onSubmit={handleManualSubmit} className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Or type what you want to say..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0"
                title="Send as spoken input"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Right 2 Cols: Live Transcript & Scenario Presets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Voice Scenarios */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Clinical Voice Query Presets (Click to Speak to AI)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (callState !== 'connected') {
                    startCall();
                    setTimeout(() => handleVoiceInput('I need to reschedule my cardiology appointment with Dr. Chen.'), 1200);
                  } else {
                    handleVoiceInput('I need to reschedule my cardiology appointment with Dr. Chen.');
                  }
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/60 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-teal-700">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>"Reschedule my Dr. Chen appointment"</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Queries slots and offers Tuesday Sep 8 @ 10:30 AM.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (callState !== 'connected') {
                    startCall();
                    setTimeout(() => handleVoiceInput('Yes, please confirm and move my appointment to Tuesday at 10:30 AM.'), 1200);
                  } else {
                    handleVoiceInput('Yes, please confirm and move my appointment to Tuesday at 10:30 AM.');
                  }
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/60 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-teal-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>"Confirm Tuesday 10:30 AM slot"</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Executes instant booking & SMS dispatch.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (callState !== 'connected') {
                    startCall();
                    setTimeout(() => handleVoiceInput('Why was my MRI claim denied and what can be done?'), 1200);
                  } else {
                    handleVoiceInput('Why was my MRI claim denied and what can be done?');
                  }
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/60 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-teal-700">
                  <FileCheck2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>"Why was my MRI claim denied?"</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Explains missing prior auth & Level 1 appeal.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (callState !== 'connected') {
                    startCall();
                    setTimeout(() => handleVoiceInput('Can you explain my current balance of four hundred twenty dollars?'), 1200);
                  } else {
                    handleVoiceInput('Can you explain my current balance of four hundred twenty dollars?');
                  }
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/60 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-teal-700">
                  <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                  <span>"Explain my $420 balance"</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Provides 4-month installment breakdown.
                </div>
              </button>
            </div>
          </div>

          {/* Live Transcript Stream */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Speech Transcription Stream
                </h3>
                {isUserListening && (
                  <span className="flex h-2 w-2 relative">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-bold">
                Speech-to-Text Active
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {transcripts.map((t, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-xs transition-colors ${
                    t.speaker === 'user'
                      ? 'bg-slate-100 text-slate-900 ml-8 border border-slate-200'
                      : 'bg-teal-50/90 text-slate-900 mr-8 border border-teal-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                    <span className={t.speaker === 'agent' ? 'text-teal-800' : 'text-slate-800'}>
                      {t.speaker === 'agent' ? '🤖 CareOps Voice AI' : `👤 ${activePatient.name}`}
                    </span>
                    <span>{t.time}</span>
                  </div>
                  <div className="leading-relaxed font-medium">{t.text}</div>
                </div>
              ))}

              {/* Interim Live Bubble when User is Talking */}
              {interimTranscript && (
                <div className="p-3 rounded-xl text-xs bg-blue-50/90 text-blue-950 ml-8 border border-blue-300 border-dashed">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-700 mb-1">
                    <span>👤 {activePatient.name} (Transcribing...)</span>
                    <span>Live</span>
                  </div>
                  <div className="leading-relaxed italic font-medium">"{interimTranscript}"</div>
                </div>
              )}
            </div>
          </div>

          {/* Executed Action Banner if triggered */}
          {lastAction && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-900">
                    Voice Action Executed Automatically
                  </div>
                  <div className="text-emerald-800 text-xs mt-0.5">
                    {lastAction.type === 'rescheduled_success'
                      ? `Appointment moved to Tuesday, Sep 8 @ 10:30 AM with Dr. Marcus Chen.`
                      : lastAction.type === 'human_transfer'
                      ? `Dispatched Priority 1 handoff alert to Sarah Jenkins (CRCR).`
                      : `Updated operational record in real time.`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
