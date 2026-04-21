import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, MapPin, Star, Globe, Search, Building2, X, ExternalLink, Calendar,
  Shield, Send, Clock, Folder, ChevronDown, ChevronUp,
  CheckCircle2, RotateCcw, Download, FileText, Bell, Users, MessageCircle
} from 'lucide-react';
import { Card, Button, Badge, Textarea } from '../ui/Common';
import { useApp } from '../../AppContext';
import { useChatNotify } from '../../ChatNotifyContext';
import { STAGE_LABELS, STAGE_COLORS } from '../../types';
import { ChatBox } from '../chat/ChatBox';

export function SEOManagerDashboard() {
  const { projects, users, currentUser, assignToLead, projectUpdates, reviewProjectUpdate, reviewSection, workSubmissions } = useApp();
  const { unreadCounts } = useChatNotify();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showAssignPopup, setShowAssignPopup] = useState<string | null>(null);
  const [assignComment, setAssignComment] = useState('');
  const [showSectionReviewModal, setShowSectionReviewModal] = useState<{ updateId: string; section: string; status: string } | null>(null);
  const [sectionReviewComment, setSectionReviewComment] = useState('');
  const [showUpdateReviewModal, setShowUpdateReviewModal] = useState<string | null>(null);
  const [updateReviewStatus, setUpdateReviewStatus] = useState('');
  const [updateReviewComment, setUpdateReviewComment] = useState('');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const toggleDate = (key: string) => setExpandedDates(prev => ({ ...prev, [key]: !prev[key] }));

  const salesManager = (Object.values(users) as any[]).find(u => u.role === 'SALES_MANAGER');
  const salesManagerName = salesManager?.name || 'Sales Manager';

  const seoLead = (Object.values(users) as any[]).find(u => u.role === 'SEO_LEAD');
  const seoLeadId = seoLead?.id || '';
  const seoLeadName = seoLead?.name || 'SEO Lead';

  const myProjectUpdates = projectUpdates.filter((u: any) => u.toId === currentUser.id);
  const pendingUpdatesCount = myProjectUpdates.filter((u: any) => u.status === 'PENDING_REVIEW').length;

  const newProjects = projects.filter(p => ['CLIENT_COMMUNICATION', 'VERIFICATION', 'READY_FOR_ASSIGNMENT'].includes(p.stage));
  const activeProjects = projects.filter(p => ['ASSIGNED_TO_LEAD', 'ON_PAGE_IN_PROGRESS', 'OFF_PAGE_IN_PROGRESS', 'REVIEW'].includes(p.stage));
  const allDisplayProjects = [...newProjects, ...activeProjects];

  const handleAssign = () => {
    if (!showAssignPopup) return;
    assignToLead(showAssignPopup, seoLeadId, assignComment);
    setShowAssignPopup(null);
    setAssignComment('');
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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">SEO Operations Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage GMB projects</p>
        </div>
        {pendingUpdatesCount > 0 && (
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="relative">
              <Bell size={20} className="text-red-400" />
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">{pendingUpdatesCount}</span>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-red-400">{pendingUpdatesCount} new report{pendingUpdatesCount !== 1 ? 's' : ''} from {seoLeadName}</span>
          </div>
        )}
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
          const pendingForProject = projectUpdates.filter((u: any) => u.status === 'PENDING_REVIEW').length;
          const badge = getProjectBadge(project.stage);
          const projectUnreadMap = unreadCounts[project.id] || {};
          const projectUnread = (Object.values(projectUnreadMap) as number[]).reduce((sum, val) => sum + val, 0);

          return (
            <Card key={project.id} className="overflow-hidden">
              <div className="p-4 sm:p-5 cursor-pointer hover:bg-slate-700/50 transition-colors" onClick={() => setExpandedProject(isExpanded ? null : project.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${isNew ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
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
                        <h3 className="font-bold text-base sm:text-lg text-slate-100">{project.name}</h3>
                        <Badge variant={badge.color as any}>{badge.label}</Badge>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${project.verificationStatus === 'VERIFIED' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          <Shield size={10} /> {project.verificationStatus === 'VERIFIED' ? 'Verified' : 'Unverified'}
                        </span>
                        {pendingForProject > 0 && !isExpanded && (
                          <span className="text-[10px] font-semibold text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full animate-pulse">{pendingForProject} new report{pendingForProject !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{project.businessCategory || 'N/A'}</p>
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
                        {pendingForProject > 0 && <p className="text-red-400 font-semibold">{pendingForProject} pending</p>}
                      </div>
                    )}
                    {isExpanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-700/50">
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                  <div className="p-4 sm:p-5 border-b border-slate-700/50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-500 rounded-full" />
                        Project Details
                      </h4>
                      {isNew && (
                        <Button size="sm" className="gap-1" onClick={(e) => { e.stopPropagation(); setShowAssignPopup(project.id); }}>
                          Assign to {seoLeadName} <ArrowRight size={14} />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                       <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Category</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessCategory || 'N/A'}</p></div>
                       <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Phone</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessPhone || 'N/A'}</p></div>
                       <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Email</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessEmail || 'N/A'}</p></div>
                       <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Website</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessWebsite || 'N/A'}</p></div>
                       <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Address</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessAddress}{project.businessCity ? `, ${project.businessCity}` : ''} {project.businessState} {project.businessZip}</p></div>
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
                    {project.managerComment && (
                      <div className="mt-3 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400">
                        <span className="font-bold">{salesManagerName}:</span> {project.managerComment}
                      </div>
                    )}
                    {project.targetKeywords && (
                      <div className="mt-3">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Keywords</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {project.targetKeywords.split(',').map((kw, i) => (<span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded-full">{kw.trim()}</span>))}
                        </div>
                      </div>
                    )}
                    {project.specialInstructions && (
                      <div className="mt-3 p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-300">{project.specialInstructions}</div>
                    )}
                    {isActive && project.assignedTo.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <Users size={14} className="text-slate-500" />
                        <div className="flex -space-x-2">
                          {project.assignedTo.map(id => (<img key={id} src={users[id]?.avatar} className="w-6 h-6 rounded-full border-2 border-slate-800 ring-1 ring-slate-700" referrerPolicy="no-referrer" />))}
                        </div>
                        <span className="text-xs text-slate-500">{project.assignedTo.map(id => users[id]?.name).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {isActive && projectUpdates.length > 0 && (
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                          <FileText size={12} className="text-green-400" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <div className="w-1 h-4 bg-green-500 rounded-full" />
                          Project Records
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {(() => {
                          const grouped: Record<string, any[]> = {};
                          projectUpdates.forEach((u: any) => {
                            const d = u.workDate || new Date(u.createdAt).toISOString().split('T')[0];
                            if (!grouped[d]) grouped[d] = [];
                            grouped[d].push(u);
                          });
                          return Object.keys(grouped).sort((a: string, b: string) => b.localeCompare(a)).map((date: string) => (
                            <div key={date} className="bg-slate-800/30 rounded-lg border border-slate-700/30 overflow-hidden">
                                <div className="px-4 py-2.5 bg-slate-800/60 flex items-center gap-2 cursor-pointer hover:bg-slate-700/40 transition-colors" onClick={() => toggleDate(`${project.id}-${date}`)}>
                                  {expandedDates[`${project.id}-${date}`] ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                                  <Calendar size={13} className="text-blue-400" />
                                <span className="text-sm font-semibold text-slate-200">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                <span className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">{grouped[date].length} report{grouped[date].length !== 1 ? 's' : ''}</span>
                              </div>
                                <div className={`divide-y divide-slate-700/30 p-3 space-y-3 ${expandedDates[`${project.id}-${date}`] ? '' : 'hidden'}`}>
                                  {grouped[date].map((update: any) => {
                          const fromUser = users[update.fromId];
                          const isStructured = update.reportType === 'STRUCTURED';
                          const offPageWorks = (update.offPageWorkIds || []).map((id: string) => workSubmissions.find((w: any) => w.id === id)).filter(Boolean);

                          return (
                            <div key={update.id} className="p-3 sm:p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                                        <h5 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
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
                                                    <span className="flex items-center gap-1 px-3 py-2 bg-slate-700/50 border border-blue-500/20 rounded-lg text-xs text-blue-400 hover:bg-slate-700"><Download size={14} /> {f.originalName}</span>
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
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                                        <h5 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1">
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
                                                        <span className="flex items-center gap-1 px-3 py-2 bg-slate-700/50 border border-blue-500/20 rounded-lg text-xs text-blue-400 hover:bg-slate-700"><Download size={14} /> {f.originalName}</span>
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
                                    <div className="flex flex-wrap gap-2 sm:gap-3 mb-2">
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
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                  </div>
                  <div className="lg:col-span-1 border-l border-slate-700/50 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
                    <ChatBox projectId={project.id} />
                  </div>
                </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {showAssignPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowAssignPopup(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">Send to {seoLeadName}</h3>
              <button onClick={() => setShowAssignPopup(null)} className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-4 sm:px-6 py-5 space-y-4">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm">
                <p className="font-semibold text-purple-400">{projects.find(p => p.id === showAssignPopup)?.name}</p>
                <p className="text-xs text-purple-400 mt-0.5">{projects.find(p => p.id === showAssignPopup)?.businessCategory || 'GMB Project'}</p>
              </div>
              <Textarea
                label="Comment for SEO Lead"
                placeholder="Add instructions or notes for the SEO Lead..."
                value={assignComment}
                onChange={e => setAssignComment(e.target.value)}
              />
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-slate-700/50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAssignPopup(null)}>Cancel</Button>
              <Button className="gap-1" onClick={handleAssign}>
                Send to {seoLeadName} <ArrowRight size={14} />
              </Button>
            </div>
          </motion.div>
        </div>
      )}

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
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                  Please describe what needs to be fixed.
                </div>
              )}
              <textarea
                className="block w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
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
                  Please describe what needs to be changed so {seoLeadName} can fix and resubmit.
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
                  className="block w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
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
