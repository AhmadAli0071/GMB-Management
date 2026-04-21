import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  MessageSquare,
  Users,
  LogOut,
  ChevronRight,
  Activity,
  Bell,
} from 'lucide-react';
import { useApp } from '../AppContext';
import { ROLE_LABELS } from '../types';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  badge?: number;
}

function SidebarItem({ icon: Icon, label, isActive, onClick, badge }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${
        isActive
          ? 'bg-blue-500/15 text-blue-400 font-semibold'
          : 'text-slate-500 hover:bg-slate-700/50 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'} />
        <span className="text-sm">{label}</span>
      </div>
      {badge && badge > 0 ? (
        <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {badge}
        </span>
      ) : (
        isActive && !badge && <ChevronRight size={14} className="text-blue-400" />
      )}
    </button>
  );
}

interface ShellProps {
  children: React.ReactNode;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Shell({ children, onLogout, activeTab, setActiveTab }: ShellProps) {
  const { currentUser, requests, activities } = useApp();

  const pendingRequests = requests.filter(r => {
    if (currentUser.role === 'SALES_MANAGER') return r.toRole === 'SALES_MANAGER' && r.status === 'PENDING';
    if (currentUser.role === 'SEO_LEAD') return r.fromId === currentUser.id && r.status === 'RESPONDED';
    return false;
  }).length;

  const recentActivities = activities.filter(a => a.userId !== currentUser.id).slice(0, 5).length;

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-100">CrossDigi</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div className="mb-4">
            <p className="px-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">General</p>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarItem icon={FolderKanban} label="Projects" isActive={activeTab === 'projects'} onClick={() => setActiveTab('projects')} />
            <SidebarItem icon={CheckSquare} label="Tasks" isActive={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
          </div>

          <div className="mb-4">
            <p className="px-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Communication</p>
            <SidebarItem icon={MessageSquare} label="Requests" isActive={activeTab === 'requests'} onClick={() => setActiveTab('requests')} badge={pendingRequests || undefined} />
            <SidebarItem icon={Activity} label="Activity" isActive={activeTab === 'activity'} onClick={() => setActiveTab('activity')} badge={recentActivities || undefined} />
          </div>

          <div className="mb-4">
            <p className="px-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Management</p>
            <SidebarItem icon={Users} label="Team" isActive={activeTab === 'team'} onClick={() => setActiveTab('team')} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2.5 rounded-xl mb-4 bg-slate-800/50 border border-slate-700/50">
            <img src={currentUser.avatar} className="w-10 h-10 rounded-lg object-cover border border-slate-700" alt={currentUser.name} referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight text-slate-200">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight truncate">{ROLE_LABELS[currentUser.role]}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <h2 className="text-lg font-bold text-slate-100">
            {activeTab === 'dashboard' ? `${ROLE_LABELS[currentUser.role]} Dashboard` :
             activeTab === 'projects' ? 'Project Portfolio' :
             activeTab === 'tasks' ? 'Task Board' :
             activeTab === 'requests' ? 'Internal Requests' :
             activeTab === 'activity' ? 'Activity Timeline' :
             activeTab === 'team' ? 'Team Directory' : ''}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell size={20} className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors" />
              {pendingRequests > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">
                  {pendingRequests}
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700">
              <img src={currentUser.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
