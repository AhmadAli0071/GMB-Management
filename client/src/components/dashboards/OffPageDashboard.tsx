import React, { useState, useRef } from 'react';
import {
  MapPin, Star, Globe, Search, Building2, Shield, ExternalLink,
  Clock, ChevronDown, ChevronUp, Image, FileText, Send, Upload, X, Paperclip,
  Download, Edit3, Folder, Bell, AlertCircle, MessageCircle
} from 'lucide-react';
import { Card, Button, Badge } from '../ui/Common';
import { useApp } from '../../AppContext';
import { useChatNotify } from '../../ChatNotifyContext';
import { STAGE_LABELS, STAGE_COLORS } from '../../types';
import { ChatBox } from '../chat/ChatBox';

export function OffPageDashboard() {
  const { currentUser, projects, users, assignments, workSubmissions, updateAssignmentStatus, submitWork, updateWork, deleteWorkFile, projectUpdates } = useApp();
  const { unreadCounts } = useChatNotify();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [submitText, setSubmitText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [editText, setEditText] = useState('');
  const [editFiles, setEditFiles] = useState<FileList | null>(null);
  const [showAlreadySentPopup, setShowAlreadySentPopup] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const seoLead = (Object.values(users) as any[]).find(u => u.role === 'SEO_LEAD');
  const seoLeadName = seoLead?.name || 'SEO Lead';
  const seoLeadId = seoLead?.id || '';

  const myAssignments = assignments.filter(a => a.toId === currentUser.id);
  const myProjectIds = [...new Set(myAssignments.map(a => a.projectId))];
  const myProjects = myProjectIds.map(id => projects.find(p => p.id === id)).filter(Boolean);

  const handleSubmitWork = async () => {
    if (!showSubmitModal) return;
    const assignment = myAssignments.find(a => a.id === showSubmitModal);
    if (!assignment) return;
    const formData = new FormData();
    formData.append('assignmentId', showSubmitModal);
    formData.append('projectId', assignment.projectId);
    formData.append('toId', seoLeadId);
    formData.append('text', submitText);
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) formData.append('files', selectedFiles[i]);
    }
    await submitWork(formData);
    setShowSubmitModal(null);
    setSubmitText('');
    setSelectedFiles(null);
  };

  const handleUpdateWork = async () => {
    if (!showEditModal) return;
    const formData = new FormData();
    formData.append('text', editText);
    if (editFiles) {
      for (let i = 0; i < editFiles.length; i++) formData.append('files', editFiles[i]);
    }
    await updateWork(showEditModal, formData);
    setShowEditModal(null);
    setEditText('');
    setEditFiles(null);
  };

  const openEditModal = (work: any) => {
    setEditText(work.text);
    setEditFiles(null);
    setShowEditModal(work.id);
  };

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'green';
    if (status === 'CHANGES_REQUESTED') return 'red';
    return 'yellow';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Projects</h1>
        <p className="text-slate-500 mt-1">Work assigned by {seoLeadName}</p>
      </div>

      {myProjects.length === 0 && (
        <Card className="p-12 text-center">
          <Folder size={40} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-500">No projects assigned yet</p>
        </Card>
      )}

      <div className="space-y-6">
        {myProjects.map(project => {
          if (!project) return null;
          const projectAssignments = myAssignments.filter(a => a.projectId === project.id);
          const projectWork = workSubmissions.filter(w => w.projectId === project.id);
          const isExpanded = expandedProject === project.id;
          const changesRequested = projectWork.filter(w => w.status === 'CHANGES_REQUESTED').length;
          const redoAssignments = projectAssignments.filter(a => a.text && a.text.includes('rejected'));
          const notifyCount = changesRequested + redoAssignments.length;
          const projectUnreadMap = unreadCounts[project.id] || {};
          const projectUnread = (Object.values(projectUnreadMap) as number[]).reduce((sum, val) => sum + val, 0);

          return (
            <Card key={project.id} className="overflow-hidden">
              <div
                className="p-4 sm:p-6 cursor-pointer hover:bg-slate-900/30 transition-colors"
                onClick={() => setExpandedProject(isExpanded ? null : project.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600 relative">
                        <Folder size={28} />
                        {notifyCount > 0 && !isExpanded && (
                          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">{notifyCount}</span>
                        )}
                      </div>
                      {projectUnread > 0 && (
                        <span className="absolute -bottom-1 -left-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-bounce shadow-lg shadow-red-500/50 z-10 flex items-center gap-0.5">
                          <MessageCircle size={9} />{projectUnread > 99 ? '99+' : projectUnread}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-slate-100">{project.name}</h3>
                        <Badge variant={STAGE_COLORS[project.stage]}>{STAGE_LABELS[project.stage]}</Badge>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${project.verificationStatus === 'VERIFIED' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          <Shield size={10} /> {project.verificationStatus === 'VERIFIED' ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{project.businessCategory || 'N/A'}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin size={10} /> {project.businessCity}{project.businessState ? `, ${project.businessState}` : ''}</span>
                        <span className="flex items-center gap-1"><Star size={10} /> {project.currentRating} ({project.currentReviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs text-slate-500">
                      <p>{projectAssignments.length} task{projectAssignments.length !== 1 ? 's' : ''}</p>
                      <p>{projectWork.length} submission{projectWork.length !== 1 ? 's' : ''}</p>
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
                    {(project.targetKeywords || project.competitors || project.services) && (
                      <div className="mt-3 space-y-2">
                        {project.targetKeywords && <div><span className="text-[10px] text-slate-500 uppercase tracking-wider">Keywords</span><div className="mt-1 flex flex-wrap gap-1">{project.targetKeywords.split(',').map((kw, i) => (<span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded-full">{kw.trim()}</span>))}</div></div>}
                        {project.services && <div><span className="text-[10px] text-slate-500 uppercase tracking-wider">Services</span><p className="text-sm font-medium text-slate-200 mt-0.5">{project.services}</p></div>}
                      </div>
                    )}
                    {project.specialInstructions && (
                      <div className="mt-3 p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-400">{project.specialInstructions}</div>
                    )}
                  </div>

                  {redoAssignments.length > 0 && (
                    <div className="px-5 py-4 bg-red-500/10 border-b border-red-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center">
                          <AlertCircle size={12} className="text-red-400" />
                        </div>
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Redo Requested by {seoLeadName}</h4>
                      </div>
                      <div className="space-y-2">
                        {redoAssignments.map(a => (
                          <div key={a.id} className="p-3 bg-slate-800/50 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-400 font-medium">{a.text}</p>
                            <p className="text-[10px] text-slate-500 mt-1">{new Date(a.createdAt).toLocaleString()}</p>
                            <Button size="sm" variant="primary" className="gap-1 mt-2" onClick={() => {
                              const existingPending = workSubmissions.find((w: any) => w.assignmentId === a.id && w.status === 'PENDING_REVIEW');
                              if (existingPending) {
                                setShowAlreadySentPopup('Work already submitted and is pending review. Wait for response from ' + seoLeadName + '.');
                                return;
                              }
                              setShowSubmitModal(a.id);
                              setSubmitText('');
                              setSelectedFiles(null);
                            }}>
                              <Upload size={14} /> Submit New Work
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {projectAssignments.filter(a => !a.text || !a.text.includes('rejected')).map(assignment => (
                    <div key={assignment.id} className="border-b border-slate-700/50">
                      <div className="px-4 sm:px-5 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-slate-500 flex items-center gap-1"><Send size={12} /> Task from {seoLeadName}</p>
                          <div className="flex gap-2">
                            {assignment.status === 'PENDING' && (
                              <Button size="sm" onClick={() => updateAssignmentStatus(assignment.id, 'IN_PROGRESS')}>Start Work</Button>
                            )}
                            <Button variant="secondary" size="sm" className="gap-1" onClick={() => {
                              const existingPending = workSubmissions.find((w: any) => w.assignmentId === assignment.id && w.status === 'PENDING_REVIEW');
                              if (existingPending) {
                                setShowAlreadySentPopup('Work already submitted and is pending review. Submit new work only after changes are requested.');
                                return;
                              }
                              setShowSubmitModal(assignment.id);
                              setSubmitText('');
                              setSelectedFiles(null);
                            }}>
                              <Upload size={14} /> Submit Work
                            </Button>
                          </div>
                        </div>
                        {assignment.text && <p className="text-sm text-slate-300 mb-2">{assignment.text}</p>}
                        {assignment.images.length > 0 && (
                          <div className="flex gap-2 mb-2">
                            {assignment.images.map((img: any, i: number) => (
                              <a key={i} href={`/uploads/${img.filename}`} target="_blank"><img src={`/uploads/${img.filename}`} className="w-16 h-16 rounded-lg object-cover border border-slate-700/50 hover:shadow-md" /></a>
                            ))}
                          </div>
                        )}
                        {assignment.documents.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {assignment.documents.map((doc: any, i: number) => (
                              <a key={i} href={`/uploads/${doc.filename}`} target="_blank" download className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400 hover:bg-blue-500/20"><Download size={12} /> {doc.originalName}</a>
                            ))}
                          </div>
                        )}
                      </div>

                      {projectWork.filter(w => w.assignmentId === assignment.id).map(work => (
                        <div key={work.id} className="mx-5 mb-3 p-4 sm:p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Badge variant={getStatusColor(work.status) as any} className="text-[10px]">
                                {work.status === 'APPROVED' ? 'Approved' : work.status === 'CHANGES_REQUESTED' ? 'Changes Requested' : 'Pending Review'}
                              </Badge>
                              <span className="text-[11px] text-slate-500">{new Date(work.createdAt).toLocaleString()}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-1 text-slate-500" onClick={() => openEditModal(work)}>
                              <Edit3 size={12} /> Edit
                            </Button>
                          </div>
                          {work.text && <p className="text-sm text-slate-300 mb-2">{work.text}</p>}
                          {work.files.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {work.files.map((f: any, i: number) => {
                                const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                return (
                                  <div key={i} className="relative group">
                                    <a href={`/uploads/${f.filename}`} target="_blank" download>
                                      {isImg ? (
                                        <img src={`/uploads/${f.filename}`} className="w-16 h-16 rounded-lg object-cover border border-slate-700/50 hover:shadow-md" />
                                      ) : (
                                        <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400 hover:bg-blue-500/20"><Download size={10} /> {f.originalName}</span>
                                      )}
                                    </a>
                                    <button onClick={() => deleteWorkFile(work.id, f.filename)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px]"><X size={8} /></button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {work.reviewComment && (
                            <div className={`p-2 rounded-lg text-xs mt-2 ${work.status === 'APPROVED' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              <span className="font-bold">{seoLeadName}:</span> {work.reviewComment}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
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

      {showAlreadySentPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAlreadySentPopup('')} />
          <div className="relative bg-slate-800/50 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10">
            <div className="px-6 py-5 text-center">
              <div className="w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={28} className="text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Already Sent!</h3>
              <p className="text-sm text-slate-400">{showAlreadySentPopup}</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-700/50 flex justify-center">
              <Button onClick={() => setShowAlreadySentPopup('')}>OK, Got it</Button>
            </div>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowSubmitModal(null)} />
          <div className="relative bg-slate-800/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">Submit Work</h3>
              <button onClick={() => setShowSubmitModal(null)} className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm">
                <p className="font-semibold text-orange-400">{projects.find(p => p.id === myAssignments.find(a => a.id === showSubmitModal)?.projectId)?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Update / Message</label>
                <textarea className="block w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" placeholder="Write update..." value={submitText} onChange={e => setSubmitText(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Upload Files</label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => fileInputRef.current?.click()}><Paperclip size={14} /> Select Files</Button>
                  <span className="text-xs text-slate-500">{selectedFiles ? `${selectedFiles.length} selected` : 'No files'}</span>
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => setSelectedFiles(e.target.files)} />
                </div>
                {selectedFiles && <div className="flex flex-wrap gap-2 mt-2">{Array.from(selectedFiles).map((f: File, i: number) => (<span key={i} className="text-xs bg-slate-900/50 px-2 py-1 rounded">{f.name}</span>))}</div>}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700/50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSubmitModal(null)}>Cancel</Button>
              <Button className="gap-1" onClick={handleSubmitWork}><Send size={14} /> Submit</Button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (() => {
        const work = workSubmissions.find(w => w.id === showEditModal);
        if (!work) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(null)} />
            <div className="relative bg-slate-800/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-100">Edit Submission</h3>
                <button onClick={() => setShowEditModal(null)} className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-500"><X size={18} /></button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Update / Message</label>
                  <textarea className="block w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" value={editText} onChange={e => setEditText(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Current Files</label>
                  <div className="flex flex-wrap gap-2">
                    {work.files.map((f: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                        <a href={`/uploads/${f.filename}`} target="_blank" download className="text-xs text-blue-400 hover:underline flex items-center gap-1"><Download size={12} /> {f.originalName}</a>
                        <button onClick={() => deleteWorkFile(work.id, f.filename)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                      </div>
                    ))}
                    {work.files.length === 0 && <p className="text-xs text-slate-500">No files</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Add More Files</label>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => editFileRef.current?.click()}><Paperclip size={14} /> Select Files</Button>
                    <span className="text-xs text-slate-500">{editFiles ? `${editFiles.length} selected` : 'No new files'}</span>
                    <input ref={editFileRef} type="file" multiple className="hidden" onChange={e => setEditFiles(e.target.files)} />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-700/50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEditModal(null)}>Cancel</Button>
                <Button className="gap-1" onClick={handleUpdateWork}><Send size={14} /> Update</Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
