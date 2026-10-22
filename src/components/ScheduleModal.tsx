import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Navigation, User, X } from 'lucide-react';
import { TimetableItem, CampusBuilding } from '../types/campus';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetable: TimetableItem[];
  buildings: CampusBuilding[];
  onNavigateToRoom: (nodeId: string, bld: CampusBuilding | null) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  timetable,
  buildings,
  onNavigateToRoom,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  if (!isOpen) return null;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const filteredSchedule = timetable.filter((t) => t.dayOfWeek === selectedDay);

  const handleNavigate = (item: TimetableItem) => {
    const parentBld = buildings.find((b) => b.id === item.buildingId) || null;
    const nodeId = item.roomId === 'ROOM_CSE_103' ? 'N_TP_103' :
      item.roomId === 'ROOM_CSE_104' ? 'N_TP_104' :
      item.roomId === 'ROOM_CSE_101' ? 'N_TP_101' : 'N_CSE_PLAZA';
    onNavigateToRoom(nodeId, parentBld);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Class Schedule & Timetable</h3>
              <p className="text-[11px] text-slate-400">Integrated Course Directions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Days Pill Filter */}
        <div className="px-6 py-3 border-b border-slate-100 flex gap-2 overflow-x-auto bg-slate-50/50">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedDay === day
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Schedule List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredSchedule.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No classes scheduled for {selectedDay}.
            </div>
          ) : (
            filteredSchedule.map((item) => {
              const bld = buildings.find((b) => b.id === item.buildingId);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-blue-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                        {item.courseCode}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{item.subjectName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock size={13} className="text-slate-400" />
                        {item.startTime} - {item.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={13} className="text-slate-400" />
                        {item.instructor}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        {bld?.name || item.buildingId} &bull; Floor {item.floorNumber}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavigate(item)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition shrink-0"
                  >
                    <Navigation size={14} fill="white" />
                    <span>Navigate</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
