import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Send, FolderKanban, Clock, TrendingUp, Calendar,
  ChevronRight, ChevronDown, ChevronUp, X, MapPin, Globe, Star, Phone, Mail, ExternalLink,
  Search, Building2, ArrowUpRight, Loader2, FileText, Pencil, RotateCcw, ShieldCheck,
  Folder, CheckCircle2, Download, MessageCircle, FileUp, Palette, Bell
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Textarea } from '../ui/Common';
import { useApp } from '../../AppContext';
import { useChatNotify } from '../../ChatNotifyContext';
import { STAGE_LABELS, STAGE_COLORS } from '../../types';
import { ChatBox } from '../chat/ChatBox';

const emptyForm = {
  name: '',
  businessCategory: '',
  businessAddress: '',
  businessCity: '',
  businessState: '',
  businessZip: '',
  businessPhone: '',
  businessEmail: '',
  businessWebsite: '',
  googleMapsLink: '',
  yelpLink: '',
  homeAdvisorLink: '',
  verificationStatus: 'UNVERIFIED' as const,
  targetKeywords: '',
  competitors: '',
  businessHours: '',
  services: '',
  offerServices: '',
  serviceAreas: '',
  currentReviews: 0,
  currentRating: 0,
  specialInstructions: '',
};

const BUSINESS_CATEGORIES = [
  'Restaurant', 'Dentist', 'Plumber', 'Real Estate Agency', 'Law Firm',
  'Auto Repair Shop', 'Gym / Fitness Center', 'Salon / Spa', 'Medical Clinic',
  'Retail Store', 'Hotel / Motel', 'Accounting Firm', 'Marketing Agency',
  'IT Services', 'Construction Company', 'Pet Services', 'Education / Tutoring',
  'Photography Studio', 'Bakery / Cafe', 'E-commerce', 'Other'
];

