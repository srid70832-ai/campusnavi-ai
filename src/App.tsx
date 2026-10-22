import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { CampusBanner } from './components/CampusBanner';
import { CampusMap3D } from './components/CampusMap3D';
import { NavigationPanel } from './components/NavigationPanel';
import { FeatureCards } from './components/FeatureCards';

// Dedicated Full-Page Tab Views (No modal popups over the map!)
import { FindLocationView } from './components/views/FindLocationView';
import { AiAssistantView } from './components/views/AiAssistantView';
import { ScheduleView } from './components/views/ScheduleView';
import { FacilitiesView } from './components/views/FacilitiesView';
import { FeedbackView } from './components/views/FeedbackView';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import { BlueprintManagerPage } from './components/blueprint/BlueprintManagerPage';
import { BlueprintParserService } from './services/blueprintParserService';

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
  UserLiveLocation,
} from './types/campus';

import { DijkstraRouter } from './services/dijkstraRouter';
import { VoiceNavigationManager } from './services/voiceNavigation';
import { GeolocationService } from './services/geolocationService';
import { subscribeToAuth, logoutGoogle } from './services/firebaseAuth';
import { AuthPage } from './components/AuthPage';
import { BlueprintAnalysisResult } from './services/blueprintAiService';

export const App: React.FC = () => {
  // Campus State (Loads published blueprint if available)
  const [buildings, setBuildings] = useState<CampusBuilding[]>(() => {
    const published = BlueprintParserService.loadPublishedBlueprint();
    if (published && published.detections && published.detections.length > 0) {
      return BlueprintParserService.detectionsToCampusBuildings(published.detections);
    }
    return INITIAL_BUILDINGS;
  });
  const [nodes, setNodes] = useState<NavNode[]>(() => {
    const published = BlueprintParserService.loadPublishedBlueprint();
    if (published && published.nodes && published.nodes.length > 0) {
      return published.nodes;
    }
    return INITIAL_NAV_NODES;
  });
  const [edges, setEdges] = useState<NavEdge[]>(() => {
    const published = BlueprintParserService.loadPublishedBlueprint();
    if (published && published.edges && published.edges.length > 0) {
      return published.edges;
    }
    return INITIAL_NAV_EDGES;
  });
  const [rooms, setRooms] = useState<CampusRoom[]>(INITIAL_ROOMS);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthPageOpen, setIsAuthPageOpen] = useState<boolean>(false);

  // User & Settings
  const [currentUser, setCurrentUser] = useState<UserSession>({
    id: 'USR-01',
    name: 'Sridharan',
    role: 'ADMIN',
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
          role: 'ADMIN',
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

  // Real-Time User Geolocation Tracking
  const [userLocation, setUserLocation] = useState<UserLiveLocation>(() =>
    GeolocationService.getInstance().getLocation()
  );
  const [isFollowUser, setIsFollowUser] = useState(false);

  useEffect(() => {
    const geo = GeolocationService.getInstance();
    const unsub = geo.subscribe((loc) => {
      setUserLocation(loc);
    });
    return () => unsub();
  }, []);

  const handleToggleGPS = () => {
    const geo = GeolocationService.getInstance();
    if (userLocation.isLiveGPS) {
      geo.stopLiveTracking();
    } else {
      geo.startLiveTracking();
    }
  };

  // Navigation State
  // Default origin: CSE Block, Destination: Central Library
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
      bld.id === 'CSE_BLOCK'
        ? 'N_CSE_PLAZA'
        : bld.id === 'LIBRARY'
        ? 'N_LIBRARY_ENTRANCE'
        : bld.id === 'MAIN_BLOCK'
        ? 'N_MAIN_ENTRANCE'
        : bld.id === 'AUDITORIUM'
        ? 'N_AUDITORIUM_ENTRANCE'
        : bld.id === 'CAFETERIA'
        ? 'N_CAFE_ENTRANCE'
        : bld.id === 'ADMIN_BLOCK'
        ? 'N_ADMIN_ENTRANCE'
        : bld.id === 'HOSTEL'
        ? 'N_HOSTEL_ENTRANCE'
        : bld.id === 'SPORTS_GROUND'
        ? 'N_SPORTS_ENTRANCE'
        : 'N_PARKING_ENTRANCE';
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

  // Sidebar Tab Switching - dedicated full-page views, no modal overlays!
  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'navigation' && !isNavigating) {
      handleStartNavigation();
    }
  };

  // Navigate to destination from search or schedule
  const handleNavigateToDestinationFromView = (
    destNodeId: string,
    bld: CampusBuilding | null
  ) => {
    setDestinationNodeId(destNodeId);
    if (bld) setSelectedBuilding(bld);
    calculateRoute(startNodeId, destNodeId, isWheelchairMode);
    setActiveTab('home'); // Switch back to map with active route!
  };

  // Feature Cards Quick Trigger
  const handleSelectFeature = (key: string) => {
    if (key === 'find') {
      setActiveTab('find');
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
      setActiveTab('admin-locations');
    }
  };

  // Handle AI Blueprint Scan Result commit
  const handleApplyBlueprintScan = (result: BlueprintAnalysisResult) => {
    // Add newly detected buildings
    setBuildings((prev) => {
      const existingIds = new Set(prev.map((b) => b.id));
      const newUnique = result.detectedBuildings.filter((b) => !existingIds.has(b.id));
      return [...prev, ...newUnique];
    });

    // Add newly detected nodes
    setNodes((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newUnique = result.detectedNodes.filter((n) => !existingIds.has(n.id));
      return [...prev, ...newUnique];
    });

    // Add newly detected edges
    setEdges((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const newUnique = result.detectedEdges.filter((e) => !existingIds.has(e.id));
      return [...prev, ...newUnique];
    });

    // Add newly detected rooms
    setRooms((prev) => {
      const existingIds = new Set(prev.map((r) => r.id));
      const newUnique = result.detectedRooms.filter((r) => !existingIds.has(r.id));
      return [...prev, ...newUnique];
    });
  };

  // Handle Full Blueprint Release Publish
  const handlePublishBlueprint = (meta: any) => {
    const blds = BlueprintParserService.detectionsToCampusBuildings(meta.detections);
    setBuildings(blds);
    setNodes(meta.nodes);
    setEdges(meta.edges);
    setActiveTab('home');
    calculateRoute('N_MAIN_GATE', 'N_LIBRARY_CONCOURSE', isWheelchairMode);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased ${
        isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-[#F4F7FB] text-slate-900'
      }`}
    >
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
              setActiveTab('home');
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
            <main className="flex-1 flex flex-col overflow-y-auto">
              {/* TAB 1: HOME / CAMPUS MAP / NAVIGATION */}
              {(activeTab === 'home' || activeTab === 'map' || activeTab === 'navigation') && (
                <div className="p-4 md:p-6 space-y-5 pb-16 max-w-[1700px] mx-auto w-full">
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

                  {/* Central Map & Navigation Responsive Split Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:h-[580px] xl:h-[620px] min-h-0">
                    {/* Interactive 3D Photorealistic Campus Map */}
                    <div className="lg:col-span-8 h-[400px] md:h-[480px] lg:h-full rounded-3xl overflow-hidden shadow-xs border border-slate-200/90 relative">
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
                        userLocation={userLocation}
                        onEnableGPS={handleToggleGPS}
                        isFollowUser={isFollowUser}
                        onToggleFollowUser={() => setIsFollowUser(!isFollowUser)}
                      />
                    </div>

                    {/* Right Turn-by-Turn Navigation Panel */}
                    <div className="lg:col-span-4 h-full min-h-0 flex flex-col">
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

                  {/* Bottom 5 Feature Cards (Clean spacing, completely below the map & directions) */}
                  <div className="pt-2">
                    <FeatureCards onSelectFeature={handleSelectFeature} />
                  </div>
                </div>
              )}

              {/* TAB 2: FIND LOCATION VIEW */}
              {activeTab === 'find' && (
                <FindLocationView
                  buildings={buildings}
                  rooms={rooms}
                  onNavigateToLocation={handleNavigateToDestinationFromView}
                />
              )}

              {/* TAB 3: AI ASSISTANT VIEW */}
              {activeTab === 'ai' && (
                <AiAssistantView
                  buildings={buildings}
                  rooms={rooms}
                  facilities={INITIAL_FACILITIES}
                  onNavigateToDestination={handleNavigateToDestinationFromView}
                />
              )}

              {/* TAB 4: SCHEDULE & TIMETABLE VIEW */}
              {activeTab === 'schedule' && (
                <ScheduleView
                  timetable={INITIAL_TIMETABLE}
                  buildings={buildings}
                  onNavigateToRoom={handleNavigateToDestinationFromView}
                />
              )}

              {/* TAB 5: FACILITIES & EMERGENCY VIEW */}
              {activeTab === 'facilities' && (
                <FacilitiesView
                  facilities={INITIAL_FACILITIES}
                  emergencyContacts={INITIAL_EMERGENCY_CONTACTS}
                  buildings={buildings}
                  onNavigateToFacility={handleNavigateToDestinationFromView}
                />
              )}

              {/* TAB 6: FEEDBACK VIEW */}
              {activeTab === 'feedback' && <FeedbackView />}

              {/* TAB 7: CAMPUS BLUEPRINT MANAGER (Full Pipeline Portal) */}
              {activeTab === 'admin-blueprint' && (
                <BlueprintManagerPage
                  onPublishToLiveMap={handlePublishBlueprint}
                  currentUserRole={currentUser.role}
                />
              )}

              {/* TAB 8: ADMIN DASHBOARD VIEW */}
              {activeTab.startsWith('admin-') && activeTab !== 'admin-blueprint' && (
                <AdminDashboardView
                  currentUser={currentUser}
                  buildings={buildings}
                  nodes={nodes}
                  edges={edges}
                  rooms={rooms}
                  onUpdateEdge={(edgeId, isBlocked, reason) => {
                    setEdges((prev) =>
                      prev.map((e) =>
                        e.id === edgeId ? { ...e, isBlocked, closureReason: reason } : e
                      )
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
                  onApplyBlueprintScan={handleApplyBlueprintScan}
                />
              )}
            </main>
          </div>
        </>
      )}
    </div>
  );
};
