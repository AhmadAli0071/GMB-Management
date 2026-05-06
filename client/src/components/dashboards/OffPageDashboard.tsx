import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin, Star, Globe, Building2, Shield,
  Clock, ChevronDown, ChevronUp, FileText, Send, Upload, X, Paperclip,
  Download, Edit3, Folder, AlertCircle, MessageCircle, Trash2, Loader2, Bell, CheckCircle2
} from 'lucide-react';
import { Card, Button, Badge } from '../ui/Common';
import { useApp } from '../../AppContext';
import { useChatNotify } from '../../ChatNotifyContext';
import { useSocket } from '../../SocketContext';
import { STAGE_LABELS, STAGE_COLORS } from '../../types';
import { ChatBox } from '../chat/ChatBox';

export function OffPageDashboard() {
  const { currentUser, projects, users, assignments, workSubmissions, updateAssignmentStatus, submitWork, updateWork, deleteWorkFile, deleteWork } = useApp();
   const { unreadCounts, notificationPermission, requestNotificationPermission } = useChatNotify();
   const { onActivityNotification, offActivityNotification } = useSocket();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [submitText, setSubmitText] = useState('');
  const [submitDate, setSubmitDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [editText, setEditText] = useState('');
  const [editFiles, setEditFiles] = useState<FileList | null>(null);
  const [showAlreadySentPopup, setShowAlreadySentPopup] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expandedWorkDates, setExpandedWorkDates] = useState<Record<string, boolean>>({});
   const toggleWorkDate = (key: string) => setExpandedWorkDates(prev => ({ ...prev, [key]: !prev[key] }));

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
    formData.append('workDate', submitDate);
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) formData.append('files', selectedFiles[i]);
    }
    try {
      setSubmitting(true);
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
    try {
      setUpdating(true);
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

   return (
     <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto px-2 sm:px-0">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-xl sm:text-2xl font-bold tracking-tight">My Projects</h1>
           <p className="text-slate-500 mt-1 text-sm">Work assigned by {seoLeadName}</p>
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
                        : n.type === 'ASSIGNMENT_CREATED' ? <Send size={14} className="text-orange-500" />
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

      {myProjects.length === 0 && (
        <Card className="p-8 sm:p-12 text-center">
          <Folder size={40} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-500">No projects assigned yet</p>
        </Card>
      )}

      <div className="space-y-4">
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
                className="p-3 sm:p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedProject(isExpanded ? null : project.id)}
              >
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white">
                        <Folder size={22} />
                        {notifyCount > 0 && !isExpanded && (
                          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 animate-pulse">{notifyCount}</span>
                        )}
                      </div>
                      {projectUnread > 0 && (
                        <span className="absolute -bottom-1 -left-1 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[18px] h-4 flex items-center justify-center px-0.5 animate-bounce shadow-lg shadow-red-500/50 z-10 gap-0.5">
                          <MessageCircle size={8} />{projectUnread > 99 ? '99+' : projectUnread}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate">{project.name}</h3>
                        <Badge variant={STAGE_COLORS[project.stage]}>{STAGE_LABELS[project.stage]}</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{project.businessCategory || 'N/A'}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5 text-[10px] sm:text-xs text-slate-500">
                        <span className="flex items-center gap-0.5"><MapPin size={10} /> {project.businessCity}{project.businessState ? `, ${project.businessState}` : ''}</span>
                        <span className="hidden sm:flex items-center gap-1"><Star size={10} /> {project.currentRating} ({project.currentReviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="hidden sm:block text-right text-xs text-slate-500">
                      <p>{projectAssignments.length} task{projectAssignments.length !== 1 ? 's' : ''}</p>
                      <p>{projectWork.length} submission{projectWork.length !== 1 ? 's' : ''}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-200">
                <div className="flex flex-col lg:flex-row lg:max-h-[70vh]">
                  <div className="flex-1 overflow-y-auto">

                  {redoAssignments.length > 0 && (
                    <div className="px-3 sm:px-5 py-3 sm:py-4 bg-red-50 border-b border-red-200">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle size={14} className="text-red-500" />
                        <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider">Redo Requested by {seoLeadName}</h4>
                      </div>
                      <div className="space-y-2">
                        {redoAssignments.map(a => (
                          <div key={a.id} className="p-3 bg-white border border-red-200 rounded-lg">
                            <p className="text-sm text-red-500 font-medium">{a.text}</p>
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
                    <div key={assignment.id} className="border-b border-slate-200">
                      <div className="px-3 sm:px-5 py-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                          <p className="text-xs font-bold text-slate-600 flex items-center gap-1"><Send size={12} /> Task from {seoLeadName}</p>
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
                        {assignment.text && <p className="text-sm text-slate-600 mb-2">{assignment.text}</p>}
                        {assignment.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {assignment.images.map((img: any, i: number) => (
                              <a key={i} href={`/uploads/${img.filename}`} target="_blank"><img src={`/uploads/${img.filename}`} className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border border-slate-200 hover:shadow-md" /></a>
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
                            <div key={date} className="mx-2 sm:mx-4 mb-2 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                              <div className="px-3 py-2 bg-slate-100 flex items-center gap-2 cursor-pointer hover:bg-slate-200/60 transition-colors" onClick={() => toggleWorkDate(dateKey)}>
                                {expandedWorkDates[dateKey] ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                                <span className="text-xs font-semibold text-slate-800">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{grouped[date].length} item{grouped[date].length !== 1 ? 's' : ''}</span>
                              </div>
                              {expandedWorkDates[dateKey] && (
                                <div className="p-2 space-y-2">
                                  {grouped[date].map((work: any) => (
                                    <div key={work.id} className="p-2.5 sm:p-3 bg-white border border-slate-200 rounded-xl">
                                      <div className="flex flex-col gap-2 mb-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant={getStatusColor(work.status) as any} className="text-[10px]">
                                              {work.status === 'APPROVED' ? 'Approved' : work.status === 'CHANGES_REQUESTED' ? 'Changes Requested' : 'Pending Review'}
                                            </Badge>
                                            <span className="text-[10px] text-slate-500">{new Date(work.createdAt).toLocaleString()}</span>
                                          </div>
                                          <div className="flex items-center gap-0.5 shrink-0">
                                            <Button variant="ghost" size="sm" className="gap-0.5 text-slate-500 text-[11px] px-1.5 py-1" onClick={() => openEditModal(work)}>
                                              <Edit3 size={11} /> <span className="hidden sm:inline">Edit</span>
                                            </Button>
                                            <Button variant="ghost" size="sm" className="gap-0.5 text-red-400 hover:text-red-600 text-[11px] px-1.5 py-1" onClick={() => setDeleteConfirmId(work.id)}>
                                              <Trash2 size={11} /> <span className="hidden sm:inline">Delete</span>
                                            </Button>
                                          </div>
                                        </div>
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
                                                    <img src={`/uploads/${f.filename}`} className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border border-slate-200 hover:shadow-md" />
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
                                          <span className="font-bold">{seoLeadName}:</span> {work.reviewComment}
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
            <div className="px-5 py-5 text-center">
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={24} className="text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Already Sent!</h3>
              <p className="text-sm text-slate-400">{showAlreadySentPopup}</p>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 flex justify-center">
              <Button onClick={() => setShowAlreadySentPopup('')}>OK, Got it</Button>
            </div>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowSubmitModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10 max-h-[90vh] overflow-y-auto">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-900">Submit Work</h3>
              <button onClick={() => setShowSubmitModal(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
                <p className="font-semibold text-orange-600">{projects.find(p => p.id === myAssignments.find(a => a.id === showSubmitModal)?.projectId)?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Work Date</label>
                <input type="date" className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={submitDate} onChange={e => setSubmitDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Update / Message</label>
                <textarea className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" placeholder="Write update..." value={submitText} onChange={e => setSubmitText(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload Files</label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => fileInputRef.current?.click()}><Paperclip size={14} /> Select Files</Button>
                  <span className="text-xs text-slate-500">{selectedFiles ? `${selectedFiles.length} selected` : 'No files'}</span>
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => setSelectedFiles(e.target.files)} />
                </div>
                {selectedFiles && <div className="flex flex-wrap gap-2 mt-2">{Array.from(selectedFiles).map((f: File, i: number) => (<span key={i} className="text-xs bg-slate-50 px-2 py-1 rounded">{f.name}</span>))}</div>}
              </div>
            </div>
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowEditModal(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10 max-h-[90vh] overflow-y-auto">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-lg font-bold text-slate-900">Edit Submission</h3>
                <button onClick={() => setShowEditModal(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
              </div>
              <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Update / Message</label>
                  <textarea className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" value={editText} onChange={e => setEditText(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Files</label>
                  <div className="flex flex-wrap gap-2">
                    {work.files.map((f: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg">
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
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setShowEditModal(null)}>Cancel</Button>
                <Button className="gap-1" onClick={handleUpdateWork} disabled={updating}>{updating ? <><Loader2 size={14} className="animate-spin" /> Updating...</> : <><Send size={14} /> Update</>}</Button>
              </div>
            </div>
          </div>
        );
      })()}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Submission</h3>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-slate-600">Are you sure you want to delete this work submission?</p>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
              <Button variant="danger" className="gap-1" disabled={deleting} onClick={async () => {
                try {
                  setDeleting(true);
                  await deleteWork(deleteConfirmId);
                  setDeleteConfirmId(null);
                } finally {
                  setDeleting(false);
                }
              }}>
                {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : <><Trash2 size={14} /> Delete</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
