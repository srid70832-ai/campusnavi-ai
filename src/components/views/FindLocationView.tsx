import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Navigation,
  Building,
  DoorOpen,
  Clock,
  Accessibility,
  CheckCircle2,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { CampusBuilding, CampusRoom } from '../../types/campus';

interface FindLocationViewProps {
  buildings: CampusBuilding[];
  rooms: CampusRoom[];
  onNavigateToLocation: (nodeId: string, building: CampusBuilding | null) => void;
}

export const FindLocationView: React.FC<FindLocationViewProps> = ({
  buildings,
  rooms,
  onNavigateToLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'All Places' },
    { id: 'ACADEMIC', label: 'Academic Blocks' },
    { id: 'LAB', label: 'Labs & Research' },
    { id: 'LIBRARY', label: 'Library' },
    { id: 'DINING', label: 'Cafeteria & Dining' },
    { id: 'ADMIN', label: 'Administration' },
    { id: 'SPORTS', label: 'Sports & Amenities' },
  ];

  // Match buildings and rooms
  const filteredBuildings = buildings.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'ACADEMIC')
      return b.id === 'CSE_BLOCK' || b.id === 'MAIN_BLOCK';
    if (selectedCategory === 'LAB') return b.id === 'CSE_BLOCK';
    if (selectedCategory === 'LIBRARY') return b.id === 'LIBRARY';
    if (selectedCategory === 'DINING') return b.id === 'CAFETERIA';
    if (selectedCategory === 'ADMIN') return b.id === 'ADMIN_BLOCK';
    if (selectedCategory === 'SPORTS') return b.id === 'SPORTS_GROUND';
    return true;
  });

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'LAB') return r.category.includes('LAB');
    if (selectedCategory === 'ACADEMIC') return r.category.includes('CLASS');
    if (selectedCategory === 'LIBRARY') return r.buildingId === 'LIBRARY';
    if (selectedCategory === 'DINING') return r.buildingId === 'CAFETERIA';
    if (selectedCategory === 'ADMIN') return r.buildingId === 'ADMIN_BLOCK';
    return true;
  });

  const getBuildingNodeId = (bldId: string) => {
    switch (bldId) {
      case 'CSE_BLOCK':
        return 'N_CSE_PLAZA';
      case 'LIBRARY':
        return 'N_LIBRARY_ENTRANCE';
      case 'MAIN_BLOCK':
        return 'N_MAIN_ENTRANCE';
      case 'AUDITORIUM':
        return 'N_AUDITORIUM_ENTRANCE';
      case 'CAFETERIA':
        return 'N_CAFE_ENTRANCE';
      case 'ADMIN_BLOCK':
        return 'N_ADMIN_ENTRANCE';
      case 'HOSTEL':
        return 'N_HOSTEL_ENTRANCE';
      case 'SPORTS_GROUND':
        return 'N_SPORTS_ENTRANCE';
      default:
        return 'N_PARKING_ENTRANCE';
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header section */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-15 mix-blend-overlay bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80")',
          }}
        />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-3">
            <Building size={14} />
            <span>Interactive Campus Directory</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Find Any Location on Campus
          </h1>
          <p className="text-sm text-blue-100 mt-2">
            Search verified classrooms, research labs, lecture halls, administrative offices, and
            dining areas with 1-click shortest route calculation.
          </p>

          {/* Search Bar Input */}
          <div className="mt-5 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by building name, room number (e.g. CS-204), or facility..."
              className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-800 rounded-2xl shadow-xl font-medium text-sm focus:outline-none focus:ring-4 focus:ring-blue-400/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-xs ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-blue-500/20'
                : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Campus Buildings Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Building size={18} className="text-blue-600" />
            <span>Campus Buildings ({filteredBuildings.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBuildings.map((bld) => (
            <div
              key={bld.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col group"
            >
              <div className="h-40 w-full bg-slate-100 relative overflow-hidden">
                <img
                  src={
                    bld.imageUrl ||
                    'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={bld.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-700 shadow-sm border border-slate-200/60">
                  {bld.code}
                </div>
                {bld.isWheelchairAccessible !== false && (
                  <div
                    title="Wheelchair Accessible"
                    className="absolute top-3 right-3 bg-emerald-500 text-white p-1.5 rounded-lg shadow-sm"
                  >
                    <Accessibility size={14} />
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition">
                    {bld.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {bld.description}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-600">
                    <span className="flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                      <DoorOpen size={13} className="text-slate-500" />
                      {bld.numFloors} Floors
                    </span>
                    <span className="flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                      <Clock size={13} className="text-slate-500" />
                      08:00 - 20:00
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    Verified Geometry
                  </span>
                  <button
                    onClick={() => {
                      const nodeId = getBuildingNodeId(bld.id);
                      onNavigateToLocation(nodeId, bld);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    <Navigation size={13} />
                    <span>Navigate</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Classrooms & Labs Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <DoorOpen size={18} className="text-indigo-600" />
            <span>Classrooms, Labs & Facilities ({filteredRooms.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredRooms.map((room) => {
            const parentBld = buildings.find((b) => b.id === room.buildingId) || null;
            return (
              <div
                key={room.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {room.roomNumber}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Floor {room.floorNumber}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-2">{room.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{room.description}</p>

                  <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-600">
                    <Building size={12} className="text-slate-400" />
                    <span>{parentBld?.name || room.buildingId}</span>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {room.openingHours || 'Open Campus Hours'}
                  </span>
                  <button
                    onClick={() => {
                      const targetNode = room.associatedNodeId || getBuildingNodeId(room.buildingId);
                      onNavigateToLocation(targetNode, parentBld);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    <Navigation size={12} />
                    <span>Directions</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
