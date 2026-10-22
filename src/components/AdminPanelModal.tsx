import React, { useState } from 'react';
import {
  ShieldCheck,
  Edit3,
  Layers,
  BarChart3,
  Users as UsersIcon,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Trash2,
  Lock,
} from 'lucide-react';
import {
  CampusBuilding,
  NavNode,
  NavEdge,
  CampusRoom,
  UserSession,
  AuditLog,
} from '../types/campus';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  buildings: CampusBuilding[];
  nodes: NavNode[];
  edges: NavEdge[];
  rooms: CampusRoom[];
  onUpdateEdge: (edgeId: string, isBlocked: boolean, reason?: string) => void;
  onApproveBuilding: (buildingId: string) => void;
  onAddBuilding: (bld: CampusBuilding) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  buildings,
  nodes,
  edges,
  rooms,
  onUpdateEdge,
  onApproveBuilding,
  onAddBuilding,
}) => {
  const [activeSection, setActiveSection] = useState<
    'locations' | 'editor' | 'approval' | 'analytics' | 'users'
  >('locations');

  // New location form state
  const [newBldName, setNewBldName] = useState('');
  const [newBldCode, setNewBldCode] = useState('');
  const [newBldDesc, setNewBldDesc] = useState('');

  // Sample Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'AUD-1',
      action: 'PUBLISH_LOCATION',
      editor: 'Prof. K. Ramanathan (Admin)',
      targetType: 'BUILDING',
      targetId: 'LIB',
      timestamp: Date.now() - 3600000 * 2,
      details: 'Central Library metadata and wheelchair ramp verified.',
    },
    {
      id: 'AUD-2',
      action: 'UPDATE_PATHWAY',
      editor: 'Campus Facilities Lead',
      targetType: 'EDGE',
      targetId: 'E_CSE_01',
      timestamp: Date.now() - 3600000 * 5,
      details: 'Paved pedestrian path edge weight calibrated to 50m.',
    },
  ]);

  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'ADMIN';

  const handleCreateBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBldName || !newBldCode) return;

    const newBld: CampusBuilding = {
      id: `BLD_${newBldCode.toUpperCase()}`,
      name: newBldName,
      code: newBldCode.toUpperCase(),
      description: newBldDesc || 'Newly registered campus building facility.',
      numFloors: 2,
      defaultFloor: 1,
      collegeId: 'TECH_UNIVERSITY',
      position: { x: 0, y: 5, z: 0 },
      dimensions: { width: 30, height: 12, depth: 25 },
      color: '#6366F1',
      accentColor: '#4338CA',
      status: 'PENDING_REVIEW',
    };

    onAddBuilding(newBld);
    setNewBldName('');
    setNewBldCode('');
    setNewBldDesc('');

    setAuditLogs((prev) => [
      {
        id: `AUD-${Date.now()}`,
        action: 'CREATE_DRAFT',
        editor: currentUser.name,
        targetType: 'BUILDING',
        targetId: newBld.id,
        timestamp: Date.now(),
        details: `Created draft for "${newBld.name}" awaiting review.`,
      },
      ...prev,
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[680px]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">Campus Administrator Dashboard</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  RBAC Admin Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Campus Data Management, 3D Graph Editor & Audit Workflow
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Access Warning if not Admin */}
        {!isAdmin && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Lock size={14} /> You are currently in view-only mode. Switch role to Administrator in the top right to make changes.
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 border-b border-slate-200 bg-slate-50 flex gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSection('locations')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeSection === 'locations' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Manage Locations ({buildings.length})
          </button>
          <button
            onClick={() => setActiveSection('editor')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeSection === 'editor' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pathway & Closure Editor ({edges.length} edges)
          </button>
          <button
            onClick={() => setActiveSection('approval')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeSection === 'approval' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Check & Approve Lifecycle
          </button>
          <button
            onClick={() => setActiveSection('analytics')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeSection === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Live Analytics
          </button>
          <button
            onClick={() => setActiveSection('users')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeSection === 'users' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Users & Audit Logs
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === 'locations' && (
            <div className="space-y-6">
              {/* Add Location Form */}
              {isAdmin && (
                <form
                  onSubmit={handleCreateBuilding}
                  className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-3"
                >
                  <div className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                    <Plus size={14} /> Register New Campus Building (Draft)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Building Name (e.g. Innovation Hall)"
                      value={newBldName}
                      onChange={(e) => setNewBldName(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Code (e.g. INH)"
                      value={newBldCode}
                      onChange={(e) => setNewBldCode(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Description / Department"
                      value={newBldDesc}
                      onChange={(e) => setNewBldDesc(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Create Draft Record
                  </button>
                </form>
              )}

              {/* Buildings List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {buildings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{b.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {b.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            b.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{b.description}</p>
                      <div className="text-[10px] text-slate-400 mt-2">
                        Floors: {b.numFloors} &bull; Coordinates: ({b.position.x}, {b.position.z})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'editor' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Manage pedestrian connections and toggle corridor closures (e.g. wet floor cleaning or construction maintenance). Dijkstra routing automatically reroutes around closed edges!
              </div>

              <div className="space-y-2">
                {edges.slice(0, 10).map((edge) => (
                  <div
                    key={edge.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {edge.fromNodeId} ➔ {edge.toNodeId}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Measured Distance: {edge.distanceMeters}m &bull; Wheelchair Accessible:{' '}
                        {edge.isAccessible ? 'Yes' : 'No (Stairs)'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                          edge.isBlocked ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {edge.isBlocked ? 'BLOCKED' : 'OPEN'}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => onUpdateEdge(edge.id, !edge.isBlocked, 'Maintenance')}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                        >
                          {edge.isBlocked ? 'Reopen Corridor' : 'Mark Closed'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'approval' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Lifecycle: <strong>Draft</strong> ➔ <strong>Pending Review</strong> ➔ <strong>Approved</strong> ➔ <strong>Published</strong>. Unapproved changes never appear in production routing graphs.
              </div>

              <div className="space-y-3">
                {buildings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{b.name}</h4>
                      <p className="text-[11px] text-slate-400">Current Lifecycle Status: {b.status}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {b.status !== 'PUBLISHED' && isAdmin ? (
                        <button
                          onClick={() => onApproveBuilding(b.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                        >
                          <CheckCircle size={14} /> Approve & Publish
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                          Live & Verified
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100">
                  <div className="text-xs font-semibold text-blue-700">Total Route Calculations</div>
                  <div className="text-2xl font-black text-blue-950 mt-1">1,428</div>
                  <div className="text-[10px] text-blue-600 mt-1">&uarr; 18% this academic week</div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100">
                  <div className="text-xs font-semibold text-emerald-700">Wheelchair Accessible Trips</div>
                  <div className="text-2xl font-black text-emerald-950 mt-1">214</div>
                  <div className="text-[10px] text-emerald-600 mt-1">100% compliant paths used</div>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-100">
                  <div className="text-xs font-semibold text-purple-700">Average Dijkstra Search Time</div>
                  <div className="text-2xl font-black text-purple-950 mt-1">1.8 ms</div>
                  <div className="text-[10px] text-purple-600 mt-1">Real-time priority queue</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-xs text-slate-800 mb-3">Popular Campus Destinations</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span>Central Library</span>
                    <span className="font-bold text-blue-600">412 queries (29%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '29%' }} />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span>AI & Robotics Laboratory (CSE-103)</span>
                    <span className="font-bold text-blue-600">328 queries (23%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '23%' }} />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span>Green Campus Cafeteria</span>
                    <span className="font-bold text-blue-600">280 queries (20%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="space-y-4">
              <h4 className="font-bold text-xs text-slate-800">Administrative Audit Trail</h4>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{log.action}</div>
                      <div className="text-[11px] text-slate-500">{log.details}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">By: {log.editor}</div>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
