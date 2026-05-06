import React, { useState, useEffect, useRef } from 'react';
import {
  Globe, X, ShieldCheck, ExternalLink, Calendar,
  Folder, ChevronDown, ChevronUp, Download, FileText, Clock, Trash2,
  Palette, Image, Paperclip, Send, CheckCircle2, Loader2, Bell, RotateCcw
} from 'lucide-react';
import { Card, Badge, Button, Modal, Textarea } from '../ui/Common';
import { useApp } from '../../AppContext';
import { useChatNotify } from '../../ChatNotifyContext';
import { useSocket } from '../../SocketContext';
import { STAGE_LABELS, STAGE_COLORS } from '../../types';
import { ChatBox } from '../chat/ChatBox';

export function BossDashboard() {
  const { projects, users, projectUpdates, workSubmissions, deleteProject, createAssignment, reviewWork, reviewProjectUpdate, assignments, currentUser } = useApp();
   const { unreadCounts, notificationPermission, requestNotificationPermission } = useChatNotify();
  const { onActivityNotification, offActivityNotification } = useSocket();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const toggleDate = (key: string) => setExpandedDates(prev => ({ ...prev, [key]: !prev[key] }));
  const [activeBossTab, setActiveBossTab] = useState<Record<string, string>>({});
  const [showAssignDesignerModal, setShowAssignDesignerModal] = useState(false);
  const [assignDesignerForm, setAssignDesignerForm] = useState({ projectId: '', text: '' });
  const [assignDesignerImages, setAssignDesignerImages] = useState<FileList | null>(null);
  const [assignDesignerDocs, setAssignDesignerDocs] = useState<FileList | null>(null);
  const [reviewWorkModal, setReviewWorkModal] = useState<string | null>(null);
  const [reviewWorkStatus, setReviewWorkStatus] = useState('');
  const [reviewWorkComment, setReviewWorkComment] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [reviewingWork, setReviewingWork] = useState(false);
  const [showUpdateReviewModal, setShowUpdateReviewModal] = useState<string | null>(null);
  const [updateReviewStatus, setUpdateReviewStatus] = useState('');
  const [updateReviewComment, setUpdateReviewComment] = useState('');
  const [updateReviewing, setUpdateReviewing] = useState(false);
  const assignDesignerImgRef = useRef<HTMLInputElement>(null);
  const assignDesignerDocRef = useRef<HTMLInputElement>(null);
  const [notifications, setNotifications] = useState<{ id: string; type: string; message: string; projectId: string; fromUserId: string; createdAt: number }[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (data: any) => {
      setNotifications(prev => [{ id: Date.now().toString()+Math.random(), type: data.type, message: data.message, projectId: data.projectId, fromUserId: data.fromUserId, createdAt: Date.now() }, ...prev].slice(0, 50));
    };
    onActivityNotification(handler);
    return () => { offActivityNotification(handler); };
  }, [onActivityNotification, offActivityNotification]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifDropdown(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  const clearNotifications = () => setNotifications([]);

  const designer = (Object.values(users) as any[]).find(u => u.role === 'DESIGNER');
  const designerName = designer?.name || 'Designer';
  const designerId = designer?.id || '';

  const allUpdates = projectUpdates;
  const pendingCount = allUpdates.filter((u: any) => u.reportType === 'STRUCTURED' && (u.onPageStatus === 'PENDING' || u.offPageStatus === 'PENDING')).length;
  const approvedCount = allUpdates.filter((u: any) => u.reportType === 'STRUCTURED' && u.onPageStatus === 'APPROVED' && u.offPageStatus === 'APPROVED').length;
  const rejectedCount = allUpdates.filter((u: any) => u.reportType === 'STRUCTURED' && (u.onPageStatus === 'REJECTED' || u.offPageStatus === 'REJECTED')).length;

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'green';
    if (status === 'REJECTED') return 'red';
    return 'yellow';
  };

  const getWorkStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'green';
    if (status === 'CHANGES_REQUESTED') return 'red';
    return 'yellow';
  };

  const openAssignDesignerModal = (projectId: string) => {
    setAssignDesignerForm({ projectId, text: '' });
    setAssignDesignerImages(null);
    setAssignDesignerDocs(null);
    setShowAssignDesignerModal(true);
  };

  const handleAssignDesigner = async () => {
    setAssigning(true);
    try {
      const formData = new FormData();
      formData.append('projectId', assignDesignerForm.projectId);
      formData.append('toId', designerId);
      formData.append('text', assignDesignerForm.text);
      if (assignDesignerImages) {
        for (let i = 0; i < assignDesignerImages.length; i++) formData.append('images', assignDesignerImages[i]);
      }
      if (assignDesignerDocs) {
        for (let i = 0; i < assignDesignerDocs.length; i++) formData.append('documents', assignDesignerDocs[i]);
      }
      await createAssignment(formData);
      setShowAssignDesignerModal(false);
      setAssignDesignerForm({ projectId: '', text: '' });
      setAssignDesignerImages(null);
      setAssignDesignerDocs(null);
    } finally {
      setAssigning(false);
    }
  };

  const handleReviewDesignerWork = async () => {
    if (!reviewWorkModal) return;
    setReviewingWork(true);
    try {
      await reviewWork(reviewWorkModal, reviewWorkStatus, reviewWorkComment);
      setReviewWorkModal(null);
      setReviewWorkStatus('');
      setReviewWorkComment('');
    } finally {
      setReviewingWork(false);
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

   return (
     <div>
       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
         <div className="flex items-center justify-between mb-6">
           <div>
             <h2 className="text-xl font-bold text-slate-900 mb-1">Boss Dashboard</h2>
             <p className="text-sm text-slate-500">Overview of all projects and reports</p>
           </div>
           {notificationPermission !== 'granted' && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => requestNotificationPermission()}>
                <Bell size={14} /> Enable Notifications
              </Button>
            )}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                <Bell size={20} className="text-slate-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 animate-pulse">{notifications.length > 99 ? '99+' : notifications.length}</span>
                )}
              </button>
              {showNotifDropdown && (
                <div className="absolute right-0 top-12 w-80 max-h-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                    <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                    {notifications.length > 0 && (<button onClick={clearNotifications} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">Clear All</button>)}
                  </div>
                  <div className="overflow-y-auto max-h-80">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center"><Bell size={24} className="mx-auto text-slate-300 mb-2" /><p className="text-sm text-slate-400">No new notifications</p></div>
                    ) : (
                      notifications.map(n => {
                        const fromUser = (users as any)[n.fromUserId];
                        const project = projects.find(p => p.id === n.projectId);
                        const typeIcon = n.type === 'REPORT_SUBMITTED' ? <FileText size={14} className="text-green-500" />
                          : n.type === 'REPORT_REVIEWED' ? <CheckCircle2 size={14} className="text-purple-500" />
                          : n.type === 'WORK_SUBMITTED' ? <Send size={14} className="text-orange-500" />
                          : n.type === 'WORK_REVIEWED' ? <CheckCircle2 size={14} className="text-blue-500" />
                          : n.type === 'PROJECT_ASSIGNED' ? <Folder size={14} className="text-blue-500" />
                          : <Bell size={14} className="text-slate-500" />;
                        const timeAgo = Math.round((Date.now() - n.createdAt) / 1000);
                        const timeStr = timeAgo < 60 ? `${timeAgo}s ago` : timeAgo < 3600 ? `${Math.round(timeAgo/60)}m ago` : `${Math.round(timeAgo/3600)}h ago`;
                        return (
                          <div key={n.id} className="px-4 py-3 border-b border-slate-100 hover:bg-blue-50/50 transition-colors">
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5 shrink-0">{typeIcon}</div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-slate-800">{n.message}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {fromUser && <span className="text-[10px] text-slate-500">{fromUser.name}</span>}
                                  {project && <span className="text-[10px] text-blue-600 truncate">- {project.name}</span>}
                                  <span className="text-[10px] text-slate-400">{timeStr}</span>
                                </div>
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
         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/10 rounded-xl flex items-center justify-center"><Folder size={16} className="text-blue-600" /></div>
              <span className="text-xl sm:text-2xl font-bold text-slate-400">{projects.length}</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-2 font-semibold">Total Projects</p>
          </Card>
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center"><Clock size={16} className="text-yellow-600" /></div>
              <span className="text-xl sm:text-2xl font-bold text-slate-400">{pendingCount}</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-2 font-semibold">Pending Reports</p>
          </Card>
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-500/10 rounded-xl flex items-center justify-center"><FileText size={16} className="text-green-600" /></div>
              <span className="text-xl sm:text-2xl font-bold text-slate-400">{approvedCount}</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-2 font-semibold">Fully Approved</p>
          </Card>
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-500/10 rounded-xl flex items-center justify-center"><X size={16} className="text-red-500" /></div>
              <span className="text-xl sm:text-2xl font-bold text-slate-400">{rejectedCount}</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-2 font-semibold">Rejected</p>
          </Card>
        </div>

        <h2 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">All Projects — Reports</h2>

        {projects.length === 0 && (
          <Card className="p-12 text-center">
            <Folder size={40} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-500">No projects yet</p>
          </Card>
        )}

        <div className="space-y-4">
          {projects.map(project => {
            const isExpanded = expandedProject === project.id;
            const projectReports = allUpdates.filter((u: any) => u.projectId === project.id);
            const structuredReports = projectReports.filter((u: any) => u.reportType === 'STRUCTURED');
            const hasPending = structuredReports.some((u: any) => u.onPageStatus === 'PENDING' || u.offPageStatus === 'PENDING');
            const hasRejected = structuredReports.some((u: any) => u.onPageStatus === 'REJECTED' || u.offPageStatus === 'REJECTED');
            const allApproved = structuredReports.some((u: any) => u.onPageStatus === 'APPROVED' && u.offPageStatus === 'APPROVED');
            const projectUnreadMap = unreadCounts[project.id] || {};
            const projectUnread = (Object.values(projectUnreadMap) as number[]).reduce((sum, val) => sum + val, 0);

            return (
              <Card key={project.id} className={`overflow-hidden ${hasRejected ? 'border-red-200' : allApproved ? 'border-green-500/20' : hasPending ? 'border-yellow-500/20' : ''}`}>
                <div className="p-3 sm:p-5 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setExpandedProject(isExpanded ? null : project.id)}>
                  <div className="flex items-start sm:items-center justify-between gap-2">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white">
                          <Folder size={22} />
                        </div>
                        {projectUnread > 0 && (
                          <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[18px] h-4 flex items-center justify-center px-0.5 animate-bounce shadow-lg shadow-red-500/50 z-10">
                            {projectUnread > 99 ? '99+' : projectUnread}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate max-w-[160px] sm:max-w-none">{project.name}</h3>
                          <Badge variant={STAGE_COLORS[project.stage]}>{STAGE_LABELS[project.stage]}</Badge>
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold ${project.verificationStatus === 'VERIFIED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                            <ShieldCheck size={9} /> {project.verificationStatus === 'VERIFIED' ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{project.businessCategory || 'N/A'} — {project.businessCity}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5 text-[10px] sm:text-xs text-slate-500">
                          <span>{(users[project.createdBy] as any)?.name || 'Unknown'}</span>
                          <span>{structuredReports.length} report{structuredReports.length !== 1 ? 's' : ''}</span>
                          {allApproved && <span className="text-green-600 font-semibold">Fully Approved</span>}
                          {hasRejected && <span className="text-red-500 font-semibold">Has Rejections</span>}
                          {hasPending && !hasRejected && <span className="text-yellow-600 font-semibold">Pending</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      <div className="hidden sm:flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => openAssignDesignerModal(project.id)}>
                          <Palette size={14} /> Designer
                        </Button>
                        <Button size="sm" variant="danger" className="gap-1" onClick={() => setDeleteConfirmId(project.id)}>
                          <Trash2 size={14} /> Delete
                        </Button>
                      </div>
                      {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-200">
                  <div className="flex gap-1 px-4 sm:px-5 pt-3 border-b border-slate-200">
                    <button className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${(activeBossTab[project.id] || 'details') === 'details' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveBossTab(p => ({ ...p, [project.id]: 'details' }))}>Details</button>
                    <button className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${activeBossTab[project.id] === 'records' ? 'bg-green-50 text-green-600 border-b-2 border-green-500' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveBossTab(p => ({ ...p, [project.id]: 'records' }))}>Records</button>
                    <button className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${(activeBossTab[project.id] || 'details') === 'report' ? 'bg-green-50 text-green-600 border-b-2 border-green-500' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveBossTab(prev => ({ ...prev, [project.id]: 'report' }))}>Monthly Report</button>
                    <button className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${activeBossTab[project.id] === 'chat' ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveBossTab(p => ({ ...p, [project.id]: 'chat' }))}>
                      Chat{projectUnread > 0 && <span className="ml-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-bold rounded-full inline-flex items-center justify-center px-0.5">{projectUnread > 99 ? '99+' : projectUnread}</span>}
                    </button>
                  </div>

                  {(activeBossTab[project.id] || 'details') === 'details' && (
                  <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-500 rounded-full" />
                        <FileText size={14} className="text-blue-500" />
                        Project Details
                      </h4>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-1 sm:hidden text-[11px]" onClick={() => openAssignDesignerModal(project.id)}>
                          <Palette size={12} /> Designer
                        </Button>
                        <Button size="sm" variant="danger" className="gap-1 text-[11px]" onClick={() => setDeleteConfirmId(project.id)}>
                          <Trash2 size={12} /> Delete
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Category</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessCategory || 'N/A'}</p></div>
                      <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Location</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessCity}{project.businessState ? `, ${project.businessState}` : ''}</p></div>
                      <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Phone</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessPhone || 'N/A'}</p></div>
                      <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Email</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessEmail || 'N/A'}</p></div>
                      <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Website</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessWebsite || 'N/A'}</p></div>
                      <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Address</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessAddress}{project.businessCity ? `, ${project.businessCity}` : ''} {project.businessState} {project.businessZip}</p></div>
                      <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Service Areas</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.serviceAreas || 'N/A'}</p></div>
                      <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Services</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.services || 'N/A'}</p></div>
                      <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">What We Offer</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{(project as any).offerServices || 'N/A'}</p></div>
                      <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Business Hours</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessHours || 'N/A'}</p></div>
                      <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Reviews</span><p className="text-sm font-medium text-slate-800 mt-0.5">{project.currentReviews} ({project.currentRating} rating)</p></div>
                      <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Competitors</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.competitors || 'N/A'}</p></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                      {project.googleMapsLink && <a href={project.googleMapsLink} target="_blank" className="flex items-center gap-2 p-2.5 bg-blue-500/5 rounded-lg border border-blue-500/10 hover:bg-blue-500/10 transition-colors"><ExternalLink size={12} className="text-blue-600 shrink-0" /><div className="min-w-0"><span className="text-[10px] text-blue-600/60 uppercase tracking-wider">Google Maps</span><p className="text-xs text-blue-600 truncate">{project.googleMapsLink}</p></div></a>}
                      {(project as any).yelpLink && <a href={(project as any).yelpLink} target="_blank" className="flex items-center gap-2 p-2.5 bg-blue-500/5 rounded-lg border border-blue-500/10 hover:bg-blue-500/10 transition-colors"><ExternalLink size={12} className="text-blue-600 shrink-0" /><div className="min-w-0"><span className="text-[10px] text-blue-600/60 uppercase tracking-wider">Yelp</span><p className="text-xs text-blue-600 truncate">{(project as any).yelpLink}</p></div></a>}
                      {(project as any).homeAdvisorLink && <a href={(project as any).homeAdvisorLink} target="_blank" className="flex items-center gap-2 p-2.5 bg-blue-500/5 rounded-lg border border-blue-500/10 hover:bg-blue-500/10 transition-colors"><ExternalLink size={12} className="text-blue-600 shrink-0" /><div className="min-w-0"><span className="text-[10px] text-blue-600/60 uppercase tracking-wider">Home Advisor</span><p className="text-xs text-blue-600 truncate">{(project as any).homeAdvisorLink}</p></div></a>}
                    </div>
                    {project.targetKeywords && (
                      <div className="mt-3">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Keywords</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {project.targetKeywords.split(',').map((kw, i) => (<span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">{kw.trim()}</span>))}
                        </div>
                      </div>
                    )}
                    {project.specialInstructions && (
                      <div className="mt-3 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-600">{project.specialInstructions}</div>
                    )}
                    {(() => {
                      const designerWorkForProject = workSubmissions.filter((w: any) => w.projectId === project.id && w.fromId === designerId);
                      if (designerWorkForProject.length === 0) return null;
                      return (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-pink-50 rounded flex items-center justify-center"><Palette size={12} className="text-pink-600" /></div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{designerName}'s Design Work</h4>
                          </div>
                          <div className="space-y-2">
                            {(() => {
                              const dg: Record<string, any[]> = {};
                              designerWorkForProject.forEach((w: any) => {
                                const d = w.workDate || new Date(w.createdAt).toISOString().split('T')[0];
                                if (!dg[d]) dg[d] = [];
                                dg[d].push(w);
                              });
                              return Object.keys(dg).sort((a, b) => b.localeCompare(a)).map(date => {
                                const dateKey = `designer-${project.id}-${date}`;
                                return (
                                  <div key={date} className="bg-pink-50 border border-pink-200 rounded-lg overflow-hidden">
                                    <div className="px-3 py-2 bg-pink-50 flex items-center gap-2 cursor-pointer hover:bg-pink-100 transition-colors" onClick={() => toggleDate(dateKey)}>
                                      {expandedDates[dateKey] ? <ChevronUp size={14} className="text-pink-600" /> : <ChevronDown size={14} className="text-pink-600" />}
                                      <span className="text-xs font-semibold text-slate-800">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{dg[date].length} item{dg[date].length !== 1 ? 's' : ''}</span>
                                    </div>
                                    {expandedDates[dateKey] && (
                                      <div className="p-2 space-y-2">
                                        {dg[date].map((work: any) => (
                                          <div key={work.id} className="p-3 bg-white border border-pink-200 rounded-lg">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                              <div className="flex items-center gap-2">
                                                <Badge variant={getWorkStatusColor(work.status) as any} className="text-[10px]">
                                                  {work.status === 'APPROVED' ? 'Approved' : work.status === 'CHANGES_REQUESTED' ? 'Changes Requested' : 'Pending Review'}
                                                </Badge>
                                                <span className="text-[10px] text-slate-500">{new Date(work.createdAt).toLocaleString()}</span>
                                              </div>
                                              {work.status === 'PENDING_REVIEW' && (
                                                <div className="flex gap-1">
                                                  <Button size="sm" variant="primary" className="gap-1 text-[11px] px-2 py-1" onClick={() => { setReviewWorkStatus('APPROVED'); setReviewWorkComment(''); setReviewWorkModal(work.id); }}>
                                                    <CheckCircle2 size={12} /> Approve
                                                  </Button>
                                                  <Button size="sm" variant="danger" className="gap-1 text-[11px] px-2 py-1" onClick={() => { setReviewWorkStatus('CHANGES_REQUESTED'); setReviewWorkComment(''); setReviewWorkModal(work.id); }}>
                                                    <X size={12} /> Reject
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                            {work.text && <p className="text-sm text-slate-600 mb-2">{work.text}</p>}
                                            {work.files.length > 0 && (
                                              <div className="flex flex-wrap gap-2">
                                                {work.files.map((f: any, i: number) => {
                                                  const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                                  return (
                                                    <a key={i} href={`/uploads/${f.filename}`} target="_blank" download>
                                                      {isImg ? (
                                                        <img src={`/uploads/${f.filename}`} className="w-20 h-20 rounded-lg object-cover border border-slate-200 hover:shadow-md" />
                                                      ) : (
                                                        <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-600"><Download size={10} /> {f.originalName}</span>
                                                      )}
                                                    </a>
                                                  );
                                                })}
                                              </div>
                                            )}
                                            {work.reviewComment && (
                                              <div className={`p-2 rounded-lg text-xs mt-2 ${work.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                                <span className="font-bold">Review:</span> {work.reviewComment}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  )}

                  {activeBossTab[project.id] === 'records' && (
                  <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto">
                    {(() => {
                      const grouped: Record<string, any[]> = {};
                      structuredReports.forEach((r: any) => {
                        const d = r.workDate || new Date(r.createdAt).toISOString().split('T')[0];
                        if (!grouped[d]) grouped[d] = [];
                        grouped[d].push(r);
                      });
                      const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
                      if (dates.length === 0) return <div className="text-center py-12"><FileText size={36} className="mx-auto text-slate-300 mb-3" /><p className="text-sm text-slate-500">No records yet</p></div>;
                      return (
                        <div className="space-y-2">
                          {dates.map(date => (
                            <div key={date} className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                              <div className="px-3 sm:px-4 py-2.5 bg-slate-100 flex items-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleDate(`${project.id}-${date}`)}>
                                {expandedDates[`${project.id}-${date}`] ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                                <Calendar size={13} className="text-blue-600" />
                                <span className="text-xs sm:text-sm font-semibold text-slate-800">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{grouped[date].length} report{grouped[date].length !== 1 ? 's' : ''}</span>
                              </div>
                              <div className={`divide-y divide-slate-700/30 ${expandedDates[`${project.id}-${date}`] ? '' : 'hidden'}`}>
                                {grouped[date].map((report: any) => {
                                  const fromUser = users[report.fromId];
                                  const toUser = users[report.toId];
                                  const offPageWorks = (report.offPageWorkIds || []).map((id: string) => workSubmissions.find((w: any) => w.id === id)).filter(Boolean);
                                  return (
                                    <div key={report.id} className="p-3">
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <Badge variant="purple" className="text-[10px]">Structured Report</Badge>
                                        <span className="text-[10px] text-slate-500">{fromUser?.name} → {toUser?.name}</span>
                                        <span className="text-[10px] text-slate-600">{new Date(report.createdAt).toLocaleTimeString()}</span>
                                      </div>
                                      <div className="space-y-2">
                                        {(report.onPageText || (report.onPageFiles && report.onPageFiles.length > 0)) && (
                                          <div>
                                            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                                              <h5 className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1"><FileText size={10} /> On-Page</h5>
                                              <Badge variant={getStatusColor(report.onPageStatus)} className="text-[10px]">{report.onPageStatus === 'APPROVED' ? 'Approved' : report.onPageStatus === 'REJECTED' ? 'Rejected' : 'Pending'}</Badge>
                                            </div>
                                            <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg">
                                              {report.onPageText && <p className="text-xs text-slate-600 whitespace-pre-wrap">{report.onPageText}</p>}
                                              {report.onPageFiles && report.onPageFiles.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-1.5">{report.onPageFiles.map((f: any, i: number) => {
                                                  const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                                  return <a key={i} href={`/uploads/${f.filename}`} target="_blank" download>{isImg ? <img src={`/uploads/${f.filename}`} className="w-14 h-14 rounded object-cover border border-slate-200" /> : <span className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-blue-500/20 rounded text-[10px] text-blue-600"><Download size={10} /> {f.originalName}</span>}</a>;
                                                })}</div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                        {offPageWorks.length > 0 && (
                                          <div>
                                            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                                              <h5 className="text-[10px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1"><Globe size={10} /> Off-Page</h5>
                                              <Badge variant={getStatusColor(report.offPageStatus)} className="text-[10px]">{report.offPageStatus === 'APPROVED' ? 'Approved' : report.offPageStatus === 'REJECTED' ? 'Rejected' : 'Pending'}</Badge>
                                            </div>
                                            <div className="space-y-1">{offPageWorks.map((work: any) => (
                                              <div key={work.id} className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                                                {work.text && <p className="text-xs text-slate-600">{work.text}</p>}
                                                {work.files && work.files.length > 0 && (
                                                  <div className="flex flex-wrap gap-1.5 mt-1">{work.files.map((f: any, i: number) => {
                                                    const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                                    return <a key={i} href={`/uploads/${f.filename}`} target="_blank" download>{isImg ? <img src={`/uploads/${f.filename}`} className="w-14 h-14 rounded object-cover border border-slate-200" /> : <span className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-blue-500/20 rounded text-[10px] text-blue-600"><Download size={10} /> {f.originalName}</span>}</a>;
                                                  })}</div>
                                                )}
                                              </div>
                                            ))}</div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  )}

                  {(activeBossTab[project.id] || 'details') === 'report' && (
                    <div className="p-4 sm:px-5 sm:py-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-green-500 rounded-full" />
                        Monthly Reports from SEO Lead
                      </h4>
                      <div className="space-y-3">
                        {(() => {
                          const myId = currentUser.id;
                          const projectReports = projectUpdates.filter((u: any) => 
                            u.projectId === project.id && u.toId === myId
                          ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                          if (projectReports.length === 0) {
                            return (
                              <div className="p-8 bg-slate-50 rounded-lg text-center">
                                <FileText size={32} className="mx-auto text-slate-400 mb-2" />
                                <p className="text-sm text-slate-500">No monthly reports submitted yet.</p>
                                <p className="text-xs text-slate-400 mt-1">Reports from SEO Lead will appear here for your review.</p>
                              </div>
                            );
                          }

                          return projectReports.map(report => (
                            <Card key={report.id} className="p-4 border-l-4 border-l-purple-500">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h5 className="font-semibold text-sm text-slate-900">{report.title || 'Monthly Report'}</h5>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    {report.workDate && ` · Work Month: ${report.workDate}`}
                                  </p>
                                </div>
                                <Badge variant={
                                  report.status === 'APPROVED' ? 'green' :
                                  report.status === 'CHANGES_REQUESTED' ? 'red' : 'yellow'
                                }>
                                  {report.status === 'APPROVED' ? 'Approved' :
                                   report.status === 'CHANGES_REQUESTED' ? 'Changes Requested' : 'Pending Review'}
                                </Badge>
                              </div>

                              <div className="space-y-3">
                                {report.text && (
                                  <p className="text-sm text-slate-700">{report.text}</p>
                                )}

                                {report.files && report.files.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {report.files.map((f: any, i: number) => {
                                      const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                      return (
                                        <a key={i} href={`/uploads/${f.filename}`} target="_blank" className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-600 hover:bg-blue-100">
                                          {isImg ? <Image size={12} /> : <Download size={12} />}
                                          {f.originalName}
                                        </a>
                                      );
                                    })}
                                  </div>
                                )}

                                {report.reportType === 'STRUCTURED' && (
                                  <div className="space-y-2">
                                    {report.onPageText && (
                                      <div>
                                        <p className="text-xs font-semibold text-purple-700 mb-1">On-Page Work</p>
                                        <p className="text-sm text-slate-700">{report.onPageText}</p>
                                      </div>
                                    )}
                                    {report.onPageFiles && report.onPageFiles.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-blue-700 mb-1">On-Page Files</p>
                                        <div className="flex flex-wrap gap-2">
                                          {report.onPageFiles.map((f: any, i: number) => (
                                            <a key={i} href={`/uploads/${f.filename}`} target="_blank" className="text-xs text-blue-600 hover:underline">
                                              {f.originalName}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {report.status === 'PENDING_REVIEW' && (
                                <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100">
                                  <Button size="sm" variant="primary" className="gap-1" onClick={() => {
                                    setShowUpdateReviewModal(report.id);
                                    setUpdateReviewStatus('APPROVED');
                                  }}>
                                    <CheckCircle2 size={14} /> Approve
                                  </Button>
                                  <Button size="sm" variant="danger" className="gap-1" onClick={() => {
                                    setShowUpdateReviewModal(report.id);
                                    setUpdateReviewStatus('CHANGES_REQUESTED');
                                  }}>
                                    <RotateCcw size={14} /> Request Changes
                                  </Button>
                                </div>
                              )}
                            </Card>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {activeBossTab[project.id] === 'chat' && (
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
      </div>

      {deleteConfirmId && (() => {
        const proj = projects.find(p => p.id === deleteConfirmId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 border border-slate-200">
              <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Delete Project</h3>
                  <p className="text-[10px] sm:text-xs text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-5">
                <p className="text-sm text-slate-600">Are you sure you want to delete <span className="font-bold text-slate-900">{proj?.name}</span>?</p>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-2">All related reports, assignments, and work submissions will also be deleted.</p>
              </div>
              <div className="px-4 sm:px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                <Button variant="danger" className="gap-1" disabled={deleting} onClick={async () => {
                  setDeleting(true);
                  try {
                    await deleteProject(deleteConfirmId);
                    setDeleteConfirmId(null);
                    setExpandedProject(null);
                  } finally {
                    setDeleting(false);
                  }
                }}>
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {showAssignDesignerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowAssignDesignerModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Assign Design Task to {designerName}</h3>
              <button onClick={() => setShowAssignDesignerModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-4 sm:px-6 py-5 space-y-4">
              <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg text-sm">
                <p className="font-semibold text-pink-600">{projects.find(p => p.id === assignDesignerForm.projectId)?.name}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Task Description</label>
                <textarea className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" placeholder="Describe what images/designs are needed..." value={assignDesignerForm.text} onChange={e => setAssignDesignerForm({ ...assignDesignerForm, text: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Reference Images</label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => assignDesignerImgRef.current?.click()}><Image size={14} /> Select Images</Button>
                  <span className="text-[10px] sm:text-xs text-slate-500">{assignDesignerImages ? `${assignDesignerImages.length} selected` : 'None'}</span>
                  <input ref={assignDesignerImgRef} type="file" multiple accept="image/*" className="hidden" onChange={e => setAssignDesignerImages(e.target.files)} />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Reference Documents</label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => assignDesignerDocRef.current?.click()}><Paperclip size={14} /> Select Files</Button>
                  <span className="text-[10px] sm:text-xs text-slate-500">{assignDesignerDocs ? `${assignDesignerDocs.length} selected` : 'None'}</span>
                  <input ref={assignDesignerDocRef} type="file" multiple className="hidden" onChange={e => setAssignDesignerDocs(e.target.files)} />
                </div>
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAssignDesignerModal(false)}>Cancel</Button>
              <Button className="gap-1" onClick={handleAssignDesigner} disabled={assigning}>{assigning ? <Loader2 size={14} className="animate-spin" /> : <Palette size={14} />} Assign to {designerName}...</Button>
            </div>
          </div>
        </div>
      )}

      {reviewWorkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setReviewWorkModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{reviewWorkStatus === 'APPROVED' ? 'Approve' : 'Reject'} Design Work</h3>
              <button onClick={() => setReviewWorkModal(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-4 sm:px-6 py-5">
              <textarea className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" placeholder={reviewWorkStatus === 'CHANGES_REQUESTED' ? 'What needs to be changed...' : 'Optional comment...'} value={reviewWorkComment} onChange={e => setReviewWorkComment(e.target.value)} />
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setReviewWorkModal(null)}>Cancel</Button>
              <Button variant={reviewWorkStatus === 'APPROVED' ? 'primary' : 'danger'} className="gap-1" onClick={handleReviewDesignerWork} disabled={reviewingWork || (reviewWorkStatus === 'CHANGES_REQUESTED' && !reviewWorkComment.trim())}>
                {reviewingWork ? <Loader2 size={14} className="animate-spin" /> : reviewWorkStatus === 'APPROVED' ? <CheckCircle2 size={14} /> : <X size={14} />} {reviewWorkStatus === 'APPROVED' ? 'Approve' : 'Reject'}...
              </Button>
            </div>
          </div>
        </div>
      )}

      {showUpdateReviewModal && (
        <Modal isOpen={true} onClose={() => setShowUpdateReviewModal(null)} title={updateReviewStatus === 'APPROVED' ? 'Approve Report' : 'Request Changes'} size="sm">
          <div className="space-y-3">
            {updateReviewStatus === 'CHANGES_REQUESTED' && (
              <div className="p-2 bg-red-50 text-red-600 text-xs rounded">Please describe what needs to be changed.</div>
            )}
            <Textarea
              label={updateReviewStatus === 'CHANGES_REQUESTED' ? 'Reason / What needs to be fixed' : 'Comment (optional)'}
              value={updateReviewComment}
              onChange={e => setUpdateReviewComment(e.target.value)}
              placeholder={updateReviewStatus === 'CHANGES_REQUESTED' ? 'e.g. Report format needs correction...' : 'Any additional notes...'}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUpdateReviewModal(null)}>Cancel</Button>
              <Button variant={updateReviewStatus === 'APPROVED' ? 'primary' : 'danger'} className="gap-1" onClick={handleUpdateReview} disabled={updateReviewing || (updateReviewStatus === 'CHANGES_REQUESTED' && !updateReviewComment.trim())}>
                {updateReviewing ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : updateReviewStatus === 'APPROVED' ? <><CheckCircle2 size={14} /> Approve</> : <><RotateCcw size={14} /> Send Back</>}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
