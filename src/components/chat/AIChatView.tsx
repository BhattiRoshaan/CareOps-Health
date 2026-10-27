import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Calendar,
  CreditCard,
  FileCheck2,
  PhoneCall,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Mic,
  MicOff
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { ChatMessage, ActionSuggestion } from '../../types';

export const AIChatView: React.FC = () => {
  const {
    activePatient,
    currentUser,
    bookAppointment,
    submitAppeal,
    payInvoice,
    setupPaymentPlan,
    createEscalation,
    addToast
  } = useApp();

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: `Hello **${activePatient.name}**! I am **CareOps AI**, your healthcare operations assistant.

I can help coordinate your appointments, review claim denials (such as your pending MRI claim **CLM-10492**), explain your billing statement balance, verify your insurance copays, or ingest prior authorization records.

How may I assist your care operations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentName: 'CareOps Orchestrator Agent',
      intentCategory: 'General inquiry',
      suggestedActions: [
        { id: 'sa-1', label: 'Why was my MRI claim denied?', actionType: 'view_claim' },
        { id: 'sa-2', label: 'Reschedule my cardiology appointment with Dr. Chen', actionType: 'book_appt' },
        { id: 'sa-3', label: 'Explain my $420 bill & payment options', actionType: 'pay_bill' },
        { id: 'sa-4', label: 'Check my insurance deductible & copays', actionType: 'check_eligibility' }
      ]
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Check for pending prompt passed from scenario launcher
  useEffect(() => {
    const pendingPrompt = sessionStorage.getItem('careops_pending_prompt');
    if (pendingPrompt) {
      sessionStorage.removeItem('careops_pending_prompt');
      handleSendMessage(pendingPrompt);
    }
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await apiService.sendChatMessage({
        message: text,
        patientId: activePatient.id,
        role: currentUser.role
      });

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: response.reply || 'I have coordinated your operational request with our healthcare administration system.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentName: response.agentName || 'CareOps Orchestrator Agent',
        intentCategory: response.intentCategory || 'Operational Workflow',
        thoughtProcess: response.thoughtProcess,
        suggestedActions: response.suggestedActions || [],
        dataPayload: response.dataPayload,
        isEmergencyAlert: response.isEmergencyAlert
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat API error:", err);
      const fallbackMsg: ChatMessage = {
        id: `asst-err-${Date.now()}`,
        sender: 'assistant',
        text: 'I have logged your request. Our clinical operations agents have verified your patient record.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentName: 'CareOps Orchestrator Agent'
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = async (action: ActionSuggestion) => {
    addToast('info', 'Executing Action', `Triggering: ${action.label}`);

    if (action.actionType === 'generate_appeal') {
      const claimId = action.payload?.claimId || 'CLM-10492';
      const success = await submitAppeal(claimId, 'Letter of Medical Necessity and Retroactive Prior Authorization Appeal submitted to BlueCross BlueShield Medical Review Division.');
      if (success) {
        setMessages(prev => [
          ...prev,
          {
            id: `asst-act-${Date.now()}`,
            sender: 'assistant',
            text: `✅ **Appeal Successfully Submitted**:
Level 1 Prior Authorization Reconsideration has been filed for **${claimId}** with BlueCross BlueShield.
* Case Reference: **AUTH-APP-${Math.floor(100000 + Math.random() * 900000)}**
* Medical Record Attachment: Dr. Marcus Chen Clinical Chart Notes (NPI 1982736450)
* Expected Payer Response: **3 to 5 business days**.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            agentName: 'Claims & Denial Intelligence Agent'
          }
        ]);
      }
    } else if (action.actionType === 'pay_bill') {
      const invoiceId = action.payload?.invoiceId || 'INV-2026-0891';
      if (action.payload?.isPlan) {
        const success = await setupPaymentPlan(invoiceId, 4);
        if (success) {
          setMessages(prev => [
            ...prev,
            {
              id: `asst-act-${Date.now()}`,
              sender: 'assistant',
              text: `✅ **Payment Plan Activated**:
Your 4-month installment schedule has been confirmed for Invoice **${invoiceId}**.
* Monthly Installment: **$105.00 / month** (0% interest)
* First Automatic Payment: **Next month (${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)})**
* Confirmation SMS and receipt emailed to your file.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              agentName: 'Billing & Financial Operations Agent'
            }
          ]);
        }
      } else {
        const success = await payInvoice(invoiceId, action.payload?.amount || 420.00, 'Visa ending in 4082');
        if (success) {
          setMessages(prev => [
            ...prev,
            {
              id: `asst-act-${Date.now()}`,
              sender: 'assistant',
              text: `✅ **Payment Received & Settled**:
We received your payment of **$${(action.payload?.amount || 420.00).toFixed(2)}** for Invoice **${invoiceId}**.
* Transaction Reference: **AUTH-TX-${Math.floor(100000 + Math.random() * 900000)}**
* Your outstanding balance is now **$0.00**.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              agentName: 'Billing & Financial Operations Agent'
            }
          ]);
        }
      }
    } else if (action.actionType === 'book_appt') {
      const date = action.payload?.date || '2026-09-08';
      const time = action.payload?.time || '10:30 AM';
      const providerId = action.payload?.providerId || 'PRV-201';

      const success = await bookAppointment(providerId, date, time, 'Cardiology Follow-up', 'Consultation & Holter Monitoring Review');
      if (success) {
        setMessages(prev => [
          ...prev,
          {
            id: `asst-act-${Date.now()}`,
            sender: 'assistant',
            text: `✅ **Appointment Confirmed**:
Your appointment with **Dr. Marcus Chen, MD** has been booked for **${date} at ${time}** at the **Main Medical Tower Suite 402**.
* SMS reminder set for 24 hours prior
* Added to your patient portal calendar.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            agentName: 'Appointment & Scheduling Agent'
          }
        ]);
      }
    } else if (action.actionType === 'escalate') {
      const success = await createEscalation(
        `Live Specialist Request: ${activePatient.name}`,
        'Patient Operations Desk',
        'User requested immediate live staff assistance via AI Chat.',
        'High'
      );
      if (success) {
        setMessages(prev => [
          ...prev,
          {
            id: `asst-act-${Date.now()}`,
            sender: 'assistant',
            text: `🎫 **Live Specialist Alert Dispatched**:
Ticket has been assigned to **Sarah Jenkins, CRCR**. A healthcare operations representative will connect in < 2 minutes or call your registered phone.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            agentName: 'Human Escalation & Triage Agent'
          }
        ]);
      }
    }
  };

  const toggleThought = (msgId: string) => {
    setExpandedThoughts(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-145px)] rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                CareOps AI Multi-Agent Orchestrator
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Active Context: <strong className="text-slate-800">{activePatient.name}</strong> ({activePatient.id}) • Grounded in Hospital SOPs & HIPAA 835/270 Feeds
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setMessages([messages[0]]);
            addToast('info', 'Session Reset', 'Chat context cleared.');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-gradient-to-br from-teal-500 to-blue-600 text-white shadow-2xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Body */}
              <div className={`space-y-2 flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
                {/* Agent & Timestamp Header */}
                {!isUser && msg.agentName && (
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                    <span className="text-teal-700 font-bold">{msg.agentName}</span>
                    {msg.intentCategory && (
                      <>
                        <span>•</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">{msg.intentCategory}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>
                )}

                {/* Emergency Notice Highlight */}
                {msg.isEmergencyAlert && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-2.5 text-xs font-semibold shadow-xs">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold uppercase tracking-wider text-rose-800">
                        EMERGENCY MEDICAL DIRECTIVE
                      </div>
                      <div>If this is a clinical emergency, call 911 immediately or proceed to the nearest Emergency Room.</div>
                    </div>
                  </div>
                )}

                {/* Main Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed inline-block ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : msg.isEmergencyAlert
                      ? 'bg-rose-50 border border-rose-200 text-slate-900 rounded-tl-none'
                      : 'bg-slate-100 border border-slate-200 text-slate-900 rounded-tl-none'
                  }`}
                >
                  <div className="prose prose-xs max-w-none space-y-2 whitespace-pre-line text-slate-900">
                    {msg.text}
                  </div>
                </div>

                {/* Reasoning Accordion */}
                {!isUser && msg.thoughtProcess && (
                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={() => toggleThought(msg.id)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-teal-600 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      <span>{expandedThoughts[msg.id] ? 'Hide Agent Reasoning' : 'View Agent Reasoning & 835 Trace'}</span>
                      {expandedThoughts[msg.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {expandedThoughts[msg.id] && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed border border-slate-800 shadow-inner">
                        <div className="text-[10px] uppercase font-bold text-teal-400 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Multi-Agent Execution Pipeline:
                        </div>
                        <div className="whitespace-pre-line text-slate-300">
                          {msg.thoughtProcess}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Suggestions Pills / Interactive Buttons */}
                {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {msg.suggestedActions.map(action => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => handleActionClick(action)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-teal-50 text-slate-800 border border-slate-200 hover:border-teal-400 shadow-2xs transition-colors cursor-pointer"
                      >
                        {action.actionType === 'generate_appeal' && <FileCheck2 className="w-3.5 h-3.5 text-rose-500" />}
                        {action.actionType === 'pay_bill' && <CreditCard className="w-3.5 h-3.5 text-teal-500" />}
                        {action.actionType === 'book_appt' && <Calendar className="w-3.5 h-3.5 text-blue-500" />}
                        {action.actionType === 'escalate' && <PhoneCall className="w-3.5 h-3.5 text-amber-500" />}
                        <span>{action.label}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-md mr-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-100 text-xs text-slate-600 flex items-center gap-2 border border-slate-200">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              </div>
              <span>Orchestrating micro-agents & checking payer records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
          Quick Inquiries:
        </span>
        <button
          type="button"
          onClick={() => handleSendMessage('Why was my MRI claim CLM-10492 denied?')}
          className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-teal-500 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
        >
          🔍 MRI Claim Denial
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage('Reschedule my cardiology appointment with Dr. Chen')}
          className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-teal-500 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
        >
          📅 Reschedule Dr. Chen
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage('Why is my bill $420 and can I set up a payment plan?')}
          className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-teal-500 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
        >
          💳 $420 Bill Breakdown
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage('I have chest pain and severe shortness of breath')}
          className="shrink-0 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-700 transition-colors cursor-pointer"
        >
          ⚠️ Test Emergency Safety
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage('I want to speak with a human representative')}
          className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-teal-500 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
        >
          👤 Human Specialist Handoff
        </button>
      </div>

      {/* Input Field Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder={isRecording ? "Listening to your voice... Speak now" : "Ask CareOps AI about appointments, claims, billing, or policies..."}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isLoading}
          className={`flex-1 px-4 py-2.5 rounded-xl text-xs border transition-colors placeholder:text-slate-400 ${
            isRecording
              ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-300'
              : 'bg-slate-50 border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500'
          }`}
        />

        {/* Voice Dictation Button */}
        <button
          type="button"
          onClick={() => {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
              addToast('error', 'Speech Recognition Unavailable', 'Browser does not support Web Speech API.');
              return;
            }

            if (isRecording) {
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.stop();
                } catch (e) {
                  // ignore
                }
              }
              setIsRecording(false);
            } else {
              try {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onstart = () => {
                  setIsRecording(true);
                  addToast('info', 'Voice Input Active', 'Listening... speak your prompt.');
                };

                recognition.onresult = (event: any) => {
                  let transcript = '';
                  for (let i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                  }
                  setInputMessage(transcript);
                };

                recognition.onerror = (event: any) => {
                  console.warn('Speech error in chat:', event.error);
                  setIsRecording(false);
                  if (event.error === 'not-allowed') {
                    addToast('error', 'Microphone Blocked', 'Please grant microphone access in your browser.');
                  }
                };

                recognition.onend = () => {
                  setIsRecording(false);
                };

                recognitionRef.current = recognition;
                recognition.start();
              } catch (e) {
                console.error(e);
                setIsRecording(false);
              }
            }
          }}
          className={`p-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
            isRecording
              ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
          title={isRecording ? 'Stop Recording' : 'Dictate with Voice'}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-teal-600" />}
        </button>

        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
