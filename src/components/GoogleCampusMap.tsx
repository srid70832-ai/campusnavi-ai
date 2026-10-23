import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  RotateCcw,
  Footprints,
} from 'lucide-react';
import { CampusBuilding, NavNode, RouteResult, UserLiveLocation } from '../types/campus';
import { INITIAL_BUILDINGS, INITIAL_NAV_NODES } from '../data/campusData';

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

// Campus geographic reference anchor (centroid in meters)
const CAMPUS_CENTER_X = 0;
const CAMPUS_CENTER_Z = -35;
const BASE_SCALE = 2.15; // 1 world meter = 2.15 screen pixels at 1.0x zoom

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

  // Dynamic dimensions of container
  const [dimensions, setDimensions] = useState({ width: 900, height: 580 });

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showBlueprintOverlay, setShowBlueprintOverlay] = useState(false);
  const [mapStyleMode, setMapStyleMode] = useState<'standard' | 'satellite'>('standard');

  // Animation frame for route pulsing & user dot
  const [pulseTime, setPulseTime] = useState(0);

  // Guarantee buildings and nodes are never empty
  const activeBuildings = buildings && buildings.length > 0 ? buildings : INITIAL_BUILDINGS;
  const activeNodes = nodes && nodes.length > 0 ? nodes : INITIAL_NAV_NODES;

  // Clamps panning so campus is always in the viewport
  const clampPan = (pX: number, pY: number) => {
    const limitX = Math.max(180, dimensions.width * 0.38);
    const limitY = Math.max(180, dimensions.height * 0.38);
    return {
      x: Math.max(-limitX, Math.min(limitX, pX)),
      y: Math.max(-limitY, Math.min(limitY, pY)),
    };
  };

  // Update container dimensions on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 100 && clientHeight > 100) {
          setDimensions({ width: clientWidth, height: clientHeight });
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(updateSize);
      ro.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      ro?.disconnect();
    };
  }, []);

  // Continuous animation loop for pulsing line and user radar
  useEffect(() => {
    let animId: number;
    const update = () => {
      setPulseTime((t) => t + 0.05);
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Convert 3D world meters (x, z) to screen pixel coordinates centered on canvas
  const worldToScreen = useCallback(
    (worldX: number, worldZ: number) => {
      const scale = BASE_SCALE * zoom;
      return {
        x: dimensions.width / 2 + pan.x + (worldX - CAMPUS_CENTER_X) * scale,
        y: dimensions.height / 2 + pan.y + (worldZ - CAMPUS_CENTER_Z) * scale,
      };
    },
    [dimensions, pan, zoom]
  );

  // Smoothly center on selected building when user chooses a destination
  useEffect(() => {
    if (selectedBuilding) {
      const scale = BASE_SCALE * zoom;
      const targetX = -(selectedBuilding.position.x - CAMPUS_CENTER_X) * scale;
      const targetY = -(selectedBuilding.position.z - CAMPUS_CENTER_Z) * scale;
      setPan(clampPan(targetX, targetY));
    }
  }, [selectedBuilding?.id]);

  // Center on user when follow mode is active
  useEffect(() => {
    if (isFollowUser && userLocation) {
      const scale = BASE_SCALE * zoom;
      const targetX = -(userLocation.x - CAMPUS_CENTER_X) * scale;
      const targetY = -(userLocation.z - CAMPUS_CENTER_Z) * scale;
      setPan(clampPan(targetX, targetY));
    }
  }, [isFollowUser, userLocation?.x, userLocation?.z]);

  // Zoom In / Out Handlers
  const handleZoomIn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoom((z) => Math.min(3.5, +(z * 1.25).toFixed(2)));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoom((z) => Math.max(0.45, +(z / 1.25).toFixed(2)));
  };

  const handleResetView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
  };

  const handleRecenterUser = () => {
    if (userLocation && (userLocation.x !== 0 || userLocation.z !== 0)) {
      const scale = BASE_SCALE * zoom;
      setPan(clampPan(-(userLocation.x - CAMPUS_CENTER_X) * scale, -(userLocation.z - CAMPUS_CENTER_Z) * scale));
    } else {
      handleResetView();
    }
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan(clampPan(e.clientX - dragStartRef.current.x, e.clientY - dragStartRef.current.y));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan(clampPan(e.touches[0].clientX - dragStartRef.current.x, e.touches[0].clientY - dragStartRef.current.y));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom centered on cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const factor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((z) => Math.max(0.45, Math.min(3.5, +(z * factor).toFixed(2))));
  };

  // Build SVG Path for Route Line
  let routeSvgPath = '';
  let routeMidpoint = { x: dimensions.width / 2, y: dimensions.height / 2 };
  if (routeResult?.success && routeResult.pathNodes.length >= 2) {
    const pts = routeResult.pathNodes.map((n) => {
      const zVal = n.z !== undefined ? n.z : n.y;
      return worldToScreen(n.x, zVal);
    });

    routeSvgPath = pts.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const midIdx = Math.floor(pts.length / 2);
    routeMidpoint = pts[midIdx] || pts[0];
  }

  // Find destination building coordinates for Red Pin
  const destBuilding =
    activeBuildings.find((b) => {
      const destNode = activeNodes.find((n) => n.id === destinationNodeId);
      return destNode && destNode.buildingId === b.id;
    }) ||
    selectedBuilding ||
    activeBuildings[0];

  const destPos = destBuilding
    ? worldToScreen(destBuilding.position.x, destBuilding.position.z + destBuilding.dimensions.depth / 2)
    : worldToScreen(0, -35);

  const userPos = worldToScreen(userLocation.x, userLocation.z);

  const totalDistanceMeters = routeResult?.totalDistanceMeters
    ? Math.round(routeResult.totalDistanceMeters)
    : 280;
  const walkMinutes = Math.max(1, Math.round(totalDistanceMeters / 70));

  // Current turn instruction for top navigation banner
  const currentInstruction =
    routeResult?.segments && routeResult.segments[currentStepIndex]
      ? routeResult.segments[currentStepIndex].instructionEn
      : 'Head towards your destination';

  const scale = BASE_SCALE * zoom;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className={`relative w-full h-full select-none overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing ${
        mapStyleMode === 'satellite' ? 'bg-[#0f172a]' : 'bg-[#F2F4F7]'
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
                <span>
                  Remaining: {totalDistanceMeters} m ({walkMinutes} min)
                </span>
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            Live
          </span>
        </div>
      )}

      {/* Floating 2D / 3D Mode Switcher (Matching Google Maps View Options) */}
      <div className="absolute top-4 left-4 z-20 flex bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-md border border-slate-200">
        <button
          onClick={() => onToggle3D(false)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
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
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
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
      <div className="absolute top-16 left-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setShowBlueprintOverlay(!showBlueprintOverlay)}
          className={`px-3 py-1.5 rounded-xl backdrop-blur-md shadow-md border text-xs font-semibold flex items-center gap-1.5 transition ${
            showBlueprintOverlay
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-white'
          }`}
        >
          <Layers size={13} />
          <span>{showBlueprintOverlay ? 'Hide Blueprint' : 'Show Blueprint'}</span>
        </button>

        <button
          onClick={onEnableGPS}
          title="Enable Live Device GPS"
          className={`px-3 py-1.5 rounded-xl backdrop-blur-md shadow-md border text-xs font-semibold flex items-center gap-1.5 transition ${
            userLocation.isLiveGPS
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-white'
          }`}
        >
          <Radio size={13} className={userLocation.isLiveGPS ? 'animate-pulse' : ''} />
          <span>{userLocation.isLiveGPS ? 'GPS Active' : 'Enable GPS'}</span>
        </button>
      </div>

      {/* Right Controls: Reset View, Recenter GPS, Zoom In, Zoom Level, Zoom Out */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Reset / Center Campus View */}
        <button
          onClick={handleResetView}
          title="Fit Full Campus in Center"
          className="w-10 h-10 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#1A73E8] hover:bg-slate-50 transition transform active:scale-95"
        >
          <Compass size={18} className="text-[#1A73E8]" />
        </button>

        {/* Recenter on User GPS */}
        <button
          onClick={handleRecenterUser}
          title="Recenter on My Location"
          className="w-10 h-10 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#1A73E8] hover:bg-slate-50 transition transform active:scale-95"
        >
          <Crosshair size={18} />
        </button>

        {/* Follow User Toggle */}
        {onToggleFollowUser && (
          <button
            onClick={onToggleFollowUser}
            title={isFollowUser ? 'Disable Follow Mode' : 'Follow My Location While Walking'}
            className={`w-10 h-10 rounded-2xl shadow-md border flex items-center justify-center transition transform active:scale-95 ${
              isFollowUser
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-white text-slate-700 border-slate-200 hover:text-emerald-600'
            }`}
          >
            <Navigation size={16} className={isFollowUser ? 'animate-bounce' : ''} />
          </button>
        )}

        {/* High Precision Zoom In / Zoom Out Widget */}
        <div className="flex flex-col bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden mt-1">
          <button
            onClick={handleZoomIn}
            title="Zoom In (+)"
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-[#1A73E8] transition active:scale-95 border-b border-slate-100"
          >
            <Plus size={18} />
          </button>

          {/* Zoom % badge */}
          <div className="w-10 py-1 text-center text-[10px] font-bold text-slate-400 bg-slate-50/80 border-b border-slate-100 select-none">
            {Math.round(zoom * 100)}%
          </div>

          <button
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-[#1A73E8] transition active:scale-95"
          >
            <Minus size={18} />
          </button>
        </div>
      </div>

      {/* Main SVG Vector Canvas: Google Maps Theme */}
      <svg
        className="w-full h-full absolute inset-0 overflow-visible"
        style={{ pointerEvents: 'auto' }}
      >
        <defs>
          {/* Google Maps Blue Route Glow Filter */}
          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1a73e8" floodOpacity="0.45" />
          </filter>

          {/* Building Soft Drop Shadow */}
          <filter id="buildingShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#3c4043" floodOpacity="0.10" />
          </filter>
        </defs>

        <g>
          {/* 1. Optional Master Blueprint Underlay Image */}
          {showBlueprintOverlay && (
            <image
              href="/sample-blueprint.jpg"
              x={worldToScreen(-115, -165).x}
              y={worldToScreen(-115, -165).y}
              width={230 * scale}
              height={290 * scale}
              opacity={0.35}
              preserveAspectRatio="none"
            />
          )}

          {/* 2. Google Maps Parks & Green Turf Areas */}
          {/* Central Quad Park */}
          <rect
            x={worldToScreen(-35, -30).x}
            y={worldToScreen(-35, -30).y}
            width={70 * scale}
            height={85 * scale}
            fill="#E6F4EA"
            stroke="#CEEAD6"
            strokeWidth="1.5"
            rx={10 * zoom}
          />

          {/* North Sports Lawn Area */}
          <rect
            x={worldToScreen(-70, -170).x}
            y={worldToScreen(-70, -170).y}
            width={140 * scale}
            height={65 * scale}
            fill="#EBF7EE"
            stroke="#CEEAD6"
            strokeWidth="1.2"
            rx={14 * zoom}
          />

          {/* Sports Ground Athletic Running Track (Red Oval with inner Football pitch) */}
          <g>
            <rect
              x={worldToScreen(-48, -162).x}
              y={worldToScreen(-48, -162).y}
              width={96 * scale}
              height={50 * scale}
              fill="#D93025"
              stroke="#B31412"
              strokeWidth="1.5"
              rx={25 * scale}
            />
            {/* Inner Football Pitch */}
            <rect
              x={worldToScreen(-38, -154).x}
              y={worldToScreen(-38, -154).y}
              width={76 * scale}
              height={34 * scale}
              fill="#34A853"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              rx={6 * zoom}
            />
            {/* White Pitch Centerline */}
            <line
              x1={worldToScreen(0, -154).x}
              y1={worldToScreen(0, -154).y}
              x2={worldToScreen(0, -120).x}
              y2={worldToScreen(0, -120).y}
              stroke="#FFFFFF"
              strokeWidth="1"
            />
            {/* Center Circle */}
            <circle
              cx={worldToScreen(0, -137).x}
              cy={worldToScreen(0, -137).y}
              r={6 * scale}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1"
            />
          </g>

          {/* Central Reflection Pool / Fountain */}
          <circle
            cx={worldToScreen(0, -15).x}
            cy={worldToScreen(0, -15).y}
            r={10 * scale}
            fill="#D2E3FC"
            stroke="#1A73E8"
            strokeWidth="1.5"
          />

          {/* 3. Google Maps Paved Roadways (Clean white roads with crisp border) */}
          {/* Main East-West Boulevard */}
          <rect
            x={worldToScreen(-95, 48).x}
            y={worldToScreen(-95, 48).y}
            width={190 * scale}
            height={14 * scale}
            fill="#FFFFFF"
            stroke="#DADCE0"
            strokeWidth="2"
            rx={4}
          />

          {/* North-South Quad Promenade */}
          <rect
            x={worldToScreen(-7, -115).x}
            y={worldToScreen(-7, -115).y}
            width={14 * scale}
            height={185 * scale}
            fill="#FFFFFF"
            stroke="#DADCE0"
            strokeWidth="2"
            rx={4}
          />

          {/* West Campus Ring Road */}
          <line
            x1={worldToScreen(-75, -110).x}
            y1={worldToScreen(-75, -110).y}
            x2={worldToScreen(-75, 55).x}
            y2={worldToScreen(-75, 55).y}
            stroke="#FFFFFF"
            strokeWidth={10 * scale}
            strokeLinecap="round"
          />
          <line
            x1={worldToScreen(-75, -110).x}
            y1={worldToScreen(-75, -110).y}
            x2={worldToScreen(-75, 55).x}
            y2={worldToScreen(-75, 55).y}
            stroke="#DADCE0"
            strokeWidth={1.5}
            strokeDasharray="4,4"
          />

          {/* East Campus Ring Road */}
          <line
            x1={worldToScreen(75, -110).x}
            y1={worldToScreen(75, -110).y}
            x2={worldToScreen(75, 55).x}
            y2={worldToScreen(75, 55).y}
            stroke="#FFFFFF"
            strokeWidth={10 * scale}
            strokeLinecap="round"
          />
          <line
            x1={worldToScreen(75, -110).x}
            y1={worldToScreen(75, -110).y}
            x2={worldToScreen(75, 55).x}
            y2={worldToScreen(75, 55).y}
            stroke="#DADCE0"
            strokeWidth={1.5}
            strokeDasharray="4,4"
          />

          {/* Walkways between Academic blocks */}
          <line
            x1={worldToScreen(-60, 40).x}
            y1={worldToScreen(-60, 40).y}
            x2={worldToScreen(0, 48).x}
            y2={worldToScreen(0, 48).y}
            stroke="#BDC1C6"
            strokeWidth={3 * zoom}
            strokeDasharray="4,3"
          />
          <line
            x1={worldToScreen(5, 25).x}
            y1={worldToScreen(5, 25).y}
            x2={worldToScreen(0, 48).x}
            y2={worldToScreen(0, 48).y}
            stroke="#BDC1C6"
            strokeWidth={3 * zoom}
            strokeDasharray="4,3"
          />
          <line
            x1={worldToScreen(-50, -10).x}
            y1={worldToScreen(-50, -10).y}
            x2={worldToScreen(-7, -10).x}
            y2={worldToScreen(-7, -10).y}
            stroke="#BDC1C6"
            strokeWidth={3 * zoom}
            strokeDasharray="4,3"
          />
          <line
            x1={worldToScreen(45, -25).x}
            y1={worldToScreen(45, -25).y}
            x2={worldToScreen(7, -25).x}
            y2={worldToScreen(7, -25).y}
            stroke="#BDC1C6"
            strokeWidth={3 * zoom}
            strokeDasharray="4,3"
          />

          {/* Main Entrance Gate Arch at South (Matching Blueprint #24) */}
          <g>
            <rect
              x={worldToScreen(-20, 72).x}
              y={worldToScreen(-20, 72).y}
              width={40 * scale}
              height={7 * scale}
              fill="#374151"
              rx={3}
            />
            <text
              x={worldToScreen(0, 76.5).x}
              y={worldToScreen(0, 76.5).y}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize={Math.max(8, 8 * zoom)}
              fontWeight="bold"
            >
              MAIN ENTRANCE GATE
            </text>
          </g>

          {/* 4. Campus Buildings (Google Maps 2D Footprints with rounded corners & drop shadow) */}
          {activeBuildings.map((bld) => {
            const isSelected = selectedBuilding?.id === bld.id;
            const pos = worldToScreen(
              bld.position.x - bld.dimensions.width / 2,
              bld.position.z - bld.dimensions.depth / 2
            );
            const w = bld.dimensions.width * scale;
            const h = bld.dimensions.depth * scale;

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

                {/* Building Label Pill Background for Perfect Readability */}
                <rect
                  x={pos.x + 4}
                  y={pos.y + h / 2 - 14}
                  width={Math.max(20, w - 8)}
                  height={26}
                  fill={isSelected ? '#1A73E8' : '#F8FAFC'}
                  stroke={isSelected ? '#1A73E8' : '#E2E8F0'}
                  strokeWidth="0.8"
                  rx={6}
                  opacity="0.95"
                />

                {/* Building Name */}
                <text
                  x={pos.x + w / 2}
                  y={pos.y + h / 2 - 2}
                  textAnchor="middle"
                  fill={isSelected ? '#FFFFFF' : '#1E293B'}
                  fontSize={Math.max(9, Math.min(12, 9.5 * zoom))}
                  fontWeight={isSelected ? 'bold' : '600'}
                  fontFamily="'Google Sans', Roboto, sans-serif"
                >
                  {w < 70 && bld.name.length > 12 ? bld.code : bld.name}
                </text>

                {/* Building Code & Floors Tag */}
                <text
                  x={pos.x + w / 2}
                  y={pos.y + h / 2 + 9}
                  textAnchor="middle"
                  fill={isSelected ? '#DBEAFE' : '#64748B'}
                  fontSize={Math.max(7.5, Math.min(9.5, 8 * zoom))}
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

          {/* 5. GOOGLE MAPS NAVIGATION ROUTE LINE (Vibrant Blue with glow & direction dashes) */}
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
          <g
            style={{ transform: `translate(${destPos.x}px, ${destPos.y}px)` }}
            className="transition-transform"
          >
            {/* Pin Drop Shadow */}
            <ellipse cx="0" cy="0" rx={8 * zoom} ry={3 * zoom} fill="rgba(60,64,67,0.3)" />

            {/* Red Teardrop Body */}
            <path
              d="M 0 -28 C -7.5 -28 -13 -22.5 -13 -15 C -13 -6 0 0 0 0 C 0 0 13 -6 13 -15 C 13 -22.5 7.5 -28 0 -28 Z"
              fill="#EA4335"
              stroke="#B31412"
              strokeWidth="1"
              transform={`scale(${Math.max(0.85, Math.min(1.4, zoom))})`}
            />

            {/* White Center Dot */}
            <circle
              cx="0"
              cy={-15 * Math.max(0.85, Math.min(1.4, zoom))}
              r={4 * Math.max(0.85, Math.min(1.4, zoom))}
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
              r={(14 + Math.sin(pulseTime * 3) * 4) * zoom}
              fill="rgba(66, 133, 244, 0.25)"
            />

            {/* White Outer Ring */}
            <circle cx="0" cy="0" r={8 * zoom} fill="#FFFFFF" filter="url(#buildingShadow)" />

            {/* Vibrant Blue Core Location Dot */}
            <circle cx="0" cy="0" r={5.5 * zoom} fill="#1A73E8" />
          </g>
        </g>
      </svg>

      {/* Floating Google Maps Style Route Info Bubble (Positioned near Route Midpoint) */}
      {routeSvgPath && (
        <div
          className="absolute pointer-events-none z-20 transform -translate-x-1/2 -translate-y-full transition-all duration-300"
          style={{
            left: `${routeMidpoint.x}px`,
            top: `${routeMidpoint.y - 12}px`,
          }}
        >
          <div className="bg-[#1A73E8] text-white px-3 py-1.5 rounded-full shadow-xl flex items-center gap-2 border-2 border-white animate-bounce [animation-duration:2.5s]">
            <Footprints size={14} className="text-white" />
            <span className="text-xs font-black tracking-tight">{walkMinutes} min</span>
            <span className="text-[11px] font-semibold text-blue-100">
              ({totalDistanceMeters} m)
            </span>
          </div>
        </div>
      )}

      {/* Bottom Scale Indicator Bar (Google Maps style) */}
      <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl shadow-xs border border-slate-200 text-[10px] font-bold text-slate-600">
        <span className="text-[#1A73E8]">Google Maps Style</span>
        <span>•</span>
        <div className="flex items-center gap-1">
          <span>0</span>
          <div className="w-12 h-1 bg-slate-800 rounded-full" />
          <span>{Math.round(50 / zoom)} m</span>
        </div>
      </div>
    </div>
  );
};
