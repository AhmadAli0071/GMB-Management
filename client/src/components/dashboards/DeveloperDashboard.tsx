import React, { useState, useRef } from 'react';
import {
  MapPin, Star, Globe, Shield, ExternalLink,
  Clock, ChevronDown, ChevronUp, FileText, Send, Upload, X, Paperclip,
  Download, Edit3, Folder, AlertCircle, MessageCircle, Code2, ArrowLeft,
  Loader2, Bell
} from 'lucide-react';
import { Card, Button, Badge } from '../ui/Common';
import { useApp } from '../../AppContext';
import { useChatNotify } from '../../ChatNotifyContext';
import { STAGE_LABELS, STAGE_COLORS, ALL_STAGES } from '../../types';
import { ChatBox } from '../chat/ChatBox';

export function DeveloperDashboard() {
  const { currentUser, projects, users, assignments, workSubmissions, updateAssignmentStatus, submitWork, updateWork, deleteWorkFile, tasks } = useApp();
   const { unreadCounts, notificationPermission, requestNotificationPermission } = useChatNotify();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState<string | null>(null);
  const [submitText, setSubmitText] = useState('');
  const [submitDate, setSubmitDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [editText, setEditText] = useState('');
  const [editFiles, setEditFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showAlreadySentPopup, setShowAlreadySentPopup] = useState('');
  const [expandedWorkDates, setExpandedWorkDates] = useState<Record<string, boolean>>({});
  const toggleWorkDate = (key: string) => setExpandedWorkDates(prev => ({ ...prev, [key]: !prev[key] }));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const seoManager = (Object.values(users) as any[]).find(u => u.role === 'SEO_MANAGER');
  const seoManagerName = seoManager?.name || 'SEO Manager';
  const seoManagerId = seoManager?.id || '';

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
    formData.append('toId', assignment.fromId);
    formData.append('text', submitText);
    formData.append('workDate', submitDate);
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) formData.append('files', selectedFiles[i]);
    }
    setSubmitting(true);
    try {
      await submitWork(formData);
      setShowSubmitModal(null);
      setSubmitText('');
      setSubmitDate(new Date().toISOString().split('T')[0]);
      setSelectedFiles(null);
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateWork = async () => {
    if (!showEditModal) return;
    const formData = new FormData();
    formData.append('text', editText);
    if (editFiles) {
      for (let i = 0; i < editFiles.length; i++) formData.append('files', editFiles[i]);
    }
    setUpdating(true);
    try {
      await updateWork(showEditModal, formData);
      setShowEditModal(null);
      setEditText('');
      setEditFiles(null);
    } finally {
      setUpdating(false);
    }
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

  const renderProjectDetail = (project: any) => {
    const projectTasks = tasks.filter((t: any) => t.projectId === project.id);

    return (
      <div className="border-t border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <button onClick={() => setShowProjectDetail(null)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft size={18} /> Back to Tasks
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-900">{project.name}</h2>
            <Badge variant="blue">{STAGE_LABELS[project.stage]}</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-5">
                <h3 className="font-bold text-lg mb-3 text-slate-800">Project Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">Created:</span> <span className="text-slate-600">{new Date(project.createdAt).toLocaleDateString()}</span></div>
                  <div><span className="text-slate-500">Status:</span> <span className="font-medium text-blue-600">{STAGE_LABELS[project.stage]}</span></div>
                </div>
                {project.specialInstructions && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-slate-400 mb-2">Description / Requirements</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{project.specialInstructions}</p>
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="p-5">
                <h3 className="font-bold text-lg mb-3 text-slate-800">Task Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Total Tasks</span><span className="font-bold text-slate-600">{projectTasks.length}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Completed</span><span className="font-bold text-green-600">{projectTasks.filter((t: any) => t.status === 'COMPLETED').length}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">In Progress</span><span className="font-bold text-blue-600">{projectTasks.filter((t: any) => t.status === 'IN_PROGRESS').length}</span></div>
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="font-bold text-lg mb-3 text-slate-800">Team</h3>
                <div className="space-y-2">
                  {project.assignedTo.map((id: string) => {
                    const user = users[id];
                    return user ? (
                      <div key={id} className="flex items-center gap-2">
                        <img src={user.avatar} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                        <div>
                          <p className="text-sm font-medium text-slate-600">{user.name}</p>
                          <p className="text-[10px] text-slate-500">{user.role.replace('_', ' ')}</p>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

   return (
     <div className="space-y-8 max-w-6xl mx-auto">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-bold tracking-tight">My Dev Tasks</h1>
           <p className="text-slate-500 mt-1">Tasks assigned by {seoManagerName}</p>
         </div>
         {notificationPermission !== 'granted' && (
           <Button size="sm" variant="outline" className="gap-1.5" onClick={() => requestNotificationPermission()}>
             <Bell size={14} /> Enable Notifications
           </Button>
         )}
       </div>

      {myProjects.length === 0 && (
        <Card className="p-12 text-center">
          <Code2 size={40} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-500">No dev tasks assigned yet</p>
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
              <div className="p-4 sm:p-6 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setExpandedProject(isExpanded ? null : project.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 bg-blue-500 text-white relative">
                        <Folder size={28} />
                        {notifyCount > 0 && !isExpanded && (
                          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">{notifyCount}</span>
                        )}
                      </div>
                      {projectUnread > 0 && (
                        <span className="absolute -bottom-1 -left-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-bounce shadow-lg shadow-red-500/50 z-10">
                          <MessageCircle size={9} />{projectUnread > 99 ? '99+' : projectUnread}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-slate-900">{project.name}</h3>
                        <Badge variant={STAGE_COLORS[project.stage]}>{STAGE_LABELS[project.stage]}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{project.businessCategory || 'N/A'}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin size={10} /> {project.businessCity}{project.businessState ? `, ${project.businessState}` : ''}</span>
                        <span>{projectAssignments.length} task{projectAssignments.length !== 1 ? 's' : ''}</span>
                        <span>{projectWork.length} submission{projectWork.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={(e) => { e.stopPropagation(); setShowProjectDetail(project.id); }}
                    >
                      <FileText size={14} /> Details
                    </Button>
                    {isExpanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                  </div>
                </div>
              </div>

              {showProjectDetail === project.id && renderProjectDetail(project)}

              {isExpanded && showProjectDetail !== project.id && (
                <div className="border-t border-slate-200">
                <div className="flex flex-col lg:flex-row max-h-[70vh]">
                  <div className="flex-1 overflow-y-auto">

                  {redoAssignments.length > 0 && (
                    <div className="px-5 py-4 bg-red-50 border-b border-red-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-red-100 flex items-center justify-center">
                          <AlertCircle size={12} className="text-red-500" />
                        </div>
                        <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider">Redo Requested by {seoManagerName}</h4>
                      </div>
                      <div className="space-y-2">
                        {redoAssignments.map(a => (
                          <div key={a.id} className="p-3 bg-white border border-red-200 rounded-lg">
                            <p className="text-sm text-red-500 font-medium">{a.text}</p>
                            <p className="text-[10px] text-slate-500 mt-1">{new Date(a.createdAt).toLocaleString()}</p>
                            <Button size="sm" variant="primary" className="gap-1 mt-2" onClick={() => {
                              const existingPending = workSubmissions.find((w: any) => w.assignmentId === a.id && w.status === 'PENDING_REVIEW');
                              if (existingPending) {
                                setShowAlreadySentPopup('Work already submitted and is pending review.');
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
                    <div key={assignment.id} className="border-b border-slate-200">
                      <div className="px-4 sm:px-5 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-slate-600 flex items-center gap-1"><Code2 size={12} /> Dev Task from {seoManagerName}</p>
                          <div className="flex gap-2">
                            {assignment.status === 'PENDING' && (
                              <Button size="sm" onClick={() => updateAssignmentStatus(assignment.id, 'IN_PROGRESS')}>Start Work</Button>
                            )}
                            <Button variant="secondary" size="sm" className="gap-1" onClick={() => {
                              const existingPending = workSubmissions.find((w: any) => w.assignmentId === assignment.id && w.status === 'PENDING_REVIEW');
                              if (existingPending) {
                                setShowAlreadySentPopup('Work already submitted and is pending review.');
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
                        {assignment.text && <p className="text-sm text-slate-600 mb-2">{assignment.text}</p>}
                        {assignment.images.length > 0 && (
                          <div className="flex gap-2 mb-2">
                            {assignment.images.map((img: any, i: number) => (
                              <a key={i} href={`/uploads/${img.filename}`} target="_blank"><img src={`/uploads/${img.filename}`} className="w-16 h-16 rounded-lg object-cover border border-slate-200 hover:shadow-md" /></a>
                            ))}
                          </div>
                        )}
                        {assignment.documents.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {assignment.documents.map((doc: any, i: number) => (
                              <a key={i} href={`/uploads/${doc.filename}`} target="_blank" download className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-600 hover:bg-blue-100"><Download size={12} /> {doc.originalName}</a>
                            ))}
                          </div>
                        )}
                      </div>

                      {projectWork.filter(w => w.assignmentId === assignment.id).length > 0 && (() => {
                        const assignmentWork = projectWork.filter(w => w.assignmentId === assignment.id);
                        const grouped: Record<string, any[]> = {};
                        assignmentWork.forEach((w: any) => {
                          const d = w.workDate || new Date(w.createdAt).toISOString().split('T')[0];
                          if (!grouped[d]) grouped[d] = [];
                          grouped[d].push(w);
                        });
                        return Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(date => {
                          const dateKey = `work-${assignment.id}-${date}`;
                          return (
                            <div key={date} className="mx-4 mb-2 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                              <div className="px-3 py-2 bg-slate-100 flex items-center gap-2 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => toggleWorkDate(dateKey)}>
                                {expandedWorkDates[dateKey] ? <ChevronUp size={14} className="text-cyan-600" /> : <ChevronDown size={14} className="text-cyan-600" />}
                                <span className="text-xs font-semibold text-slate-800">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{grouped[date].length} item{grouped[date].length !== 1 ? 's' : ''}</span>
                              </div>
                              {expandedWorkDates[dateKey] && (
                                <div className="p-2 space-y-2">
                                  {grouped[date].map((work: any) => (
                                    <div key={work.id} className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl">
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
                                      {work.text && <p className="text-sm text-slate-600 mb-2">{work.text}</p>}
                                      {work.files.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                          {work.files.map((f: any, i: number) => {
                                            const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                            return (
                                              <div key={i} className="relative group">
                                                <a href={`/uploads/${f.filename}`} target="_blank" download>
                                                  {isImg ? (
                                                    <img src={`/uploads/${f.filename}`} className="w-20 h-20 rounded-lg object-cover border border-slate-200 hover:shadow-md" />
                                                  ) : (
                                                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-600 hover:bg-blue-100"><Download size={10} /> {f.originalName}</span>
                                                  )}
                                                </a>
                                                <button onClick={() => deleteWorkFile(work.id, f.filename)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px]"><X size={8} /></button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                      {work.reviewComment && (
                                        <div className={`p-2 rounded-lg text-xs mt-2 ${work.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                          <span className="font-bold">{seoManagerName}:</span> {work.reviewComment}
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
                  ))}
                  </div>
                   <div className="w-full lg:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200">
                     <div className="h-[50vh] lg:h-[70vh]">
                      <ChatBox projectId={project.id} />
                    </div>
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
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowAlreadySentPopup('')} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10">
            <div className="px-6 py-5 text-center">
              <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={28} className="text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Already Sent!</h3>
              <p className="text-sm text-slate-400">{showAlreadySentPopup}</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-center">
              <Button onClick={() => setShowAlreadySentPopup('')}>OK, Got it</Button>
            </div>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowSubmitModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Submit Dev Work</h3>
              <button onClick={() => setShowSubmitModal(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg text-sm">
                <p className="font-semibold text-cyan-600">{projects.find(p => p.id === myAssignments.find(a => a.id === showSubmitModal)?.projectId)?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Work Date</label>
                <input type="date" className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={submitDate} onChange={e => setSubmitDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Description</label>
                <textarea className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" placeholder="Describe the development work..." value={submitText} onChange={e => setSubmitText(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload Dev Files</label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => fileInputRef.current?.click()}><Paperclip size={14} /> Select Files</Button>
                  <span className="text-xs text-slate-500">{selectedFiles ? `${selectedFiles.length} selected` : 'No files'}</span>
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => setSelectedFiles(e.target.files)} />
                </div>
                {selectedFiles && <div className="flex flex-wrap gap-2 mt-2">{Array.from(selectedFiles).map((f: File, i: number) => (<span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded">{f.name}</span>))}</div>}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSubmitModal(null)}>Cancel</Button>
              <Button className="gap-1" onClick={handleSubmitWork} disabled={submitting}>{submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : <><Send size={14} /> Submit</>}</Button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (() => {
        const work = workSubmissions.find(w => w.id === showEditModal);
        if (!work) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowEditModal(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Edit Submission</h3>
                <button onClick={() => setShowEditModal(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <textarea className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" value={editText} onChange={e => setEditText(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Files</label>
                  <div className="flex flex-wrap gap-2">
                    {work.files.map((f: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg">
                        <a href={`/uploads/${f.filename}`} target="_blank" download className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Download size={12} /> {f.originalName}</a>
                        <button onClick={() => deleteWorkFile(work.id, f.filename)} className="text-red-500 hover:text-red-600"><X size={14} /></button>
                      </div>
                    ))}
                    {work.files.length === 0 && <p className="text-xs text-slate-500">No files</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Add More Files</label>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => editFileRef.current?.click()}><Paperclip size={14} /> Select Files</Button>
                    <span className="text-xs text-slate-500">{editFiles ? `${editFiles.length} selected` : 'No new files'}</span>
                    <input ref={editFileRef} type="file" multiple className="hidden" onChange={e => setEditFiles(e.target.files)} />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEditModal(null)}>Cancel</Button>
                <Button className="gap-1" onClick={handleUpdateWork} disabled={updating}>{updating ? <><Loader2 size={14} className="animate-spin" /> Updating...</> : <><Send size={14} /> Update</>}</Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
