import React, { useState } from 'react';
import { User, ROLE_LABELS, STAGE_LABELS, STAGE_COLORS, ALL_STAGES } from './types';
import { AppProvider, useApp } from './AppContext';
import { SocketProvider } from './SocketContext';
import { ChatNotifyProvider } from './ChatNotifyContext';
import { LoginPage } from './components/LoginPage';
import { Shell } from './components/Shell';
import { SalesDashboard } from './components/dashboards/SalesDashboard';
import { SEOManagerDashboard } from './components/dashboards/SEOManagerDashboard';
import { SEOLeadDashboard } from './components/dashboards/SEOLeadDashboard';
import { OffPageDashboard } from './components/dashboards/OffPageDashboard';
import { DesignerDashboard } from './components/dashboards/DesignerDashboard';
import { BossDashboard } from './components/dashboards/BossDashboard';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import { KanbanBoard } from './components/KanbanBoard';
import { Card, Button, Badge, Modal, Textarea, Input, StatCard } from './components/ui/Common';
import {
  Search, LayoutGrid, Plus, ChevronRight, List,
  Activity, Filter, ArrowUpRight, CheckCircle2, Clock,
  MessageSquare, Send, Users as UsersIcon, Mail, Phone,
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    try { return JSON.parse(stored); } catch { return null; }
  });

  const handleLogin = (loggedInUser: User) => {
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <SocketProvider>
      <AppProvider currentUser={user} onLogout={() => setUser(null)}>
        <ChatNotifyProvider>
          <AppContent />
        </ChatNotifyProvider>
      </AppProvider>
    </SocketProvider>
  );
}

function AppContent() {
  const { currentUser, onLogout } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const roleLabel = ROLE_LABELS[currentUser.role];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-100">CrossDigi</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden sm:block text-sm text-slate-400">Welcome, <span className="text-blue-400 font-semibold">{currentUser.name}</span></span>
          <span className="px-2.5 py-1 bg-blue-500/15 text-blue-400 rounded-lg text-[11px] font-semibold border border-blue-500/25">{roleLabel}</span>
          <button
            onClick={onLogout}
            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="p-4 sm:p-8">
        {currentUser.role === 'SALES_MANAGER' && <SalesDashboard />}
        {currentUser.role === 'SEO_MANAGER' && <SEOManagerDashboard />}
        {currentUser.role === 'SEO_LEAD' && <SEOLeadDashboard />}
        {currentUser.role === 'OFF_PAGE_SPECIALIST' && <OffPageDashboard />}
        {currentUser.role === 'BOSS' && <BossDashboard />}
        {currentUser.role === 'DESIGNER' && <DesignerDashboard />}
      </div>
    </div>
  );

  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'SEO_MANAGER': return <SEOManagerDashboard />;
      case 'SEO_LEAD': return <SEOLeadDashboard />;
      case 'OFF_PAGE_SPECIALIST': return <OffPageDashboard />;
      case 'BOSS': return <BossDashboard />;
      case 'DESIGNER': return <DesignerDashboard />;
      default: return null;
    }
  };

  const renderContent = () => {
    if (selectedProjectId) {
      return <ProjectDetailPage projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />;
    }

    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'projects': return <ProjectsPage onSelectProject={setSelectedProjectId} />;
      case 'tasks': return <KanbanBoard />;
      case 'requests': return <RequestsPage />;
      case 'activity': return <ActivityTimeline />;
      case 'team': return <TeamPage />;
      default: return null;
    }
  };

  return (
    <Shell onLogout={onLogout} activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSelectedProjectId(null); }}>
      {renderContent()}
    </Shell>
  );
}

