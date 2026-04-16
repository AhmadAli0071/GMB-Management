/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserRole } from './types';
import { MOCK_USERS, MOCK_PROJECTS } from './constants';
import { LoginPage } from './components/LoginPage';
import { Shell } from './components/Shell';
import { SalesDashboard } from './components/dashboards/SalesDashboard';
import { SEOManagerDashboard } from './components/dashboards/SEOManagerDashboard';
import { SEOLeadDashboard } from './components/dashboards/SEOLeadDashboard';
import { OffPageDashboard } from './components/dashboards/OffPageDashboard';
import { InternDashboard } from './components/dashboards/InternDashboard';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import { KanbanBoard } from './components/KanbanBoard';
import { Badge, Card, Button } from './components/ui/Common';
import { Search, Filter, Plus, ChevronRight, LayoutGrid, List } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleLogin = (role: UserRole) => {
    const defaultUser = Object.values(MOCK_USERS).find(u => u.role === role);
    if (defaultUser) {
      setUser(defaultUser);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
    setSelectedProjectId(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'SALES_MANAGER': return <SalesDashboard />;
      case 'SEO_MANAGER': return <SEOManagerDashboard />;
      case 'SEO_LEAD': return <SEOLeadDashboard />;
      case 'OFF_PAGE_SPECIALIST': return <OffPageDashboard />;
      case 'INTERN': return <InternDashboard />;
      default: return <div>Generic Dashboard</div>;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Overview';
      case 'projects': return 'Project Portfolio';
      case 'tasks': return 'Task Operations';
      case 'requests': return 'Internal Requests';
      case 'team': return 'Team Directory';
      default: return 'Page';
    }
  };

  const renderContent = () => {
    if (selectedProjectId) {
      return (
        <ProjectDetailPage 
          projectId={selectedProjectId} 
          onBack={() => setSelectedProjectId(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'projects':
        return (
          <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{getPageTitle()}</h1>
                <p className="text-gray-500 mt-1">Manage all SEO accounts and client initiatives</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <LayoutGrid size={18} />
                </Button>
                <Button variant="outline" className="gap-2">
                  <List size={18} />
                </Button>
                <Button className="gap-2">
                  <Plus size={18} />
                  <span>New Project</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex gap-6">
                <button className="text-sm font-bold text-blue-600 border-b-2 border-blue-600 pb-1">All Projects</button>
                <button className="text-sm font-semibold text-gray-400 hover:text-gray-600 pb-1">Recently Updated</button>
                <button className="text-sm font-semibold text-gray-400 hover:text-gray-600 pb-1">Waiting Info</button>
              </div>
              <div className="flex items-center gap-2">
                <Search size={16} className="text-gray-400" />
                <input type="text" placeholder="Filter projects..." className="text-sm bg-transparent border-none outline-none w-48" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_PROJECTS.map(project => (
                <Card 
                  key={project.id} 
                  className="p-6 cursor-pointer hover:border-blue-200 hover:shadow-lg transition-all"
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 border border-gray-100">
                      <LayoutGrid size={20} />
                    </div>
                    <Badge variant={project.status === 'ON_PAGE' ? 'blue' : project.status === 'NEW' ? 'green' : 'gray'}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{project.name}</h3>
                  <p className="text-xs text-gray-400 font-medium mb-6">Client: {project.clientName}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex -space-x-2">
                      {project.assignedTo.map(id => (
                        <img key={id} src={MOCK_USERS[id]?.avatar} className="w-6 h-6 rounded-full border-2 border-white ring-1 ring-gray-100" referrerPolicy="no-referrer" />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 group">
                      Details <ChevronRight size={12} />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'tasks':
        return (
          <div className="space-y-8 h-full flex flex-col max-w-7xl mx-auto">
            <div className="flex items-center justify-between shrink-0">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{getPageTitle()}</h1>
                <p className="text-gray-500 mt-1">Kanban task board for On-Page and Off-Page execution</p>
              </div>
              <div className="flex gap-3">
                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                  <Button variant="ghost" size="sm" className="bg-blue-50 text-blue-600">Board</Button>
                  <Button variant="ghost" size="sm" className="text-gray-500">List</Button>
                  <Button variant="ghost" size="sm" className="text-gray-500">Gantt</Button>
                </div>
                <Button className="gap-2">
                  <Filter size={18} />
                  <span>Filter</span>
                </Button>
              </div>
            </div>
            
            <KanbanBoard />
          </div>
        );
      case 'requests':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">{getPageTitle()}</h1>
              <Button>New General Request</Button>
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center shrink-0">
                      <Search size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Search Console Access Required</h4>
                      <p className="text-sm text-gray-500 mt-1">From muaz@crossdigi.com regarding <span className="font-semibold">TechStyle Project</span></p>
                      <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                        "Need to verify the domain to start the technical audit phase properly."
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <Badge variant="yellow">PENDING</Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Decline</Button>
                      <Button variant="primary" size="sm">Resolve</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );
      case 'team':
        return (
          <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">The CrossDigi Team</h1>
                <p className="text-gray-500 mt-1">Directory of SEO leads, specialists and associates</p>
              </div>
              <Button>Invite Member</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.values(MOCK_USERS).map(member => (
                <Card key={member.id} className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <img src={member.avatar} className="w-20 h-20 rounded-2xl mx-auto object-cover border-4 border-white shadow-xl" alt={member.name} referrerPolicy="no-referrer" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <h3 className="font-bold text-gray-900">{member.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1 mb-6">{member.role.replace('_', ' ')}</p>
                  <Button variant="outline" size="sm" className="w-full">View Profile</Button>
                </Card>
              ))}
            </div>
          </div>
        );
      default:
        return <div>404 - Not Found</div>;
    }
  };

  return (
    <Shell user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Shell>
  );
}
