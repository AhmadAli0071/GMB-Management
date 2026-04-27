import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, MapPin, Star, Globe, Search, Building2, X, ExternalLink, Calendar,
  Shield, Send, Clock, Folder, ChevronDown, ChevronUp,
  CheckCircle2, RotateCcw, Download, FileText, Bell, Users, MessageCircle, Loader2, FolderPlus, Code2, Paperclip
} from 'lucide-react';
import { Card, Button, Badge, Textarea } from '../ui/Common';
import { useApp } from '../../AppContext';
import { useChatNotify } from '../../ChatNotifyContext';
import { useSocket } from '../../SocketContext';
import { STAGE_LABELS, STAGE_COLORS } from '../../types';
import { ChatBox } from '../chat/ChatBox';

export function SEOManagerDashboard() {
  const { projects, users, currentUser, assignToLead, projectUpdates, reviewProjectUpdate, reviewSection, workSubmissions, createAssignment, createProject } = useApp();
  const { unreadCounts } = useChatNotify();
  const { onActivityNotification, offActivityNotification } = useSocket();

  const [notifications, setNotifications] = useState<{ id: string; type: string; message: string; projectId: string; fromUserId: string; createdAt: number }[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (data: any) => {
      setNotifications(prev => [{
        id: Date.now().toString() + Math.random(),
        type: data.type,
        message: data.message,
        projectId: data.projectId,
        fromUserId: data.fromUserId,
        createdAt: Date.now(),
      }, ...prev].slice(0, 50));
    };
    onActivityNotification(handler);
    return () => { offActivityNotification(handler); };
  }, [onActivityNotification, offActivityNotification]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const clearNotifications = () => setNotifications([]);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [showAssignPopup, setShowAssignPopup] = useState<string | null>(null);
  const [assignComment, setAssignComment] = useState('');
  const [showSectionReviewModal, setShowSectionReviewModal] = useState<{ updateId: string; section: string; status: string } | null>(null);
  const [sectionReviewComment, setSectionReviewComment] = useState('');
  const [showUpdateReviewModal, setShowUpdateReviewModal] = useState<string | null>(null);
  const [updateReviewStatus, setUpdateReviewStatus] = useState('');
  const [updateReviewComment, setUpdateReviewComment] = useState('');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const toggleDate = (key: string) => setExpandedDates(prev => ({ ...prev, [key]: !prev[key] }));
  const [assigning, setAssigning] = useState(false);
  const [sectionReviewing, setSectionReviewing] = useState(false);
  const [updateReviewing, setUpdateReviewing] = useState(false);
  const [showDevAssignPopup, setShowDevAssignPopup] = useState<string | null>(null);
  const [devAssignText, setDevAssignText] = useState('');
  const [devAssigning, setDevAssigning] = useState(false);
  const [showDevProjectModal, setShowDevProjectModal] = useState(false);
  const [devProjectName, setDevProjectName] = useState('');
  const [devProjectDesc, setDevProjectDesc] = useState('');
  const [devProjectFiles, setDevProjectFiles] = useState<FileList | null>(null);
  const [devProjectCreating, setDevProjectCreating] = useState(false);
  const devFileRef = useRef<HTMLInputElement>(null);

  const salesManager = (Object.values(users) as any[]).find(u => u.role === 'SALES_MANAGER');
  const salesManagerName = salesManager?.name || 'Sales Manager';

  const seoLead = (Object.values(users) as any[]).find(u => u.role === 'SEO_LEAD');
  const seoLeadId = seoLead?.id || '';
  const seoLeadName = seoLead?.name || 'SEO Lead';

  const developer = (Object.values(users) as any[]).find(u => u.role === 'DEVELOPER');
  const developerId = developer?.id || '';
  const developerName = developer?.name || 'Developer';

  const myProjectUpdates = projectUpdates.filter((u: any) => u.toId === currentUser.id);
  const isUpdatePending = (u: any) => {
    if (u.reportType === 'STRUCTURED') {
      const hasOnPage = !!(u.onPageText || (u.onPageFiles && u.onPageFiles.length > 0));
      const hasOffPage = !!(u.offPageWorkIds && u.offPageWorkIds.length > 0);
      return (hasOnPage && u.onPageStatus === 'PENDING') || (hasOffPage && u.offPageStatus === 'PENDING');
    }
    return u.status === 'PENDING_REVIEW';
  };
  const pendingUpdatesCount = myProjectUpdates.filter(isUpdatePending).length;

  const newProjects = projects.filter(p => ['CLIENT_COMMUNICATION', 'VERIFICATION', 'READY_FOR_ASSIGNMENT'].includes(p.stage));
  const activeProjects = projects.filter(p => ['ASSIGNED_TO_LEAD', 'ON_PAGE_IN_PROGRESS', 'OFF_PAGE_IN_PROGRESS', 'REVIEW'].includes(p.stage));
  const allDisplayProjects = [...newProjects, ...activeProjects];

  const handleAssign = async () => {
    if (!showAssignPopup) return;
    if (!seoLeadId) {
      alert('SEO Lead not found. Please refresh the page and try again.');
      return;
    }
    setAssigning(true);
    try {
      await assignToLead(showAssignPopup, seoLeadId, assignComment);
      setShowAssignPopup(null);
      setAssignComment('');
    } catch (err) {
      alert('Assignment failed: ' + (err.message || 'Unknown error'));
    } finally {
      setAssigning(false);
    }
  };

  const handleDevAssign = async () => {
    if (!showDevAssignPopup) return;
    if (!developerId) {
      alert('Developer not found. Please ensure a developer user exists.');
      return;
    }
    setDevAssigning(true);
    try {
      const formData = new FormData();
      formData.append('projectId', showDevAssignPopup);
      formData.append('toId', developerId);
      formData.append('text', devAssignText || 'Development task assigned by SEO Manager');
      await createAssignment(formData);
      setShowDevAssignPopup(null);
      setDevAssignText('');
    } catch (err: any) {
      alert('Assignment failed: ' + (err.message || 'Unknown error'));
    } finally {
      setDevAssigning(false);
    }
  };

  const handleCreateDevProject = async () => {
    if (!devProjectName.trim()) { alert('Project name is required'); return; }
    if (!developerId) { alert('Developer not found'); return; }
    setDevProjectCreating(true);
    try {
      await createProject({
        name: devProjectName,
        businessCategory: 'DEVELOPMENT',
        specialInstructions: devProjectDesc,
        stage: 'READY_FOR_ASSIGNMENT',
      });
      const allProjects = await (await fetch('/api/projects', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })).json();
      const newProject = allProjects.find((p: any) => p.name === devProjectName && p.businessCategory === 'DEVELOPMENT');
      if (newProject) {
        const formData = new FormData();
        formData.append('projectId', newProject.id);
        formData.append('toId', developerId);
        formData.append('text', devProjectDesc || 'Development project assigned by SEO Manager');
        if (devProjectFiles) {
          for (let i = 0; i < devProjectFiles.length; i++) formData.append('images', devProjectFiles[i]);
        }
        await createAssignment(formData);
      }
      setShowDevProjectModal(false);
      setDevProjectName('');
      setDevProjectDesc('');
      setDevProjectFiles(null);
    } catch (err: any) {
      alert('Failed to create project: ' + (err.message || 'Unknown error'));
    } finally {
      setDevProjectCreating(false);
    }
  };

  const handleUpdateReview = async () => {
    if (!showUpdateReviewModal) return;
    setUpdateReviewing(true);
    try {
      await reviewProjectUpdate(showUpdateReviewModal, updateReviewStatus, updateReviewComment);
      setShowUpdateReviewModal(null);
      setUpdateReviewComment('');
      setUpdateReviewStatus('');
    } finally {
      setUpdateReviewing(false);
    }
  };

  const handleSectionReview = async () => {
    if (!showSectionReviewModal) return;
    setSectionReviewing(true);
    try {
      await reviewSection(showSectionReviewModal.updateId, showSectionReviewModal.section, showSectionReviewModal.status, sectionReviewComment);
      setShowSectionReviewModal(null);
      setSectionReviewComment('');
    } finally {
      setSectionReviewing(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'green';
    if (status === 'CHANGES_REQUESTED') return 'red';
    return 'yellow';
  };

  const getProjectBadge = (stage: string) => {
    if (['CLIENT_COMMUNICATION', 'VERIFICATION', 'READY_FOR_ASSIGNMENT'].includes(stage)) return { color: 'purple', label: 'New' };
    return { color: STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || 'blue', label: STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage };
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">SEO Operations Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage GMB projects</p>
        </div>
        <div className="flex items-center gap-3">
          {developerId && (
            <Button className="gap-2" onClick={() => setShowDevProjectModal(true)}>
              <FolderPlus size={18} /> Create Dev Project
            </Button>
          )}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Bell size={20} className="text-slate-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 animate-pulse">{notifications.length > 99 ? '99+' : notifications.length}</span>
              )}
            </button>
            {showNotifDropdown && (
              <div className="absolute right-0 top-12 w-80 max-h-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                  {notifications.length > 0 && (
                    <button onClick={clearNotifications} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">Clear All</button>
                  )}
                </div>
                <div className="overflow-y-auto max-h-80">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell size={24} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map(n => {
                      const fromUser = (users as any)[n.fromUserId];
                      const project = projects.find(p => p.id === n.projectId);
                      const typeIcon = n.type === 'PROJECT_ASSIGNED' ? <Folder size={14} className="text-blue-500" />
                        : n.type === 'REPORT_SUBMITTED' ? <FileText size={14} className="text-green-500" />
                        : n.type === 'WORK_SUBMITTED' ? <Send size={14} className="text-orange-500" />
                        : n.type === 'WORK_REVIEWED' ? <CheckCircle2 size={14} className="text-purple-500" />
                        : n.type === 'REPORT_REVIEWED' ? <CheckCircle2 size={14} className="text-green-500" />
                        : <Bell size={14} className="text-slate-500" />;
                      const timeAgo = Math.round((Date.now() - n.createdAt) / 1000);
                      const timeStr = timeAgo < 60 ? `${timeAgo}s ago` : timeAgo < 3600 ? `${Math.round(timeAgo / 60)}m ago` : `${Math.round(timeAgo / 3600)}h ago`;
                      return (
                        <div key={n.id} className="px-4 py-3 border-b border-slate-100 hover:bg-blue-50/50 transition-colors">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 shrink-0">{typeIcon}</div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-slate-800">{n.message}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {fromUser && <span className="text-[10px] text-slate-500">{fromUser.name}</span>}
                                {project && <span className="text-[10px] text-blue-600 truncate">· {project.name}</span>}
                              </div>
                              <span className="text-[10px] text-slate-400 mt-0.5 block">{timeStr}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {allDisplayProjects.length === 0 && (
        <Card className="p-8 sm:p-12 text-center">
          <Folder size={40} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-500">No projects yet</p>
        </Card>
      )}

      <div className="space-y-4">
        {allDisplayProjects.map(project => {
          const isNew = ['CLIENT_COMMUNICATION', 'VERIFICATION', 'READY_FOR_ASSIGNMENT'].includes(project.stage);
          const isActive = !isNew;
          const isExpanded = expandedProject === project.id;
          const projectUpdates = myProjectUpdates.filter((u: any) => u.projectId === project.id);
          const pendingForProject = projectUpdates.filter(isUpdatePending).length;
          const badge = getProjectBadge(project.stage);
          const projectUnreadMap = unreadCounts[project.id] || {};
          const projectUnread = (Object.values(projectUnreadMap) as number[]).reduce((sum, val) => sum + val, 0);

          return (
            <Card key={project.id} className="overflow-hidden">
              <div className="p-4 sm:p-5 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => { setExpandedProject(isExpanded ? null : project.id); if (!isExpanded) setActiveTab('details'); }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${'bg-blue-500 text-white'}`}>
                        <Folder size={28} />
                        {pendingForProject > 0 && !isExpanded && (
                          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">{pendingForProject}</span>
                        )}
                      </div>
                      {projectUnread > 0 && (
                        <span className="absolute -bottom-1 -left-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-bounce shadow-lg shadow-red-500/50 z-10 flex items-center gap-0.5">
                          <MessageCircle size={9} />{projectUnread > 99 ? '99+' : projectUnread}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="font-bold text-base sm:text-lg text-slate-900">{project.name}</h3>
                        <Badge variant={badge.color as any}>{badge.label}</Badge>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${project.verificationStatus === 'VERIFIED' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                          <Shield size={10} /> {project.verificationStatus === 'VERIFIED' ? 'Verified' : 'Unverified'}
                        </span>
                        {pendingForProject > 0 && !isExpanded && (
                          <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full animate-pulse">{pendingForProject} new report{pendingForProject !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{project.businessCategory || 'N/A'}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin size={10} /> {project.businessCity}{project.businessState ? `, ${project.businessState}` : ''}</span>
                        <span className="flex items-center gap-1"><Star size={10} /> {project.currentRating} ({project.currentReviews} reviews)</span>
                        <span className="flex items-center gap-1"><Building2 size={10} /> {salesManagerName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isActive && (
                      <div className="text-right text-xs text-slate-500 hidden sm:block">
                        <p>{projectUpdates.length} report{projectUpdates.length !== 1 ? 's' : ''}</p>
                        {pendingForProject > 0 && <p className="text-red-500 font-semibold">{pendingForProject} pending</p>}
                      </div>
                    )}
                    {isNew && !isExpanded && (
                      <Button size="sm" className="gap-1 shrink-0" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowAssignPopup(project.id); }}>
                        Assign to {seoLeadName} <ArrowRight size={14} />
                      </Button>
                    )}
                    {isExpanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-200">
                  <div className="flex gap-1 px-4 sm:px-5 pt-3 border-b border-slate-200">
                    <button className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${activeTab === 'details' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveTab('details')}>Details</button>
                    <button className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${activeTab === 'records' ? 'bg-green-50 text-green-600 border-b-2 border-green-500' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveTab('records')}>Records</button>
                    <button className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${activeTab === 'chat' ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveTab('chat')}>Chat{projectUnread > 0 && <span className="ml-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-bold rounded-full inline-flex items-center justify-center px-0.5">{projectUnread > 99 ? '99+' : projectUnread}</span>}</button>
                  </div>

                  {activeTab === 'details' && (<>
                  <div className="p-4 sm:px-5 sm:py-4 border-b border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-500 rounded-full" />
                        Project Details
                      </h4>
                      <div className="flex items-center gap-2">
                        {isNew && (
                          <Button size="sm" className="gap-1" onClick={() => setShowAssignPopup(project.id)}>
                            Assign to {seoLeadName} <ArrowRight size={14} />
                          </Button>
                        )}
                        {developerId && (
                          <Button variant="outline" size="sm" className="gap-1" onClick={() => { setShowDevAssignPopup(project.id); setDevAssignText(''); }}>
                            <Code2 size={14} /> Assign to {developerName}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Category</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessCategory || 'N/A'}</p></div>
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Phone</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessPhone || 'N/A'}</p></div>
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Email</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessEmail || 'N/A'}</p></div>
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Website</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessWebsite || 'N/A'}</p></div>
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Address</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessAddress}{project.businessCity ? `, ${project.businessCity}` : ''} {project.businessState} {project.businessZip}</p></div>
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Service Areas</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.serviceAreas || 'N/A'}</p></div>
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Services</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.services || 'N/A'}</p></div>
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">What We Offer</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{(project as any).offerServices || 'N/A'}</p></div>
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Business Hours</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessHours || 'N/A'}</p></div>
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Reviews</span><p className="text-sm font-medium text-slate-800 mt-0.5">{project.currentReviews} ({project.currentRating} rating)</p></div>
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Verification</span><p className="text-sm font-medium text-slate-800 mt-0.5">{project.verificationStatus}</p></div>
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Competitors</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.competitors || 'N/A'}</p></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                        {project.googleMapsLink && <a href={project.googleMapsLink} target="_blank" className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"><ExternalLink size={12} className="text-blue-600 shrink-0" /><div className="min-w-0"><span className="text-[10px] text-blue-600/60 uppercase tracking-wider">Google Maps</span><p className="text-xs text-blue-600 truncate">{project.googleMapsLink}</p></div></a>}
                        {(project as any).yelpLink && <a href={(project as any).yelpLink} target="_blank" className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"><ExternalLink size={12} className="text-blue-600 shrink-0" /><div className="min-w-0"><span className="text-[10px] text-blue-600/60 uppercase tracking-wider">Yelp</span><p className="text-xs text-blue-600 truncate">{(project as any).yelpLink}</p></div></a>}
                        {(project as any).homeAdvisorLink && <a href={(project as any).homeAdvisorLink} target="_blank" className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"><ExternalLink size={12} className="text-blue-600 shrink-0" /><div className="min-w-0"><span className="text-[10px] text-blue-600/60 uppercase tracking-wider">Home Advisor</span><p className="text-xs text-blue-600 truncate">{(project as any).homeAdvisorLink}</p></div></a>}
                      </div>
                     {project.managerComment && (
                       <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                         <span className="font-bold">{salesManagerName}:</span> {project.managerComment}
                       </div>
                     )}
                     {project.targetKeywords && (
                       <div className="mt-3">
                         <span className="text-[10px] text-slate-500 uppercase tracking-wider">Keywords</span>
                         <div className="mt-1 flex flex-wrap gap-1">
                           {project.targetKeywords.split(',').map((kw, i) => (<span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">{kw.trim()}</span>))}
                         </div>
                       </div>
                     )}
                     {project.specialInstructions && (
                       <div className="mt-3 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">{project.specialInstructions}</div>
                     )}
                     {isActive && project.assignedTo.length > 0 && (
                       <div className="mt-3 flex items-center gap-2">
                         <Users size={14} className="text-slate-500" />
                         <div className="flex -space-x-2">
                           {project.assignedTo.map(id => (<img key={id} src={users[id]?.avatar} className="w-6 h-6 rounded-full border-2 border-white ring-1 ring-slate-200" referrerPolicy="no-referrer" />))}
                         </div>
                         <span className="text-xs text-slate-500">{project.assignedTo.map(id => users[id]?.name).join(', ')}</span>
                       </div>
                      )}
                    </div>
                  </>)}

                  {activeTab === 'records' && (<>
                    {isActive && projectUpdates.length > 0 && (
                    <div className="p-4 sm:px-5 sm:py-4">
                       <div className="space-y-2">
                        {(() => {
                          const grouped: Record<string, any[]> = {};
                          projectUpdates.forEach((u: any) => {
                            const d = u.workDate || new Date(u.createdAt).toISOString().split('T')[0];
                            if (!grouped[d]) grouped[d] = [];
                            grouped[d].push(u);
                          });
                          return Object.keys(grouped).sort((a: string, b: string) => b.localeCompare(a)).map((date: string) => (
                            <div key={date} className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                <div className="px-4 py-2.5 bg-slate-100 flex items-center gap-2 cursor-pointer hover:bg-slate-200/60 transition-colors" onClick={() => toggleDate(`${project.id}-${date}`)}>
                                  {expandedDates[`${project.id}-${date}`] ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                                  <Calendar size={13} className="text-blue-600" />
                                <span className="text-sm font-semibold text-slate-800">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{grouped[date].length} report{grouped[date].length !== 1 ? 's' : ''}</span>
                              </div>
                                <div className={`divide-y divide-slate-200 p-3 space-y-3 ${expandedDates[`${project.id}-${date}`] ? '' : 'hidden'}`}>
                                  {grouped[date].map((update: any) => {
                          const fromUser = users[update.fromId];
                          const isStructured = update.reportType === 'STRUCTURED';
                          const offPageWorks = (update.offPageWorkIds || []).map((id: string) => workSubmissions.find((w: any) => w.id === id)).filter(Boolean);

                          return (
                            <div key={update.id} className="p-3 sm:p-4 bg-white border border-slate-200 rounded-xl">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                  <Badge variant={getStatusColor(isStructured && !isUpdatePending(update) && update.status === 'PENDING_REVIEW' ? 'APPROVED' : update.status)} className="text-[10px]">
                                    {isStructured ? (isUpdatePending(update) ? 'Pending Review' : 'Approved') : (update.status === 'APPROVED' ? 'Approved' : update.status === 'CHANGES_REQUESTED' ? 'Changes Requested' : 'Pending Review')}
                                  </Badge>
                                  {isStructured && <Badge variant="purple" className="text-[10px]">Structured Report</Badge>}
                                  <span className="text-[11px] text-slate-500">{fromUser?.name} — {new Date(update.createdAt).toLocaleString()}</span>
                                </div>
                                {!isStructured && update.status === 'PENDING_REVIEW' && (
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="primary" className="gap-1" onClick={() => { setUpdateReviewStatus('APPROVED'); setUpdateReviewComment(''); setShowUpdateReviewModal(update.id); }}>
                                      <CheckCircle2 size={14} /> Approve
                                    </Button>
                                    <Button size="sm" variant="danger" className="gap-1" onClick={() => { setUpdateReviewStatus('CHANGES_REQUESTED'); setUpdateReviewComment(''); setShowUpdateReviewModal(update.id); }}>
                                      <RotateCcw size={14} /> Request Changes
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {isStructured ? (
                                <div className="space-y-4">
                                  {(update.onPageText || (update.onPageFiles && update.onPageFiles.length > 0)) && (
                                    <div>
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                                        <h5 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
                                          <FileText size={10} /> On-Page Report
                                        </h5>
                                        <div className="flex items-center gap-2">
                                          {update.onPageStatus !== 'PENDING' && (
                                            <Badge variant={update.onPageStatus === 'APPROVED' ? 'green' : 'red'} className="text-[10px]">
                                              {update.onPageStatus === 'APPROVED' ? 'Approved' : 'Rejected'}
                                            </Badge>
                                          )}
                                          {update.onPageStatus === 'PENDING' && (
                                            <div className="flex gap-1">
                                              <Button size="sm" variant="primary" className="gap-1 text-[11px] px-2 py-1" onClick={() => { setShowSectionReviewModal({ updateId: update.id, section: 'onPage', status: 'APPROVED' }); setSectionReviewComment(''); }}>
                                                <CheckCircle2 size={12} /> Approve
                                              </Button>
                                              <Button size="sm" variant="danger" className="gap-1 text-[11px] px-2 py-1" onClick={() => { setShowSectionReviewModal({ updateId: update.id, section: 'onPage', status: 'REJECTED' }); setSectionReviewComment(''); }}>
                                                <X size={12} /> Reject
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                        {update.onPageText && <p className="text-sm text-slate-600 mb-2 whitespace-pre-wrap">{update.onPageText}</p>}
                                        {update.onPageFiles && update.onPageFiles.length > 0 && (
                                          <div className="flex flex-wrap gap-2">
                                            {update.onPageFiles.map((f: any, i: number) => {
                                              const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                              return (
                                                <a key={i} href={`/uploads/${f.filename}`} target="_blank" download>
                                                  {isImg ? (
                                                    <img src={`/uploads/${f.filename}`} className="w-20 h-20 rounded-lg object-cover border border-slate-200 hover:shadow-md" />
                                                  ) : (
                                                    <span className="flex items-center gap-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-600 hover:bg-blue-100"><Download size={14} /> {f.originalName}</span>
                                                  )}
                                                </a>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                      {update.onPageComment && (
                                        <div className={`p-2 rounded-lg text-xs mt-1 ${update.onPageStatus === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                          <span className="font-bold">Review:</span> {update.onPageComment}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {offPageWorks.length > 0 && (
                                    <div>
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                                        <h5 className="text-xs font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                                          <Globe size={10} /> Off-Page Report
                                        </h5>
                                        <div className="flex items-center gap-2">
                                          {update.offPageStatus !== 'PENDING' && (
                                            <Badge variant={update.offPageStatus === 'APPROVED' ? 'green' : 'red'} className="text-[10px]">
                                              {update.offPageStatus === 'APPROVED' ? 'Approved' : 'Rejected'}
                                            </Badge>
                                          )}
                                          {update.offPageStatus === 'PENDING' && (
                                            <div className="flex gap-1">
                                              <Button size="sm" variant="primary" className="gap-1 text-[11px] px-2 py-1" onClick={() => { setShowSectionReviewModal({ updateId: update.id, section: 'offPage', status: 'APPROVED' }); setSectionReviewComment(''); }}>
                                                <CheckCircle2 size={12} /> Approve
                                              </Button>
                                              <Button size="sm" variant="danger" className="gap-1 text-[11px] px-2 py-1" onClick={() => { setShowSectionReviewModal({ updateId: update.id, section: 'offPage', status: 'REJECTED' }); setSectionReviewComment(''); }}>
                                                <X size={12} /> Reject
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        {offPageWorks.map((work: any) => (
                                          <div key={work.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                            {work.text && <p className="text-sm text-slate-600 mb-2">{work.text}</p>}
                                            {work.files && work.files.length > 0 && (
                                              <div className="flex flex-wrap gap-2">
                                                {work.files.map((f: any, i: number) => {
                                                  const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                                  return (
                                                    <a key={i} href={`/uploads/${f.filename}`} target="_blank" download>
                                                      {isImg ? (
                                                        <img src={`/uploads/${f.filename}`} className="w-20 h-20 rounded-lg object-cover border border-slate-200 hover:shadow-md" />
                                                      ) : (
                                                        <span className="flex items-center gap-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-600 hover:bg-blue-100"><Download size={14} /> {f.originalName}</span>
                                                      )}
                                                    </a>
                                                  );
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                      {update.offPageComment && (
                                        <div className={`p-2 rounded-lg text-xs mt-1 ${update.offPageStatus === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                          <span className="font-bold">Review:</span> {update.offPageComment}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <>
                                  {update.text && <p className="text-sm text-slate-600 mb-2">{update.text}</p>}
                                  {update.files.length > 0 && (
                                    <div className="flex flex-wrap gap-2 sm:gap-3 mb-2">
                                      {update.files.map((f: any, i: number) => {
                                        const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                        return (
                                          <a key={i} href={`/uploads/${f.filename}`} target="_blank" download>
                                            {isImg ? (
                                              <img src={`/uploads/${f.filename}`} className="w-20 h-20 rounded-lg object-cover border border-slate-200 hover:shadow-md" />
                                            ) : (
                                              <span className="flex items-center gap-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-600 hover:bg-blue-100"><Download size={14} /> {f.originalName}</span>
                                            )}
                                          </a>
                                        );
                                      })}
                                    </div>
                                  )}
                                </>
                              )}

                              {update.reviewComment && (
                                <div className={`p-2 rounded-lg text-xs mt-2 ${update.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                  <span className="font-bold">Your review:</span> {update.reviewComment}
                                </div>
                              )}
                            </div>
                          );
                        })}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                     </div>
                    )}
                  </>)}

                  {activeTab === 'chat' && (
                    <div className="h-[70vh]">
                      <ChatBox projectId={project.id} />
                    </div>
                  )}
                  </div>
                )}
            </Card>
          );
        })}
      </div>

      {showAssignPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowAssignPopup(null)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Send to {seoLeadName}</h3>
              <button onClick={() => setShowAssignPopup(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-4 sm:px-6 py-5 space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm">
                <p className="font-semibold text-purple-600">{projects.find(p => p.id === showAssignPopup)?.name}</p>
                <p className="text-xs text-purple-600 mt-0.5">{projects.find(p => p.id === showAssignPopup)?.businessCategory || 'GMB Project'}</p>
              </div>
              <Textarea
                label="Comment for SEO Lead"
                placeholder="Add instructions or notes for the SEO Lead..."
                value={assignComment}
                onChange={e => setAssignComment(e.target.value)}
              />
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAssignPopup(null)}>Cancel</Button>
              <Button className="gap-1" onClick={handleAssign} disabled={assigning}>
                {assigning ? <><Loader2 size={14} className="animate-spin" /> Assigning...</> : <>Send to {seoLeadName} <ArrowRight size={14} /></>}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {showDevAssignPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => { setShowDevAssignPopup(null); setDevAssignText(''); }} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Assign to {developerName}</h3>
              <button onClick={() => { setShowDevAssignPopup(null); setDevAssignText(''); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-4 sm:px-6 py-5 space-y-4">
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg text-sm">
                <p className="font-semibold text-cyan-600">{projects.find(p => p.id === showDevAssignPopup)?.name}</p>
                <p className="text-xs text-cyan-600 mt-0.5">{projects.find(p => p.id === showDevAssignPopup)?.businessCategory || 'GMB Project'}</p>
              </div>
              <Textarea
                label="Task Description"
                placeholder="Describe the development task..."
                value={devAssignText}
                onChange={e => setDevAssignText(e.target.value)}
              />
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowDevAssignPopup(null); setDevAssignText(''); }}>Cancel</Button>
              <Button className="gap-1" onClick={handleDevAssign} disabled={devAssigning}>
                {devAssigning ? <><Loader2 size={14} className="animate-spin" /> Assigning...</> : <><Send size={14} /> Assign to {developerName}</>}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {showDevProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => { setShowDevProjectModal(false); setDevProjectName(''); setDevProjectDesc(''); setDevProjectFiles(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Create Dev Project</h3>
              <p className="text-sm text-slate-500">Create and assign to {developerName}</p>
            </div>
            <div className="px-4 sm:px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                <input type="text" className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Client Website Development" value={devProjectName} onChange={e => setDevProjectName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description / Requirements</label>
                <textarea className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" placeholder="Describe what needs to be developed..." value={devProjectDesc} onChange={e => setDevProjectDesc(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Attach Files (Images / Docs)</label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => devFileRef.current?.click()}><Paperclip size={14} /> Select Files</Button>
                  <span className="text-xs text-slate-500">{devProjectFiles ? `${devProjectFiles.length} file(s) selected` : 'No files'}</span>
                  <input ref={devFileRef} type="file" multiple className="hidden" onChange={e => setDevProjectFiles(e.target.files)} />
                </div>
                {devProjectFiles && <div className="flex flex-wrap gap-2 mt-2">{Array.from(devProjectFiles).map((f: File, i: number) => (<span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded">{f.name}</span>))}</div>}
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowDevProjectModal(false); setDevProjectName(''); setDevProjectDesc(''); setDevProjectFiles(null); }}>Cancel</Button>
              <Button className="gap-1" onClick={handleCreateDevProject} disabled={devProjectCreating}>
                {devProjectCreating ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : <><FolderPlus size={14} /> Create & Assign</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSectionReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowSectionReviewModal(null)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {showSectionReviewModal.status === 'APPROVED' ? 'Approve' : 'Reject'} {showSectionReviewModal.section === 'onPage' ? 'On-Page' : 'Off-Page'} Report
              </h3>
              <button onClick={() => setShowSectionReviewModal(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-4 sm:px-6 py-5 space-y-4">
              {showSectionReviewModal.status === 'REJECTED' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-500">
                  Please describe what needs to be fixed.
                </div>
              )}
              <textarea
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                placeholder={showSectionReviewModal.status === 'REJECTED' ? 'What needs to be fixed...' : 'Optional comment...'}
                value={sectionReviewComment}
                onChange={e => setSectionReviewComment(e.target.value)}
              />
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSectionReviewModal(null)}>Cancel</Button>
              <Button variant={showSectionReviewModal.status === 'APPROVED' ? 'primary' : 'danger'} className="gap-1" onClick={handleSectionReview} disabled={sectionReviewing || (showSectionReviewModal.status === 'REJECTED' && !sectionReviewComment.trim())}>
                {sectionReviewing ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : showSectionReviewModal.status === 'APPROVED' ? <><CheckCircle2 size={14} /> Approve</> : <><X size={14} /> Reject</>}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {showUpdateReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowUpdateReviewModal(null)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {updateReviewStatus === 'APPROVED' ? 'Approve Update' : 'Request Changes'}
              </h3>
              <button onClick={() => setShowUpdateReviewModal(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-4 sm:px-6 py-5 space-y-4">
              {updateReviewStatus === 'CHANGES_REQUESTED' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-500">
                  Please describe what needs to be changed so {seoLeadName} can fix and resubmit.
                </div>
              )}
              {updateReviewStatus === 'APPROVED' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-600">
                  You can add an optional comment with this approval.
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  {updateReviewStatus === 'CHANGES_REQUESTED' ? 'Reason / What needs to be fixed' : 'Comment (optional)'}
                </label>
                <textarea
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  placeholder={updateReviewStatus === 'CHANGES_REQUESTED' ? 'e.g. Report format needs correction, missing screenshots...' : 'Any additional notes...'}
                  value={updateReviewComment}
                  onChange={e => setUpdateReviewComment(e.target.value)}
                />
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowUpdateReviewModal(null)}>Cancel</Button>
              <Button
                variant={updateReviewStatus === 'APPROVED' ? 'primary' : 'danger'}
                className="gap-1"
                onClick={handleUpdateReview}
                disabled={updateReviewing || (updateReviewStatus === 'CHANGES_REQUESTED' && !updateReviewComment.trim())}
              >
                {updateReviewing ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : updateReviewStatus === 'APPROVED' ? <><CheckCircle2 size={14} /> Approve</> : <><RotateCcw size={14} /> Send Back for Changes</>}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