function ProjectsPage({ onSelectProject }: { onSelectProject: (id: string) => void }) {
  const { projects, users } = useApp();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? projects : projects.filter(p => p.stage === filter);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Portfolio</h1>
          <p className="text-gray-500 mt-1">Manage all SEO accounts and client initiatives</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><LayoutGrid size={16} /></Button>
          <Button variant="outline" size="sm"><List size={16} /></Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setFilter('all')} className={`text-sm font-bold pb-1 px-3 rounded-lg transition-colors ${filter === 'all' ? 'text-blue-400 bg-blue-500/15' : 'text-slate-500 hover:text-slate-300'}`}>All ({projects.length})</button>
          {ALL_STAGES.map(stage => {
            const count = projects.filter(p => p.stage === stage).length;
            if (count === 0) return null;
            return (
              <button key={stage} onClick={() => setFilter(stage)} className={`text-sm font-semibold pb-1 px-3 rounded-lg transition-colors whitespace-nowrap ${filter === stage ? 'text-blue-400 bg-blue-500/15' : 'text-slate-500 hover:text-slate-300'}`}>
                {STAGE_LABELS[stage]} ({count})
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Search size={16} className="text-slate-500" />
          <input type="text" placeholder="Filter projects..." className="text-sm bg-transparent border-none outline-none w-40 text-slate-300 placeholder-slate-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(project => (
          <Card
            key={project.id}
            className="p-6 cursor-pointer hover:border-blue-500/30 hover:shadow-lg transition-all"
            onClick={() => onSelectProject(project.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center text-slate-500 border border-slate-700/50">
                <LayoutGrid size={20} />
              </div>
              <Badge variant={STAGE_COLORS[project.stage]}>{STAGE_LABELS[project.stage]}</Badge>
            </div>
            <h3 className="font-bold text-lg mb-1 text-slate-100">{project.name}</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">{project.businessCategory || 'GMB Project'} — {project.businessCity || ''}</p>
            <p className="text-sm text-slate-400 line-clamp-2 mb-4">{project.targetKeywords || project.specialInstructions || 'GMB Optimization'}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
              <div className="flex -space-x-2">
                {project.assignedTo.slice(0, 4).map(id => (
                  <img key={id} src={users[id]?.avatar} className="w-6 h-6 rounded-full border-2 border-slate-800 ring-1 ring-slate-700" referrerPolicy="no-referrer" />
                ))}
                {project.assignedTo.length > 4 && <span className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 text-[9px] font-bold text-slate-400 flex items-center justify-center">+{project.assignedTo.length - 4}</span>}
              </div>
              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                Details <ChevronRight size={12} />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RequestsPage() {
  const { currentUser, requests, projects, users, createInfoRequest, respondToRequest } = useApp();
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showRespond, setShowRespond] = useState<string | null>(null);
  const [requestContent, setRequestContent] = useState('');
  const [requestProject, setRequestProject] = useState('');
  const [responseContent, setResponseContent] = useState('');

  const visibleRequests = requests.filter(r => {
    if (currentUser.role === 'SALES_MANAGER') return r.toRole === 'SALES_MANAGER';
    if (currentUser.role === 'SEO_LEAD') return r.fromId === currentUser.id;
    return true;
  });

  const canCreateRequest = currentUser.role === 'SEO_LEAD';
  const canRespond = currentUser.role === 'SALES_MANAGER';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Internal Requests</h1>
          <p className="text-slate-500 mt-1">
            {currentUser.role === 'SALES_MANAGER' ? 'Client information requests from the SEO team' :
             currentUser.role === 'SEO_LEAD' ? 'Your requests to Sales Manager for client info' :
             'Team communication requests'}
          </p>
        </div>
        {canCreateRequest && (
          <Button className="gap-2" onClick={() => setShowNewRequest(true)}>
            <Send size={18} />
            <span>New Request</span>
          </Button>
        )}
      </div>

      {visibleRequests.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare size={40} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-500">No requests found</p>
        </Card>
      ) : (
        visibleRequests.map(req => {
          const fromUser = users[req.fromId];
          const project = projects.find(p => p.id === req.projectId);
          const respondedByUser = req.respondedBy ? users[req.respondedBy] : null;
          return (
            <Card key={req.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${req.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>
                    <MessageSquare size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-100">{fromUser?.name}</span>
                      <Badge variant={req.status === 'PENDING' ? 'yellow' : 'green'}>{req.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-500">Re: <span className="font-semibold text-blue-400">{project?.name}</span></p>
                    <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                      <p className="text-sm text-slate-300">{req.content}</p>
                    </div>
                    {req.response && (
                      <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-green-400">{respondedByUser?.name} responded:</span>
                          <span className="text-[10px] text-slate-500">{req.respondedAt && new Date(req.respondedAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-green-300">{req.response}</p>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 mt-2">{new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {canRespond && req.status === 'PENDING' && (
                  <Button variant="primary" size="sm" onClick={() => setShowRespond(req.id)}>Respond</Button>
                )}
              </div>
            </Card>
          );
        })
      )}

      <Modal isOpen={showNewRequest} onClose={() => setShowNewRequest(false)} title="Request Client Information">
        <form onSubmit={(e) => { e.preventDefault(); createInfoRequest(requestProject, requestContent); setRequestContent(''); setRequestProject(''); setShowNewRequest(false); }} className="space-y-4">
          <p className="text-sm text-slate-400">Request information from the client via Khuzaima (Sales Manager).</p>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">Project</label>
            <select className="block w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={requestProject} onChange={e => setRequestProject(e.target.value)} required>
              <option value="">Select project...</option>
              {projects.filter(p => p.assignedTo.includes(currentUser.id) && p.stage !== 'COMPLETED').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <Textarea label="What do you need?" placeholder="Describe the information needed from the client..." value={requestContent} onChange={e => setRequestContent(e.target.value)} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowNewRequest(false)}>Cancel</Button>
            <Button type="submit">Send Request</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showRespond} onClose={() => setShowRespond(null)} title="Respond to Request">
        <div className="space-y-4">
          {showRespond && (() => {
            const req = requests.find(r => r.id === showRespond);
            return <p className="text-sm text-slate-400 p-3 bg-slate-900/50 rounded-lg">{req?.content}</p>;
          })()}
          <Textarea label="Your Response" placeholder="Provide the requested information..." value={responseContent} onChange={e => setResponseContent(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowRespond(null)}>Cancel</Button>
            <Button onClick={() => { if (showRespond) { respondToRequest(showRespond, responseContent); setResponseContent(''); setShowRespond(null); } }} disabled={!responseContent.trim()}>Send Response</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ActivityTimeline() {
  const { activities, users, projects } = useApp();
  const [filter, setFilter] = useState('all');

  const typeIcons: Record<string, string> = {
    PROJECT_CREATED: 'blue',
    STAGE_CHANGED: 'purple',
    TASK_CREATED: 'orange',
    TASK_STATUS_CHANGED: 'green',
    REQUEST_CREATED: 'yellow',
    REQUEST_RESPONDED: 'green',
    UPDATE_SENT: 'blue',
  };

  const filteredActivities = filter === 'all' ? activities : activities.filter(a => a.type === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Timeline</h1>
          <p className="text-slate-500 mt-1">All project updates and actions across the team</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          <select className="text-sm bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Activity</option>
            <option value="PROJECT_CREATED">Projects</option>
            <option value="STAGE_CHANGED">Stage Changes</option>
            <option value="TASK_CREATED">Tasks Created</option>
            <option value="TASK_STATUS_CHANGED">Task Updates</option>
            <option value="REQUEST_CREATED">Requests</option>
            <option value="UPDATE_SENT">Updates</option>
          </select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-slate-700/30">
          {filteredActivities.map(activity => {
            const user = users[activity.userId];
            const project = activity.projectId ? projects.find(p => p.id === activity.projectId) : null;
            const color = typeIcons[activity.type] || 'gray';
            const colorClasses: Record<string, string> = {
              blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
              orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
              green: 'bg-green-500/10 text-green-400 border-green-500/20',
              yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
              gray: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
            };

            return (
              <div key={activity.id} className="p-5 hover:bg-slate-800/30 transition-colors flex items-start gap-4">
                <div className="relative shrink-0">
                  <img src={user?.avatar} className="w-10 h-10 rounded-full border-2 border-slate-700 shadow-sm" referrerPolicy="no-referrer" />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-800 flex items-center justify-center ${colorClasses[color]}`}>
                    <Activity size={10} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed">
                    <span className="font-bold text-slate-100">{user?.name}</span>{' '}
                    <span className="text-slate-400">{activity.content}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] text-slate-500">{new Date(activity.timestamp).toLocaleString()}</span>
                    {project && (
                      <span className="text-[11px] font-semibold text-blue-400 flex items-center gap-1">
                        <ArrowUpRight size={10} /> {project.name}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant={color as any} className="text-[9px] shrink-0">{activity.type.replace(/_/g, ' ').toLowerCase()}</Badge>
              </div>
            );
          })}
          {filteredActivities.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <Activity size={40} className="mx-auto mb-4 text-slate-600" />
              <p>No activity found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function TeamPage() {
  const { users } = useApp();

  const roleOrder = ['SALES_MANAGER', 'SEO_MANAGER', 'SEO_LEAD', 'OFF_PAGE_SPECIALIST', 'DESIGNER'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Directory</h1>
          <p className="text-slate-500 mt-1">SEO team hierarchy and contact information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roleOrder.map(role => {
          const member = (Object.values(users) as User[]).find(u => u.role === role);
          if (!member) return null;
          return (
            <Card key={member.id} className="p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <img src={member.avatar} className="w-20 h-20 rounded-2xl mx-auto object-cover border-4 border-slate-700 shadow-xl" alt={member.name} referrerPolicy="no-referrer" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                </div>
                <h3 className="font-bold text-slate-100">{member.name}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1 mb-4">{ROLE_LABELS[member.role]}</p>
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2 text-sm text-slate-400 p-2 bg-slate-900/50 rounded-lg">
                    <Mail size={14} className="text-slate-500 shrink-0" />
                    <span className="truncate text-xs">{member.email}</span>
                  </div>
                </div>
                <Badge variant={role === 'SALES_MANAGER' ? 'blue' : role === 'SEO_MANAGER' ? 'purple' : role === 'SEO_LEAD' ? 'green' : role === 'OFF_PAGE_SPECIALIST' ? 'orange' : 'gray'} className="mt-4">
                  {ROLE_LABELS[member.role]}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-6 text-slate-100">Communication Hierarchy</h3>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <div className="px-4 py-2 bg-blue-500/10 rounded-lg font-semibold text-blue-400">Khuzaima (Sales)</div>
          <ChevronRight size={20} className="text-slate-600" />
          <div className="px-4 py-2 bg-purple-500/10 rounded-lg font-semibold text-purple-400">Ali (SEO Mgr)</div>
          <ChevronRight size={20} className="text-slate-600" />
          <div className="px-4 py-2 bg-green-500/10 rounded-lg font-semibold text-green-400">Muaz (SEO Lead)</div>
          <ChevronRight size={20} className="text-slate-600" />
          <div className="px-4 py-2 bg-orange-500/10 rounded-lg font-semibold text-orange-400">Awais (Off-Page)</div>
          <ChevronRight size={20} className="text-slate-600" />
          <div className="px-4 py-2 bg-pink-500/10 rounded-lg font-semibold text-pink-400">Designer</div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <strong className="text-yellow-400">Communication Rule:</strong> Only Khuzaima (Sales Manager) communicates with clients. If Muaz needs client info, he creates a request to Khuzaima.
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <strong className="text-blue-400">Update Flow:</strong> Hassan updates Awais → Awais updates Muaz → Muaz updates Ali
          </div>
        </div>
      </Card>
    </div>
  );
}
