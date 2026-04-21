import React, { useState, useRef } from 'react';
import {
  Globe, X, ShieldCheck, ExternalLink, Calendar,
  Folder, ChevronDown, ChevronUp, Download, FileText, Clock, Trash2, MessageCircle,
  Palette, Image, Paperclip, Send, CheckCircle2
} from 'lucide-react';
import { Card, Badge, Button } from '../ui/Common';
import { useApp } from '../../AppContext';
import { useChatNotify } from '../../ChatNotifyContext';
import { STAGE_LABELS, STAGE_COLORS } from '../../types';
import { ChatBox } from '../chat/ChatBox';

export function BossDashboard() {
  const { projects, users, projectUpdates, workSubmissions, deleteProject, createAssignment, reviewWork, assignments } = useApp();
  const { unreadCounts } = useChatNotify();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const toggleDate = (key: string) => setExpandedDates(prev => ({ ...prev, [key]: !prev[key] }));
  const [showAssignDesignerModal, setShowAssignDesignerModal] = useState(false);
  const [assignDesignerForm, setAssignDesignerForm] = useState({ projectId: '', text: '' });
  const [assignDesignerImages, setAssignDesignerImages] = useState<FileList | null>(null);
  const [assignDesignerDocs, setAssignDesignerDocs] = useState<FileList | null>(null);
  const [reviewWorkModal, setReviewWorkModal] = useState<string | null>(null);
  const [reviewWorkStatus, setReviewWorkStatus] = useState('');
  const [reviewWorkComment, setReviewWorkComment] = useState('');
  const assignDesignerImgRef = useRef<HTMLInputElement>(null);
  const assignDesignerDocRef = useRef<HTMLInputElement>(null);

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
  };

  const handleReviewDesignerWork = async () => {
    if (!reviewWorkModal) return;
    await reviewWork(reviewWorkModal, reviewWorkStatus, reviewWorkComment);
    setReviewWorkModal(null);
    setReviewWorkStatus('');
    setReviewWorkComment('');
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center"><Folder size={18} className="text-blue-400" /></div>
              <span className="text-2xl font-bold text-slate-400">{projects.length}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-semibold">Total Projects</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center"><Clock size={18} className="text-yellow-400" /></div>
              <span className="text-2xl font-bold text-slate-400">{pendingCount}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-semibold">Pending Reports</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center"><FileText size={18} className="text-green-400" /></div>
              <span className="text-2xl font-bold text-slate-400">{approvedCount}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-semibold">Fully Approved</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center"><X size={18} className="text-red-400" /></div>
              <span className="text-2xl font-bold text-slate-400">{rejectedCount}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-semibold">Rejected</p>
          </Card>
        </div>

        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">All Projects — Reports</h2>

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
              <Card key={project.id} className={`overflow-hidden ${hasRejected ? 'border-red-500/20' : allApproved ? 'border-green-500/20' : hasPending ? 'border-yellow-500/20' : ''}`}>
                <div className="p-5 cursor-pointer hover:bg-slate-900/30 transition-colors" onClick={() => setExpandedProject(isExpanded ? null : project.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${allApproved ? 'bg-green-500/10 text-green-400' : hasRejected ? 'bg-red-500/10 text-red-400' : hasPending ? 'bg-yellow-500/10 text-yellow-400' : 'bg-slate-900/50 text-slate-500'}`}>
                          <Folder size={28} />
                        </div>
                        {projectUnread > 0 && (
                          <span className="absolute -top-1.5 -left-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-bounce shadow-lg shadow-red-500/50 z-10">
                            {projectUnread > 99 ? '99+' : projectUnread}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg text-slate-100">{project.name}</h3>
                          <Badge variant={STAGE_COLORS[project.stage]}>{STAGE_LABELS[project.stage]}</Badge>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${project.verificationStatus === 'VERIFIED' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            <ShieldCheck size={10} /> {project.verificationStatus === 'VERIFIED' ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{project.businessCategory || 'N/A'} — {project.businessCity}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                          <span>Created by {(users[project.createdBy] as any)?.name || 'Unknown'}</span>
                          <span>{structuredReports.length} report{structuredReports.length !== 1 ? 's' : ''}</span>
                          {allApproved && <span className="text-green-400 font-semibold">Fully Approved</span>}
                          {hasRejected && <span className="text-red-400 font-semibold">Has Rejections</span>}
                          {hasPending && !hasRejected && <span className="text-yellow-400 font-semibold">Pending</span>}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-700/50">
                  <div className="grid grid-cols-1 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                    <div className="px-4 sm:px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-500 rounded-full" />
                        Project Details
                      </h4>
                      <div className="flex gap-2">
                        <Button size="sm" variant="danger" className="gap-1" onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(project.id); }}>
                          <Trash2 size={14} /> Delete
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 border-b border-slate-700/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        <div className="p-2.5 bg-white/[0.04] rounded-lg border border-blue-200/10"><span className="text-[10px] text-blue-300/60 uppercase tracking-wider font-medium">Category</span><p className="text-sm font-medium text-blue-50 mt-0.5 truncate">{project.businessCategory || 'N/A'}</p></div>
                        <div className="p-2.5 bg-white/[0.04] rounded-lg border border-blue-200/10"><span className="text-[10px] text-blue-300/60 uppercase tracking-wider font-medium">Location</span><p className="text-sm font-medium text-blue-50 mt-0.5 truncate">{project.businessCity}{project.businessState ? `, ${project.businessState}` : ''}</p></div>
                        <div className="p-2.5 bg-white/[0.04] rounded-lg border border-blue-200/10"><span className="text-[10px] text-blue-300/60 uppercase tracking-wider font-medium">Phone</span><p className="text-sm font-medium text-blue-50 mt-0.5 truncate">{project.businessPhone || 'N/A'}</p></div>
                        <div className="p-2.5 bg-white/[0.04] rounded-lg border border-blue-200/10"><span className="text-[10px] text-blue-300/60 uppercase tracking-wider font-medium">Email</span><p className="text-sm font-medium text-blue-50 mt-0.5 truncate">{project.businessEmail || 'N/A'}</p></div>
                        <div className="p-2.5 bg-white/[0.04] rounded-lg border border-blue-200/10"><span className="text-[10px] text-blue-300/60 uppercase tracking-wider font-medium">Website</span><p className="text-sm font-medium text-blue-50 mt-0.5 truncate">{project.businessWebsite || 'N/A'}</p></div>
                        <div className="p-2.5 bg-white/[0.04] rounded-lg border border-blue-200/10"><span className="text-[10px] text-blue-300/60 uppercase tracking-wider font-medium">Address</span><p className="text-sm font-medium text-blue-50 mt-0.5 truncate">{project.businessAddress}{project.businessCity ? `, ${project.businessCity}` : ''} {project.businessState} {project.businessZip}</p></div>
                        <div className="p-2.5 bg-white/[0.04] rounded-lg border border-blue-200/10"><span className="text-[10px] text-blue-300/60 uppercase tracking-wider font-medium">Service Areas</span><p className="text-sm font-medium text-blue-50 mt-0.5 truncate">{project.serviceAreas || 'N/A'}</p></div>
                        <div className="p-2.5 bg-white/[0.04] rounded-lg border border-blue-200/10"><span className="text-[10px] text-blue-300/60 uppercase tracking-wider font-medium">Services</span><p className="text-sm font-medium text-blue-50 mt-0.5 truncate">{project.services || 'N/A'}</p></div>
                        <div className="p-2.5 bg-white/[0.04] rounded-lg border border-blue-200/10"><span className="text-[10px] text-blue-300/60 uppercase tracking-wider font-medium">What We Offer</span><p className="text-sm font-medium text-blue-50 mt-0.5 truncate">{(project as any).offerServices || 'N/A'}</p></div>
                        <div className="p-2.5 bg-white/[0.04] rounded-lg border border-blue-200/10"><span className="text-[10px] text-blue-300/60 uppercase tracking-wider font-medium">Business Hours</span><p className="text-sm font-medium text-blue-50 mt-0.5 truncate">{project.businessHours || 'N/A'}</p></div>
                        <div className="p-2.5 bg-white/[0.04] rounded-lg border border-blue-200/10"><span className="text-[10px] text-blue-300/60 uppercase tracking-wider font-medium">Reviews</span><p className="text-sm font-medium text-blue-50 mt-0.5">{project.currentReviews} ({project.currentRating} rating)</p></div>
                        <div className="p-2.5 bg-white/[0.04] rounded-lg border border-blue-200/10"><span className="text-[10px] text-blue-300/60 uppercase tracking-wider font-medium">Competitors</span><p className="text-sm font-medium text-blue-50 mt-0.5 truncate">{project.competitors || 'N/A'}</p></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                        {project.googleMapsLink && <a href={project.googleMapsLink} target="_blank" className="flex items-center gap-2 p-2.5 bg-blue-500/5 rounded-lg border border-blue-500/10 hover:bg-blue-500/10 transition-colors"><ExternalLink size={12} className="text-blue-400 shrink-0" /><div className="min-w-0"><span className="text-[10px] text-blue-400/60 uppercase tracking-wider">Google Maps</span><p className="text-xs text-blue-400 truncate">{project.googleMapsLink}</p></div></a>}
                        {(project as any).yelpLink && <a href={(project as any).yelpLink} target="_blank" className="flex items-center gap-2 p-2.5 bg-blue-500/5 rounded-lg border border-blue-500/10 hover:bg-blue-500/10 transition-colors"><ExternalLink size={12} className="text-blue-400 shrink-0" /><div className="min-w-0"><span className="text-[10px] text-blue-400/60 uppercase tracking-wider">Yelp</span><p className="text-xs text-blue-400 truncate">{(project as any).yelpLink}</p></div></a>}
                        {(project as any).homeAdvisorLink && <a href={(project as any).homeAdvisorLink} target="_blank" className="flex items-center gap-2 p-2.5 bg-blue-500/5 rounded-lg border border-blue-500/10 hover:bg-blue-500/10 transition-colors"><ExternalLink size={12} className="text-blue-400 shrink-0" /><div className="min-w-0"><span className="text-[10px] text-blue-400/60 uppercase tracking-wider">Home Advisor</span><p className="text-xs text-blue-400 truncate">{(project as any).homeAdvisorLink}</p></div></a>}
                      </div>
                    </div>

                    {structuredReports.length > 0 ? (
                      <div className="p-4 sm:p-5">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <div className="w-1 h-4 bg-purple-500 rounded-full" />
                          Project Records
                        </h4>
                        <div className="space-y-2">
                          {(() => {
                            const grouped: Record<string, any[]> = {};
                            structuredReports.forEach((r: any) => {
                              const d = r.workDate || new Date(r.createdAt).toISOString().split('T')[0];
                              if (!grouped[d]) grouped[d] = [];
                              grouped[d].push(r);
                            });
                            const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
                            return dates.map(date => (
                              <div key={date} className="bg-slate-800/30 rounded-lg border border-slate-700/30 overflow-hidden">
                                <div className="px-4 py-2.5 bg-slate-800/60 flex items-center gap-2 cursor-pointer hover:bg-slate-700/40 transition-colors" onClick={() => toggleDate(`${project.id}-${date}`)}>
                                  {expandedDates[`${project.id}-${date}`] ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                                  <Calendar size={13} className="text-blue-400" />
                                  <span className="text-sm font-semibold text-slate-200">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                  <span className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">{grouped[date].length} report{grouped[date].length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className={`divide-y divide-slate-700/30 ${expandedDates[`${project.id}-${date}`] ? '' : 'hidden'}`}>
                                  {grouped[date].map((report: any) => {
                                    const fromUser = users[report.fromId];
                                    const toUser = users[report.toId];
                                    const offPageWorks = (report.offPageWorkIds || []).map((id: string) => workSubmissions.find((w: any) => w.id === id)).filter(Boolean);
                                    return (
                                      <div key={report.id} className="p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Badge variant="purple" className="text-[10px]">Structured Report</Badge>
                                          <span className="text-[10px] text-slate-500">{fromUser?.name} → {toUser?.name}</span>
                                          <span className="text-[10px] text-slate-600">{new Date(report.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="space-y-2">
                                          {(report.onPageText || (report.onPageFiles && report.onPageFiles.length > 0)) && (
                                            <div>
                                              <div className="flex items-center justify-between mb-1">
                                                <h5 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1"><FileText size={10} /> On-Page</h5>
                                                <Badge variant={getStatusColor(report.onPageStatus)} className="text-[10px]">{report.onPageStatus === 'APPROVED' ? 'Approved' : report.onPageStatus === 'REJECTED' ? 'Rejected' : 'Pending'}</Badge>
                                              </div>
                                              <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                                {report.onPageText && <p className="text-xs text-slate-300 whitespace-pre-wrap">{report.onPageText}</p>}
                                                {report.onPageFiles && report.onPageFiles.length > 0 && (
                                                  <div className="flex flex-wrap gap-1.5 mt-1.5">{report.onPageFiles.map((f: any, i: number) => {
                                                    const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                                    return <a key={i} href={`/uploads/${f.filename}`} target="_blank" download>{isImg ? <img src={`/uploads/${f.filename}`} className="w-14 h-14 rounded object-cover border border-slate-700/50" /> : <span className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 border border-blue-500/20 rounded text-[10px] text-blue-400"><Download size={10} /> {f.originalName}</span>}</a>;
                                                  })}</div>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                          {offPageWorks.length > 0 && (
                                            <div>
                                              <div className="flex items-center justify-between mb-1">
                                                <h5 className="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1"><Globe size={10} /> Off-Page</h5>
                                                <Badge variant={getStatusColor(report.offPageStatus)} className="text-[10px]">{report.offPageStatus === 'APPROVED' ? 'Approved' : report.offPageStatus === 'REJECTED' ? 'Rejected' : 'Pending'}</Badge>
                                              </div>
                                              <div className="space-y-1">{offPageWorks.map((work: any) => (
                                                <div key={work.id} className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                                  {work.text && <p className="text-xs text-slate-300">{work.text}</p>}
                                                  {work.files && work.files.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-1">{work.files.map((f: any, i: number) => {
                                                      const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                                      return <a key={i} href={`/uploads/${f.filename}`} target="_blank" download>{isImg ? <img src={`/uploads/${f.filename}`} className="w-14 h-14 rounded object-cover border border-slate-700/50" /> : <span className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 border border-blue-500/20 rounded text-[10px] text-blue-400"><Download size={10} /> {f.originalName}</span>}</a>;
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
                            ));
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 py-8 text-center text-sm text-slate-500">No reports submitted yet</div>
                    )}

                    {(() => {
                      const mySentAssignments = assignments.filter(a => a.toId === designerId && a.projectId === project.id);
                      const designerWork = workSubmissions.filter((w: any) => w.projectId === project.id && w.fromId === designerId);
                      if (designerWork.length === 0 && mySentAssignments.length === 0) return null;
                      return (
                        <div className="px-4 sm:px-5 py-4 border-t border-slate-700/50">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-pink-500/20 rounded flex items-center justify-center">
                              <Palette size={12} className="text-pink-400" />
                            </div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{designerName}'s Design Work</h4>
                          </div>
                          {designerWork.length === 0 ? (
                            <p className="text-xs text-slate-500 text-center py-4">No submissions yet</p>
                          ) : (() => {
                            const grouped: Record<string, any[]> = {};
                            designerWork.forEach((w: any) => {
                              const d = w.workDate || new Date(w.createdAt).toISOString().split('T')[0];
                              if (!grouped[d]) grouped[d] = [];
                              grouped[d].push(w);
                            });
                            return Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(date => {
                              const dateKey = `designer-${project.id}-${date}`;
                              return (
                                <div key={date} className="mb-2 bg-pink-500/5 border border-pink-500/20 rounded-lg overflow-hidden">
                                  <div className="px-3 py-2 bg-pink-500/10 flex items-center gap-2 cursor-pointer hover:bg-pink-500/15 transition-colors" onClick={() => toggleDate(dateKey)}>
                                    {expandedDates[dateKey] ? <ChevronUp size={14} className="text-pink-400" /> : <ChevronDown size={14} className="text-pink-400" />}
                                    <span className="text-xs font-semibold text-slate-200">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    <span className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">{grouped[date].length} item{grouped[date].length !== 1 ? 's' : ''}</span>
                                  </div>
                                  {expandedDates[dateKey] && (
                                    <div className="p-2 space-y-2">
                                      {grouped[date].map((work: any) => (
                                        <div key={work.id} className="p-3 bg-pink-500/5 border border-pink-500/20 rounded-lg">
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
                                          {work.text && <p className="text-sm text-slate-300 mb-2">{work.text}</p>}
                                          {work.files.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                              {work.files.map((f: any, i: number) => {
                                                const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                                return (
                                                  <a key={i} href={`/uploads/${f.filename}`} target="_blank" download>
                                                    {isImg ? (
                                                      <img src={`/uploads/${f.filename}`} className="w-20 h-20 rounded-lg object-cover border border-slate-700/50 hover:shadow-md" />
                                                    ) : (
                                                      <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400"><Download size={10} /> {f.originalName}</span>
                                                    )}
                                                  </a>
                                                );
                                              })}
                                            </div>
                                          )}
                                          {work.reviewComment && (
                                            <div className={`p-2 rounded-lg text-xs mt-2 ${work.status === 'APPROVED' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
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
                      );
                    })()}
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
      </div>

      {deleteConfirmId && (() => {
        const proj = projects.find(p => p.id === deleteConfirmId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
            <div className="relative bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 border border-slate-700/50">
              <div className="px-6 py-4 border-b border-slate-700/50 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <Trash2 size={20} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Delete Project</h3>
                  <p className="text-xs text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-slate-300">Are you sure you want to delete <span className="font-bold text-white">{proj?.name}</span>?</p>
                <p className="text-xs text-slate-500 mt-2">All related reports, assignments, and work submissions will also be deleted.</p>
              </div>
              <div className="px-6 py-4 border-t border-slate-700/50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                <Button variant="danger" className="gap-1" onClick={async () => {
                  await deleteProject(deleteConfirmId);
                  setDeleteConfirmId(null);
                  setExpandedProject(null);
                }}>
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {showAssignDesignerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAssignDesignerModal(false)} />
          <div className="relative bg-slate-800/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">Assign Design Task to {designerName}</h3>
              <button onClick={() => setShowAssignDesignerModal(false)} className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg text-sm">
                <p className="font-semibold text-pink-400">{projects.find(p => p.id === assignDesignerForm.projectId)?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Task Description</label>
                <textarea className="block w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" placeholder="Describe what images/designs are needed..." value={assignDesignerForm.text} onChange={e => setAssignDesignerForm({ ...assignDesignerForm, text: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Reference Images</label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => assignDesignerImgRef.current?.click()}><Image size={14} /> Select Images</Button>
                  <span className="text-xs text-slate-500">{assignDesignerImages ? `${assignDesignerImages.length} selected` : 'None'}</span>
                  <input ref={assignDesignerImgRef} type="file" multiple accept="image/*" className="hidden" onChange={e => setAssignDesignerImages(e.target.files)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Reference Documents</label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => assignDesignerDocRef.current?.click()}><Paperclip size={14} /> Select Files</Button>
                  <span className="text-xs text-slate-500">{assignDesignerDocs ? `${assignDesignerDocs.length} selected` : 'None'}</span>
                  <input ref={assignDesignerDocRef} type="file" multiple className="hidden" onChange={e => setAssignDesignerDocs(e.target.files)} />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700/50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAssignDesignerModal(false)}>Cancel</Button>
              <Button className="gap-1" onClick={handleAssignDesigner}><Palette size={14} /> Assign to {designerName}</Button>
            </div>
          </div>
        </div>
      )}

      {reviewWorkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setReviewWorkModal(null)} />
          <div className="relative bg-slate-800/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">{reviewWorkStatus === 'APPROVED' ? 'Approve' : 'Reject'} Design Work</h3>
              <button onClick={() => setReviewWorkModal(null)} className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-6 py-5">
              <textarea className="block w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" placeholder={reviewWorkStatus === 'CHANGES_REQUESTED' ? 'What needs to be changed...' : 'Optional comment...'} value={reviewWorkComment} onChange={e => setReviewWorkComment(e.target.value)} />
            </div>
            <div className="px-6 py-4 border-t border-slate-700/50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setReviewWorkModal(null)}>Cancel</Button>
              <Button variant={reviewWorkStatus === 'APPROVED' ? 'primary' : 'danger'} className="gap-1" onClick={handleReviewDesignerWork} disabled={reviewWorkStatus === 'CHANGES_REQUESTED' && !reviewWorkComment.trim()}>
                {reviewWorkStatus === 'APPROVED' ? <><CheckCircle2 size={14} /> Approve</> : <><X size={14} /> Reject</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
