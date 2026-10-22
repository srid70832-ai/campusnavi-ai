import React, { useState } from 'react';
import {
  Search,
  Menu,
  Sun,
  Moon,
  Bell,
  GraduationCap,
  ChevronDown,
  Building2,
  MapPin,
  X,
  LogOut,
  LogIn,
} from 'lucide-react';
import { CampusBuilding, CampusRoom, UserSession } from '../types/campus';
import { signInWithGoogle, logoutGoogle } from '../services/firebaseAuth';

interface TopBarProps {
  buildings: CampusBuilding[];
  rooms: CampusRoom[];
  onSelectDestination: (destId: string, bld: CampusBuilding | null) => void;
  currentUser: UserSession;
  onChangeUserRole: (role: 'STUDENT' | 'VISITOR' | 'ADMIN') => void;
  onUserAuthUpdate: (user: UserSession) => void;
  onOpenAuthPage?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  buildings,
  rooms,
  onSelectDestination,
  currentUser,
  onChangeUserRole,
  onUserAuthUpdate,
  onOpenAuthPage,
  isDarkMode,
  onToggleDarkMode,
  onToggleSidebar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const filteredBuildings = searchQuery.trim()
    ? buildings.filter(
        (b) =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredRooms = searchQuery.trim()
    ? rooms.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectBuilding = (bld: CampusBuilding) => {
    setSearchQuery(bld.name);
    setIsDropdownOpen(false);
    const entranceNodeId =
      bld.id === 'CSE_BLOCK' ? 'N_CSE_PLAZA' :
      bld.id === 'LIBRARY' ? 'N_LIBRARY_ENTRANCE' :
      bld.id === 'MAIN_BLOCK' ? 'N_MAIN_ENTRANCE' :
      bld.id === 'AUDITORIUM' ? 'N_AUDITORIUM_ENTRANCE' :
      bld.id === 'CAFETERIA' ? 'N_CAFE_ENTRANCE' :
      bld.id === 'ADMIN_BLOCK' ? 'N_ADMIN_ENTRANCE' :
      bld.id === 'HOSTEL' ? 'N_HOSTEL_ENTRANCE' :
      bld.id === 'SPORTS_GROUND' ? 'N_SPORTS_ENTRANCE' : 'N_PARKING_ENTRANCE';
    onSelectDestination(entranceNodeId, bld);
  };

  const handleSelectRoom = (room: CampusRoom) => {
    setSearchQuery(room.name);
    setIsDropdownOpen(false);
    const parentBld = buildings.find((b) => b.id === room.buildingId) || null;
    onSelectDestination(room.associatedNodeId, parentBld);
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const user = await signInWithGoogle();
      if (user) {
        onUserAuthUpdate({
          id: user.uid,
          name: user.displayName || 'Google User',
          email: user.email || '',
          role: 'STUDENT',
          photoUrl: user.photoURL || undefined,
          isGoogleAuth: true,
          department: 'Academic Campus',
        });
      }
    } catch (err) {
      console.error('Failed to sign in with Google:', err);
    } finally {
      setAuthLoading(false);
      setIsProfileMenuOpen(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logoutGoogle();
      onUserAuthUpdate({
        id: 'USR-GUEST',
        name: 'Guest Student',
        email: 'student@navicampus.ai',
        role: 'STUDENT',
        isGoogleAuth: false,
        department: 'Campus Navigator',
      });
    } catch (err) {
      console.error('Failed to logout:', err);
    } finally {
      setIsProfileMenuOpen(false);
    }
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between z-30 shrink-0 shadow-xs">
      {/* Brand & Logo — NaviCampus AI */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
          <GraduationCap size={22} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-slate-900 text-base tracking-tight">
              NaviCampus AI
            </h1>
          </div>
          <p className="text-[11px] font-medium text-slate-500 -mt-0.5">
            Smart Campus Navigation
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="relative flex-1 max-w-xl mx-4 hidden sm:block">
        <div className="relative flex items-center bg-slate-50 border border-slate-200/90 rounded-2xl px-3.5 py-2 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition shadow-inner">
          <Menu size={18} className="text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search location (e.g., Library, CSE Block, Cafeteria...)"
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsDropdownOpen(false);
              }}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isDropdownOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-12 mt-1 bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden z-50 max-h-80 overflow-y-auto">
            {filteredBuildings.length === 0 && filteredRooms.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No verified campus buildings or rooms matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div>
                {filteredBuildings.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                      Campus Buildings
                    </span>
                    {filteredBuildings.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleSelectBuilding(b)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 flex items-center gap-3 transition"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <Building2 size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800">{b.name}</div>
                          <div className="text-[11px] text-slate-500 truncate">{b.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredRooms.length > 0 && (
                  <div className="p-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                      Classrooms & Facilities
                    </span>
                    {filteredRooms.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleSelectRoom(r)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 flex items-center gap-3 transition"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <MapPin size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800">{r.name}</div>
                          <div className="text-[11px] text-slate-500">
                            Room {r.roomNumber} &bull; Floor {r.floorNumber}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Day/Night Theme toggle */}
        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
        >
          {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition relative"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
              <div className="font-bold text-slate-800 mb-2">Campus Announcements</div>
              <div className="space-y-2">
                <div className="p-2 bg-blue-50 text-blue-900 rounded-lg">
                  <div className="font-semibold">AI & SLAM Hackathon 2026</div>
                  <div className="text-[10px] text-blue-700">Turing Auditorium (Floor 1). Cash pool: $10,000.</div>
                </div>
                <div className="p-2 bg-slate-50 text-slate-700 rounded-lg">
                  <div className="font-semibold">Accessible Ramp Upgrades</div>
                  <div className="text-[10px] text-slate-500">All Main and CSE Block entrances now open.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill with Google Auth */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
          >
            {currentUser.photoUrl ? (
              <img
                src={currentUser.photoUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {currentUser.role.charAt(0) + currentUser.role.slice(1).toLowerCase()}
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50 text-xs space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Account & Authentication
              </div>

              {!currentUser.isGoogleAuth ? (
                <>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="w-full text-left px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center gap-2 transition"
                  >
                    <LogIn size={14} />
                    <span>{authLoading ? 'Signing in...' : 'Continue with Google'}</span>
                  </button>
                  {onOpenAuthPage && (
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenAuthPage();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 transition"
                    >
                      <span>Email / Password Login &rarr;</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleGoogleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2 transition"
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              )}

              <div className="pt-2 border-t border-slate-100 px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Role (RBAC)
              </div>
              <button
                onClick={() => {
                  onChangeUserRole('STUDENT');
                  setIsProfileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                  currentUser.role === 'STUDENT' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => {
                  onChangeUserRole('ADMIN');
                  setIsProfileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                  currentUser.role === 'ADMIN' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                Administrator / Faculty
              </button>
              <button
                onClick={() => {
                  onChangeUserRole('VISITOR');
                  setIsProfileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                  currentUser.role === 'VISITOR' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                Campus Visitor
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
