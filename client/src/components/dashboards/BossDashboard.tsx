import React, { useState } from 'react';
import {
  Globe, X, ShieldCheck, ExternalLink, Calendar,
  Folder, ChevronDown, ChevronUp, Download, FileText, Clock, Trash2, MessageCircle
} from 'lucide-react';
import { Card, Badge, Button } from '../ui/Common';
import { useApp } from '../../AppContext';
import { useChatNotify } from '../../ChatNotifyContext';
import { STAGE_LABELS, STAGE_COLORS } from '../../types';
import { ChatBox } from '../chat/ChatBox';

export function BossDashboard() {
  const { projects, users, projectUpdates, workSubmissions, deleteProject } = useApp();
  const { unreadCounts } = useChatNotify();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const toggleDate = (key: string) => setExpandedDates(prev => ({ ...prev, [key]: !prev[key] }));

  const allUpdates = projectUpdates;
  const pendingCount = allUpdates.filter((u: any) => u.reportType === 'STRUCTURED' && (u.onPageStatus === 'PENDING' || u.offPageStatus === 'PENDING')).length;
  const approvedCount = allUpdates.filter((u: any) => u.reportType === 'STRUCTURED' && u.onPageStatus === 'APPROVED' && u.offPageStatus === 'APPROVED').length;
  const rejectedCount = allUpdates.filter((u: any) => u.reportType === 'STRUCTURED' && (u.onPageStatus === 'REJECTED' || u.offPageStatus === 'REJECTED')).length;

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'green';
    if (status === 'REJECTED') return 'red';
    return 'yellow';
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
                      <Button size="sm" variant="danger" className="gap-1" onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(project.id); }}>
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                    <div className="p-4 sm:p-5 border-b border-slate-700/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Category</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessCategory || 'N/A'}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Location</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessCity}{project.businessState ? `, ${project.businessState}` : ''}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Phone</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessPhone || 'N/A'}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Email</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessEmail || 'N/A'}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Website</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessWebsite || 'N/A'}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Address</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessAddress}{project.businessCity ? `, ${project.businessCity}` : ''} {project.businessState} {project.businessZip}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Service Areas</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.serviceAreas || 'N/A'}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Services</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.services || 'N/A'}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">What We Offer</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{(project as any).offerServices || 'N/A'}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Business Hours</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.businessHours || 'N/A'}</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Reviews</span><p className="text-sm font-medium text-slate-200 mt-0.5">{project.currentReviews} ({project.currentRating} rating)</p></div>
                        <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/30"><span className="text-[10px] text-slate-500 uppercase tracking-wider">Competitors</span><p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{project.competitors || 'N/A'}</p></div>
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
    </div>
  );
}
