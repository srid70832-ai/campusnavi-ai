import React, { useState } from 'react';
import {
  Building2,
  PhoneCall,
  MapPin,
  Navigation,
  ShieldAlert,
  Search,
  Accessibility,
  HeartPulse,
  Coffee,
  Landmark,
} from 'lucide-react';
import { Facility, EmergencyContact, CampusBuilding } from '../../types/campus';

interface FacilitiesViewProps {
  facilities: Facility[];
  emergencyContacts: EmergencyContact[];
  buildings: CampusBuilding[];
  onNavigateToFacility: (nodeId: string, building: CampusBuilding | null) => void;
}

export const FacilitiesView: React.FC<FacilitiesViewProps> = ({
  facilities,
  emergencyContacts,
  buildings,
  onNavigateToFacility,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'All Facilities' },
    { id: 'CAFETERIA', label: 'Dining & Cafeterias', icon: Coffee },
    { id: 'FIRST_AID', label: 'First Aid & Medical', icon: HeartPulse },
    { id: 'ATM', label: 'ATMs & Banking', icon: Landmark },
    { id: 'ELEVATOR', label: 'Elevators & Lifts', icon: Accessibility },
    { id: 'RAMP', label: 'Wheelchair Ramps', icon: Accessibility },
    { id: 'RESTROOM', label: 'Restrooms', icon: Building2 },
  ];

  const filteredFacilities = facilities.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.locationDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.buildingId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeCategory === 'ALL') return true;
    return f.type === activeCategory;
  });

  const getBuilding = (bldId: string) => {
    return buildings.find((b) => b.id === bldId) || null;
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-2">
            <Building2 size={14} />
            <span>Campus Amenities & Support</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Campus Facilities & Services</h1>
          <p className="text-xs md:text-sm text-blue-100 mt-1">
            Browse campus health clinics, student dining halls, banking ATMs, IT helpdesks, and emergency contacts with instant routing.
          </p>

          {/* Search input */}
          <div className="mt-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facility name, medical center, or ATM..."
              className="w-full pl-11 pr-4 py-3 bg-white text-slate-800 rounded-2xl shadow-md font-medium text-xs md:text-sm focus:outline-none focus:ring-4 focus:ring-blue-400/40"
            />
          </div>
        </div>
      </div>

      {/* Emergency SOS Banner */}
      <div className="bg-red-50/80 border border-red-200 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-3">
          <ShieldAlert size={20} className="text-red-600 animate-pulse" />
          <span>Immediate Campus Emergency Contacts</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-2xl p-3.5 border border-red-100 shadow-xs flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-xs">{contact.title}</h4>
                <p className="text-[11px] text-slate-500">{contact.role}</p>
                <div className="text-xs font-bold text-red-600 mt-1">{contact.phoneNumber}</div>
              </div>
              <a
                href={`tel:${contact.phoneNumber}`}
                className="w-8 h-8 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition shadow-xs"
              >
                <PhoneCall size={14} />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-xs ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-blue-500/20'
                : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFacilities.map((fac) => {
          const bld = getBuilding(fac.buildingId);
          return (
            <div
              key={fac.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {fac.type}
                  </span>
                  {fac.isAccessible && (
                    <span
                      title="Wheelchair Accessible"
                      className="text-emerald-600 flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <Accessibility size={13} />
                      Accessible
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition">
                  {fac.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {fac.locationDescription}
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-slate-400" />
                    <span>
                      {bld?.name || fac.buildingId} (Floor {fac.floorNumber})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        fac.status === 'OPEN' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <span className="font-semibold text-slate-700">Status: {fac.status}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => onNavigateToFacility(fac.associatedNodeId, bld)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition transform active:scale-95"
                >
                  <Navigation size={13} />
                  <span>Get Directions</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