export function SalesDashboard() {
  const { projects, users, currentUser, createProject, updateProject, updateProjectStage, projectUpdates, reviewProjectUpdate, reviewSection, workSubmissions, createAssignment, assignToLead } = useApp();
  const { unreadCounts, notificationPermission, requestNotificationPermission } = useChatNotify();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
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
  const [form, setForm] = useState(emptyForm);
  const [formStep, setFormStep] = useState(1);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editStep, setEditStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const myProjects = projects.filter(p => p.createdBy === currentUser.id);
  const myProjectUpdates = projectUpdates.filter((u: any) => u.toId === currentUser.id);
  const updatesByProject = myProjectUpdates.reduce((acc: any, u: any) => {
    if (!acc[u.projectId]) acc[u.projectId] = [];
    acc[u.projectId].push(u);
    return acc;
  }, {});

  const isUpdatePending = (u: any) => {
      if (u.reportType === 'STRUCTURED') {
        const hasOnPage = !!(u.onPageText || (u.onPageFiles && u.onPageFiles.length > 0));
        const hasOffPage = !!(u.offPageWorkIds && u.offPageWorkIds.length > 0);
        return (hasOnPage && u.onPageStatus === 'PENDING') || (hasOffPage && u.offPageStatus === 'PENDING');
      }
    return u.status === 'PENDING_REVIEW';
  };

  const seoLead = (Object.values(users) as any[]).find(u => u.role === 'SEO_LEAD');
  const seoLeadId = seoLead?.id || '';
  const seoLeadName = seoLead?.name || 'SEO Lead';

  const designer = (Object.values(users) as any[]).find(u => u.role === 'DESIGNER');
  const designerId = designer?.id || '';
  const designerName = designer?.name || 'Designer';

  const handleAssign = async () => {
    if (!showAssignPopup) return;
    if (!seoLeadId) {
      alert('SEO Lead not found. Please refresh.');
      return;
    }
    setAssigning(true);
    try {
      await assignToLead(showAssignPopup, seoLeadId, assignComment);
      setShowAssignPopup(null);
      setAssignComment('');
      setExpandedProject(null);
    } catch (err: any) {
      alert('Assignment failed: ' + (err.message || 'Unknown error'));
    } finally {
      setAssigning(false);
    }
  };

  const handleStartWork = async (projectId: string) => {
    await updateProjectStage(projectId, 'ON_PAGE_IN_PROGRESS');
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createProject(form);
      setForm(emptyForm);
      setFormStep(1);
      setShowCreateModal(false);
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    setEditForm({
      name: project.name || '',
      businessCategory: project.businessCategory || '',
      businessAddress: project.businessAddress || '',
      businessCity: project.businessCity || '',
      businessState: project.businessState || '',
      businessZip: project.businessZip || '',
      businessPhone: project.businessPhone || '',
      businessEmail: project.businessEmail || '',
      businessWebsite: project.businessWebsite || '',
      googleMapsLink: project.googleMapsLink || '',
      yelpLink: (project as any).yelpLink || '',
      homeAdvisorLink: (project as any).homeAdvisorLink || '',
      targetKeywords: project.targetKeywords || '',
      competitors: project.competitors || '',
      businessHours: project.businessHours || '',
      services: project.services || '',
      offerServices: (project as any).offerServices || '',
      serviceAreas: project.serviceAreas || '',
      currentReviews: project.currentReviews || 0,
      currentRating: project.currentRating || 0,
      specialInstructions: project.specialInstructions || '',
      verificationStatus: project.verificationStatus,
    });
    setEditingProject(projectId);
    setEditStep(1);
  };

  const updateEdit = (field: string, value: any) => setEditForm(prev => ({ ...prev, [field]: value }));

   const handleEditSave = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!editingProject) return;
     setSaving(true);
     try {
       await updateProject(editingProject, editForm);
       setEditingProject(null);
       setEditStep(1);
     } finally {
       setSaving(false);
     }
   };

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'green';
    if (status === 'CHANGES_REQUESTED') return 'red';
    return 'yellow';
  };

  const myWorkSubmissions = workSubmissions.filter((w: any) => myProjects.some((p: any) => p.id === w.projectId));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
       <div className="flex items-center justify-between mb-6">
         <div>
           <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
           <p className="text-sm text-slate-500 mt-0.5">Manage your GMB projects</p>
         </div>
         <div className="flex items-center gap-3">
           {notificationPermission !== 'granted' && (
             <Button size="sm" variant="outline" className="gap-1.5" onClick={() => requestNotificationPermission()}>
               <Bell size={14} /> Enable Notifications
             </Button>
           )}
           <Button className="gap-2" onClick={() => { setForm(emptyForm); setFormStep(1); setShowCreateModal(true); }}>
             <Plus size={18} />
             New GMB Project
           </Button>
         </div>
       </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><FolderKanban size={18} className="text-blue-600" /></div>
            <span className="text-2xl font-bold text-slate-400">{myProjects.length}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-semibold">Total Projects</p>
        </Card>
        <Card className={`p-5 ${myProjectUpdates.filter(isUpdatePending).length > 0 ? 'border-red-200 bg-red-50' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center relative">
              <Clock size={18} className="text-yellow-600" />
              {myProjectUpdates.filter(isUpdatePending).length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5 animate-pulse">{myProjectUpdates.filter(isUpdatePending).length}</span>
              )}
            </div>
            <span className="text-2xl font-bold text-slate-400">{myProjectUpdates.filter(isUpdatePending).length}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-semibold">Pending Reviews</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><TrendingUp size={18} className="text-green-600" /></div>
            <span className="text-2xl font-bold text-slate-400">{myProjects.filter(p => p.stage === 'COMPLETED').length}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-semibold">Completed</p>
        </Card>
      </div>

      {/* Project List (Expandable Cards) */}
      <div className="space-y-4">
        {myProjects.length === 0 ? (
          <Card className="p-16 text-center">
            <Building2 size={48} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-500 mb-2">No GMB projects yet</h3>
            <p className="text-sm text-slate-500 mb-6">Create your first GMB optimization project</p>
            <Button className="gap-2" onClick={() => { setForm(emptyForm); setFormStep(1); setShowCreateModal(true); }}>
              <Plus size={18} /> New GMB Project
            </Button>
          </Card>
        ) : (
          myProjects.map(project => {
            const isExpanded = expandedProject === project.id;
            const projectUpdates = myProjectUpdates.filter((u: any) => u.projectId === project.id);
            const pendingCount = projectUpdates.filter(isUpdatePending).length;
            const projectUnreadMap = unreadCounts[project.id] || {};
            const projectUnread = (Object.values(projectUnreadMap) as number[]).reduce((sum, val) => sum + val, 0);
            const projectOnPageWork = workSubmissions.filter((w: any) => w.projectId === project.id);
            const approvedOffPage = workSubmissions.filter((w: any) => w.projectId === project.id && w.status === 'APPROVED' && w.fromId !== currentUser.id);
            const rejectedCount = projectUpdates.filter((u: any) => u.status === 'CHANGES_REQUESTED').length;

            return (
              <Card key={project.id} className="overflow-hidden">
                <div className="p-4 sm:p-5 cursor-pointer hover:bg-blue-50/50 transition-colors" onClick={() => setExpandedProject(isExpanded ? null : project.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-blue-500 text-white">
                          <Folder size={28} />
                          {pendingCount > 0 && !isExpanded && (
                            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">{pendingCount}</span>
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
                          <h3 className="font-bold text-lg text-slate-900">{project.name}</h3>
                          <Badge variant={STAGE_COLORS[project.stage]}>{STAGE_LABELS[project.stage]}</Badge>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${project.verificationStatus === 'VERIFIED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                            <ShieldCheck size={10} /> {project.verificationStatus === 'VERIFIED' ? 'Verified' : 'Unverified'}
                          </span>
                          {pendingCount > 0 && !isExpanded && (
                            <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full animate-pulse">{pendingCount} report{pendingCount !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{project.businessCategory || 'N/A'}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><MapPin size={10} /> {project.businessCity}{project.businessState ? `, ${project.businessState}` : ''}</span>
                          <span className="flex items-center gap-1"><Star size={10} /> {project.currentRating} ({project.currentReviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {project.stage === 'CLIENT_COMMUNICATION' && (
                          <Button size="sm" variant="secondary" onClick={() => updateProjectStage(project.id, 'VERIFICATION')}>Verify</Button>
                        )}
                        {project.stage === 'VERIFICATION' && (
                          <Button size="sm" className="gap-1" onClick={() => updateProjectStage(project.id, 'READY_FOR_ASSIGNMENT')}>
                            Submit to Ali <Send size={14} />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => openEditModal(project.id)}>
                          <Pencil size={14} /> Edit
                        </Button>
                      </div>
                      {isExpanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-200">
                    <div className="flex gap-1 px-4 sm:px-5 pt-3 border-b border-slate-200">
                      <button className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${activeTab === 'details' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveTab('details')}>Details</button>
                      <button className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${activeTab === 'onpage' ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveTab('onpage')}>On-Page</button>
                      <button className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${activeTab === 'offpage' ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveTab('offpage')}>Off-Page</button>
                      <button className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${activeTab === 'report' ? 'bg-green-50 text-green-600 border-b-2 border-green-500' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveTab('report')}>Submit Report</button>
                      <button className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${activeTab === 'chat' ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setActiveTab('chat')}>Chat{projectUnread > 0 && <span className="ml-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-bold rounded-full inline-flex items-center justify-center px-0.5">{projectUnread > 99 ? '99+' : projectUnread}</span>}</button>
                    </div>

                    {/* Details Tab */}
                    {activeTab === 'details' && (
                      <div className="p-4 sm:px-5 sm:py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Category</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessCategory || 'N/A'}</p></div>
                          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Phone</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessPhone}</p></div>
                          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Email</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessEmail}</p></div>
                          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Website</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessWebsite || 'N/A'}</p></div>
                          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Address</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessAddress}, {project.businessCity} {project.businessState} {project.businessZip}</p></div>
                          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Service Areas</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.serviceAreas || 'N/A'}</p></div>
                          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Services</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.services || 'N/A'}</p></div>
                          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">What We Offer</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{(project as any).offerServices || 'N/A'}</p></div>
                          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Business Hours</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessHours || 'N/A'}</p></div>
                          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Reviews</span><p className="text-sm font-medium text-slate-800 mt-0.5">{project.currentReviews} ({project.currentRating} rating)</p></div>
                          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Verification</span><p className="text-sm font-medium text-slate-800 mt-0.5">{project.verificationStatus}</p></div>
                          <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Competitors</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.competitors || 'N/A'}</p></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                          {project.googleMapsLink && <a href={project.googleMapsLink} target="_blank" className="flex items-center gap-2 p-2.5 bg-blue-500/5 rounded-lg border border-blue-500/10 hover:bg-blue-500/10 transition-colors"><ExternalLink size={12} className="text-blue-600 shrink-0" /><div className="min-w-0"><span className="text-[10px] text-blue-600/60 uppercase tracking-wider">Google Maps</span><p className="text-xs text-blue-600 truncate">{project.googleMapsLink}</p></div></a>}
                          {(project as any).yelpLink && <a href={(project as any).yelpLink} target="_blank" className="flex items-center gap-2 p-2.5 bg-blue-500/5 rounded-lg border border-blue-500/10 hover:bg-blue-500/10 transition-colors"><ExternalLink size={12} className="text-blue-600 shrink-0" /><div className="min-w-0"><span className="text-[10px] text-blue-600/60 uppercase tracking-wider">Yelp</span><p className="text-xs text-blue-600 truncate">{(project as any).yelpLink}</p></div></a>}
                          {(project as any).homeAdvisorLink && <a href={(project as any).homeAdvisorLink} target="_blank" className="flex items-center gap-2 p-2.5 bg-blue-500/5 rounded-lg border border-blue-500/10 hover:bg-blue-500/10 transition-colors"><ExternalLink size={12} className="text-blue-600 shrink-0" /><div className="min-w-0"><span className="text-[10px] text-blue-600/60 uppercase tracking-wider">Home Advisor</span><p className="text-xs text-blue-600 truncate">{(project as any).homeAdvisorLink}</p></div></a>}
                        </div>
                        {project.targetKeywords && (
                          <div className="mt-3">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Target Keywords</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {project.targetKeywords.split(',').map((kw: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{kw.trim()}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* On-Page Tab */}
                    {activeTab === 'onpage' && (
                      <div className="p-4 sm:px-5 sm:py-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <div className="w-1 h-4 bg-purple-500 rounded-full" />
                            On-Page Work
                          </h4>
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => {/* open add work modal */}}>
                            <Plus size={14} /> Add Work
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {/* On-page work list */}
                          {projectOnPageWork.length === 0 ? (
                            <div className="p-6 bg-slate-50 rounded-lg text-center">
                              <FileUp size={24} className="mx-auto text-slate-600 mb-2" />
                              <p className="text-sm text-slate-500">No on-page work added yet.</p>
                            </div>
                          ) : (
                            projectOnPageWork.map(work => (
                              <div key={work.id} className="p-3 bg-white border border-slate-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant={work.status === 'APPROVED' ? 'green' : work.status === 'CHANGES_REQUESTED' ? 'red' : 'yellow'}>{work.status.replace('_', ' ')}</Badge>
                                  {work.status === 'PENDING' && (
                                    <div className="flex gap-1">
                                      <Button size="sm" variant="primary" className="gap-1 text-[11px] px-2 py-1" onClick={() => {/* approve */}}><CheckCircle2 size={12} /> Approve</Button>
                                      <Button size="sm" variant="danger" className="gap-1 text-[11px] px-2 py-1" onClick={() => {/* reject */}}><RotateCcw size={12} /> Reject</Button>
                                    </div>
                                  )}
                                </div>
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
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Off-Page Tab */}
                    {activeTab === 'offpage' && (
                      <div className="p-4 sm:px-5 sm:py-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <div className="w-1 h-4 bg-orange-500 rounded-full" />
                            Off-Page Work
                          </h4>
                          <Button size="sm" variant="secondary" className="gap-1" onClick={() => setShowAssignPopup(project.id)}>
                            <Palette size={14} /> Assign to SEO Lead
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {/* Off-page work list */}
                          {approvedOffPage.length === 0 ? (
                            <div className="p-6 bg-slate-50 rounded-lg text-center">
                              <p className="text-sm text-slate-500">No off-page work yet.</p>
                            </div>
                          ) : (
                            approvedOffPage.map(work => (
                              <div key={work.id} className="p-3 bg-white border border-slate-200 rounded-lg">
                                <p className="text-sm text-slate-600 mb-2">{work.text}</p>
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
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Submit Report Tab */}
                    {activeTab === 'report' && (
                      <div className="p-4 sm:px-5 sm:py-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                          <div className="w-1 h-4 bg-green-500 rounded-full" />
                          Submit Report
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="p-4">
                            <h5 className="font-semibold text-sm mb-2">Quick Report</h5>
                            <p className="text-xs text-slate-500 mb-3">Simple report with title, notes and attachments</p>
                            <Button className="w-full gap-2" onClick={() => {/* open quick report modal */}}>
                              <Send size={16} /> Send to Ali & Kevin
                            </Button>
                          </Card>
                          <Card className="p-4">
                            <h5 className="font-semibold text-sm mb-2">Structured Report</h5>
                            <p className="text-xs text-slate-500 mb-3">On-page work + off-page work selection</p>
                            <Button variant="outline" className="w-full gap-2" onClick={() => {/* open structured modal */}}>
                              <FileText size={16} /> Create Structured
                            </Button>
                          </Card>
                        </div>
                      </div>
                    )}

                    {/* Chat Tab */}
                    {activeTab === 'chat' && (
                      <div className="h-[70vh]">
                        <ChatBox projectId={project.id} />
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <Modal isOpen={true} onClose={() => { setShowCreateModal(false); setFormStep(1); }} title={formStep === 1 ? 'New GMB Project — Business Info' : formStep === 2 ? 'Links & Listing Details' : 'Target Keywords & Notes'} size="lg">
          <form onSubmit={handleCreate}>
            {/* ... multi-step form ... */}
          </form>
        </Modal>
      )}

      {editingProject && (
        <Modal isOpen={true} onClose={() => { setEditingProject(null); setEditStep(1); }} title="Edit Project" size="lg">
          <form onSubmit={handleEditSave}>
            {/* ... edit form ... */}
          </form>
        </Modal>
      )}

      {showAssignPopup && (
        <Modal isOpen={true} onClose={() => setShowAssignPopup(null)} title={`Assign to ${seoLeadName}`} size="sm">
          <div className="space-y-3">
            <Textarea label="Comment (optional)" value={assignComment} onChange={e => setAssignComment(e.target.value)} placeholder="Add a note..." />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignPopup(null)}>Cancel</Button>
              <Button className="gap-2" onClick={handleAssign} disabled={assigning}>
                {assigning ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : <><Send size={14} /> Assign</>}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showUpdateReviewModal && (
        <Modal isOpen={true} onClose={() => setShowUpdateReviewModal(null)} title={updateReviewStatus === 'APPROVED' ? 'Approve Update' : 'Request Changes'} size="sm">
          <div className="space-y-3">
            {updateReviewStatus === 'CHANGES_REQUESTED' && <div className="p-2 bg-red-50 text-red-600 text-xs rounded">Please describe what needs to be changed.</div>}
            <Textarea label={updateReviewStatus === 'CHANGES_REQUESTED' ? 'Reason / What needs to be fixed' : 'Comment (optional)'} value={updateReviewComment} onChange={e => setUpdateReviewComment(e.target.value)} placeholder={updateReviewStatus === 'CHANGES_REQUESTED' ? 'e.g. Report format needs correction...' : 'Any additional notes...'} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUpdateReviewModal(null)}>Cancel</Button>
              <Button variant={updateReviewStatus === 'APPROVED' ? 'primary' : 'danger'} className="gap-1" onClick={handleUpdateReview} disabled={updateReviewing || (updateReviewStatus === 'CHANGES_REQUESTED' && !updateReviewComment.trim())}>
                {updateReviewing ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : updateReviewStatus === 'APPROVED' ? <><CheckCircle2 size={14} /> Approve</> : <><RotateCcw size={14} /> Send Back</>}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showSectionReviewModal && (
        <Modal isOpen={true} onClose={() => setShowSectionReviewModal(null)} title={showSectionReviewModal.status === 'APPROVED' ? 'Approve Section' : 'Request Changes'} size="sm">
          <div className="space-y-3">
            {showSectionReviewModal.status === 'CHANGES_REQUESTED' && <div className="p-2 bg-red-50 text-red-600 text-xs rounded">Please describe what needs to be changed.</div>}
            <Textarea label={showSectionReviewModal.status === 'CHANGES_REQUESTED' ? 'Reason / What needs to be fixed' : 'Comment (optional)'} value={sectionReviewComment} onChange={e => setSectionReviewComment(e.target.value)} placeholder={showSectionReviewModal.status === 'CHANGES_REQUESTED' ? 'e.g. Please add more details...' : 'Any additional notes...'} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSectionReviewModal(null)}>Cancel</Button>
              <Button variant={showSectionReviewModal.status === 'APPROVED' ? 'primary' : 'danger'} className="gap-1" onClick={handleSectionReview} disabled={sectionReviewing || (showSectionReviewModal.status === 'CHANGES_REQUESTED' && !sectionReviewComment.trim())}>
                {sectionReviewing ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : showSectionReviewModal.status === 'APPROVED' ? <><CheckCircle2 size={14} /> Approve</> : <><RotateCcw size={14} /> Send Back</>}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
