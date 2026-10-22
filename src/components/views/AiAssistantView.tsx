import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  MapPin,
  Volume2,
  Navigation,
  Compass,
  Building,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { CampusBuilding, CampusRoom, Facility } from '../../types/campus';
import { AiCampusAssistant, AssistantResponse } from '../../services/aiAssistant';
import { VoiceNavigationManager } from '../../services/voiceNavigation';

interface AiAssistantViewProps {
  buildings: CampusBuilding[];
  rooms: CampusRoom[];
  facilities: Facility[];
  onNavigateToDestination: (destId: string, bld: CampusBuilding | null) => void;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  suggestedDestinationId?: string;
  suggestedDestinationName?: string;
  source?: string;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  buildings,
  rooms,
  facilities,
  onNavigateToDestination,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Vanakkam! I am your Campus Navigator AI Assistant powered by Google Gemini. Ask me about buildings, classrooms, accessible ramps, cafeteria menus, or shortest routes in English or தமிழ்.',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const msg = textToSend || inputMessage;
    if (!msg.trim()) return;

    const userMsg: Message = { sender: 'user', text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response: AssistantResponse = await AiCampusAssistant.query(
        msg,
        rooms,
        buildings,
        facilities
      );

      const assistantMsg: Message = {
        sender: 'assistant',
        text: response.answer,
        suggestedDestinationId: response.suggestedDestinationId,
        suggestedDestinationName: response.suggestedDestinationName,
        source: response.source,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      VoiceNavigationManager.getInstance().speak(response.answer);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I could not complete the query. Please verify campus database connection or check your network.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNavigateClick = (destId: string) => {
    const bld = buildings.find((b) => b.id === destId) || null;
    onNavigateToDestination(destId, bld);
  };

  const quickPrompts = [
    'How do I walk to the Central Library?',
    'Where is the Cafeteria and what are its timings?',
    'Show me the route to AI & Robotics Lab',
    'Which buildings have wheelchair accessible ramps?',
    'Where is the Administrative Block located?',
  ];

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full h-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
            <Bot size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black">Campus Navigator AI Assistant</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini Vision & Spatial Engine
              </span>
            </div>
            <p className="text-xs md:text-sm text-blue-100 mt-1">
              Ask spatial queries, find faculty rooms, or request real shortest path directions in English and Tamil.
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden min-h-[480px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                }`}
              >
                {m.sender === 'user' ? (
                  <span className="text-xs font-bold">You</span>
                ) : (
                  <Sparkles size={16} />
                )}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {/* Suggested Destination Button */}
                {m.suggestedDestinationId && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <MapPin size={13} className="text-blue-600" />
                      {m.suggestedDestinationName || 'Target Location'}
                    </span>
                    <button
                      onClick={() => handleNavigateClick(m.suggestedDestinationId!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                    >
                      <Navigation size={13} />
                      <span>Take Me There</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                <Sparkles size={16} className="animate-spin text-indigo-600" />
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Thinking & calculating campus shortest paths...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 md:px-6 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Lightbulb size={14} className="text-amber-500 shrink-0" />
          <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">Try:</span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-medium whitespace-nowrap hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 md:p-5 bg-white border-t border-slate-200/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2.5"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your question (e.g., 'How to get to CS Lab 2?', 'Where is the ATM?')..."
              className="flex-1 py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition shadow-md shadow-blue-500/20"
            >
              <Send size={15} />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
