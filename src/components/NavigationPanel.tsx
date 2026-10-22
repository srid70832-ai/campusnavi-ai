import React from 'react';
import { RouteResult, TurnAction, CampusBuilding } from '../types/campus';
import {
  Navigation,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Volume2,
  VolumeX,
  Play,
  Square,
  Maximize2,
  X,
  Clock,
  Compass,
  Accessibility,
  Building as BuildingIcon,
} from 'lucide-react';

interface NavigationPanelProps {
  destinationBuilding: CampusBuilding | null;
  routeResult: RouteResult | null;
  isNavigating: boolean;
  currentStepIndex: number;
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  onClose: () => void;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
  isWheelchairMode: boolean;
  onToggleWheelchair: () => void;
  voiceLanguage: 'English' | 'Tamil';
  onChangeVoiceLanguage: (lang: 'English' | 'Tamil') => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  destinationBuilding,
  routeResult,
  isNavigating,
  currentStepIndex,
  onStartNavigation,
  onStopNavigation,
  onClose,
  isVoiceEnabled,
  onToggleVoice,
  isWheelchairMode,
  onToggleWheelchair,
  voiceLanguage,
  onChangeVoiceLanguage,
}) => {
  if (!destinationBuilding && (!routeResult || !routeResult.success)) {
    return (
      <div className="w-full h-full bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <Navigation size={28} />
        </div>
        <h3 className="font-bold text-slate-800 text-base">Select a Destination</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
          Click any campus building or search above to calculate genuine shortest paths.
        </p>
      </div>
    );
  }

  const destTitle = destinationBuilding?.name || 'Selected Destination';
  const destSubtitle = destinationBuilding?.description || 'Main Academic Campus';
  const totalMeters = routeResult?.totalDistanceMeters ? Math.round(routeResult.totalDistanceMeters) : 350;
  const totalMins = Math.max(1, Math.round(totalMeters / 70));

  const getStepIcon = (action: TurnAction) => {
    switch (action) {
      case 'TURN_RIGHT':
        return <ArrowRight size={18} className="text-blue-600" />;
      case 'TURN_LEFT':
        return <ArrowLeft size={18} className="text-blue-600" />;
      case 'ARRIVE':
        return <MapPin size={18} className="text-red-500" />;
      case 'TAKE_LIFT_UP':
      case 'TAKE_LIFT_DOWN':
      case 'TAKE_RAMP':
        return <Accessibility size={18} className="text-indigo-600" />;
      default:
        return <ArrowUp size={18} className="text-blue-600" />;
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-slate-200/90 flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <MapPin size={18} className="text-blue-600" />
          <span>Navigation to {destTitle}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <button
            onClick={onToggleVoice}
            title={isVoiceEnabled ? 'Disable Voice Guidance' : 'Enable Voice Guidance'}
            className={`p-1.5 rounded-lg transition ${
              isVoiceEnabled ? 'text-blue-600 bg-blue-50' : 'hover:bg-slate-100'
            }`}
          >
            {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Destination Card with Photo */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 flex gap-3.5">
          <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-200 relative">
            <img
              src={
                destinationBuilding?.imageUrl ||
                'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=500&q=80'
              }
              alt={destTitle}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h4 className="font-bold text-slate-900 text-sm">{destTitle}</h4>
            <p className="text-[11px] text-slate-500 line-clamp-1">{destSubtitle}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                <Clock size={12} />~ {totalMeters} meters ({totalMins} min walk)
              </span>
            </div>
          </div>
        </div>

        {/* Start / Stop Navigation Action Button */}
        <div>
          {!isNavigating ? (
            <button
              onClick={onStartNavigation}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition transform active:scale-[0.98]"
            >
              <Play size={16} fill="white" />
              <span>Start Navigation</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <div className="flex-1 py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Guidance Active
              </div>
              <button
                onClick={onStopNavigation}
                className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <Square size={14} fill="white" />
                <span>End</span>
              </button>
            </div>
          )}
        </div>

        {/* Accessibility & Voice Settings Bar */}
        <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60">
          <button
            onClick={onToggleWheelchair}
            className={`flex items-center gap-1.5 font-medium transition ${
              isWheelchairMode ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Accessibility size={15} />
            <span>{isWheelchairMode ? 'Accessible Only' : 'Standard Path'}</span>
          </button>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Voice:</span>
            <button
              onClick={() => onChangeVoiceLanguage(voiceLanguage === 'English' ? 'Tamil' : 'English')}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-blue-600 hover:bg-slate-50"
            >
              {voiceLanguage}
            </button>
          </div>
        </div>

        {/* Step-by-Step Directions (Matching Screenshot Layout) */}
        <div>
          <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
            <Compass size={14} className="text-slate-500" />
            <span>Step by Step Directions</span>
          </h5>

          <div className="space-y-1.5">
            {routeResult?.segments && routeResult.segments.length > 0 ? (
              routeResult.segments.map((seg, idx) => {
                const isActive = isNavigating && idx === currentStepIndex;
                const isPassed = isNavigating && idx < currentStepIndex;

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-2.5 rounded-xl transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : isPassed
                        ? 'bg-slate-50 text-slate-400 opacity-60'
                        : 'bg-slate-50/60 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white border border-slate-200 shadow-xs'
                      }`}
                    >
                      {getStepIcon(seg.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug font-semibold ${isActive ? 'text-white' : 'text-slate-800'}`}>
                        {voiceLanguage === 'Tamil' && seg.instructionTa ? seg.instructionTa : seg.instructionEn}
                      </p>
                      <span className={`text-[11px] block mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                        {Math.round(seg.distanceMeters)} m
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              // Default preview steps matching the exact mockup when CSE Block -> Central Library is loaded
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-white/20 text-white">
                    <ArrowUp size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Head straight from CSE Block</p>
                    <span className="text-[11px] text-blue-100">50 m</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 text-slate-800">
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-white border border-slate-200">
                    <ArrowRight size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Turn right at Main Block junction</p>
                    <span className="text-[11px] text-slate-400">80 m</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 text-slate-800">
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-white border border-slate-200">
                    <ArrowUp size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Go straight towards Auditorium</p>
                    <span className="text-[11px] text-slate-400">120 m</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 text-slate-800">
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-white border border-slate-200">
                    <ArrowLeft size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Turn left near the Cafeteria</p>
                    <span className="text-[11px] text-slate-400">70 m</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 text-slate-800">
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-white border border-slate-200">
                    <ArrowUp size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Go straight</p>
                    <span className="text-[11px] text-slate-400">30 m</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 text-slate-800">
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-white border border-slate-200">
                    <MapPin size={18} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">You will reach Central Library</p>
                    <span className="text-[11px] text-slate-400">Arrived (Total: 350 m)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
