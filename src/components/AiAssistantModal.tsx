import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, MapPin, Volume2 } from 'lucide-react';
import { CampusBuilding, CampusRoom, Facility } from '../types/campus';
import { AiCampusAssistant, AssistantResponse } from '../services/aiAssistant';
import { VoiceNavigationManager } from '../services/voiceNavigation';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  buildings,
  rooms,
  facilities,
  onNavigateToDestination,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Hello! I am your NaviCampus AI assistant. You can ask me for directions, classrooms, facilities, accessible entrances, or timings in English or தமிழ்.',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

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

      // Speak response if voice is available
      VoiceNavigationManager.getInstance().speak(response.answer);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Sorry, I encountered an error checking verified campus data.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNavigateClick = (destId: string) => {
    const bld = buildings.find((b) => b.id === destId) || null;
    onNavigateToDestination(destId, bld);
    onClose();
  };

  const quickPrompts = [
    'How do I reach the Library?',
    'Where is the Cafeteria?',
    'Find AI & Robotics Lab',
    'Nearest accessible entrance',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[580px]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm">NaviCampus AI Assistant</h3>
              <p className="text-[11px] text-blue-100 flex items-center gap-1">
                <Sparkles size={11} /> Verified Campus Data &bull; English & தமிழ்
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white">
            <X size={18} />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200/90 text-slate-800 shadow-xs'
                }`}
              >
                {m.text}

                {/* Suggested Destination Card */}
                {m.suggestedDestinationId && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-700 text-[11px]">
                      {m.suggestedDestinationName}
                    </span>
                    <button
                      onClick={() => handleNavigateClick(m.suggestedDestinationId!)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition"
                    >
                      <MapPin size={11} /> Navigate Here
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white border border-slate-200 w-fit px-3 py-2 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="text-[11px] font-medium whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg transition"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about classrooms, directions, facilities..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputMessage.trim()}
            className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center justify-center transition shadow-xs"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
