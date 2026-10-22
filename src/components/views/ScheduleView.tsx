import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  BookOpen,
  User,
  CheckCircle2,
} from 'lucide-react';
import { TimetableItem, CampusBuilding } from '../../types/campus';

interface ScheduleViewProps {
  timetable: TimetableItem[];
  buildings: CampusBuilding[];
  onNavigateToRoom: (nodeId: string, building: CampusBuilding | null) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  timetable,
  buildings,
  onNavigateToRoom,
}) => {
  const [selectedDay, setSelectedDay] = useState<
    'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
  >('Monday');

  const days: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'> = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const filteredClasses = timetable.filter((t) => t.dayOfWeek === selectedDay);

  const getBuilding = (bldId: string) => {
    return buildings.find((b) => b.id === bldId) || null;
  };

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
    <div className="flex-1 flex flex-col p-4 md:p-6 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-2">
            <Calendar size={14} />
            <span>Academic Schedule & Room Routing</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Class Schedule & Timetable</h1>
          <p className="text-xs md:text-sm text-blue-100 mt-1 max-w-xl">
            View your upcoming lectures, labs, and exams with instant 1-click shortest path walking
            directions right to the classroom door.
          </p>

          {/* Day Selector Chips */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-xs ${
                  selectedDay === day
                    ? 'bg-white text-blue-700 shadow-md scale-105'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Class Schedule Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BookOpen size={18} className="text-blue-600" />
            <span>{selectedDay}&apos;s Lectures & Labs ({filteredClasses.length})</span>
          </h2>
        </div>

        {filteredClasses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Calendar size={28} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No scheduled classes for {selectedDay}</h3>
            <p className="text-xs text-slate-500 mt-1">Enjoy your free study or project time!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((item) => {
              const bld = getBuilding(item.buildingId);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5">
                        <Clock size={13} />
                        {item.startTime} - {item.endTime}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {item.courseCode}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition">
                      {item.subjectName}
                    </h3>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-slate-400" />
                        <span>{item.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-blue-600" />
                        <span className="font-semibold text-slate-800">
                          {item.roomId} ({bld?.name || item.buildingId})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      Floor {item.floorNumber}
                    </span>
                    <button
                      onClick={() => {
                        const targetNode = getBuildingNodeId(item.buildingId);
                        onNavigateToRoom(targetNode, bld);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition transform active:scale-95"
                    >
                      <Navigation size={13} />
                      <span>Navigate Here</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
