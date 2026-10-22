import React from 'react';
import { MapPin, ArrowLeftRight, Navigation, Sparkles } from 'lucide-react';
import { CampusBuilding, NavNode } from '../types/campus';

interface CampusBannerProps {
  buildings: CampusBuilding[];
  nodes: NavNode[];
  startNodeId: string;
  destinationNodeId: string;
  onChangeStartNode: (id: string) => void;
  onChangeDestinationNode: (id: string) => void;
  onSwapLocations: () => void;
  onGetDirections: () => void;
}

export const CampusBanner: React.FC<CampusBannerProps> = ({
  buildings,
  nodes,
  startNodeId,
  destinationNodeId,
  onChangeStartNode,
  onChangeDestinationNode,
  onSwapLocations,
  onGetDirections,
}) => {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 text-white">
      {/* Background Campus Architecture Layer */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80")',
        }}
      />

      <div className="relative z-10">
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
          Explore Your Campus Easily
        </h2>
        <p className="text-xs md:text-sm text-slate-300 font-normal mt-1 max-w-2xl">
          Find classrooms, libraries, labs, cafeterias and more with AI-powered navigation
        </p>

        {/* Origin / Destination Search Row (Matching Screenshot) */}
        <div className="mt-4 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-lg border border-white/40 flex flex-col md:flex-row items-center gap-2 text-slate-800">
          {/* Origin selector */}
          <div className="flex-1 w-full flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-2.5 shrink-0">
              <MapPin size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] uppercase font-bold text-slate-400">Start Location</label>
              <select
                value={startNodeId}
                onChange={(e) => onChangeStartNode(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="N_CSE_PLAZA">My Location (CSE Block)</option>
                <option value="N_MAIN_ENTRANCE">Main Block Portico</option>
                <option value="N_ADMIN_ENTRANCE">Admin Block Lobby</option>
                <option value="N_CAFE_ENTRANCE">Cafeteria Plaza</option>
                <option value="N_HOSTEL_ENTRANCE">Hostel Complex</option>
                <option value="N_PARKING_ENTRANCE">Transit & Parking Hub</option>
                <option value="N_SPORTS_ENTRANCE">Sports Ground Pavilion</option>
                <option value="N_AUDITORIUM_ENTRANCE">Auditorium Entrance</option>
                <option value="N_LIBRARY_ENTRANCE">Central Library</option>
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={onSwapLocations}
            title="Swap Origin and Destination"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-600 flex items-center justify-center transition shrink-0"
          >
            <ArrowLeftRight size={16} />
          </button>

          {/* Destination selector */}
          <div className="flex-1 w-full flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2">
            <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-2.5 shrink-0">
              <MapPin size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] uppercase font-bold text-slate-400">Destination</label>
              <select
                value={destinationNodeId}
                onChange={(e) => onChangeDestinationNode(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="N_LIBRARY_ENTRANCE">Central Library</option>
                <option value="N_CSE_PLAZA">CSE Block</option>
                <option value="N_TP_103">AI & Robotics Lab (CSE-103)</option>
                <option value="N_AUDITORIUM_ENTRANCE">Dr. APJ Abdul Kalam Auditorium</option>
                <option value="N_CAFE_ENTRANCE">Green Campus Cafeteria</option>
                <option value="N_MAIN_ENTRANCE">Main Academic Block</option>
                <option value="N_ADMIN_ENTRANCE">Dean of Academic Affairs (Admin)</option>
                <option value="N_SPORTS_ENTRANCE">Athletic Ground & Track</option>
                <option value="N_HOSTEL_ENTRANCE">Student Hostel Quad</option>
                <option value="N_PARKING_ENTRANCE">Parking Lot & EV Station</option>
              </select>
            </div>
          </div>

          {/* Get Directions Button */}
          <button
            onClick={onGetDirections}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition transform active:scale-95 shrink-0"
          >
            <Navigation size={16} fill="white" />
            <span>Get Directions</span>
          </button>
        </div>
      </div>
    </div>
  );
};
