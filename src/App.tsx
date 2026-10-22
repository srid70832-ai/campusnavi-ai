import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { CampusBanner } from './components/CampusBanner';
import { CampusMap3D } from './components/CampusMap3D';
import { NavigationPanel } from './components/NavigationPanel';
import { FeatureCards } from './components/FeatureCards';
import { AiAssistantModal } from './components/AiAssistantModal';
import { ScheduleModal } from './components/ScheduleModal';
import { FacilitiesModal } from './components/FacilitiesModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { FeedbackModal } from './components/FeedbackModal';

import {
  INITIAL_BUILDINGS,
  INITIAL_NAV_NODES,
  INITIAL_NAV_EDGES,
  INITIAL_ROOMS,
  INITIAL_TIMETABLE,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_FACILITIES,
} from './data/campusData';

import {
  CampusBuilding,
  NavNode,
  NavEdge,
  CampusRoom,
  RouteResult,
  UserSession,
} from './types/campus';

import { DijkstraRouter } from './services/dijkstraRouter';
import { VoiceNavigationManager } from './services/voiceNavigation';
import { subscribeToAuth, logoutGoogle } from './services/firebaseAuth';
import { AuthPage } from './components/AuthPage';

export const App: React.FC = () => {
  // Campus State
  const [buildings, setBuildings] = useState<CampusBuilding[]>(INITIAL_BUILDINGS);
  const [nodes, setNodes] = useState<NavNode[]>(INITIAL_NAV_NODES);
  const [edges, setEdges] = useState<NavEdge[]>(INITIAL_NAV_EDGES);
  const [rooms, setRooms] = useState<CampusRoom[]>(INITIAL_ROOMS);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthPageOpen, setIsAuthPageOpen] = useState<boolean>(false);

  // User & Settings
  const [currentUser, setCurrentUser] = useState<UserSession>({
    id: 'USR-01',
    name: 'Sridharan',
    role: 'STUDENT',
    email: 'sridharan@campus.edu',
    department: 'Computer Science & AI',
  });

  // Listen to Google Auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Google User',
          email: firebaseUser.email || '',
          role: 'STUDENT',
          photoUrl: firebaseUser.photoURL || undefined,
          isGoogleAuth: true,
          department: 'Academic Campus',
        });
        setIsAuthenticated(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Navigation State
  // Default origin: CSE Block, Destination: Central Library (matching screenshot)
  const [startNodeId, setStartNodeId] = useState<string>('N_CSE_PLAZA');
  const [destinationNodeId, setDestinationNodeId] = useState<string>('N_LIBRARY_ENTRANCE');
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(
    INITIAL_BUILDINGS.find((b) => b.id === 'LIBRARY') || null
  );

  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Audio / Accessibility settings
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [voiceLanguage, setVoiceLanguage] = useState<'English' | 'Tamil'>('English');
  const [isWheelchairMode, setIsWheelchairMode] = useState(false);

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isFacilitiesModalOpen, setIsFacilitiesModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Compute Route using Dijkstra
  const calculateRoute = (startId: string, destId: string, wheelchairOnly: boolean) => {
    const nodesMap = new Map<string, NavNode>(nodes.map((n) => [n.id, n]));
    const result = DijkstraRouter.findRoute(
      startId,
      destId,
      nodesMap,
      edges,
      wheelchairOnly,
      1.2
    );
    setRouteResult(result);
    setCurrentStepIndex(0);
    return result;
  };

  // Initial calculation on mount
  useEffect(() => {
    calculateRoute(startNodeId, destinationNodeId, isWheelchairMode);
  }, []);

  // Update route when settings change
  const handleRecalculateRoute = () => {
    calculateRoute(startNodeId, destinationNodeId, isWheelchairMode);
  };

  // Handle Swap Locations
  const handleSwapLocations = () => {
    const tempStart = startNodeId;
    setStartNodeId(destinationNodeId);
    setDestinationNodeId(tempStart);
    calculateRoute(destinationNodeId, tempStart, isWheelchairMode);
  };

  // Select building from map click
  const handleSelectBuildingOnMap = (bld: CampusBuilding) => {
    setSelectedBuilding(bld);
    const destNode =
      bld.id === 'CSE_BLOCK' ? 'N_CSE_PLAZA' :
      bld.id === 'LIBRARY' ? 'N_LIBRARY_ENTRANCE' :
      bld.id === 'MAIN_BLOCK' ? 'N_MAIN_ENTRANCE' :
      bld.id === 'AUDITORIUM' ? 'N_AUDITORIUM_ENTRANCE' :
      bld.id === 'CAFETERIA' ? 'N_CAFE_ENTRANCE' :
      bld.id === 'ADMIN_BLOCK' ? 'N_ADMIN_ENTRANCE' :
      bld.id === 'HOSTEL' ? 'N_HOSTEL_ENTRANCE' :
      bld.id === 'SPORTS_GROUND' ? 'N_SPORTS_ENTRANCE' : 'N_PARKING_ENTRANCE';
    setDestinationNodeId(destNode);
    calculateRoute(startNodeId, destNode, isWheelchairMode);
  };

  // Turn-by-turn Navigation Engine
  const handleStartNavigation = () => {
    if (!routeResult || !routeResult.success || routeResult.segments.length === 0) {
      calculateRoute(startNodeId, destinationNodeId, isWheelchairMode);
    }
    setIsNavigating(true);
    setCurrentStepIndex(0);

    // Speak first turn instruction
    if (isVoiceEnabled && routeResult && routeResult.segments.length > 0) {
      const seg = routeResult.segments[0];
      VoiceNavigationManager.getInstance().speak(
        seg.instructionEn,
        seg.instructionTa,
        true
      );
    }
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setCurrentStepIndex(0);
    VoiceNavigationManager.getInstance().stop();
  };

  // Step progression simulation during active navigation
  useEffect(() => {
    if (!isNavigating || !routeResult || !routeResult.segments.length) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next < routeResult.segments.length) {
          const seg = routeResult.segments[next];
          if (isVoiceEnabled) {
            VoiceNavigationManager.getInstance().speak(
              seg.instructionEn,
              seg.instructionTa
            );
          }
          return next;
        } else {
          // Reached destination!
          if (isVoiceEnabled) {
            VoiceNavigationManager.getInstance().speak(
              'Destination reached. You have arrived at your destination!',
              'இலக்கை அடைந்துவிட்டீர்கள்!',
              true
            );
          }
          setIsNavigating(false);
          return prev;
        }
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isNavigating, routeResult, isVoiceEnabled]);

  // Sidebar Tab Switching
  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'ai') setIsAiModalOpen(true);
    if (tab === 'schedule') setIsScheduleModalOpen(true);
    if (tab === 'facilities') setIsFacilitiesModalOpen(true);
    if (tab === 'feedback') setIsFeedbackModalOpen(true);
    if (tab.startsWith('admin-')) setIsAdminModalOpen(true);
    if (tab === 'navigation' && !isNavigating) handleStartNavigation();
  };

  // Feature Cards Quick Trigger
  const handleSelectFeature = (key: string) => {
    if (key === 'find') {
      const searchEl = document.querySelector('input[type="text"]') as HTMLInputElement;
      searchEl?.focus();
    } else if (key === 'dijkstra') {
      handleRecalculateRoute();
    } else if (key === '3d-map') {
      setIs3DMode((prev) => !prev);
    } else if (key === 'voice') {
      const newVoiceState = !isVoiceEnabled;
      setIsVoiceEnabled(newVoiceState);
      VoiceNavigationManager.getInstance().setEnabled(newVoiceState);
      if (newVoiceState) {
        VoiceNavigationManager.getInstance().speak(
          'Turn-by-turn voice guidance enabled.',
          'குரல் வழிகாட்டுதல் இயக்கப்பட்டது.'
        );
      }
    } else if (key === 'admin') {
      setIsAdminModalOpen(true);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased ${isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-[#F4F7FB] text-slate-900'}`}>
      {/* If Auth Page is open, show split-screen authentication */}
      {isAuthPageOpen ? (
        <AuthPage
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthenticated(true);
            setIsAuthPageOpen(false);
          }}
          onBrowseAsGuest={() => setIsAuthPageOpen(false)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      ) : (
        <>
          {/* Top Header Bar */}
          <TopBar
            buildings={buildings}
            rooms={rooms}
            currentUser={currentUser}
            onChangeUserRole={(role) => setCurrentUser((u) => ({ ...u, role }))}
            onUserAuthUpdate={(user) => {
              setCurrentUser(user);
              setIsAuthenticated(user.isGoogleAuth || false);
            }}
            onOpenAuthPage={() => setIsAuthPageOpen(true)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            onSelectDestination={(nodeId, bld) => {
              setDestinationNodeId(nodeId);
              if (bld) setSelectedBuilding(bld);
              calculateRoute(startNodeId, nodeId, isWheelchairMode);
            }}
          />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          currentUser={currentUser}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Center / Right Content Work Area */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Top Banner: Explore Your Campus Easily */}
          <CampusBanner
            buildings={buildings}
            nodes={nodes}
            startNodeId={startNodeId}
            destinationNodeId={destinationNodeId}
            onChangeStartNode={(id) => {
              setStartNodeId(id);
              calculateRoute(id, destinationNodeId, isWheelchairMode);
            }}
            onChangeDestinationNode={(id) => {
              setDestinationNodeId(id);
              const bld = buildings.find((b) => b.id === id) || null;
              if (bld) setSelectedBuilding(bld);
              calculateRoute(startNodeId, id, isWheelchairMode);
            }}
            onSwapLocations={handleSwapLocations}
            onGetDirections={handleRecalculateRoute}
          />

          {/* Central Map & Navigation Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[580px] min-h-[580px]">
            {/* Interactive 3D Campus Map (matching 70% width in screenshot) */}
            <div className="lg:col-span-8 h-full rounded-2xl overflow-hidden shadow-xs border border-slate-200/90 relative">
              <CampusMap3D
                buildings={buildings}
                nodes={nodes}
                selectedBuilding={selectedBuilding}
                onSelectBuilding={handleSelectBuildingOnMap}
                routeResult={routeResult}
                startNodeId={startNodeId}
                destinationNodeId={destinationNodeId}
                is3DMode={is3DMode}
                onToggle3D={setIs3DMode}
                currentStepIndex={currentStepIndex}
              />
            </div>

            {/* Right Turn-by-Turn Navigation Panel (matching 30% width in screenshot) */}
            <div className="lg:col-span-4 h-full">
              <NavigationPanel
                destinationBuilding={selectedBuilding}
                routeResult={routeResult}
                isNavigating={isNavigating}
                currentStepIndex={currentStepIndex}
                onStartNavigation={handleStartNavigation}
                onStopNavigation={handleStopNavigation}
                onClose={() => setSelectedBuilding(null)}
                isVoiceEnabled={isVoiceEnabled}
                onToggleVoice={() => {
                  const state = !isVoiceEnabled;
                  setIsVoiceEnabled(state);
                  VoiceNavigationManager.getInstance().setEnabled(state);
                }}
                isWheelchairMode={isWheelchairMode}
                onToggleWheelchair={() => {
                  const state = !isWheelchairMode;
                  setIsWheelchairMode(state);
                  calculateRoute(startNodeId, destinationNodeId, state);
                }}
                voiceLanguage={voiceLanguage}
                onChangeVoiceLanguage={(lang) => {
                  setVoiceLanguage(lang);
                  VoiceNavigationManager.getInstance().setLanguage(lang);
                }}
              />
            </div>
          </div>

          {/* Bottom 5 Feature Cards */}
          <FeatureCards onSelectFeature={handleSelectFeature} />
        </main>
      </div>

      {/* Modals */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        buildings={buildings}
        rooms={rooms}
        facilities={INITIAL_FACILITIES}
        onNavigateToDestination={(destId, bld) => {
          setDestinationNodeId(destId);
          if (bld) setSelectedBuilding(bld);
          calculateRoute(startNodeId, destId, isWheelchairMode);
        }}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        timetable={INITIAL_TIMETABLE}
        buildings={buildings}
        onNavigateToRoom={(nodeId, bld) => {
          setDestinationNodeId(nodeId);
          if (bld) setSelectedBuilding(bld);
          calculateRoute(startNodeId, nodeId, isWheelchairMode);
        }}
      />

      <FacilitiesModal
        isOpen={isFacilitiesModalOpen}
        onClose={() => setIsFacilitiesModalOpen(false)}
        facilities={INITIAL_FACILITIES}
        emergencyContacts={INITIAL_EMERGENCY_CONTACTS}
        buildings={buildings}
        onNavigateToFacility={(nodeId, bld) => {
          setDestinationNodeId(nodeId);
          if (bld) setSelectedBuilding(bld);
          calculateRoute(startNodeId, nodeId, isWheelchairMode);
        }}
      />

      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUser={currentUser}
        buildings={buildings}
        nodes={nodes}
        edges={edges}
        rooms={rooms}
        onUpdateEdge={(edgeId, isBlocked, reason) => {
          setEdges((prev) =>
            prev.map((e) => (e.id === edgeId ? { ...e, isBlocked, closureReason: reason } : e))
          );
        }}
        onApproveBuilding={(bldId) => {
          setBuildings((prev) =>
            prev.map((b) => (b.id === bldId ? { ...b, status: 'PUBLISHED' } : b))
          );
        }}
        onAddBuilding={(newBld) => {
          setBuildings((prev) => [...prev, newBld]);
        }}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
        </>
      )}
    </div>
  );
};
