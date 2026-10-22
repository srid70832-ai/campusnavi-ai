import React, { useState } from 'react';
import { Building, Accessibility, Utensils, HeartPulse, ShieldAlert, PhoneCall, MapPin, X, Car } from 'lucide-react';
import { Facility, EmergencyContact, CampusBuilding } from '../types/campus';

interface FacilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: Facility[];
  emergencyContacts: EmergencyContact[];
  buildings: CampusBuilding[];
  onNavigateToFacility: (nodeId: string, bld: CampusBuilding | null) => void;
}

export const FacilitiesModal: React.FC<FacilitiesModalProps> = ({
  isOpen,
  onClose,
  facilities,
  emergencyContacts,
  buildings,
  onNavigateToFacility,
}) => {
  const [activeTab, setActiveTab] = useState<'facilities' | 'emergency'>('facilities');

  if (!isOpen) return null;

  const handleNavigate = (f: Facility) => {
    const parentBld = buildings.find((b) => b.id === f.buildingId) || null;
    onNavigateToFacility(f.associatedNodeId, parentBld);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Building size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Campus Facilities & Emergency Services</h3>
              <p className="text-[11px] text-slate-400">Restrooms, Accessibility, Health & SOS</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 py-3 border-b border-slate-100 flex gap-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('facilities')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'facilities'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Facilities & Accessibility
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'emergency'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Emergency SOS Contacts
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {activeTab === 'facilities' ? (
            facilities.map((fac) => (
              <div
                key={fac.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-blue-300 transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    {fac.type === 'RAMP' ? (
                      <Accessibility size={20} />
                    ) : fac.type === 'CAFETERIA' ? (
                      <Utensils size={20} />
                    ) : fac.type === 'FIRST_AID' ? (
                      <HeartPulse size={20} className="text-red-500" />
                    ) : (
                      <Car size={20} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{fac.name}</h4>
                    <p className="text-[11px] text-slate-500">{fac.locationDescription}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Status: {fac.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleNavigate(fac)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 transition"
                >
                  <MapPin size={13} />
                  <span>Navigate</span>
                </button>
              </div>
            ))
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                In case of emergency, call campus dispatch or tap below to initiate emergency contact.
              </div>
              {emergencyContacts.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl p-4 border border-red-100 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{c.title}</h4>
                      <p className="text-[11px] text-slate-500">{c.role}</p>
                      <span className="text-[10px] text-slate-400">{c.location}</span>
                    </div>
                  </div>

                  <a
                    href={`tel:${c.phoneNumber}`}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
                  >
                    <PhoneCall size={14} />
                    <span>{c.phoneNumber}</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
