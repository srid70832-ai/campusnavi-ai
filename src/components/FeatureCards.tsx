import React from 'react';
import { MapPin, Navigation, Box, Mic, ShieldCheck } from 'lucide-react';

interface FeatureCardsProps {
  onSelectFeature: (featureKey: string) => void;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({ onSelectFeature }) => {
  const features = [
    {
      id: 'find',
      icon: MapPin,
      iconBg: 'bg-blue-500',
      title: 'Find Any Location',
      description: 'Search classrooms, labs, offices and more',
    },
    {
      id: 'dijkstra',
      icon: Navigation,
      iconBg: 'bg-emerald-500',
      title: 'Shortest Path',
      description: "AI-powered Dijkstra's algorithm",
    },
    {
      id: '3d-map',
      icon: Box,
      iconBg: 'bg-indigo-600',
      title: '3D Campus Map',
      description: 'Interactive 3D view with real buildings',
    },
    {
      id: 'voice',
      icon: Mic,
      iconBg: 'bg-rose-500',
      title: 'Voice Navigation',
      description: 'Turn by turn voice guidance',
    },
    {
      id: 'admin',
      icon: ShieldCheck,
      iconBg: 'bg-amber-500',
      title: 'Verified Campus Data',
      description: 'Accurate 3D maps & verified paths',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-4">
      {features.map((f) => {
        const Icon = f.icon;
        return (
          <button
            key={f.id}
            onClick={() => onSelectFeature(f.id)}
            className="group text-left bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition duration-200 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl ${f.iconBg} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
            >
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-800 text-xs truncate group-hover:text-blue-600 transition">
                {f.title}
              </h4>
              <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                {f.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
