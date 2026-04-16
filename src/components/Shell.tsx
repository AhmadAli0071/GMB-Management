/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  Search,
  Plus
} from 'lucide-react';
import { User, UserRole } from '../types';
import { Button } from './ui/Common';

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
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group ${
        isActive 
          ? 'bg-blue-50 text-blue-700 font-medium' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
        <span className="text-sm">{label}</span>
      </div>
      {badge ? (
        <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {badge}
        </span>
      ) : (
        isActive && <ChevronRight size={14} className="text-blue-600" />
      )}
    </button>
  );
}

interface ShellProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Shell({ children, user, onLogout, activeTab, setActiveTab }: ShellProps) {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl font-display">C</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-blue-900">CrossDigi</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div className="mb-4">
            <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">General</p>
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              isActive={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <SidebarItem 
              icon={FolderKanban} 
              label="Projects" 
              isActive={activeTab === 'projects'} 
              onClick={() => setActiveTab('projects')} 
            />
            <SidebarItem 
              icon={CheckSquare} 
              label="Tasks" 
              isActive={activeTab === 'tasks'} 
              onClick={() => setActiveTab('tasks')} 
            />
          </div>

          <div className="mb-4">
            <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Management</p>
            <SidebarItem 
              icon={MessageSquare} 
              label="Requests" 
              isActive={activeTab === 'requests'} 
              onClick={() => setActiveTab('requests')} 
              badge={user.role === 'SALES_MANAGER' ? 2 : undefined}
            />
            <SidebarItem 
              icon={Users} 
              label="Team" 
              isActive={activeTab === 'team'} 
              onClick={() => setActiveTab('team')} 
            />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-xl mb-4 bg-gray-50 border border-gray-100">
            <img src={user.avatar} className="w-10 h-10 rounded-lg object-cover border border-gray-200" alt={user.name} referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{user.name}</p>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight truncate">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="max-w-md w-full relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search projects, tasks, or files..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="hidden md:flex gap-2">
              <Plus size={16} />
              <span>Create Task</span>
            </Button>
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs ring-4 ring-white">
                {user.name.charAt(0)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
