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
  Trash2,
  Lock,
  Upload,
  Cpu,
  Sparkles,
  MapPin,
  CheckCircle2,
  FileText,
  RefreshCw,
  Eye,
  Sliders,
} from 'lucide-react';
import {
  CampusBuilding,
  NavNode,
  NavEdge,
  CampusRoom,
  UserSession,
  AuditLog,
} from '../../types/campus';
import { BlueprintAiService, BlueprintAnalysisResult } from '../../services/blueprintAiService';

interface AdminDashboardViewProps {
  currentUser: UserSession;
  buildings: CampusBuilding[];
  nodes: NavNode[];
  edges: NavEdge[];
  rooms: CampusRoom[];
  onUpdateEdge: (edgeId: string, isBlocked: boolean, reason?: string) => void;
  onApproveBuilding: (buildingId: string) => void;
  onAddBuilding: (bld: CampusBuilding) => void;
  onApplyBlueprintScan?: (result: BlueprintAnalysisResult) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  buildings,
  nodes,
  edges,
  rooms,
  onUpdateEdge,
  onApproveBuilding,
  onAddBuilding,
  onApplyBlueprintScan,
}) => {
  const [activeSection, setActiveSection] = useState<
    'blueprint' | 'locations' | 'editor' | 'approval' | 'analytics' | 'users'
  >('blueprint');

  // Blueprint scanning state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<BlueprintAnalysisResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
      setScanError(null);
      setAppliedSuccess(false);
    }
  };

  const handleStartScan = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    setScanError(null);
    setAppliedSuccess(false);

    try {
      const result = await BlueprintAiService.analyzeBlueprint(selectedFile, 'Main Academic Campus');
      setScanResult(result);
    } catch (err: any) {
      setScanError(err.message || 'Error scanning blueprint image.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyBlueprint = () => {
    if (!scanResult) return;
    if (onApplyBlueprintScan) {
      onApplyBlueprintScan(scanResult);
    } else {
      // Add detected buildings
      scanResult.detectedBuildings.forEach((bld) => onAddBuilding(bld));
    }
    setAppliedSuccess(true);
  };

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
    <div className="flex-1 flex flex-col p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white mb-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Campus Cartography & Graph Administration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Campus Administration Dashboard</h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
            Upload blueprints to auto-generate graph nodes/edges with Gemini AI, manage live pathway closures, and review campus locations.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-bold text-white">{currentUser.name}</div>
            <div className="text-[10px] text-blue-300 uppercase font-bold">{currentUser.role} ACCESS</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'blueprint', label: 'AI Blueprint Scanner', icon: Cpu, badge: 'Gemini AI' },
          { id: 'locations', label: 'Manage Locations', icon: Edit3 },
          { id: 'editor', label: 'Pathway / Road Closures', icon: Layers },
          { id: 'approval', label: 'Audit & Approvals', icon: ShieldCheck },
          { id: 'analytics', label: 'Usage Analytics', icon: BarChart3 },
          { id: 'users', label: 'User Roles', icon: UsersIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: AI BLUEPRINT SCANNER */}
      {activeSection === 'blueprint' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Cpu size={20} className="text-blue-600" />
                  <span>Gemini Vision AI — Blueprint & Floorplan Graph Generator</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload an architectural campus blueprint, satellite site plan, or building floorplan. Gemini Vision AI will automatically detect buildings, entrances, corridor intersections, and generate Dijkstra graph nodes and edges.
                </p>
              </div>
            </div>

            {/* Upload Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <label className="block w-full border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <Upload size={24} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {selectedFile ? selectedFile.name : 'Click to Upload Campus Blueprint / Floorplan'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports high-resolution PNG, JPG, CAD blueprint scans
                  </p>
                </label>

                {previewUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 h-52 bg-slate-100 relative">
                    <img
                      src={previewUrl}
                      alt="Blueprint Preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      Blueprint Preview
                    </div>
                  </div>
                )}

                <button
                  onClick={handleStartScan}
                  disabled={!selectedFile || isScanning}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition transform active:scale-98"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Scanning Blueprint with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Analyze Blueprint & Generate Dijkstra Graph</span>
                    </>
                  )}
                </button>

                {scanError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{scanError}</span>
                  </div>
                )}
              </div>

              {/* Analysis Output Results */}
              <div className="lg:col-span-7 bg-slate-50/70 rounded-3xl p-5 border border-slate-200/80 flex flex-col justify-between">
                {scanResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Detection Summary</span>
                        <h4 className="text-base font-bold text-slate-900">
                          AI Graph Calibration Complete
                        </h4>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        Connected Graph Verified
                      </span>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
                        <div className="text-lg font-black text-blue-600">
                          {scanResult.summary.buildingsCount}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500">Buildings</div>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
                        <div className="text-lg font-black text-indigo-600">
                          {scanResult.detectedNodes.length}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500">Graph Nodes</div>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
                        <div className="text-lg font-black text-emerald-600">
                          {scanResult.summary.pathwaysCount}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500">Edges</div>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
                        <div className="text-lg font-black text-purple-600">
                          {scanResult.summary.roomsCount}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500">Rooms/Labs</div>
                      </div>
                    </div>

                    {/* Detected Buildings List */}
                    <div>
                      <h5 className="text-xs font-bold text-slate-700 mb-2">Detected Buildings</h5>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {scanResult.detectedBuildings.map((b) => (
                          <div
                            key={b.id}
                            className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-blue-600" />
                              <span className="font-bold text-slate-800">{b.name}</span>
                              <span className="text-[10px] text-slate-400">({b.code})</span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {b.numFloors} Floors • {b.architectureStyle}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      {appliedSuccess ? (
                        <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 size={16} />
                          <span>Graph synchronized with Live 3D Campus Map!</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Click below to commit this graph into live navigation.
                        </span>
                      )}

                      <button
                        onClick={handleApplyBlueprint}
                        disabled={appliedSuccess}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-xs"
                      >
                        <CheckCircle size={15} />
                        <span>{appliedSuccess ? 'Applied to Live Map' : 'Approve & Update Live Map'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <Cpu size={40} className="text-slate-300 mb-3" />
                    <h4 className="font-bold text-slate-700 text-sm">No Blueprint Analyzed Yet</h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Upload a campus floor plan or site layout image on the left and click &quot;Analyze Blueprint&quot; to begin AI recognition.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: LOCATIONS MANAGEMENT */}
      {activeSection === 'locations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <Plus size={16} className="text-blue-600" />
              <span>Add New Campus Location</span>
            </h3>
            <form onSubmit={handleCreateBuilding} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Building Name
                </label>
                <input
                  type="text"
                  required
                  value={newBldName}
                  onChange={(e) => setNewBldName(e.target.value)}
                  placeholder="e.g. Mechanical & Robotics Block"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Building Code
                </label>
                <input
                  type="text"
                  required
                  value={newBldCode}
                  onChange={(e) => setNewBldCode(e.target.value)}
                  placeholder="e.g. MECH"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newBldDesc}
                  onChange={(e) => setNewBldDesc(e.target.value)}
                  placeholder="Details, facilities, departments..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Plus size={14} />
                <span>Save Building Draft</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              <span>Registered Campus Buildings ({buildings.length})</span>
            </h3>
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {buildings.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{b.name}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                        {b.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{b.description}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    {b.status || 'PUBLISHED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PATHWAY / ROAD CLOSURES */}
      {activeSection === 'editor' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Layers size={18} className="text-blue-600" />
                <span>Live Route & Pathway Closures (Dijkstra Edge Controller)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle pathway blockades for construction, waterlogging, or events. Dijkstra router will automatically recalculate around blocked edges.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {edges.map((e) => (
              <div
                key={e.id}
                className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">{e.id}</span>
                    <span className="text-xs text-slate-600">
                      {e.fromNodeId} ➔ {e.toNodeId}
                    </span>
                    <span className="text-[11px] font-semibold text-blue-600">
                      ({Math.round(e.distanceMeters)}m)
                    </span>
                  </div>
                  {e.isBlocked && (
                    <span className="inline-block text-[11px] text-red-600 font-semibold mt-1">
                      Reason: {e.closureReason || 'Blocked by administrator'}
                    </span>
                  )}
                </div>

                <button
                  onClick={() =>
                    onUpdateEdge(e.id, !e.isBlocked, e.isBlocked ? undefined : 'Scheduled Maintenance')
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    e.isBlocked
                      ? 'bg-red-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {e.isBlocked ? 'Blocked (Click to Open)' : 'Open / Clear'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: APPROVAL & AUDIT */}
      {activeSection === 'approval' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span>Audit Logs & Change History</span>
          </h3>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-blue-700">{log.action}</span>
                    <span className="text-xs text-slate-700">by {log.editor}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: ANALYTICS */}
      {activeSection === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase">Total Routes Calculated</div>
            <div className="text-3xl font-black text-blue-600 mt-2">1,482</div>
            <div className="text-xs text-emerald-600 mt-1 font-semibold">↑ 14% this week</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase">Accessible Routes Taken</div>
            <div className="text-3xl font-black text-indigo-600 mt-2">247</div>
            <div className="text-xs text-slate-500 mt-1 font-semibold">Wheelchair ramp & lift queries</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase">Top Destination</div>
            <div className="text-2xl font-black text-slate-800 mt-2">Central Library</div>
            <div className="text-xs text-slate-500 mt-1 font-semibold">Followed by CSE Block & Cafe</div>
          </div>
        </div>
      )}

      {/* SECTION 6: USERS */}
      {activeSection === 'users' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <UsersIcon size={18} className="text-blue-600" />
            <span>Authorized Campus Administrators</span>
          </h3>
          <div className="space-y-2">
            {[
              { name: 'Sridharan', role: 'ADMIN', email: 'sridharan@campus.edu', dept: 'Computer Science & AI' },
              { name: 'Dr. M. Swaminathan', role: 'CAMPUS_OFFICER', email: 'facilities@campus.edu', dept: 'Campus Operations' },
              { name: 'Student Council Lead', role: 'MODERATOR', email: 'council@campus.edu', dept: 'Student Affairs' },
            ].map((u, i) => (
              <div
                key={i}
                className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-800">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email} • {u.dept}</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
