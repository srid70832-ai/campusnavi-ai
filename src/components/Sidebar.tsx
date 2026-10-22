import React, { useState } from 'react';
import {
  Home,
  Map as MapIcon,
  Search,
  Navigation,
  Bot,
  Calendar,
  Building,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Users,
  Edit3,
  Layers,
  Compass,
  Cpu,
} from 'lucide-react';
import { UserSession } from '../types/campus';

export type ActiveTab =
  | 'home'
  | 'map'
  | 'find'
  | 'navigation'
  | 'ai'
  | 'schedule'
  | 'facilities'
  | 'feedback'
  | 'admin-blueprint'
  | 'admin-locations'
  | 'admin-editor'
  | 'admin-approve'
  | 'admin-analytics'
  | 'admin-users';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentUser: UserSession;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [isAdminOpen, setIsAdminOpen] = useState(true);

  const navItems = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home },
    { id: 'map' as ActiveTab, label: 'Campus Map', icon: MapIcon },
    { id: 'find' as ActiveTab, label: 'Find Location', icon: Search },
    { id: 'navigation' as ActiveTab, label: 'Navigation', icon: Navigation },
    { id: 'ai' as ActiveTab, label: 'AI Assistant', icon: Bot },
    { id: 'schedule' as ActiveTab, label: 'Schedule & Events', icon: Calendar },
    { id: 'facilities' as ActiveTab, label: 'Facilities', icon: Building },
    { id: 'feedback' as ActiveTab, label: 'Feedback', icon: MessageSquare },
  ];

  const adminItems = [
    { id: 'admin-blueprint' as ActiveTab, label: 'Campus Blueprint Manager', icon: Cpu },
    { id: 'admin-locations' as ActiveTab, label: 'Manage Locations', icon: Edit3 },
    { id: 'admin-editor' as ActiveTab, label: 'Map Editor (3D)', icon: Layers },
    { id: 'admin-approve' as ActiveTab, label: 'Check & Approve', icon: ShieldCheck },
    { id: 'admin-analytics' as ActiveTab, label: 'Analytics', icon: BarChart3 },
    { id: 'admin-users' as ActiveTab, label: 'Users', icon: Users },
  ];

  const handleItemClick = (id: ActiveTab) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/90 flex flex-col justify-between p-4 shadow-sm transition-transform duration-300 md:translate-x-0 ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {/* Navigation Section */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Collapsible Admin Panel Section */}
        <div>
          <button
            onClick={() => setIsAdminOpen(!isAdminOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-slate-800 hover:text-blue-600 transition"
          >
            <div className="flex items-center gap-2.5">
              <Settings size={16} className="text-slate-500" />
              <span>Admin Panel</span>
            </div>
            {isAdminOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {isAdminOpen && (
            <div className="mt-1 space-y-1 pl-4 border-l border-slate-100 ml-3">
              {adminItems.map((adm) => {
                const AdmIcon = adm.icon;
                const isAdmActive = activeTab === adm.id;
                return (
                  <button
                    key={adm.id}
                    onClick={() => handleItemClick(adm.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isAdmActive
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <AdmIcon size={15} className={isAdmActive ? 'text-blue-600' : 'text-slate-400'} />
                    <span>{adm.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Branding & Footer Badge — NaviCampus AI */}
      <div className="pt-4 border-t border-slate-100">
        <div className="bg-blue-50/80 rounded-2xl p-3 border border-blue-100/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Compass size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">NaviCampus AI</div>
            <div className="text-[10px] text-blue-700 font-medium">Smart Campus Navigator</div>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-3 font-medium">
          NaviCampus AI &copy; 2026. All rights reserved.
        </p>
      </div>
    </aside>
  );
};
