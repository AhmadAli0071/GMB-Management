import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Send, FolderKanban, Clock, TrendingUp, Calendar,
  ChevronRight, X, MapPin, Globe, Star, Phone, Mail, ExternalLink,
  Search, Building2, ArrowUpRight, Loader2, FileText, Pencil, RotateCcw, ShieldCheck,
  Folder, CheckCircle2, Download, Bell, MessageCircle, Palette, Home
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Textarea, Select } from '../ui/Common';
import { useApp } from '../../AppContext';
import { useChatNotify } from '../../ChatNotifyContext';
import { STAGE_LABELS, STAGE_COLORS } from '../../types';
import { ChatBox } from '../chat/ChatBox';
import { ProjectDetailPage } from '../ProjectDetailPage';
import { GlobalChatPanel } from '../GlobalChatPanel';

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
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formStep, setFormStep] = useState(1);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editStep, setEditStep] = useState(1);
  const [showUpdateReviewModal, setShowUpdateReviewModal] = useState<string | null>(null);
  const [updateReviewStatus, setUpdateReviewStatus] = useState('');
  const [updateReviewComment, setUpdateReviewComment] = useState('');
  const [showSectionReviewModal, setShowSectionReviewModal] = useState<{ updateId: string; section: string; status: string } | null>(null);
  const [sectionReviewComment, setSectionReviewComment] = useState('');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const toggleDate = (key: string) => setExpandedDates(prev => ({ ...prev, [key]: !prev[key] }));
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
  const [sectionReviewing, setSectionReviewing] = useState(false);
  const [updateReviewing, setUpdateReviewing] = useState(false);

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

  const pendingUpdatesCount = myProjectUpdates.filter(isUpdatePending).length;

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'green';
    if (status === 'CHANGES_REQUESTED') return 'red';
    return 'yellow';
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

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setResubmitting(true);
    try {
      await updateProject(editingProject, editForm);
      await updateProjectStage(editingProject, 'CLIENT_COMMUNICATION');
      setEditingProject(null);
      setEditStep(1);
    } finally {
      setResubmitting(false);
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

  const getStatusColorForBadge = (status: string) => {
    if (status === 'APPROVED') return 'green';
    if (status === 'CHANGES_REQUESTED') return 'red';
    return 'yellow';
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-sm text-slate-500 mt-0.5">Manage GMB optimization projects</p>
          </div>
          <Button className="gap-2" onClick={() => { setForm(emptyForm); setFormStep(1); setShowCreateModal(true); }}>
            <Plus size={18} />
            New GMB Project
          </Button>
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
          <Card className={`p-5 ${pendingUpdatesCount > 0 ? 'border-red-200 bg-red-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center relative">
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
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><TrendingUp size={18} className="text-green-600" /></div>
              <span className="text-2xl font-bold text-slate-400">{myProjects.filter(p => p.stage === 'COMPLETED').length}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-semibold">Completed</p>
          </Card>
        </div>

        {/* Team Global Chat */}
        {!selectedProjectId && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Team Chat</h3>
            <GlobalChatPanel />
          </div>
        )}

        {/* If a project is selected, show its detail page */}
        {selectedProjectId && (
          <div key={selectedProjectId} className="mt-6">
            <ProjectDetailPage
              projectId={selectedProjectId}
              onBack={() => setSelectedProjectId(null)}
            />
          </div>
        )}

        {/* Projects Grid */}
        {myProjects.length === 0 && !selectedProjectId && (
          <Card className="p-16 text-center">
            <Building2 size={48} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-500 mb-2">No GMB projects yet</h3>
            <p className="text-sm text-slate-500 mb-6">Create your first GMB optimization project</p>
            <Button className="gap-2" onClick={() => { setForm(emptyForm); setFormStep(1); setShowCreateModal(true); }}>
              <Plus size={18} /> New GMB Project
            </Button>
          </Card>
        )}

        {myProjects.length > 0 && !selectedProjectId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {myProjects.map(project => {
              const projectUpdates = myProjectUpdates.filter((u: any) => u.projectId === project.id);
              const pendingForProject = projectUpdates.filter(isUpdatePending).length;
              const projectUnreadMap = unreadCounts[project.id] || {};
              const projectUnread = (Object.values(projectUnreadMap) as number[]).reduce((sum, val) => sum + val, 0);
              const stageColor = STAGE_COLORS[project.stage];
              const stageLabel = STAGE_LABELS[project.stage];

              return (
                <Card
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                >
                  {/* Top: icon + badges */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <Folder size={24} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {pendingForProject > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                          {pendingForProject} pending
                        </span>
                      )}
                      {projectUnread > 0 && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                          <MessageCircle size={10} /> {projectUnread > 99 ? '99+' : projectUnread}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title + category */}
                  <h3 className="font-bold text-slate-900 text-base mb-1 truncate" title={project.name}>
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2 min-h-[32px]">
                    {project.businessCategory || 'General Business'}
                  </p>

                  {/* Meta: city + rating */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={10} /> {project.businessCity || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={10} fill="currentColor" className="text-yellow-500" /> {project.currentRating || '0'}
                    </span>
                  </div>

                  {/* Stage badge */}
                  <Badge variant={stageColor} className="text-[10px]">
                    {stageLabel}
                  </Badge>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals remain unchanged below */}

      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setFormStep(1); }} title={formStep === 1 ? 'New GMB Project — Business Info' : formStep === 2 ? 'Links & Listing Details' : 'Target Keywords & Notes'} size="lg">
        <form onSubmit={handleCreate}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-5 sm:mb-6">
            {[1, 2, 3].map(step => (
              <React.Fragment key={step}>
                <button type="button" onClick={() => { if (step < formStep) setFormStep(step); }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center transition-colors ${step <= formStep ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {step}
                </button>
                {step < 3 && <div className={`flex-1 h-0.5 rounded ${step < formStep ? 'bg-blue-600' : 'bg-slate-100'}`} />}
              </React.Fragment>
            ))}
          </div>

          {formStep === 1 && (
            <div className="space-y-3 sm:space-y-4">
              <Input label="Business Name (Project Name) *" placeholder="e.g. BurgerHouse" required value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-medium text-slate-600">Business Category *</label>
                  <input list="business-categories" placeholder="Select or type category..." value={form.businessCategory} onChange={e => setForm(prev => ({ ...prev, businessCategory: e.target.value }))} className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" />
                  <datalist id="business-categories">
                    {BUSINESS_CATEGORIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <Input label="Business Phone *" placeholder="+1 555-0000" required value={form.businessPhone} onChange={e => setForm(prev => ({ ...prev, businessPhone: e.target.value }))} />
              </div>
              <Input label="Business Email *" type="email" placeholder="business@company.com" required value={form.businessEmail} onChange={e => setForm(prev => ({ ...prev, businessEmail: e.target.value }))} />
              <Input label="Full Address *" placeholder="123 Main St" required value={form.businessAddress} onChange={e => setForm(prev => ({ ...prev, businessAddress: e.target.value }))} />
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <Input label="City *" placeholder="City" required value={form.businessCity} onChange={e => setForm(prev => ({ ...prev, businessCity: e.target.value }))} />
                <Input label="State" placeholder="State" value={form.businessState} onChange={e => setForm(prev => ({ ...prev, businessState: e.target.value }))} />
                <Input label="Zip Code" placeholder="12345" value={form.businessZip} onChange={e => setForm(prev => ({ ...prev, businessZip: e.target.value }))} />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="button" onClick={() => setFormStep(2)}>Next <ChevronRight size={14} /></Button>
              </div>
            </div>
          )}

          {formStep === 2 && (
            <div className="space-y-3 sm:space-y-4">
              <Input label="Business Website" placeholder="https://example.com" value={form.businessWebsite} onChange={e => setForm(prev => ({ ...prev, businessWebsite: e.target.value }))} />
              <Input label="Google Maps Link" placeholder="https://maps.google.com/..." value={form.googleMapsLink} onChange={e => setForm(prev => ({ ...prev, googleMapsLink: e.target.value }))} />
              <Input label="Yelp Listing URL" placeholder="https://yelp.com/biz/..." value={form.yelpLink} onChange={e => setForm(prev => ({ ...prev, yelpLink: e.target.value }))} />
              <Input label="Home Advisor URL" placeholder="https://homeadvisor.com/..." value={form.homeAdvisorLink} onChange={e => setForm(prev => ({ ...prev, homeAdvisorLink: e.target.value }))} />
              <Input label="Business Hours" placeholder="Mon-Fri 9AM-6PM, Sat 10AM-2PM" value={form.businessHours} onChange={e => setForm(prev => ({ ...prev, businessHours: e.target.value }))} />
              <Textarea label="Services / Products" placeholder="List main services or products..." value={form.services} onChange={e => setForm(prev => ({ ...prev, services: e.target.value }))} />
              <Textarea label="What We Offer to Client" placeholder="List services we provide to this client..." value={form.offerServices} onChange={e => setForm(prev => ({ ...prev, offerServices: e.target.value }))} />
              <Input label="Service Areas" placeholder="e.g. Downtown, Midtown, +10 mile radius" value={form.serviceAreas} onChange={e => setForm(prev => ({ ...prev, serviceAreas: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Input label="Reviews Count" type="number" min={0} value={form.currentReviews} onChange={e => setForm(prev => ({ ...prev, currentReviews: Number(e.target.value) }))} />
                <Input label="Rating" type="number" min={0} max={5} step={0.1} value={form.currentRating} onChange={e => setForm(prev => ({ ...prev, currentRating: Number(e.target.value) }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setFormStep(1)}>Back</Button>
                <Button type="button" onClick={() => setFormStep(3)}>Next <ChevronRight size={14} /></Button>
              </div>
            </div>
          )}

          {formStep === 3 && (
            <div className="space-y-3 sm:space-y-4">
              <Textarea label="Target Keywords *" placeholder="e.g. best burger restaurant near me, burgers downtown, fast food delivery" required value={form.targetKeywords} onChange={e => setForm(prev => ({ ...prev, targetKeywords: e.target.value }))} />
              <Textarea label="Competitor Businesses" placeholder="e.g. Burger King, McDonald's, Five Guys (local competitors)" value={form.competitors} onChange={e => setForm(prev => ({ ...prev, competitors: e.target.value }))} />
              <Textarea label="Special Instructions / Notes" placeholder="Any additional info, client preferences, access details..." value={form.specialInstructions} onChange={e => setForm(prev => ({ ...prev, specialInstructions: e.target.value }))} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setFormStep(2)}>Back</Button>
                <Button type="submit" className="gap-2" disabled={creating}>{creating ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Plus size={16} /> Create Project</>}</Button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {editingProject && (() => {
        const project = projects.find(p => p.id === editingProject);
        if (!project) return null;
        return (
          <Modal isOpen={true} onClose={() => { setEditingProject(null); setEditStep(1); }} title={`Edit — ${project.name}`} size="lg">
            <form onSubmit={handleEditSave}>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-5 sm:mb-6">
                {[1, 2, 3].map(step => (
                  <React.Fragment key={step}>
                    <button type="button" onClick={() => { if (step < editStep) setEditStep(step); }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center transition-colors ${step <= editStep ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {step}
                    </button>
                    {step < 3 && <div className={`flex-1 h-0.5 rounded ${step < editStep ? 'bg-blue-600' : 'bg-slate-100'}`} />}
                  </React.Fragment>
                ))}
              </div>

              {editStep === 1 && (
                <div className="space-y-3 sm:space-y-4">
                  <Input label="Business Name (Project Name) *" placeholder="e.g. BurgerHouse" required value={editForm.name} onChange={e => updateEdit('name', e.target.value)} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-medium text-slate-600">Business Category *</label>
                      <input list="business-categories-edit" placeholder="Select or type category..." value={editForm.businessCategory} onChange={e => updateEdit('businessCategory', e.target.value)} className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" />
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
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setEditStep(2)}>Back</Button>
                    <Button type="button" onClick={() => setEditStep(3)}>Next <ChevronRight size={14} /></Button>
                  </div>
                </div>
              )}

              {editStep === 2 && (
                <div className="space-y-3 sm:space-y-4">
                  <Input label="Business Website" placeholder="https://example.com" value={editForm.businessWebsite} onChange={e => updateEdit('businessWebsite', e.target.value)} />
                  <Input label="Google Maps Link" placeholder="https://maps.google.com/..." value={editForm.googleMapsLink} onChange={e => updateEdit('googleMapsLink', e.target.value)} />
                  <Input label="Yelp Listing URL" placeholder="https://yelp.com/biz/..." value={editForm.yelpLink} onChange={e => updateEdit('yelpLink', e.target.value)} />
                  <Input label="Home Advisor URL" placeholder="https://homeadvisor.com/..." value={editForm.homeAdvisorLink} onChange={e => updateEdit('homeAdvisorLink', e.target.value)} />
                  <Input label="Business Hours" placeholder="Mon-Fri 9AM-6PM, Sat 10AM-2PM" value={editForm.businessHours} onChange={e => updateEdit('businessHours', e.target.value)} />
                  <Textarea label="Services / Products" placeholder="List main services or products..." value={editForm.services} onChange={e => updateEdit('services', e.target.value)} />
                  <Textarea label="What We Offer to Client" placeholder="List services we provide to this client..." value={editForm.offerServices} onChange={e => updateEdit('offerServices', e.target.value)} />
                  <Input label="Service Areas" placeholder="e.g. Downtown, Midtown, +10 mile radius" value={editForm.serviceAreas} onChange={e => updateEdit('serviceAreas', e.target.value)} />
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <Input label="Reviews Count" type="number" min={0} value={editForm.currentReviews} onChange={e => updateEdit('currentReviews', Number(e.target.value))} />
                    <Input label="Rating" type="number" min={0} max={5} step={0.1} value={editForm.currentRating} onChange={e => updateEdit('currentRating', Number(e.target.value))} />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setEditStep(1)}>Back</Button>
                    <Button type="button" onClick={() => setEditStep(3)}>Next <ChevronRight size={14} /></Button>
                  </div>
                </div>
              )}

              {editStep === 3 && (
                <div className="space-y-3 sm:space-y-4">
                  <Textarea label="Target Keywords *" placeholder="e.g. best burger restaurant near me, burgers downtown, fast food delivery" required value={editForm.targetKeywords} onChange={e => updateEdit('targetKeywords', e.target.value)} />
                  <Textarea label="Competitor Businesses" placeholder="e.g. Burger King, McDonald's, Five Guys (local competitors)" value={editForm.competitors} onChange={e => updateEdit('competitors', e.target.value)} />
                  <Textarea label="Special Instructions / Notes" placeholder="Any additional info, client preferences, access details..." value={editForm.specialInstructions} onChange={e => updateEdit('specialInstructions', e.target.value)} />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setEditStep(2)}>Back</Button>
                    <Button type="submit" className="gap-2" disabled={resubmitting}>{resubmitting ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : <><CheckCircle2 size={16} /> Update Project</>}</Button>
                  </div>
                </div>
              )}
            </form>
          </Modal>
        );
      })()}

      {/* Review Modals (unchanged) */}
      {showUpdateReviewModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowUpdateReviewModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {updateReviewStatus === 'APPROVED' ? 'Approve Update' : 'Request Changes'}
              </h3>
              <button onClick={() => setShowUpdateReviewModal(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-4 sm:px-6 py-5 space-y-4">
              {updateReviewStatus === 'CHANGES_REQUESTED' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-500">
                  Please describe what needs to be changed.
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
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
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
          </div>
        </motion.div>
      )}

      {showSectionReviewModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowSectionReviewModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {showSectionReviewModal.status === 'APPROVED' ? 'Approve Section' : 'Request Changes'}
              </h3>
              <button onClick={() => setShowSectionReviewModal(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-4 sm:px-6 py-5 space-y-4">
              {showSectionReviewModal.status === 'CHANGES_REQUESTED' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-500">
                  Please describe what needs to be changed.
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  {showSectionReviewModal.status === 'CHANGES_REQUESTED' ? 'Reason / What needs to be fixed' : 'Comment (optional)'}
                </label>
                <textarea
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  placeholder={showSectionReviewModal.status === 'CHANGES_REQUESTED' ? 'e.g. Please add more details, fix formatting...' : 'Any additional notes...'}
                  value={sectionReviewComment}
                  onChange={e => setSectionReviewComment(e.target.value)}
                />
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSectionReviewModal(null)}>Cancel</Button>
              <Button
                variant={showSectionReviewModal.status === 'APPROVED' ? 'primary' : 'danger'}
                className="gap-1"
                onClick={handleSectionReview}
                disabled={sectionReviewing || (showSectionReviewModal.status === 'CHANGES_REQUESTED' && !sectionReviewComment.trim())}
              >
                {sectionReviewing ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : showSectionReviewModal.status === 'APPROVED' ? <><CheckCircle2 size={14} /> Approve</> : <><RotateCcw size={14} /> Request Changes</>}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}