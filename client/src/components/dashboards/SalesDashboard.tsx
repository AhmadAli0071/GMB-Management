import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus, Send, FolderKanban, Clock, TrendingUp,
  ChevronRight, X, MapPin, Globe, Star, Phone, Mail, ExternalLink,
  Search, Building2, ArrowUpRight, Loader2, FileText, Pencil, RotateCcw, ShieldCheck,
  Folder, ChevronDown, ChevronUp, CheckCircle2, Download, Bell, MessageCircle
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Textarea, Select } from '../ui/Common';
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
  const { projects, activities, users, createProject, updateProject, updateProjectStage, currentUser, onLogout, projectUpdates, reviewProjectUpdate, reviewSection, workSubmissions } = useApp();
  const { unreadCounts } = useChatNotify();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formStep, setFormStep] = useState(1);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editStep, setEditStep] = useState(1);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showUpdateReviewModal, setShowUpdateReviewModal] = useState<string | null>(null);
  const [updateReviewStatus, setUpdateReviewStatus] = useState('');
  const [updateReviewComment, setUpdateReviewComment] = useState('');
  const [showSectionReviewModal, setShowSectionReviewModal] = useState<{ updateId: string; section: string; status: string } | null>(null);
  const [sectionReviewComment, setSectionReviewComment] = useState('');

  const myProjects = projects.filter(p => p.createdBy === currentUser.id);
  const workingProjects = myProjects.filter(p => !['COMPLETED', 'CLIENT_COMMUNICATION', 'VERIFICATION'].includes(p.stage));
  const unverifiedProjects = myProjects.filter(p => ['CLIENT_COMMUNICATION', 'VERIFICATION'].includes(p.stage));
  const completedProjects = myProjects.filter(p => p.stage === 'COMPLETED');
  const submittedProjects = myProjects.filter(p => !['CLIENT_COMMUNICATION', 'VERIFICATION'].includes(p.stage) && p.stage !== 'COMPLETED');

  const myProjectUpdates = projectUpdates.filter((u: any) => u.toId === currentUser.id);
  const updatesByProject = myProjectUpdates.reduce((acc: any, u: any) => {
    if (!acc[u.projectId]) acc[u.projectId] = [];
    acc[u.projectId].push(u);
    return acc;
  }, {});
  const pendingUpdatesCount = myProjectUpdates.filter((u: any) => u.status === 'PENDING_REVIEW').length;

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'green';
    if (status === 'CHANGES_REQUESTED') return 'red';
    return 'yellow';
  };

  const handleUpdateReview = async () => {
    if (!showUpdateReviewModal) return;
    await reviewProjectUpdate(showUpdateReviewModal, updateReviewStatus, updateReviewComment);
    setShowUpdateReviewModal(null);
    setUpdateReviewComment('');
    setUpdateReviewStatus('');
  };

  const handleSectionReview = async () => {
    if (!showSectionReviewModal) return;
    await reviewSection(showSectionReviewModal.updateId, showSectionReviewModal.section, showSectionReviewModal.status, sectionReviewComment);
    setShowSectionReviewModal(null);
    setSectionReviewComment('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createProject(form);
    setForm(emptyForm);
    setFormStep(1);
    setShowCreateModal(false);
  };

  const handleSubmitToAli = (projectId: string) => {
    updateProjectStage(projectId, 'READY_FOR_ASSIGNMENT');
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
      verificationStatus: (project.verificationStatus as any) || 'UNVERIFIED',
      targetKeywords: project.targetKeywords || '',
      competitors: project.competitors || '',
      businessHours: project.businessHours || '',
      services: project.services || '',
      offerServices: (project as any).offerServices || '',
      serviceAreas: project.serviceAreas || '',
      currentReviews: project.currentReviews || 0,
      currentRating: project.currentRating || 0,
      specialInstructions: project.specialInstructions || '',
    });
    setEditStep(1);
    setEditingProject(projectId);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    updateProject(editingProject, editForm);
    setEditingProject(null);
    setEditStep(1);
  };

  const handleResubmit = () => {
    if (!editingProject) return;
    updateProject(editingProject, editForm);
    updateProjectStage(editingProject, 'CLIENT_COMMUNICATION');
    setEditingProject(null);
    setEditStep(1);
  };

  const updateEdit = (field: string, value: any) => setEditForm(prev => ({ ...prev, [field]: value }));

  const getProjectActivities = (projectId: string) => {
    return activities
      .filter(a => a.projectId === projectId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getProgressPercent = (projectId: string) => {
    const seoManager = (Object.values(users) as any[]).find(u => u.role === 'SEO_MANAGER');
    const salesManager = (Object.values(users) as any[]).find(u => u.role === 'SALES_MANAGER');
    let progress = 0;

    const aliUpdates = projectUpdates.filter((u: any) => u.projectId === projectId && u.toId === seoManager?.id && u.reportType === 'STRUCTURED');
    const kevinUpdates = projectUpdates.filter((u: any) => u.projectId === projectId && u.toId === salesManager?.id && u.reportType === 'STRUCTURED');

    const aliLatest = aliUpdates[0];
    const kevinLatest = kevinUpdates[0];

    if (aliLatest) {
      if (aliLatest.onPageStatus === 'APPROVED') progress += 25;
      if (aliLatest.offPageStatus === 'APPROVED') progress += 25;
    }
    if (kevinLatest) {
      if (kevinLatest.onPageStatus === 'APPROVED') progress += 25;
      if (kevinLatest.offPageStatus === 'APPROVED') progress += 25;
    }

    return progress;
  };

  const getNextStep = (stage: string) => {
    const nextSteps: Record<string, string> = {
      CLIENT_COMMUNICATION: 'Verify business details',
      VERIFICATION: 'Submit to Ali (SEO Manager)',
      READY_FOR_ASSIGNMENT: 'Ali will assign to SEO Lead',
      ASSIGNED_TO_LEAD: 'SEO Lead will start GMB optimization',
      ON_PAGE_IN_PROGRESS: 'GMB On-Page optimization in progress',
      OFF_PAGE_IN_PROGRESS: 'Off-Page SEO & citation building',
      REVIEW: 'Final review before completion',
      COMPLETED: 'Project finished',
    };
    return nextSteps[stage] || '';
  };

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Dashboard</h2>
            <p className="text-sm text-slate-500 mt-0.5">Manage GMB optimization projects</p>
          </div>
          <Button className="gap-2" onClick={() => { setForm(emptyForm); setFormStep(1); setShowCreateModal(true); }}>
            <Plus size={18} />
            New GMB Project
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center"><FolderKanban size={18} className="text-blue-600" /></div>
              <span className="text-2xl font-bold text-slate-400">{myProjects.length}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-semibold">Total Projects</p>
          </Card>
          <Card className={`p-5 ${pendingUpdatesCount > 0 ? 'border-red-500/20 bg-red-500/10' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center relative">
                <Clock size={18} className="text-yellow-600" />
                {pendingUpdatesCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5 animate-pulse">{pendingUpdatesCount}</span>
                )}
              </div>
              <span className="text-2xl font-bold text-slate-400">{pendingUpdatesCount}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-semibold">Pending Reviews</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center"><TrendingUp size={18} className="text-green-600" /></div>
              <span className="text-2xl font-bold text-slate-400">{completedProjects.length}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-semibold">Completed</p>
          </Card>
        </div>

        {myProjects.length === 0 && (
          <Card className="p-16 text-center">
            <Building2 size={48} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-500 mb-2">No GMB projects yet</h3>
            <p className="text-sm text-slate-500 mb-6">Create your first GMB optimization project</p>
            <Button className="gap-2" onClick={() => { setForm(emptyForm); setFormStep(1); setShowCreateModal(true); }}>
              <Plus size={18} /> New GMB Project
            </Button>
          </Card>
        )}

        <div className="space-y-4">
          {myProjects.map(project => {
            const isExpanded = expandedProject === project.id;
            const isNew = ['CLIENT_COMMUNICATION', 'VERIFICATION'].includes(project.stage);
            const isActive = !isNew && project.stage !== 'COMPLETED';
            const isCompleted = project.stage === 'COMPLETED';
            const projectUpdates = myProjectUpdates.filter((u: any) => u.projectId === project.id);
            const pendingForProject = projectUpdates.filter((u: any) => u.status === 'PENDING_REVIEW').length;
            const projectUnreadMap = unreadCounts[project.id] || {};
            const projectUnread = (Object.values(projectUnreadMap) as number[]).reduce((sum, val) => sum + val, 0);

            return (
              <Card key={project.id} className={`overflow-hidden ${pendingForProject > 0 ? 'border-red-500/20' : ''}`}>
                <div className="p-4 sm:p-5 cursor-pointer hover:bg-slate-900/30 transition-colors" onClick={() => setExpandedProject(isExpanded ? null : project.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="relative shrink-0">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${isCompleted ? 'bg-green-500/10 text-green-600' : isNew ? 'bg-yellow-500/10 text-yellow-600' : pendingForProject > 0 ? 'bg-red-500/10 text-red-600' : 'bg-blue-500/10 text-blue-600'}`}>
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
                          <h3 className="font-bold text-lg text-slate-100">{project.name}</h3>
                          <Badge variant={STAGE_COLORS[project.stage]}>{STAGE_LABELS[project.stage]}</Badge>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${project.verificationStatus === 'VERIFIED' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            <ShieldCheck size={10} /> {project.verificationStatus === 'VERIFIED' ? 'Verified' : 'Unverified'}
                          </span>
                          {pendingForProject > 0 && !isExpanded && (
                            <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full animate-pulse">{pendingForProject} report{pendingForProject !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">{project.businessCategory || 'N/A'}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><MapPin size={10} /> {project.businessCity}{project.businessState ? `, ${project.businessState}` : ''}</span>
                          <span className="flex items-center gap-1"><Star size={10} /> {project.currentRating} ({project.currentReviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {isNew && project.stage === 'CLIENT_COMMUNICATION' && (
                          <Button size="sm" variant="secondary" onClick={() => updateProjectStage(project.id, 'VERIFICATION')}>Verify</Button>
                        )}
                        {isNew && project.stage === 'VERIFICATION' && (
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
                  <div className="border-t border-slate-700/50">
                  <div className="grid grid-cols-1 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                    <div className="p-4 sm:p-5 border-b border-slate-700/50">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-500 rounded-full" />
                        Project Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Category</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessCategory || 'N/A'}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Phone</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessPhone}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Email</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessEmail}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Website</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessWebsite || 'N/A'}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Address</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessAddress}, {project.businessCity} {project.businessState} {project.businessZip}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Service Areas</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.serviceAreas || 'N/A'}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Services</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.services || 'N/A'}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">What We Offer</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{(project as any).offerServices || 'N/A'}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Business Hours</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessHours || 'N/A'}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Reviews</span><p className="text-sm font-medium text-slate-200 mt-0.5">{project.currentReviews} ({project.currentRating} rating)</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Verification</span><p className="text-sm font-medium text-slate-200 mt-0.5">{project.verificationStatus}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Competitors</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.competitors || 'N/A'}</p></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                        {project.googleMapsLink && <a href={project.googleMapsLink} target="_blank" className="flex items-center gap-2 p-2.5 bg-blue-500/5 rounded-lg border border-blue-500/10 hover:bg-blue-500/10 transition-colors"><ExternalLink size={12} className="text-blue-400 shrink-0" /><div className="min-w-0"><span className="text-[10px] text-blue-400/60 uppercase tracking-wider">Google Maps</span><p className="text-xs text-blue-400 truncate">{project.googleMapsLink}</p></div></a>}
                        {(project as any).yelpLink && <a href={(project as any).yelpLink} target="_blank" className="flex items-center gap-2 p-2.5 bg-blue-500/5 rounded-lg border border-blue-500/10 hover:bg-blue-500/10 transition-colors"><ExternalLink size={12} className="text-blue-400 shrink-0" /><div className="min-w-0"><span className="text-[10px] text-blue-400/60 uppercase tracking-wider">Yelp</span><p className="text-xs text-blue-400 truncate">{(project as any).yelpLink}</p></div></a>}
                        {(project as any).homeAdvisorLink && <a href={(project as any).homeAdvisorLink} target="_blank" className="flex items-center gap-2 p-2.5 bg-blue-500/5 rounded-lg border border-blue-500/10 hover:bg-blue-500/10 transition-colors"><ExternalLink size={12} className="text-blue-400 shrink-0" /><div className="min-w-0"><span className="text-[10px] text-blue-400/60 uppercase tracking-wider">Home Advisor</span><p className="text-xs text-blue-400 truncate">{(project as any).homeAdvisorLink}</p></div></a>}
                      </div>
                      {project.targetKeywords && (
                        <div className="mt-3">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Keywords</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {project.targetKeywords.split(',').map((kw, i) => (<span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded-full">{kw.trim()}</span>))}
                          </div>
                        </div>
                      )}
                      {project.specialInstructions && (
                        <div className="mt-3 p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-400">{project.specialInstructions}</div>
                      )}
                    </div>

                    {isActive && (() => {
                      const progress = getProgressPercent(project.id);
                      return (
                        <div className="px-4 sm:px-5 py-4 border-b border-slate-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</h4>
                            <span className="text-xs font-bold text-blue-600">{progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} className="h-full bg-blue-600 rounded-full" />
                          </div>
                          <p className="text-xs text-slate-500 mt-2"><span className="font-medium text-slate-400">Next:</span> {getNextStep(project.stage)}</p>
                        </div>
                      );
                    })()}

                    {projectUpdates.length > 0 && (
                      <div className="p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-green-500/10 rounded flex items-center justify-center">
                            <FileText size={12} className="text-green-600" />
                          </div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <div className="w-1 h-4 bg-green-500 rounded-full" />
                            Reports from SEO Team
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {projectUpdates.map((update: any) => {
                            const fromUser = users[update.fromId];
                            const isStructured = update.reportType === 'STRUCTURED';
                            const offPageWorks = (update.offPageWorkIds || []).map((id: string) => workSubmissions.find((w: any) => w.id === id)).filter(Boolean);

                            return (
                              <div key={update.id} className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <Badge variant={getStatusColor(update.status)} className="text-[10px]">
                                      {update.status === 'APPROVED' ? 'Approved' : update.status === 'CHANGES_REQUESTED' ? 'Changes Requested' : 'Pending Review'}
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
                                        <div className="flex items-center justify-between mb-2">
                                          <h5 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1"><FileText size={10} /> On-Page Report</h5>
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
                                        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                          {update.onPageText && <p className="text-sm text-slate-300 mb-2 whitespace-pre-wrap">{update.onPageText}</p>}
                                          {update.onPageFiles && update.onPageFiles.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                              {update.onPageFiles.map((f: any, i: number) => {
                                                const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                                return (
                                                  <a key={i} href={`/uploads/${f.filename}`} target="_blank" download>
                                                    {isImg ? (
                                                      <img src={`/uploads/${f.filename}`} className="w-20 h-20 rounded-lg object-cover border border-slate-700/50 hover:shadow-md" />
                                                    ) : (
                                                      <span className="flex items-center gap-1 px-3 py-2 bg-slate-800/50 border border-blue-500/20 rounded-lg text-xs text-blue-400 hover:bg-blue-500/20"><Download size={14} /> {f.originalName}</span>
                                                    )}
                                                  </a>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                        {update.onPageComment && (
                                          <div className={`p-2 rounded-lg text-xs mt-1 ${update.onPageStatus === 'APPROVED' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            <span className="font-bold">Review:</span> {update.onPageComment}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    {offPageWorks.length > 0 && (
                                      <div>
                                        <div className="flex items-center justify-between mb-2">
                                          <h5 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1"><Globe size={10} /> Off-Page Report</h5>
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
                                            <div key={work.id} className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                              {work.text && <p className="text-sm text-slate-300 mb-2">{work.text}</p>}
                                              {work.files && work.files.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                  {work.files.map((f: any, i: number) => {
                                                    const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                                    return (
                                                      <a key={i} href={`/uploads/${f.filename}`} target="_blank" download>
                                                        {isImg ? (
                                                          <img src={`/uploads/${f.filename}`} className="w-20 h-20 rounded-lg object-cover border border-slate-700/50 hover:shadow-md" />
                                                        ) : (
                                                          <span className="flex items-center gap-1 px-3 py-2 bg-slate-800/50 border border-blue-500/20 rounded-lg text-xs text-blue-400 hover:bg-blue-500/20"><Download size={14} /> {f.originalName}</span>
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
                                          <div className={`p-2 rounded-lg text-xs mt-1 ${update.offPageStatus === 'APPROVED' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            <span className="font-bold">Review:</span> {update.offPageComment}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    {update.text && <p className="text-sm text-slate-300 mb-2">{update.text}</p>}
                                    {update.files.length > 0 && (
                                      <div className="flex flex-wrap gap-3 mb-2">
                                        {update.files.map((f: any, i: number) => {
                                          const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                          return (
                                            <a key={i} href={`/uploads/${f.filename}`} target="_blank" download>
                                              {isImg ? (
                                                <img src={`/uploads/${f.filename}`} className="w-20 h-20 rounded-lg object-cover border border-slate-700/50 hover:shadow-md" />
                                              ) : (
                                                <span className="flex items-center gap-1 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400 hover:bg-blue-500/20"><Download size={14} /> {f.originalName}</span>
                                              )}
                                            </a>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </>
                                )}

                                {update.reviewComment && (
                                  <div className={`p-2 rounded-lg text-xs mt-2 ${update.status === 'APPROVED' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    <span className="font-bold">Your review:</span> {update.reviewComment}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    </div>
                    <div className="lg:col-span-1 border-l border-slate-700/50">
                      <ChatBox projectId={project.id} />
                    </div>
                  </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setFormStep(1); }} title={formStep === 1 ? 'New GMB Project — Business Info' : formStep === 2 ? 'Links & Listing Details' : 'Target Keywords & Notes'} size="lg">
        <form onSubmit={handleCreate}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-5 sm:mb-6">
            {[1, 2, 3].map(step => (
              <React.Fragment key={step}>
                <button type="button" onClick={() => { if (step < formStep) setFormStep(step); }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center transition-colors ${step <= formStep ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-500'}`}>
                  {step}
                </button>
                {step < 3 && <div className={`flex-1 h-0.5 rounded ${step < formStep ? 'bg-blue-600' : 'bg-slate-700/50'}`} />}
              </React.Fragment>
            ))}
          </div>

          {formStep === 1 && (
            <div className="space-y-3 sm:space-y-4">
              <Input label="Business Name (Project Name) *" placeholder="e.g. BurgerHouse" required value={form.name} onChange={e => update('name', e.target.value)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-medium text-slate-300">Business Category *</label>
                  <input list="business-categories" placeholder="Select or type category..." value={form.businessCategory} onChange={e => update('businessCategory', e.target.value)} className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg sm:rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" />
                  <datalist id="business-categories">
                    {BUSINESS_CATEGORIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <Input label="Business Phone *" placeholder="+1 555-0000" required value={form.businessPhone} onChange={e => update('businessPhone', e.target.value)} />
              </div>
              <Input label="Business Email *" type="email" placeholder="business@company.com" required value={form.businessEmail} onChange={e => update('businessEmail', e.target.value)} />
              <Input label="Full Address *" placeholder="123 Main St" required value={form.businessAddress} onChange={e => update('businessAddress', e.target.value)} />
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <Input label="City *" placeholder="City" required value={form.businessCity} onChange={e => update('businessCity', e.target.value)} />
                <Input label="State" placeholder="State" value={form.businessState} onChange={e => update('businessState', e.target.value)} />
                <Input label="Zip Code" placeholder="12345" value={form.businessZip} onChange={e => update('businessZip', e.target.value)} />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="button" onClick={() => setFormStep(2)}>Next <ChevronRight size={14} /></Button>
              </div>
            </div>
          )}

          {formStep === 2 && (
            <div className="space-y-3 sm:space-y-4">
              <Input label="Business Website" placeholder="https://www.example.com" value={form.businessWebsite} onChange={e => update('businessWebsite', e.target.value)} />
              <Input label="Google Maps Link" placeholder="https://maps.google.com/..." value={form.googleMapsLink} onChange={e => update('googleMapsLink', e.target.value)} />
              <Input label="Yelp Link" placeholder="https://www.yelp.com/biz/..." value={form.yelpLink} onChange={e => update('yelpLink', e.target.value)} />
              <Input label="Home Advisor Link" placeholder="https://www.homeadvisor.com/..." value={form.homeAdvisorLink} onChange={e => update('homeAdvisorLink', e.target.value)} />
              <Select label="Verification Status *" value={form.verificationStatus} onChange={e => update('verificationStatus', e.target.value)}>
                <option value="UNVERIFIED">Unverified</option>
                <option value="VERIFIED">Verified</option>
              </Select>
              <Input label="Business Hours" placeholder="Mon-Fri 9AM-6PM, Sat 10AM-2PM" value={form.businessHours} onChange={e => update('businessHours', e.target.value)} />
              <Textarea label="Services / Products" placeholder="List main services or products..." value={form.services} onChange={e => update('services', e.target.value)} />
              <Textarea label="What We Offer to Client" placeholder="List services we provide to this client..." value={form.offerServices} onChange={e => update('offerServices', e.target.value)} />
              <Input label="Service Areas" placeholder="e.g. Downtown, Midtown, +10 mile radius" value={form.serviceAreas} onChange={e => update('serviceAreas', e.target.value)} />
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Input label="Reviews Count" type="number" min={0} value={form.currentReviews} onChange={e => update('currentReviews', Number(e.target.value))} />
                <Input label="Rating" type="number" min={0} max={5} step={0.1} value={form.currentRating} onChange={e => update('currentRating', Number(e.target.value))} />
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setFormStep(1)} className="w-full sm:w-auto">Back</Button>
                <Button type="button" onClick={() => setFormStep(3)} className="w-full sm:w-auto">Next <ChevronRight size={14} /></Button>
              </div>
            </div>
          )}

          {formStep === 3 && (
            <div className="space-y-3 sm:space-y-4">
              <Textarea label="Target Keywords *" placeholder="e.g. best burger restaurant near me, burgers downtown, fast food delivery" required value={form.targetKeywords} onChange={e => update('targetKeywords', e.target.value)} />
              <Textarea label="Competitor Businesses" placeholder="e.g. Burger King, McDonald's, Five Guys (local competitors)" value={form.competitors} onChange={e => update('competitors', e.target.value)} />
              <Textarea label="Special Instructions / Notes" placeholder="Any additional info, client preferences, access details..." value={form.specialInstructions} onChange={e => update('specialInstructions', e.target.value)} />
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setFormStep(2)} className="w-full sm:w-auto">Back</Button>
                <Button type="submit" className="gap-2 w-full sm:w-auto"><Plus size={16} /> Create Project</Button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {editingProject && (() => {
        const project = projects.find(p => p.id === editingProject);
        if (!project) return null;
        return (
          <Modal isOpen={true} onClose={() => { setEditingProject(null); setEditStep(1); }} title={editStep === 1 ? `Edit — ${project.name}` : editStep === 2 ? 'Links & Listing Details' : 'Target Keywords & Notes'} size="lg">
            <form onSubmit={handleEditSave}>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-5 sm:mb-6">
                {[1, 2, 3].map(step => (
                  <React.Fragment key={step}>
                    <button type="button" onClick={() => { if (step < editStep) setEditStep(step); }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center transition-colors ${step <= editStep ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-500'}`}>
                      {step}
                    </button>
                    {step < 3 && <div className={`flex-1 h-0.5 rounded ${step < editStep ? 'bg-blue-600' : 'bg-slate-700/50'}`} />}
                  </React.Fragment>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4 p-2.5 sm:p-3 bg-blue-500/10 rounded-lg">
                <Badge variant={STAGE_COLORS[project.stage]}>{STAGE_LABELS[project.stage]}</Badge>
                <span className="text-xs text-slate-400">Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>

              {editStep === 1 && (
                <div className="space-y-3 sm:space-y-4">
                  <Input label="Business Name (Project Name) *" placeholder="e.g. BurgerHouse" required value={editForm.name} onChange={e => updateEdit('name', e.target.value)} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-medium text-slate-300">Business Category *</label>
                      <input list="business-categories-edit" placeholder="Select or type category..." value={editForm.businessCategory} onChange={e => updateEdit('businessCategory', e.target.value)} className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg sm:rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" />
                      <datalist id="business-categories-edit">
                        {BUSINESS_CATEGORIES.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                    <Input label="Business Phone *" placeholder="+1 555-0000" required value={editForm.businessPhone} onChange={e => updateEdit('businessPhone', e.target.value)} />
                  </div>
                  <Input label="Business Email *" type="email" placeholder="business@company.com" required value={editForm.businessEmail} onChange={e => updateEdit('businessEmail', e.target.value)} />
                  <Input label="Full Address *" placeholder="123 Main St" required value={editForm.businessAddress} onChange={e => updateEdit('businessAddress', e.target.value)} />
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <Input label="City *" placeholder="City" required value={editForm.businessCity} onChange={e => updateEdit('businessCity', e.target.value)} />
                    <Input label="State" placeholder="State" value={editForm.businessState} onChange={e => updateEdit('businessState', e.target.value)} />
                    <Input label="Zip Code" placeholder="12345" value={editForm.businessZip} onChange={e => updateEdit('businessZip', e.target.value)} />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="button" onClick={() => setEditStep(2)}>Next <ChevronRight size={14} /></Button>
                  </div>
                </div>
              )}

              {editStep === 2 && (
                <div className="space-y-3 sm:space-y-4">
                  <Input label="Business Website" placeholder="https://www.example.com" value={editForm.businessWebsite} onChange={e => updateEdit('businessWebsite', e.target.value)} />
                  <Input label="Google Maps Link" placeholder="https://maps.google.com/..." value={editForm.googleMapsLink} onChange={e => updateEdit('googleMapsLink', e.target.value)} />
                  <Input label="Yelp Link" placeholder="https://www.yelp.com/biz/..." value={editForm.yelpLink} onChange={e => updateEdit('yelpLink', e.target.value)} />
                  <Input label="Home Advisor Link" placeholder="https://www.homeadvisor.com/..." value={editForm.homeAdvisorLink} onChange={e => updateEdit('homeAdvisorLink', e.target.value)} />
                  <Select label="Verification Status *" value={editForm.verificationStatus} onChange={e => updateEdit('verificationStatus', e.target.value)}>
                    <option value="UNVERIFIED">Unverified</option>
                    <option value="VERIFIED">Verified</option>
                  </Select>
                  <Input label="Business Hours" placeholder="Mon-Fri 9AM-6PM, Sat 10AM-2PM" value={editForm.businessHours} onChange={e => updateEdit('businessHours', e.target.value)} />
                  <Textarea label="Services / Products" placeholder="List main services or products..." value={editForm.services} onChange={e => updateEdit('services', e.target.value)} />
                  <Textarea label="What We Offer to Client" placeholder="List services we provide to this client..." value={editForm.offerServices} onChange={e => updateEdit('offerServices', e.target.value)} />
                  <Input label="Service Areas" placeholder="e.g. Downtown, Midtown, +10 mile radius" value={editForm.serviceAreas} onChange={e => updateEdit('serviceAreas', e.target.value)} />
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <Input label="Reviews Count" type="number" min={0} value={editForm.currentReviews} onChange={e => updateEdit('currentReviews', Number(e.target.value))} />
                    <Input label="Rating" type="number" min={0} max={5} step={0.1} value={editForm.currentRating} onChange={e => updateEdit('currentRating', Number(e.target.value))} />
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setEditStep(1)} className="w-full sm:w-auto">Back</Button>
                    <Button type="button" onClick={() => setEditStep(3)} className="w-full sm:w-auto">Next <ChevronRight size={14} /></Button>
                  </div>
                </div>
              )}

              {editStep === 3 && (
                <div className="space-y-3 sm:space-y-4">
                  <Textarea label="Target Keywords *" placeholder="e.g. best burger restaurant near me" required value={editForm.targetKeywords} onChange={e => updateEdit('targetKeywords', e.target.value)} />
                  <Textarea label="Competitor Businesses" placeholder="e.g. Burger King, McDonald's" value={editForm.competitors} onChange={e => updateEdit('competitors', e.target.value)} />
                  <Textarea label="Special Instructions / Notes" placeholder="Any additional info..." value={editForm.specialInstructions} onChange={e => updateEdit('specialInstructions', e.target.value)} />
                  <div className="flex flex-col sm:flex-row justify-between pt-4 border-t border-slate-700/50 gap-2">
                    <Button type="button" variant="outline" onClick={() => setEditStep(2)} className="w-full sm:w-auto">Back</Button>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Button type="button" variant="outline" className="gap-2 w-full sm:w-auto" onClick={handleResubmit}>
                        <RotateCcw size={16} /> Save & Resubmit
                      </Button>
                      <Button type="submit" className="gap-2 w-full sm:w-auto">
                        <Pencil size={16} /> Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Modal>
        );
      })()}

      {showSectionReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowSectionReviewModal(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">
                {showSectionReviewModal.status === 'APPROVED' ? 'Approve' : 'Reject'} {showSectionReviewModal.section === 'onPage' ? 'On-Page' : 'Off-Page'} Report
              </h3>
              <button onClick={() => setShowSectionReviewModal(null)} className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-4 sm:px-6 py-5 space-y-4">
              {showSectionReviewModal.status === 'REJECTED' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">Please describe what needs to be fixed.</div>
              )}
              <textarea
                className="block w-full px-3 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                placeholder={showSectionReviewModal.status === 'REJECTED' ? 'What needs to be fixed...' : 'Optional comment...'}
                value={sectionReviewComment}
                onChange={e => setSectionReviewComment(e.target.value)}
              />
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-slate-700/50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSectionReviewModal(null)}>Cancel</Button>
              <Button variant={showSectionReviewModal.status === 'APPROVED' ? 'primary' : 'danger'} className="gap-1" onClick={handleSectionReview} disabled={showSectionReviewModal.status === 'REJECTED' && !sectionReviewComment.trim()}>
                {showSectionReviewModal.status === 'APPROVED' ? <><CheckCircle2 size={14} /> Approve</> : <><X size={14} /> Reject</>}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {showUpdateReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowUpdateReviewModal(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">
                {updateReviewStatus === 'APPROVED' ? 'Approve Update' : 'Request Changes'}
              </h3>
              <button onClick={() => setShowUpdateReviewModal(null)} className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-4 sm:px-6 py-5 space-y-4">
              {updateReviewStatus === 'CHANGES_REQUESTED' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                  Please describe what needs to be changed.
                </div>
              )}
              {updateReviewStatus === 'APPROVED' && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400">
                  You can add an optional comment with this approval.
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {updateReviewStatus === 'CHANGES_REQUESTED' ? 'Reason / What needs to be fixed' : 'Comment (optional)'}
                </label>
                <textarea
                  className="block w-full px-3 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  placeholder={updateReviewStatus === 'CHANGES_REQUESTED' ? 'e.g. Report format needs correction, missing screenshots...' : 'Any additional notes...'}
                  value={updateReviewComment}
                  onChange={e => setUpdateReviewComment(e.target.value)}
                />
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-slate-700/50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowUpdateReviewModal(null)}>Cancel</Button>
              <Button
                variant={updateReviewStatus === 'APPROVED' ? 'primary' : 'danger'}
                className="gap-1"
                onClick={handleUpdateReview}
                disabled={updateReviewStatus === 'CHANGES_REQUESTED' && !updateReviewComment.trim()}
              >
                {updateReviewStatus === 'APPROVED' ? <><CheckCircle2 size={14} /> Approve</> : <><RotateCcw size={14} /> Send Back for Changes</>}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
