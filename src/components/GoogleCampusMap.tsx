import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Crosshair,
  Plus,
  Minus,
  Layers,
  MapPin,
  Navigation,
  Eye,
  Radio,
  Clock,
  ArrowRight,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CampusBuilding, NavNode, RouteResult, UserLiveLocation } from '../types/campus';

interface GoogleCampusMapProps {
  buildings: CampusBuilding[];
  nodes: NavNode[];
  selectedBuilding: CampusBuilding | null;
  onSelectBuilding: (building: CampusBuilding) => void;
  routeResult: RouteResult | null;
  startNodeId: string;
  destinationNodeId: string;
  is3DMode: boolean;
  onToggle3D: (is3D: boolean) => void;
  currentStepIndex?: number;
  userLocation: UserLiveLocation;
  onEnableGPS: () => void;
  isFollowUser?: boolean;
  onToggleFollowUser?: () => void;
  isNavigating?: boolean;
}

export const GoogleCampusMap: React.FC<GoogleCampusMapProps> = ({
  buildings,
  nodes,
  selectedBuilding,
  onSelectBuilding,
  routeResult,
  startNodeId,
  destinationNodeId,
  is3DMode,
  onToggle3D,
  currentStepIndex = 0,
  userLocation,
  onEnableGPS,
  isFollowUser = false,
  onToggleFollowUser,
  isNavigating = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state for 2D Google Maps view
  const [zoom, setZoom] = useState<number>(1.25);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showBlueprintOverlay, setShowBlueprintOverlay] = useState(false);
  const [mapStyleMode, setMapStyleMode] = useState<'standard' | 'satellite'>('standard');

  // Animation frame for route pulsing & user dot
  const [pulseTime, setPulseTime] = useState(0);
  useEffect(() => {
    let animId: number;
    const update = () => {
      setPulseTime((t) => t + 0.05);
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  // When selected building changes, smoothly pan map to it
  useEffect(() => {
    if (selectedBuilding && containerRef.current) {
      const targetPanX = -selectedBuilding.position.x * 2.8 * zoom;
      const targetPanY = -selectedBuilding.position.z * 2.8 * zoom;
      setPan({ x: targetPanX, y: targetPanY });
    }
  }, [selectedBuilding, zoom]);

  // When follow user is active, pan to user
  useEffect(() => {
    if (isFollowUser && userLocation) {
      setPan({
        x: -userLocation.x * 2.8 * zoom,
        y: -userLocation.z * 2.8 * zoom,
      });
    }
  }, [isFollowUser, userLocation.x, userLocation.z, zoom]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((prev) => Math.max(0.65, Math.min(3.2, prev * zoomFactor)));
  };

  const handleRecenter = () => {
    if (userLocation) {
      setPan({
        x: -userLocation.x * 2.8 * zoom,
        y: -userLocation.z * 2.8 * zoom,
      });
    } else {
      setPan({ x: 0, y: 0 });
      setZoom(1.25);
    }
  };

  const handleResetNorth = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1.25);
  };

  // Convert 3D world meters (x, z) to screen pixel coordinates
  const worldToScreen = (worldX: number, worldZ: number) => {
    const scale = 2.8 * zoom;
    return {
      x: worldX * scale + pan.x,
      y: worldZ * scale + pan.y,
    };
  };

  // Build SVG Path for the Route Line
  let routeSvgPath = '';
  let routeMidpoint = { x: 0, y: 0 };
  if (routeResult?.success && routeResult.pathNodes.length >= 2) {
    const pts = routeResult.pathNodes.map((n) => {
      const zVal = n.z !== undefined ? n.z : n.y;
      return worldToScreen(n.x, zVal);
    });

    routeSvgPath = pts.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    // Midpoint for the Google Maps floating ETA bubble
    const midIdx = Math.floor(pts.length / 2);
    routeMidpoint = pts[midIdx] || pts[0];
  }

  // Find destination building coordinates for Red Pin
  const destBuilding = buildings.find((b) => {
    const destNode = nodes.find((n) => n.id === destinationNodeId);
    return destNode && destNode.buildingId === b.id;
  }) || selectedBuilding || buildings[0];

  const destPos = destBuilding
    ? worldToScreen(destBuilding.position.x, destBuilding.position.z + destBuilding.dimensions.depth / 2)
    : worldToScreen(0, -40);

  const userPos = worldToScreen(userLocation.x, userLocation.z);

  const totalDistanceMeters = routeResult?.totalDistanceMeters ? Math.round(routeResult.totalDistanceMeters) : 280;
  const walkMinutes = Math.max(1, Math.round(totalDistanceMeters / 70));

  // Current Turn instruction for top navigation banner
  const currentInstruction =
    routeResult?.segments && routeResult.segments[currentStepIndex]
      ? routeResult.segments[currentStepIndex].instructionEn
      : 'Head towards your destination';

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className={`relative w-full h-full select-none overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing ${
        mapStyleMode === 'satellite' ? 'bg-[#0f172a]' : 'bg-[#F8F9FA]'
      }`}
    >
      {/* Google Maps Style Top Floating Navigation Banner (Active during navigation) */}
      {isNavigating && (
        <div className="absolute top-3 inset-x-4 md:inset-x-12 z-30 flex items-center justify-between p-3.5 bg-[#137333] text-white rounded-2xl shadow-xl border border-emerald-600 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white shrink-0">
              <Navigation size={22} className="rotate-45" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight">{currentInstruction}</div>
              <div className="text-[11px] text-emerald-100 flex items-center gap-2 mt-0.5">
                <span>Next turn in ~45 m</span>
                <span>•</span>
                <span>Remaining: {totalDistanceMeters} m ({walkMinutes} min)</span>
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            Live
          </span>
        </div>
      )}

      {/* Floating 2D / 3D Mode Switcher (Matching Google Maps View Options) */}
      <div className="absolute top-4 left-4 z-20 flex bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-lg border border-slate-200">
        <button
          onClick={() => onToggle3D(false)}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            !is3DMode
              ? 'bg-[#1A73E8] text-white shadow-md shadow-blue-500/25'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Layers size={14} />
          <span>Google 2D</span>
        </button>
        <button
          onClick={() => onToggle3D(true)}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            is3DMode
              ? 'bg-[#1A73E8] text-white shadow-md shadow-blue-500/25'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Eye size={14} />
          <span>3D View</span>
        </button>
      </div>

      {/* Blueprint Underlay Toggle */}
      <div className="absolute top-16 left-4 z-20">
        <button
          onClick={() => setShowBlueprintOverlay(!showBlueprintOverlay)}
          className={`px-3 py-1.5 rounded-xl backdrop-blur-md shadow-md border text-xs font-semibold flex items-center gap-1.5 transition ${
            showBlueprintOverlay
              ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
              : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers size={13} />
          <span>{showBlueprintOverlay ? 'Hide Blueprint' : 'Show Blueprint'}</span>
        </button>
      </div>

      {/* GPS Status Indicator (Top-Left under Blueprint toggle) */}
      <div className="absolute top-28 left-4 z-20 flex items-center gap-2">
        <button
          onClick={onEnableGPS}
          title={userLocation.statusMessage || 'Toggle Live GPS'}
          className={`px-3 py-1.5 rounded-xl backdrop-blur-md shadow-md border text-xs font-semibold flex items-center gap-2 transition ${
            userLocation.isLiveGPS
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20'
              : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Radio size={14} className={userLocation.isLiveGPS ? 'animate-pulse' : ''} />
          <span>{userLocation.isLiveGPS ? 'GPS Active' : 'Enable GPS'}</span>
          {userLocation.accuracy && (
            <span className="text-[10px] opacity-80">(±{Math.round(userLocation.accuracy)}m)</span>
          )}
        </button>
      </div>

      {/* Right Controls: Recenter, North, Zoom In/Out */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleResetNorth}
          title="Reset North Orientation"
          className="w-10 h-10 rounded-2xl bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition transform active:scale-95"
        >
          <Compass size={18} className="text-[#1A73E8]" />
        </button>

        <button
          onClick={handleRecenter}
          title="Center on My Location"
          className="w-10 h-10 rounded-2xl bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#1A73E8] hover:bg-slate-50 transition transform active:scale-95"
        >
          <Crosshair size={18} />
        </button>

        {onToggleFollowUser && (
          <button
            onClick={onToggleFollowUser}
            title={isFollowUser ? 'Disable Follow Mode' : 'Follow My Location While Walking'}
            className={`w-10 h-10 rounded-2xl shadow-lg border flex items-center justify-center transition transform active:scale-95 ${
              isFollowUser
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-white text-slate-700 border-slate-200 hover:text-emerald-600'
            }`}
          >
            <Navigation size={16} className={isFollowUser ? 'animate-bounce' : ''} />
          </button>
        )}

        <div className="flex flex-col bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mt-1">
          <button
            onClick={() => setZoom((z) => Math.min(3.2, z + 0.3))}
            title="Zoom In"
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-[#1A73E8] transition active:scale-95 border-b border-slate-100"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.65, z - 0.3))}
            title="Zoom Out"
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-[#1A73E8] transition active:scale-95"
          >
            <Minus size={18} />
          </button>
        </div>
      </div>

      {/* Main SVG Vector Canvas: Renders Google Maps styled Roads, Greenery, Buildings, and Navigation Route */}
      <svg className="w-full h-full absolute inset-0 overflow-visible" style={{ pointerEvents: 'auto' }}>
        <g style={{ transformOrigin: 'center' }}>
          {/* Defs: Drop Shadows & Markers */}
          <defs>
            {/* Google Maps Blue Route Glow Filter */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1a73e8" floodOpacity="0.45" />
            </filter>

            {/* Building Soft Drop Shadow */}
            <filter id="buildingShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3c4043" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* 1. Optional Master Blueprint Underlay */}
          {showBlueprintOverlay && (
            <image
              href="/sample-blueprint.jpg"
              x={worldToScreen(-115, -150).x}
              y={worldToScreen(-115, -150).y}
              width={230 * 2.8 * zoom}
              height={290 * 2.8 * zoom}
              opacity={0.35}
              preserveAspectRatio="none"
            />
          )}

          {/* 2. Google Maps Parks & Green Turf Areas */}
          {/* Central Quad Park */}
          <rect
            x={worldToScreen(-25, -20).x}
            y={worldToScreen(-25, -20).y}
            width={50 * 2.8 * zoom}
            height={70 * 2.8 * zoom}
            fill="#E6F4EA"
            stroke="#CEEAD6"
            strokeWidth="1.5"
            rx={8 * zoom}
          />

          {/* Sports Ground Athletic Running Track (Matching Google Maps red oval) */}
          <g>
            <rect
              x={worldToScreen(-42, -152).x}
              y={worldToScreen(-42, -152).y}
              width={84 * 2.8 * zoom}
              height={54 * 2.8 * zoom}
              fill="#D93025"
              stroke="#B31412"
              strokeWidth="1.5"
              rx={26 * zoom}
            />
            {/* Inner Football Pitch */}
            <rect
              x={worldToScreen(-34, -144).x}
              y={worldToScreen(-34, -144).y}
              width={68 * 2.8 * zoom}
              height={38 * 2.8 * zoom}
              fill="#34A853"
              stroke="#FFFFFF"
              strokeWidth="1"
              rx={6 * zoom}
            />
            {/* White Pitch Centerline */}
            <line
              x1={worldToScreen(0, -144).x}
              y1={worldToScreen(0, -144).y}
              x2={worldToScreen(0, -106).x}
              y2={worldToScreen(0, -106).y}
              stroke="#FFFFFF"
              strokeWidth="1"
            />
          </g>

          {/* Central Reflection Pool / Fountain */}
          <circle
            cx={worldToScreen(0, -25).x}
            cy={worldToScreen(0, -25).y}
            r={12 * zoom}
            fill="#D2E3FC"
            stroke="#1A73E8"
            strokeWidth="1.5"
          />

          {/* 3. Google Maps Paved Roadways (Clean white roads with crisp border) */}
          {/* Main East-West Boulevard */}
          <rect
            x={worldToScreen(-95, 48).x}
            y={worldToScreen(-95, 48).y}
            width={190 * 2.8 * zoom}
            height={14 * 2.8 * zoom}
            fill="#FFFFFF"
            stroke="#DADCE0"
            strokeWidth="2"
            rx={4}
          />

          {/* North-South Quad Promenade */}
          <rect
            x={worldToScreen(-7, -100).x}
            y={worldToScreen(-7, -100).y}
            width={14 * 2.8 * zoom}
            height={220 * 2.8 * zoom}
            fill="#FFFFFF"
            stroke="#DADCE0"
            strokeWidth="2"
            rx={4}
          />

          {/* Walkway paths between blocks */}
          <line
            x1={worldToScreen(-65, -80).x}
            y1={worldToScreen(-65, -80).y}
            x2={worldToScreen(-65, 80).x}
            y2={worldToScreen(-65, 80).y}
            stroke="#BDC1C6"
            strokeWidth={4 * zoom}
            strokeDasharray="4,4"
          />
          <line
            x1={worldToScreen(65, -80).x}
            y1={worldToScreen(65, -80).y}
            x2={worldToScreen(65, 80).x}
            y2={worldToScreen(65, 80).y}
            stroke="#BDC1C6"
            strokeWidth={4 * zoom}
            strokeDasharray="4,4"
          />

          {/* 4. Campus Buildings (Google Maps 2D Footprints with rounded corners & drop shadow) */}
          {buildings.map((bld) => {
            const isSelected = selectedBuilding?.id === bld.id;
            const pos = worldToScreen(
              bld.position.x - bld.dimensions.width / 2,
              bld.position.z - bld.dimensions.depth / 2
            );
            const w = bld.dimensions.width * 2.8 * zoom;
            const h = bld.dimensions.depth * 2.8 * zoom;

            return (
              <g
                key={bld.id}
                onClick={() => onSelectBuilding(bld)}
                className="cursor-pointer transition-transform hover:scale-[1.01]"
              >
                {/* Building Footprint Polygon */}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={w}
                  height={h}
                  fill={isSelected ? '#E8F0FE' : '#FFFFFF'}
                  stroke={isSelected ? '#1A73E8' : '#DADCE0'}
                  strokeWidth={isSelected ? '2.5' : '1.2'}
                  rx={6 * zoom}
                  filter="url(#buildingShadow)"
                />

                {/* Building Label */}
                <text
                  x={pos.x + w / 2}
                  y={pos.y + h / 2 - 2}
                  textAnchor="middle"
                  fill={isSelected ? '#1A73E8' : '#202124'}
                  fontSize={Math.max(9, Math.min(13, 10 * zoom))}
                  fontWeight={isSelected ? 'bold' : '600'}
                  fontFamily="'Google Sans', Roboto, sans-serif"
                >
                  {bld.name}
                </text>

                {/* Building Code & Floors Tag */}
                <text
                  x={pos.x + w / 2}
                  y={pos.y + h / 2 + 12 * Math.min(1.2, zoom)}
                  textAnchor="middle"
                  fill="#70757A"
                  fontSize={Math.max(8, Math.min(10, 8.5 * zoom))}
                  fontWeight="500"
                >
                  {bld.code} • {bld.numFloors}F
                </text>

                {/* Building Entrance Red Indicator (matching blueprint legend) */}
                <circle
                  cx={pos.x + w / 2}
                  cy={pos.y + h}
                  r={3.5 * zoom}
                  fill="#EA4335"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          {/* 5. GOOGLE MAPS NAVIGATION ROUTE LINE (Vibrant Blue with glow & direction chevrons) */}
          {routeSvgPath && (
            <g>
              {/* Cyan Accent Glow Underneath */}
              <path
                d={routeSvgPath}
                fill="none"
                stroke="#4285F4"
                strokeWidth={11 * zoom}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.35"
              />

              {/* Bold Royal Blue Google Route Line */}
              <path
                d={routeSvgPath}
                fill="none"
                stroke="#1A73E8"
                strokeWidth={7 * zoom}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#routeGlow)"
              />

              {/* White Animated Dash Overlay */}
              <path
                d={routeSvgPath}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={2 * zoom}
                strokeDasharray={`${6 * zoom},${14 * zoom}`}
                strokeDashoffset={-pulseTime * 24}
                strokeLinecap="round"
                opacity="0.85"
              />
            </g>
          )}

          {/* 6. GOOGLE MAPS RED DESTINATION PIN (Official Teardrop Pin Marker) */}
          <g style={{ transform: `translate(${destPos.x}px, ${destPos.y}px)` }} className="transition-transform">
            {/* Pin Drop Shadow */}
            <ellipse cx="0" cy="0" rx={8 * zoom} ry={3 * zoom} fill="rgba(60,64,67,0.3)" />

            {/* Red Teardrop Body */}
            <path
              d="M 0 -28 C -7.5 -28 -13 -22.5 -13 -15 C -13 -6 0 0 0 0 C 0 0 13 -6 13 -15 C 13 -22.5 7.5 -28 0 -28 Z"
              fill="#EA4335"
              stroke="#B31412"
              strokeWidth="1"
              transform={`scale(${Math.max(0.8, Math.min(1.4, zoom))})`}
            />

            {/* White Center Dot */}
            <circle
              cx="0"
              cy={-15 * Math.max(0.8, Math.min(1.4, zoom))}
              r={4 * Math.max(0.8, Math.min(1.4, zoom))}
              fill="#FFFFFF"
            />
          </g>

          {/* 7. GOOGLE MAPS CURRENT LOCATION BLUE DOT (Pulsing Halo & Direction Beam) */}
          <g style={{ transform: `translate(${userPos.x}px, ${userPos.y}px)` }}>
            {/* Direction Beam / Flashlight Cone */}
            {userLocation.heading !== null && (
              <path
                d="M 0 0 L -18 -38 A 45 45 0 0 1 18 -38 Z"
                fill="rgba(66, 133, 244, 0.22)"
                transform={`rotate(${userLocation.heading}) scale(${Math.max(0.8, zoom)})`}
              />
            )}

            {/* Pulsing Light Blue Halo */}
            <circle
              cx="0"
              cy="0"
              r={(12 + Math.sin(pulseTime * 4) * 3) * zoom}
              fill="rgba(66, 133, 244, 0.25)"
            />

            {/* Electric Blue Core Dot */}
            <circle
              cx="0"
              cy="0"
              r={6.5 * zoom}
              fill="#1A73E8"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
          </g>
        </g>
      </svg>

      {/* 8. FLOATING GOOGLE MAPS ROUTE ETA BUBBLE (Matching media_1792744614361_2d0606c6.png) */}
      {routeSvgPath && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-100"
          style={{
            left: `${routeMidpoint.x}px`,
            top: `${routeMidpoint.y - 12}px`,
          }}
        >
          <div className="bg-[#1A73E8] text-white px-3.5 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 text-xs font-black tracking-tight border border-blue-400">
            <span>🚶</span>
            <span>{walkMinutes} min</span>
            <span className="text-blue-200 font-semibold">• {totalDistanceMeters} m</span>
          </div>
          {/* Downward Speech Triangle pointer */}
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-[#1A73E8] mx-auto" />
        </div>
      )}

      {/* Bottom-Left: Google Maps Metric Scale Bar */}
      <div className="absolute bottom-3 left-4 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-[10px] font-bold text-slate-700 flex items-center gap-2">
        <span className="text-[#1A73E8]">Google Maps Style</span>
        <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
          <span>0</span>
          <div className="w-12 h-1 bg-slate-800 rounded-full" />
          <span>100 m</span>
        </div>
      </div>
    </div>
  );
};
