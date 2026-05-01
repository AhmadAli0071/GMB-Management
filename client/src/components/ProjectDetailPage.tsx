import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, Clock, Calendar, Users, FileText, CheckCircle2,
  Activity, Phone, Mail, ExternalLink, Shield, Briefcase,
  Globe, MessageCircle, X, RotateCcw, Loader2, Download
} from 'lucide-react';
import { Card, Button, Badge } from './ui/Common';
import { useApp } from '../AppContext';
import { ALL_STAGES, STAGE_LABELS, STAGE_COLORS, UserRole } from '../types';
import { ChatBox } from '../chat/ChatBox';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetailPage({ projectId, onBack }: ProjectDetailProps) {
  const { currentUser, projects, tasks, activities, users, updateProjectStage, projectUpdates, reviewProjectUpdate, reviewSection, workSubmissions } = useApp();
  
  // State
  const [activeTab, setActiveTab] = useState('details');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const toggleDate = (key: string) => setExpandedDates(prev => ({ ...prev, [key]: !prev[key] }));
  
  // Review modals state
  const [showUpdateReviewModal, setShowUpdateReviewModal] = useState<string | null>(null);
  const [updateReviewStatus, setUpdateReviewStatus] = useState('');
  const [updateReviewComment, setUpdateReviewComment] = useState('');
  const [showSectionReviewModal, setShowSectionReviewModal] = useState<{ updateId: string; section: string; status: string } | null>(null);
  const [sectionReviewComment, setSectionReviewComment] = useState('');
  const [updateReviewing, setUpdateReviewing] = useState(false);
  const [sectionReviewing, setSectionReviewing] = useState(false);

  const project = projects.find(p => p.id === projectId);
  if (!project) return <div className="text-center py-20 text-slate-400">Project not found</div>;

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const projectActivities = activities.filter(a => a.projectId === project.id).slice(0, 20);
  const onPageTasks = projectTasks.filter(t => t.type === 'ON_PAGE');
  const offPageTasks = projectTasks.filter(t => t.type === 'OFF_PAGE');

  const projectUpdatesForProject = projectUpdates.filter((u: any) => u.projectId === project.id && u.toId === currentUser.id);
  const groupedUpdates = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    projectUpdatesForProject.forEach((u: any) => {
      const d = u.workDate || new Date(u.createdAt).toISOString().split('T')[0];
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(u);
    });
    return grouped;
  }, [projectUpdatesForProject]);

  const isUpdatePending = (u: any) => {
    if (u.reportType === 'STRUCTURED') {
      const hasOnPage = !!(u.onPageText || (u.onPageFiles && u.onPageFiles.length > 0));
      const hasOffPage = !!(u.offPageWorkIds && u.offPageWorkIds.length > 0);
      return (hasOnPage && u.onPageStatus === 'PENDING') || (hasOffPage && u.offPageStatus === 'PENDING');
    }
    return u.status === 'PENDING_REVIEW';
  };

  const pendingUpdatesCount = projectUpdatesForProject.filter(isUpdatePending).length;
  const currentStageIndex = ALL_STAGES.indexOf(project.stage);

  // Tab configurations
  const isSalesManager = currentUser.role === UserRole.SALES_MANAGER;
  const salesTabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'records', label: `Records${pendingUpdatesCount > 0 ? ` (${pendingUpdatesCount})` : ''}`, icon: Clock },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
  ];
  const defaultTabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'on-page', label: `On-Page (${onPageTasks.length})`, icon: CheckCircle2 },
    { id: 'off-page', label: `Off-Page (${offPageTasks.length})`, icon: ExternalLink },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ];
  const tabs = isSalesManager ? salesTabs : defaultTabs;

  const canAdvanceStage = () => {
    if (currentUser.role === UserRole.SALES_MANAGER && (project.stage === 'CLIENT_COMMUNICATION' || project.stage === 'VERIFICATION')) return true;
    if (currentUser.role === UserRole.SEO_MANAGER && project.stage === 'READY_FOR_ASSIGNMENT') return true;
    if (currentUser.role === UserRole.SEO_LEAD && ['ASSIGNED_TO_LEAD', 'ON_PAGE_IN_PROGRESS', 'OFF_PAGE_IN_PROGRESS', 'REVIEW'].includes(project.stage)) return true;
    return false;
  };

  const getNextStageAction = () => {
    switch (project.stage) {
      case 'CLIENT_COMMUNICATION': return { label: 'Start Verification', stage: 'VERIFICATION' as const };
      case 'VERIFICATION': return { label: 'Verify & Forward', stage: 'READY_FOR_ASSIGNMENT' as const };
      case 'READY_FOR_ASSIGNMENT': return { label: 'Assign to Lead', stage: 'ASSIGNED_TO_LEAD' as const };
      case 'ASSIGNED_TO_LEAD': return { label: 'Start On-Page Work', stage: 'ON_PAGE_IN_PROGRESS' as const };
      case 'ON_PAGE_IN_PROGRESS': return { label: 'Move to Off-Page', stage: 'OFF_PAGE_IN_PROGRESS' as const };
      case 'OFF_PAGE_IN_PROGRESS': return { label: 'Send for Review', stage: 'REVIEW' as const };
      case 'REVIEW': return { label: 'Mark Complete', stage: 'COMPLETED' as const };
      default: return null;
    }
  };

  const nextAction = getNextStageAction();

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'green';
    if (status === 'CHANGES_REQUESTED') return 'red';
    return 'yellow';
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors mb-4 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </button>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">{project.name}</h1>
            <Badge variant={STAGE_COLORS[project.stage]}>{STAGE_LABELS[project.stage]}</Badge>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
              project.verificationStatus === 'VERIFIED' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'
            }`}>
              <Shield size={12} /> {project.verificationStatus === 'VERIFIED' ? 'Verified' : 'Unverified'}
            </span>
          </div>
          <p className="text-slate-500 mt-2 font-medium">Category: <span className="text-blue-500">{project.businessCategory || 'N/A'}</span></p>
        </div>
        <div className="flex gap-3">
          {nextAction && canAdvanceStage() && (
            <Button className="gap-2 shadow-md" onClick={() => updateProjectStage(project.id, nextAction.stage)}>
              <CheckCircle2 size={18} />
              <span>{nextAction.label}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stage Progress */}
      <Card className="p-6 bg-white rounded-2xl shadow-md border border-blue-100">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-blue-100 z-0" />
          {ALL_STAGES.map((stage, i) => {
            const isCompleted = i < currentStageIndex;
            const isCurrent = i === currentStageIndex;
            return (
              <div key={stage} className="relative z-10 flex flex-col items-center gap-2 bg-white px-3 py-1">
                <div className={`w-11 h-11 rounded-full border-3 flex items-center justify-center transition-all shadow-md ${
                  isCompleted ? 'bg-blue-500 border-blue-200 text-white' :
                  isCurrent ? 'bg-white border-blue-500 text-blue-500 shadow-lg shadow-blue-200' :
                  'bg-white border-slate-200 text-slate-300'
                }`}>
                  {isCompleted ? <CheckCircle2 size={18} /> : <span className="text-sm font-bold">{i + 1}</span>}
                </div>
                <span className={`text-[10px] font-bold tracking-wider uppercase text-center max-w-[80px] ${
                  isCurrent ? 'text-blue-500' : isCompleted ? 'text-slate-600' : 'text-slate-300'
                }`}>{STAGE_LABELS[stage].split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-blue-100 gap-6 overflow-x-auto no-scrollbar bg-white rounded-t-2xl px-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-4 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* SALES MANAGER: Details Tab */}
        {isSalesManager && activeTab === 'details' && (
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
        )}

        {/* SALES MANAGER: Records Tab */}
        {isSalesManager && activeTab === 'records' && (
          <div className="space-y-2">
            {Object.keys(groupedUpdates).length > 0 ? (
              Object.keys(groupedUpdates).sort((a, b) => b.localeCompare(a)).map((date: string) => {
                const dateKey = `${project.id}-${date}`;
                const updates = groupedUpdates[date];
                return (
                  <div key={date} className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-100 flex items-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleDate(dateKey)}>
                      {expandedDates[dateKey] ? <Clock size={14} className="text-blue-600 rotate-90" /> : <Clock size={14} className="text-blue-600" />}
                      <span className="text-sm font-semibold text-slate-800">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">{updates.length} report{updates.length !== 1 ? 's' : ''}</span>
                    </div>
                    {expandedDates[dateKey] && (
                      <div className="divide-y divide-slate-200">
                        {updates.map((update: any) => {
                          const fromUser = users[update.fromId];
                          const isStructured = update.reportType === 'STRUCTURED';
                          const hasOnPage = isStructured && !!(update.onPageText || (update.onPageFiles && update.onPageFiles.length > 0));
                          const hasOffPage = isStructured && !!(update.offPageWorkIds && update.offPageWorkIds.length > 0);
                          const offPageWorks = hasOffPage ? update.offPageWorkIds.map((id: string) => workSubmissions.find((w: any) => w.id === id)).filter(Boolean) : [];

                          return (
                            <div key={update.id} className="p-4 bg-white">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant={getStatusColor(isStructured && !isUpdatePending(update) && update.status === 'PENDING_REVIEW' ? 'APPROVED' : update.status)} className="text-[10px]">
                                    {isStructured
                                      ? (isUpdatePending(update) ? 'Pending Review' : 'Approved')
                                      : (update.status === 'APPROVED' ? 'Approved' : update.status === 'CHANGES_REQUESTED' ? 'Changes Requested' : 'Pending Review')
                                    }
                                  </Badge>
                                  {isStructured && <Badge variant="purple" className="text-[10px]">Structured Report</Badge>}
                                  <span className="text-[11px] text-slate-500">{fromUser?.name} — {new Date(update.createdAt).toLocaleString()}</span>
                                </div>
                                {!isStructured && update.status === 'PENDING_REVIEW' && (
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="primary" className="gap-1 text-[11px] px-2 py-1" onClick={() => { setUpdateReviewStatus('APPROVED'); setUpdateReviewComment(''); setShowUpdateReviewModal(update.id); }}>
                                      <CheckCircle2 size={12} /> Approve
                                    </Button>
                                    <Button size="sm" variant="danger" className="gap-1 text-[11px] px-2 py-1" onClick={() => { setUpdateReviewStatus('CHANGES_REQUESTED'); setUpdateReviewComment(''); setShowUpdateReviewModal(update.id); }}>
                                      <RotateCcw size={12} /> Reject
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {update.title && <p className="text-sm font-semibold text-blue-600 mb-1">{update.title}</p>}
                              {update.text && <p className="text-sm text-slate-600 mb-2 whitespace-pre-wrap">{update.text}</p>}

                              {isStructured ? (
                                <div className="space-y-4">
                                  {hasOnPage && (
                                    <div>
                                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                        <h5 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1"><FileText size={10} /> On-Page Report</h5>
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
                                                    <span className="flex items-center gap-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs text-blue-600 hover:bg-blue-100"><Download size={14} /> {f.originalName}</span>
                                                  )}
                                                </a>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                      {update.onPageComment && (
                                        <div className={`p-2 rounded-lg text-xs mt-2 ${update.onPageStatus === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                          <span className="font-bold">Review:</span> {update.onPageComment}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {hasOffPage && (
                                    <div>
                                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                        <h5 className="text-xs font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1"><Globe size={10} /> Off-Page Report</h5>
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
                                                        <span className="flex items-center gap-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs text-blue-600 hover:bg-blue-100"><Download size={14} /> {f.originalName}</span>
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
                                        <div className={`p-2 rounded-lg text-xs mt-2 ${update.offPageStatus === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
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
                                    <div className="flex flex-wrap gap-3 mb-2">
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

                              {/* Designer work approvals section would go here if needed */}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <Card className="p-12 text-center text-slate-400 bg-white rounded-xl border border-blue-100">
                <FileText size={36} className="mx-auto mb-3 text-slate-300" />
                <p>No records yet</p>
              </Card>
            )}
          </div>
        )}

        {/* SALES MANAGER: Chat Tab */}
        {isSalesManager && activeTab === 'chat' && (
          <div className="h-[70vh]">
            <ChatBox projectId={project.id} />
          </div>
        )}

        {/* NON-SALES: Overview Tab */}
        {!isSalesManager && activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 bg-white rounded-2xl shadow-md border border-blue-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800"><FileText size={18} className="text-blue-500" /> Project Description</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{project.specialInstructions || project.targetKeywords || 'GMB Optimization Project'}</p>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white rounded-2xl shadow-md border border-blue-100">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800"><Calendar size={18} className="text-blue-500" /> Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Category</span><span className="font-semibold text-slate-700">{project.businessCategory || 'N/A'}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-slate-400 flex items-center gap-1"><Mail size={12} /> Email</span><span className="font-semibold text-blue-500">{project.businessEmail}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-slate-400 flex items-center gap-1"><Phone size={12} /> Phone</span><span className="font-semibold text-slate-700">{project.businessPhone}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Location</span><span className="font-semibold text-slate-700">{project.businessCity}{project.businessState ? `, ${project.businessState}` : ''}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Status</span><span className={`font-bold flex items-center gap-1 ${project.verificationStatus === 'VERIFIED' ? 'text-green-500' : 'text-red-400'}`}><Shield size={12} /> {project.verificationStatus === 'VERIFIED' ? 'Verified' : 'Unverified'}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Created</span><span className="font-semibold text-slate-700">{new Date(project.createdAt).toLocaleDateString()}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Last Update</span><span className="font-semibold text-slate-700">{new Date(project.lastUpdate).toLocaleDateString()}</span></div>
                  </div>
                </Card>
                <Card className="p-6 bg-white rounded-2xl shadow-md border border-blue-100">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800"><Users size={18} className="text-blue-500" /> Team</h3>
                  <div className="space-y-3">
                    {project.assignedTo.map(id => {
                      const user = users[id];
                      return (
                        <div key={id} className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                          <img src={user?.avatar} className="w-10 h-10 rounded-full border-2 border-blue-200" referrerPolicy="no-referrer" />
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                            <p className="text-[10px] text-blue-500 font-medium uppercase">{user?.role.replace('_', ' ')}</p>
                          </div>
                        </div>
                      );
                    })}
                    {project.assignedTo.length === 0 && <p className="text-sm text-slate-400">No team assigned yet</p>}
                  </div>
                </Card>
              </div>
            </div>
            <Card className="p-6 bg-white rounded-2xl shadow-md border border-blue-100 h-fit sticky top-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800"><Briefcase size={18} className="text-blue-500" /> Task Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm"><span className="text-slate-400">Total Tasks</span><span className="font-bold text-slate-700">{projectTasks.length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Completed</span><span className="font-bold text-green-500">{projectTasks.filter(t => t.status === 'COMPLETED').length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">In Progress</span><span className="font-bold text-blue-500">{projectTasks.filter(t => t.status === 'IN_PROGRESS').length}</span></div>
                <div className="h-2.5 bg-blue-100 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all shadow-sm" style={{ width: `${projectTasks.length > 0 ? (projectTasks.filter(t => t.status === 'COMPLETED').length / projectTasks.length) * 100 : 0}%` }} />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* NON-SALES: On-Page / Off-Page Tabs */}
        {!isSalesManager && (activeTab === 'on-page' || activeTab === 'off-page') && (
          <div className="space-y-3">
            {(activeTab === 'on-page' ? onPageTasks : offPageTasks).map(task => {
              const assignee = users[task.assignedTo];
              return (
                <Card key={task.id} className="p-5 bg-white rounded-xl shadow-md border border-blue-100 flex items-center justify-between hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <button className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                      task.status === 'COMPLETED' ? 'bg-green-500 border-green-500 text-white' : 'border-blue-200'
                    }`}>
                      {task.status === 'COMPLETED' && <CheckCircle2 size={14} />}
                    </button>
                    <div>
                      <p className={`font-semibold text-sm ${task.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.title}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Badge variant={task.status === 'COMPLETED' ? 'green' : task.status === 'IN_PROGRESS' ? 'blue' : 'gray'}>{task.status.replace('_', ' ')}</Badge>
                        <Badge variant={task.priority === 'HIGH' ? 'red' : 'gray'} className="text-[9px]">{task.priority}</Badge>
                        {assignee && <span className="text-[11px] text-slate-400">{assignee.name}</span>}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
            {(activeTab === 'on-page' ? onPageTasks.length : offPageTasks.length) === 0 && (
              <Card className="p-12 text-center text-slate-400 bg-white rounded-xl border border-blue-100">No {activeTab} tasks yet</Card>
            )}
          </div>
        )}

        {/* NON-SALES: Timeline Tab */}
        {!isSalesManager && activeTab === 'timeline' && (
          <div className="max-w-2xl mx-auto py-6">
            <div className="relative space-y-6">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-blue-100 z-0" />
              {projectActivities.map(activity => {
                const user = users[activity.userId];
                return (
                  <div key={activity.id} className="relative z-10 flex gap-4 pl-12 group">
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-500 shadow-sm">
                      <Activity size={14} />
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-md border border-blue-100 flex-1">
                      <p className="text-sm text-slate-700">
                        <span className="font-bold text-blue-500">{user?.name}</span> {activity.content}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
              {projectActivities.length === 0 && (
                <div className="text-center text-slate-400 py-10 bg-white rounded-xl border border-blue-100">No activity yet for this project</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Review Modals */}
      {showUpdateReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
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
        </div>
      )}

      {showSectionReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
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
        </div>
      )}
    </div>
  );
}
