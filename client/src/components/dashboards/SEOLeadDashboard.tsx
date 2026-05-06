import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight, MapPin, Star, Globe, Search, Building2, X, Shield, ExternalLink,
  Send, Clock, ChevronDown, ChevronUp, Paperclip, Image, FileText,
  CheckCircle2, RotateCcw, Folder, Download, Plus, Trash2, FileUp, Bell, AlertCircle, MessageCircle, Loader2, Palette, Calendar
} from 'lucide-react';
import { Card, Button, Badge } from '../ui/Common';
import { useApp } from '../../AppContext';
import { useChatNotify } from '../../ChatNotifyContext';
import { useSocket } from '../../SocketContext';
import { STAGE_LABELS, STAGE_COLORS } from '../../types';
import { ChatBox } from '../chat/ChatBox';

export function SEOLeadDashboard() {
  const {
    currentUser, projects, users, assignments, workSubmissions,
    projectUpdates, updateProjectStage, createAssignment, reviewWork,
    submitProjectUpdate, reviewProjectUpdate, leadWork,
    createLeadWork, updateLeadWork, deleteLeadWorkFile, deleteLeadWork
  } = useApp();
   const { unreadCounts, notificationPermission, requestNotificationPermission } = useChatNotify();
  const { onActivityNotification, offActivityNotification } = useSocket();

  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ projectId: '', toId: '', text: '' });
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<FileList | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewCommentText, setReviewCommentText] = useState('');
  const [showAddOnPageModal, setShowAddOnPageModal] = useState(false);
  const [addOnPageForm, setAddOnPageForm] = useState({ projectId: '', text: '' });
  const [addOnPageDate, setAddOnPageDate] = useState(new Date().toISOString().split('T')[0]);
  const [onPageFiles, setOnPageFiles] = useState<FileList | null>(null);
  const [showEditOnPageModal, setShowEditOnPageModal] = useState<string | null>(null);
  const [editOnPageForm, setEditOnPageForm] = useState({ id: '', text: '' });
  const [editOnPageFiles, setEditOnPageFiles] = useState<FileList | null>(null);
  const [showSubmitReportModal, setShowSubmitReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ projectId: '', toId: '' });
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [showUpdateReviewModal, setShowUpdateReviewModal] = useState<string | null>(null);
  const [updateReviewStatus, setUpdateReviewStatus] = useState('');
  const [updateReviewComment, setUpdateReviewComment] = useState('');
  const [showAlreadySentPopup, setShowAlreadySentPopup] = useState('');
  const [addingWork, setAddingWork] = useState(false);
  const [sendingAssignment, setSendingAssignment] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [editingOnPage, setEditingOnPage] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [updateReviewing, setUpdateReviewing] = useState(false);
  const [assigningDesigner, setAssigningDesigner] = useState(false);
  const [showAssignDesignerModal, setShowAssignDesignerModal] = useState(false);
  const [assignDesignerForm, setAssignDesignerForm] = useState({ projectId: '', text: '' });
  const [assignDesignerImages, setAssignDesignerImages] = useState<FileList | null>(null);
  const [assignDesignerDocs, setAssignDesignerDocs] = useState<FileList | null>(null);
   const [expandedWorkDates, setExpandedWorkDates] = useState<Record<string, boolean>>({});
   const toggleWorkDate = (key: string) => setExpandedWorkDates(prev => ({ ...prev, [key]: !prev[key] }));

     // Simple Report state
     const [showSimpleReportModal, setShowSimpleReportModal] = useState(false);
     const [simpleReportForm, setSimpleReportForm] = useState({ projectId: '', toId: '' });
     const [simpleReportTitle, setSimpleReportTitle] = useState('');
     const [simpleReportNotes, setSimpleReportNotes] = useState('');
     const [simpleReportFiles, setSimpleReportFiles] = useState<FileList | null>(null);
     const [submittingSimple, setSubmittingSimple] = useState(false);
      const [editingReportId, setEditingReportId] = useState<string | null>(null);
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

      // Monthly Report submission to Sales Manager
     const [showQuickMonthlyReportModal, setShowQuickMonthlyReportModal] = useState<string | null>(null);
     const [quickMonthlyTitle, setQuickMonthlyTitle] = useState('');
     const [quickMonthlyNotes, setQuickMonthlyNotes] = useState('');
     const [quickMonthlyFiles, setQuickMonthlyFiles] = useState<FileList | null>(null);
     const [quickMonthlyWorkDate, setQuickMonthlyWorkDate] = useState(new Date().toISOString().split('T')[0]);
     const [submittingQuickMonthly, setSubmittingQuickMonthly] = useState(false);

     const [showStructuredMonthlyReportModal, setShowStructuredMonthlyReportModal] = useState<string | null>(null);
     const [structuredMonthlyOnPageText, setStructuredMonthlyOnPageText] = useState('');
     const [structuredMonthlyOnPageFiles, setStructuredMonthlyOnPageFiles] = useState<FileList | null>(null);
     const [selectedMonthlyOffPageWork, setSelectedMonthlyOffPageWork] = useState<string[]>([]);
     const [structuredMonthlyWorkDate, setStructuredMonthlyWorkDate] = useState(new Date().toISOString().split('T')[0]);
     const [submittingStructuredMonthly, setSubmittingStructuredMonthly] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
   const docInputRef = useRef<HTMLInputElement>(null);
   const onPageFileRef = useRef<HTMLInputElement>(null);
   const editOnPageFileRef = useRef<HTMLInputElement>(null);
   const assignDesignerImgRef = useRef<HTMLInputElement>(null);
   const assignDesignerDocRef = useRef<HTMLInputElement>(null);
   const simpleFileInputRef = useRef<HTMLInputElement>(null);

  const seoManager = (Object.values(users) as any[]).find(u => u.role === 'SEO_MANAGER');
  const seoManagerName = seoManager?.name || 'SEO Manager';
  const seoManagerId = seoManager?.id || '';

  const salesManager = (Object.values(users) as any[]).find(u => u.role === 'SALES_MANAGER');
  const salesManagerName = salesManager?.name || 'Sales Manager';
  const salesManagerId = salesManager?.id || '';

  const offPageSpecialist = (Object.values(users) as any[]).find(u => u.role === 'OFF_PAGE_SPECIALIST');
  const offPageName = offPageSpecialist?.name || 'Off-Page Specialist';
  const offPageId = offPageSpecialist?.id || '';

  const designerUser = (Object.values(users) as any[]).find(u => u.role === 'DESIGNER');
  const designerName = designerUser?.name || 'Designer';
  const designerId = designerUser?.id || '';

  const myProjects = projects.filter(p => p.assignedTo.includes(currentUser.id));
  const mySentAssignments = assignments.filter(a => a.fromId === currentUser.id);
  const myWorkReviews = workSubmissions.filter(w => w.toId === currentUser.id);
  const myLeadWork = leadWork.filter((w: any) => w.userId === currentUser.id);

  const handleStartWork = (projectId: string) => {
    updateProjectStage(projectId, 'ON_PAGE_IN_PROGRESS');
  };

  const handleSendAssignment = async () => {
    setSendingAssignment(true);
    try {
      const formData = new FormData();
      formData.append('projectId', assignForm.projectId);
      formData.append('toId', assignForm.toId);
      formData.append('text', assignForm.text);
      if (selectedImages) {
        for (let i = 0; i < selectedImages.length; i++) formData.append('images', selectedImages[i]);
      }
      if (selectedDocs) {
        for (let i = 0; i < selectedDocs.length; i++) formData.append('documents', selectedDocs[i]);
      }
      await createAssignment(formData);
      setShowAssignModal(false);
      setAssignForm({ projectId: '', toId: '', text: '' });
      setSelectedImages(null);
      setSelectedDocs(null);
    } finally {
      setSendingAssignment(false);
    }
  };

  const openAssignModal = (projectId: string) => {
    setAssignForm({ projectId, toId: offPageId, text: '' });
    setSelectedImages(null);
    setSelectedDocs(null);
    setShowAssignModal(true);
  };

  const openAssignDesignerModal = (projectId: string) => {
    setAssignDesignerForm({ projectId, text: '' });
    setAssignDesignerImages(null);
    setAssignDesignerDocs(null);
    setShowAssignDesignerModal(true);
  };

  const handleAssignDesigner = async () => {
    setAssigningDesigner(true);
    try {
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
    } finally {
      setAssigningDesigner(false);
    }
  };

  const handleReview = async () => {
    if (!showReviewModal) return;
    setReviewing(true);
    try {
      await reviewWork(showReviewModal, reviewStatus, reviewCommentText);
      setShowReviewModal(null);
      setReviewCommentText('');
      setReviewStatus('');
    } finally {
      setReviewing(false);
    }
  };

  const handleAddOnPage = async () => {
    setAddingWork(true);
    try {
      const formData = new FormData();
      formData.append('projectId', addOnPageForm.projectId);
      formData.append('text', addOnPageForm.text);
      formData.append('workDate', addOnPageDate);
      if (onPageFiles) {
        for (let i = 0; i < onPageFiles.length; i++) formData.append('files', onPageFiles[i]);
      }
      await createLeadWork(formData);
      setShowAddOnPageModal(false);
      setAddOnPageForm({ projectId: '', text: '' });
      setOnPageFiles(null);
      setAddOnPageDate(new Date().toISOString().split('T')[0]);
    } catch (err: any) {
      alert('Failed to add work: ' + (err.message || 'Unknown error'));
    } finally {
      setAddingWork(false);
    }
  };

  const openAddOnPageModal = (projectId: string) => {
    setAddOnPageForm({ projectId, text: '' });
    setOnPageFiles(null);
    setAddOnPageDate(new Date().toISOString().split('T')[0]);
    setShowAddOnPageModal(true);
  };

  const handleEditOnPage = async () => {
    if (!showEditOnPageModal) return;
    setEditingOnPage(true);
    try {
      const formData = new FormData();
      formData.append('text', editOnPageForm.text);
      if (editOnPageFiles) {
        for (let i = 0; i < editOnPageFiles.length; i++) formData.append('files', editOnPageFiles[i]);
      }
      await updateLeadWork(showEditOnPageModal, formData);
      setShowEditOnPageModal(null);
      setEditOnPageForm({ id: '', text: '' });
      setEditOnPageFiles(null);
    } finally {
      setEditingOnPage(false);
    }
  };

  const openEditOnPageModal = (item: any) => {
    setEditOnPageForm({ id: item.id, text: item.text || '' });
    setEditOnPageFiles(null);
    setShowEditOnPageModal(item.id);
  };

  const handleSubmitReport = async () => {
    setSubmittingReport(true);
    try {
      const projectLeadWork = myLeadWork.filter((w: any) => w.projectId === reportForm.projectId);
      const approvedWork = myWorkReviews.filter(
        (w: any) => w.projectId === reportForm.projectId && w.status === 'APPROVED'
      );

      const formData = new FormData();
      formData.append('projectId', reportForm.projectId);
      formData.append('toId', reportForm.toId);
      formData.append('reportType', 'STRUCTURED');
      formData.append('onPageText', projectLeadWork.map((w: any) => w.text).filter(Boolean).join('\n\n'));
      formData.append('offPageWorkIds', JSON.stringify(approvedWork.map((w: any) => w.id)));

      const onPageFiles: { filename: string; originalName: string }[] = [];
      for (const item of projectLeadWork) {
        for (const f of item.files) {
          onPageFiles.push({ filename: f.filename, originalName: f.originalName });
        }
      }
      formData.append('onPageFilesJson', JSON.stringify(onPageFiles));
      formData.append('workDate', reportDate);

      await submitProjectUpdate(formData);
      setShowSubmitReportModal(false);
      setReportForm({ projectId: '', toId: '' });
      setReportDate(new Date().toISOString().split('T')[0]);
    } finally {
      setSubmittingReport(false);
    }
  };

   const openSubmitReportModal = (projectId: string, toId: string) => {
     const existing = projectUpdates.find((u: any) => u.projectId === projectId && u.toId === toId && u.fromId === currentUser.id && u.reportType === 'STRUCTURED' && (u.onPageStatus === 'PENDING' || u.offPageStatus === 'PENDING'));
     if (existing) {
       const toUser = users[toId];
       setShowAlreadySentPopup(`Report already sent to ${toUser?.name} and is pending review. Submit a new report only after changes are made.`);
       return;
     }
     setReportForm({ projectId, toId });
     setShowSubmitReportModal(true);
   };

   // Simple Report handlers
   const openSimpleReportModal = (projectId: string, toId: string) => {
     setSimpleReportForm({ projectId, toId });
     setSimpleReportTitle('');
     setSimpleReportNotes('');
     setSimpleReportFiles(null);
     setEditingReportId(null);
     setShowSimpleReportModal(true);
   };

   const openResubmitModal = (projectId: string, toId: string, title: string, text: string) => {
     setSimpleReportForm({ projectId, toId });
     setSimpleReportTitle(title);
     setSimpleReportNotes(text);
     setSimpleReportFiles(null);
     setEditingReportId(`resubmit-${Date.now()}`);
     setShowSimpleReportModal(true);
   };

   const handleSimpleReportSubmit = async () => {
     if (!simpleReportTitle.trim() || !simpleReportForm.projectId) return;
     setSubmittingSimple(true);
     try {
       const formData = new FormData();
       formData.append('projectId', simpleReportForm.projectId);
       formData.append('toId', simpleReportForm.toId);
       formData.append('title', simpleReportTitle.trim());
       formData.append('text', simpleReportNotes.trim());
       if (simpleReportFiles) {
         Array.from(simpleReportFiles).forEach(file => formData.append('files', file));
       }
       formData.append('workDate', new Date().toISOString().split('T')[0]);

       await submitProjectUpdate(formData);
       setShowSimpleReportModal(false);
       setSimpleReportForm({ projectId: '', toId: '' });
       setSimpleReportTitle('');
       setSimpleReportNotes('');
       setSimpleReportFiles(null);
     } catch (err) {
       console.error('Simple report submit error:', err);
     } finally {
       setSubmittingSimple(false);
     }
   };

     // Monthly Report handlers (to Sales Manager)
     const handleQuickMonthlyReportSubmit = async () => {
       if (!quickMonthlyTitle.trim() || !showQuickMonthlyReportModal) return;
       setSubmittingQuickMonthly(true);
       try {
         const formData = new FormData();
         formData.append('projectId', showQuickMonthlyReportModal);
         formData.append('toId', salesManagerId); // Send to Sales Manager (Kevin)
         formData.append('title', quickMonthlyTitle.trim());
         formData.append('text', quickMonthlyNotes.trim());
         if (quickMonthlyFiles) {
           Array.from(quickMonthlyFiles).forEach(file => formData.append('files', file));
         }
         formData.append('workDate', quickMonthlyWorkDate);

         await submitProjectUpdate(formData);
         setShowQuickMonthlyReportModal(null);
         setQuickMonthlyTitle('');
         setQuickMonthlyNotes('');
         setQuickMonthlyFiles(null);
       } catch (err) {
         console.error('Quick monthly report submit error:', err);
       } finally {
         setSubmittingQuickMonthly(false);
       }
     };

     const handleStructuredMonthlyReportSubmit = async () => {
       if (!showStructuredMonthlyReportModal) return;
       setSubmittingStructuredMonthly(true);
       try {
         const formData = new FormData();
         formData.append('projectId', showStructuredMonthlyReportModal);
         formData.append('toId', salesManagerId); // Send to Sales Manager (Kevin)
         formData.append('reportType', 'STRUCTURED');
         formData.append('onPageText', structuredMonthlyOnPageText);

         const onPageFiles: { filename: string; originalName: string }[] = [];
         if (structuredMonthlyOnPageFiles) {
           Array.from(structuredMonthlyOnPageFiles).forEach(file => {
             onPageFiles.push({ filename: file.name, originalName: file.name });
           });
         }
         formData.append('onPageFilesJson', JSON.stringify(onPageFiles));

         if (selectedMonthlyOffPageWork.length > 0) {
           formData.append('offPageWorkIds', JSON.stringify(selectedMonthlyOffPageWork));
         }

         formData.append('workDate', structuredMonthlyWorkDate);

         await submitProjectUpdate(formData);
         setShowStructuredMonthlyReportModal(null);
         setStructuredMonthlyOnPageText('');
         setStructuredMonthlyOnPageFiles(null);
         setSelectedMonthlyOffPageWork([]);
       } catch (err) {
         console.error('Structured monthly report submit error:', err);
       } finally {
         setSubmittingStructuredMonthly(false);
       }
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

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'green';
    if (status === 'CHANGES_REQUESTED') return 'red';
    return 'yellow';
  };

   return (
     <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-bold tracking-tight">My Projects</h1>
           <p className="text-slate-500 mt-1">GMB projects assigned by {seoManagerName}</p>
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
                  {notifications.length > 0 && (
                    <button onClick={clearNotifications} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">Clear All</button>
                  )}
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
                        : n.type === 'SECTION_REVIEWED' ? <FileText size={14} className="text-orange-500" />
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
        <Card className="p-12 text-center">
          <Folder size={40} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-500">No projects assigned yet</p>
        </Card>
      )}

      <div className="space-y-6">
        {myProjects.map(project => {
          const projectAssignments = mySentAssignments.filter(a => a.projectId === project.id);
          const projectWork = myWorkReviews.filter(w => w.projectId === project.id);
          const projectOnPageWork = myLeadWork.filter((w: any) => w.projectId === project.id);
          const approvedOffPage = projectWork.filter((w: any) => w.status === 'APPROVED');
          const isExpanded = expandedProject === project.id;
          const pendingCount = projectWork.filter((w: any) => w.status === 'PENDING_REVIEW').length;
          const myReports = projectUpdates.filter((u: any) => u.fromId === currentUser.id && u.projectId === project.id);
          const rejectedReports = myReports.filter((u: any) => u.reportType === 'STRUCTURED' && (u.onPageStatus === 'REJECTED' || u.offPageStatus === 'REJECTED'));
          const rejectedCount = rejectedReports.reduce((acc: number, u: any) => {
            if (u.onPageStatus === 'REJECTED') acc++;
            if (u.offPageStatus === 'REJECTED') acc++;
            return acc;
          }, 0);
          const projectUnreadMap = unreadCounts[project.id] || {};
          const projectUnread = (Object.values(projectUnreadMap) as number[]).reduce((sum, val) => sum + val, 0);

          return (
            <Card key={project.id} className="overflow-hidden">
              <div className="p-4 sm:p-5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setExpandedProject(isExpanded ? null : project.id)}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                       <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 relative">
                         <Folder size={28} />
                         {(pendingCount > 0 || rejectedCount > 0) && !isExpanded && (
                           <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">{pendingCount + rejectedCount}</span>
                        )}
                      </div>
                      {projectUnread > 0 && (
                        <span className="absolute -bottom-1 -left-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-bounce shadow-lg shadow-red-500/50 z-10 flex items-center gap-0.5">
                          <MessageCircle size={9} />{projectUnread > 99 ? '99+' : projectUnread}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-lg text-slate-900">{project.name}</h3>
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
                      <p>On-Page: {projectOnPageWork.length} item{projectOnPageWork.length !== 1 ? 's' : ''}</p>
                      <p>Off-Page: {approvedOffPage.length} approved</p>
                      {pendingCount > 0 && <p className="text-red-500">{pendingCount} pending review</p>}
                      {rejectedCount > 0 && <p className="text-orange-500 font-semibold">{rejectedCount} section{rejectedCount !== 1 ? 's' : ''} rejected</p>}
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
                  {activeTab === 'details' && (<>
                  <div className="p-4 sm:px-5 sm:py-4 border-b border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-500 rounded-full" />
                        Project Details
                      </h4>
                       <div className="flex flex-wrap gap-2">
                         {project.stage === 'ASSIGNED_TO_LEAD' && (
                           <Button size="sm" className="gap-1" onClick={() => handleStartWork(project.id)}>Start Work <ArrowRight size={14} /></Button>
                         )}
                         <Button variant="secondary" size="sm" className="gap-1" onClick={() => openAssignModal(project.id)}>
                           <Send size={14} /> Assign to {offPageName}
                         </Button>
                         <Button variant="secondary" size="sm" className="gap-1" onClick={() => openAssignDesignerModal(project.id)}>
                           <Palette size={14} /> Assign to {designerName}
                         </Button>
                       </div>
                    </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Category</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessCategory || 'N/A'}</p></div>
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Phone</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessPhone || 'N/A'}</p></div>
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Email</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessEmail || 'N/A'}</p></div>
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Website</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessWebsite || 'N/A'}</p></div>
                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200"><span className="text-[10px] text-blue-500/70 uppercase tracking-wider font-medium">Address</span><p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{project.businessAddress}{project.businessCity ? `, ${project.businessCity}` : ''} {project.businessState} {project.businessZip}</p></div>
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
                    {project.managerComment && (
                      <div className="mt-3 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-600">
                        <span className="font-bold">{seoManagerName}:</span> {project.managerComment}
                      </div>
                    )}
                    {(project.targetKeywords || project.services) && (
                      <div className="mt-3 space-y-2">
                        {project.targetKeywords && <div><span className="text-[10px] text-slate-500 uppercase tracking-wider">Keywords</span><div className="mt-1 flex flex-wrap gap-1">{project.targetKeywords.split(',').map((kw, i) => (<span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-600 text-xs rounded-full">{kw.trim()}</span>))}</div></div>}
                        {project.services && <div><span className="text-[10px] text-slate-500 uppercase tracking-wider">Services</span><p className="text-sm font-medium text-slate-800 mt-0.5">{project.services}</p></div>}
                      </div>
                    )}
                  </div>
                  </>)}
                  {activeTab === 'onpage' && (<>
                  <div className="p-4 sm:px-5 sm:py-4 border-b border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                          <FileText size={12} className="text-purple-400" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">On-Page Report (Your Work)</h4>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => openAddOnPageModal(project.id)}>
                        <Plus size={14} /> Add Work
                      </Button>
                    </div>

                    {projectOnPageWork.length === 0 ? (
                      <div className="p-6 bg-slate-50 rounded-lg text-center">
                        <FileUp size={24} className="mx-auto text-slate-600 mb-2" />
                        <p className="text-sm text-slate-500">No on-page work added yet. Click "Add Work" to start.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(() => {
                          const grouped: Record<string, any[]> = {};
                          projectOnPageWork.forEach((item: any) => {
                            const d = item.workDate || new Date(item.createdAt).toISOString().split('T')[0];
                            if (!grouped[d]) grouped[d] = [];
                            grouped[d].push(item);
                          });
                          return Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(date => {
                            const dateKey = `onpage-${project.id}-${date}`;
                            return (
                              <div key={date} className="bg-purple-500/5 border border-purple-500/20 rounded-lg overflow-hidden">
                                <div className="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-purple-500/10 transition-colors" onClick={() => toggleWorkDate(dateKey)}>
                                  {expandedWorkDates[dateKey] ? <ChevronUp size={14} className="text-purple-400" /> : <ChevronDown size={14} className="text-purple-400" />}
                                  <span className="text-xs font-semibold text-purple-300">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                  <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{grouped[date].length} item{grouped[date].length !== 1 ? 's' : ''}</span>
                                </div>
                                {expandedWorkDates[dateKey] && (
                                  <div className="p-2 space-y-2">
                                    {grouped[date].map((item: any) => (
                                      <div key={item.id} className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                          <p className="text-sm text-slate-600 flex-1">{item.text || <span className="text-slate-500 italic">No description</span>}</p>
                                          <div className="flex items-center gap-1 ml-2 shrink-0">
                                            <button className="p-1 hover:bg-purple-500/20 rounded text-purple-400" onClick={() => openEditOnPageModal(item)}>
                                              <FileText size={14} />
                                            </button>
                                            <button className="p-1 hover:bg-red-500/20 rounded text-red-400" onClick={() => deleteLeadWork(item.id)}>
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </div>
                                        {item.files.length > 0 && (
                                          <div className="flex flex-wrap gap-2">
                                            {item.files.map((f: any, i: number) => {
                                              const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                              return (
                                                <div key={i} className="relative group">
                                                  {isImg ? (
                                                    <img src={`/uploads/${f.filename}`} className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                                                  ) : (
                                                    <a href={`/uploads/${f.filename}`} target="_blank" download className="flex items-center gap-1 text-xs text-blue-600 hover:underline bg-white px-2 py-1 rounded border border-slate-200">
                                                      <Download size={12} /> {f.originalName}
                                                    </a>
                                                  )}
                                                  <button
                                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] hidden group-hover:flex items-center justify-center"
                                                    onClick={() => deleteLeadWorkFile(item.id, f.filename)}
                                                  >
                                                    <X size={8} />
                                                  </button>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
       )}
                                </div>
                              );
                            })
                          })()}
                        </div>
                      )}
                    </div>
                    </>
                  )}

                  {activeTab === 'report' && (<>
                    {/* Monthly Report Submission Section - Muaz submits reports to Sales Manager */}
                   <div className="p-4 sm:px-5 sm:py-4 border-t border-slate-200">
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                       <div className="w-1 h-4 bg-green-500 rounded-full" />
                       Submit Monthly Report to Sales Manager
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <Card className="p-4">
                         <h5 className="font-semibold text-sm mb-2">Quick Monthly Report</h5>
                         <p className="text-xs text-slate-500 mb-3">Simple summary of this month's work</p>
                         <Button className="w-full gap-2" onClick={() => setShowQuickMonthlyReportModal(project.id)}>
                           <Send size={16} /> Send to Sales Manager
                         </Button>
                       </Card>
                       <Card className="p-4">
                         <h5 className="font-semibold text-sm mb-2">Structured Monthly Report</h5>
                         <p className="text-xs text-slate-500 mb-3">Detailed on-page and off-page work</p>
                         <Button variant="outline" className="w-full gap-2" onClick={() => setShowStructuredMonthlyReportModal(project.id)}>
                           <FileText size={16} /> Create Structured
                         </Button>
                       </Card>
                     </div>
                   </div>

                   {rejectedReports.length > 0 && (
                    <div className="p-4 sm:px-5 sm:py-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center">
                          <RotateCcw size={12} className="text-red-400" />
                        </div>
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Rejected Sections — Fix & Resubmit</h4>
                      </div>
                      <div className="space-y-3">
                        {rejectedReports.map((report: any) => {
                          const toUser = users[report.toId];
                          return (
                            <div key={report.id} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="red" className="text-[10px]">Rejected</Badge>
                                <span className="text-[11px] text-slate-500">Sent to {toUser?.name}</span>
                              </div>
                              {report.onPageStatus === 'REJECTED' && (
                                <div className="mb-2 p-2 bg-white border border-red-500/20 rounded">
                                  <p className="text-[10px] font-bold text-purple-400 uppercase mb-1">On-Page Rejected</p>
                                  {report.onPageComment && <p className="text-xs text-red-400">{report.onPageComment}</p>}
                                  <p className="text-[10px] text-slate-500 mt-1">Fix your on-page work above and resubmit</p>
                                </div>
                              )}
                              {report.offPageStatus === 'REJECTED' && (
                                <div className="p-2 bg-white border border-red-500/20 rounded">
                                  <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Off-Page Rejected</p>
                                  {report.offPageComment && <p className="text-xs text-red-400">{report.offPageComment}</p>}
                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <Button size="sm" variant="danger" className="gap-1 text-[11px] px-2 py-1" onClick={() => { setAssignForm({ projectId: project.id, toId: offPageId, text: `Off-page report rejected by ${toUser?.name}. Reason: ${report.offPageComment || 'No reason provided'}. Please redo and resubmit.` }); setSelectedImages(null); setSelectedDocs(null); setShowAssignModal(true); }}>
                                      <Send size={12} /> Ask {offPageName} to Redo
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(() => {
                    const myReviewedReports = projectUpdates.filter((u: any) => u.fromId === currentUser.id && u.projectId === project.id);
                    const reviewedReports = myReviewedReports.filter((u: any) =>
                      u.reportType === 'STRUCTURED' && (u.onPageStatus !== 'PENDING' || u.offPageStatus !== 'PENDING')
                    );
                    const simpleReviewed = myReviewedReports.filter((u: any) =>
                      u.reportType !== 'STRUCTURED' && u.reviewComment
                    );
                    const allReviewed = [...reviewedReports, ...simpleReviewed];
                    if (allReviewed.length === 0) return null;

                    return (
                      <div className="p-4 sm:px-5 sm:py-4 border-b border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                            <CheckCircle2 size={12} className="text-green-400" />
                          </div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reviews from Manager/Client</h4>
                          {reviewedReports.filter((u: any) => u.onPageStatus === 'REJECTED' || u.offPageStatus === 'REJECTED').length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full">
                              <Bell size={10} /> {reviewedReports.filter((u: any) => u.onPageStatus === 'REJECTED' || u.offPageStatus === 'REJECTED').length} rejected
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          {allReviewed.map((u: any) => {
                            const toUser = users[u.toId];
                            const isStructured = u.reportType === 'STRUCTURED';

                            if (isStructured) {
                              return (
                                <div key={u.id} className="p-3 bg-white border border-slate-200 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="purple" className="text-[10px]">Structured Report</Badge>
                                    <span className="text-[11px] text-slate-500">Sent to {toUser?.name}</span>
                                  </div>
                                  <div className="space-y-2">
                                    {u.onPageStatus !== 'PENDING' && (
                                      <div className={`p-2 rounded-lg ${u.onPageStatus === 'APPROVED' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                        <Badge variant={u.onPageStatus === 'APPROVED' ? 'green' : 'red'} className="text-[10px]">On-Page: {u.onPageStatus === 'APPROVED' ? 'Approved' : 'Rejected'}</Badge>
                                        {u.onPageComment && <p className={`text-xs mt-1 ${u.onPageStatus === 'APPROVED' ? 'text-green-400' : 'text-red-400'}`}>{u.onPageComment}</p>}
                                      </div>
                                    )}
                                    {u.offPageStatus !== 'PENDING' && (
                                      <div className={`p-2 rounded-lg ${u.offPageStatus === 'APPROVED' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                        <Badge variant={u.offPageStatus === 'APPROVED' ? 'green' : 'red'} className="text-[10px]">Off-Page: {u.offPageStatus === 'APPROVED' ? 'Approved' : 'Rejected'}</Badge>
                                        {u.offPageComment && <p className={`text-xs mt-1 ${u.offPageStatus === 'APPROVED' ? 'text-green-400' : 'text-red-400'}`}>{u.offPageComment}</p>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={u.id} className={`p-3 rounded-lg ${u.status === 'APPROVED' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={u.status === 'APPROVED' ? 'green' : 'red'} className="text-[10px]">{u.status === 'APPROVED' ? 'Approved' : 'Changes Requested'}</Badge>
                                  <span className="text-[11px] text-slate-500">Sent to {toUser?.name}</span>
                                  <span className="text-[10px] text-slate-400">{u.title}</span>
                                </div>
                                {u.reviewComment && <p className={`text-sm mb-2 ${u.status === 'APPROVED' ? 'text-green-400' : 'text-red-400'}`}>{u.reviewComment}</p>}
                                {u.text && <p className="text-xs text-slate-400 mb-2 line-clamp-2">{u.text}</p>}
                                {u.status === 'CHANGES_REQUESTED' && (
                                  <Button size="sm" variant="danger" className="gap-1 text-[11px]" onClick={() => openResubmitModal(u.projectId, u.toId, u.title || '', u.text || '')}>
                                    <Send size={12} /> Edit & Resubmit
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="p-4 sm:px-5 sm:py-4 bg-white">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Submit Final Report</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button className="gap-2" onClick={() => openSubmitReportModal(project.id, seoManagerId)}>
                        <Send size={16} /> Submit Report to {seoManagerName}
                      </Button>
                      <Button variant="secondary" className="gap-2" onClick={() => openSubmitReportModal(project.id, salesManagerId)}>
                        <Send size={16} /> Submit Report to {salesManagerName}
                      </Button>
                    </div>
                     <p className="text-[10px] text-slate-500 mt-2">
                       Report will include your On-Page work + {offPageName}'s approved Off-Page work
                     </p>
                   </div>

                   {/* Quick Report Section */}
                   <div className="p-4 sm:px-5 sm:py-4 bg-slate-50 border-t border-slate-200">
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Report</h4>
                     <div className="flex flex-wrap gap-3">
                       <Button className="gap-2" onClick={() => openSimpleReportModal(project.id, seoManagerId)}>
                         <Send size={16} /> Simple Report to {seoManagerName}
                       </Button>
                       <Button variant="secondary" className="gap-2" onClick={() => openSimpleReportModal(project.id, salesManagerId)}>
                         <Send size={16} /> Simple Report to {salesManagerName}
                       </Button>
                     </div>
                     <p className="text-[10px] text-slate-500 mt-2">
                       Title, notes and file attachments. Independent of work items.
                     </p>
                   </div>

                   </>)}

                  {activeTab === 'chat' && (
                  <div className="h-[70vh]">
                    <ChatBox projectId={project.id} />
                  </div>
                  )}
                  </div>
                )}
              </Card>
            );
          })}
      </div>

      {showAlreadySentPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAlreadySentPopup('')} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10">
            <div className="px-6 py-5 text-center">
              <div className="w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={28} className="text-yellow-400" />
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

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Send to {offPageName}</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
                <p className="font-semibold text-blue-600">{projects.find(p => p.id === assignForm.projectId)?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Text / Instructions</label>
                <textarea className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" placeholder="Write instructions..." value={assignForm.text} onChange={e => setAssignForm({ ...assignForm, text: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Images</label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => fileInputRef.current?.click()}><Image size={14} /> Select Images</Button>
                  <span className="text-xs text-slate-500">{selectedImages ? `${selectedImages.length} selected` : 'No images'}</span>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => setSelectedImages(e.target.files)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Documents</label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => docInputRef.current?.click()}><Paperclip size={14} /> Select Docs</Button>
                  <span className="text-xs text-slate-500">{selectedDocs ? `${selectedDocs.length} selected` : 'No docs'}</span>
                  <input ref={docInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.xlsx,.xls" className="hidden" onChange={e => setSelectedDocs(e.target.files)} />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
              <Button className="gap-1" onClick={handleSendAssignment} disabled={sendingAssignment}>{sendingAssignment ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : <><Send size={14} /> Send</>}</Button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowReviewModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{reviewStatus === 'APPROVED' ? 'Approve Submission' : 'Request Changes'}</h3>
              <button onClick={() => setShowReviewModal(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {reviewStatus === 'CHANGES_REQUESTED' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                  Please describe what needs to be changed so {offPageName} can fix and resubmit.
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  {reviewStatus === 'CHANGES_REQUESTED' ? 'Reason / What needs to be fixed' : 'Comment (optional)'}
                </label>
                <textarea
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  placeholder={reviewStatus === 'CHANGES_REQUESTED' ? 'e.g. Backlinks are missing, anchor text needs correction...' : 'Any additional notes...'}
                  value={reviewCommentText}
                  onChange={e => setReviewCommentText(e.target.value)}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowReviewModal(null)}>Cancel</Button>
              <Button variant={reviewStatus === 'APPROVED' ? 'primary' : 'danger'} className="gap-1" onClick={handleReview} disabled={reviewing || (reviewStatus === 'CHANGES_REQUESTED' && !reviewCommentText.trim())}>
                {reviewing ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : reviewStatus === 'APPROVED' ? <><CheckCircle2 size={14} /> Approve</> : <><RotateCcw size={14} /> Send Back for Changes</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAddOnPageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAddOnPageModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add On-Page Work</h3>
              <button onClick={() => setShowAddOnPageModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm">
                <p className="font-semibold text-purple-400">{projects.find(p => p.id === addOnPageForm.projectId)?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Work Date</label>
                <input type="date" className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" value={addOnPageDate} onChange={e => setAddOnPageDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Description / Notes</label>
                <textarea
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  placeholder="Describe the on-page work done (meta tags, content optimization, schema markup, etc.)..."
                  value={addOnPageForm.text}
                  onChange={e => setAddOnPageForm({ ...addOnPageForm, text: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Attach Files (Screenshots, Reports)</label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => onPageFileRef.current?.click()}><Paperclip size={14} /> Select Files</Button>
                  <span className="text-xs text-slate-500">{onPageFiles ? `${onPageFiles.length} selected` : 'No files'}</span>
                  <input ref={onPageFileRef} type="file" multiple className="hidden" onChange={e => setOnPageFiles(e.target.files)} />
                </div>
                {onPageFiles && <div className="flex flex-wrap gap-2 mt-2">{Array.from(onPageFiles).map((f: File, i: number) => (<span key={i} className="text-xs bg-slate-50 px-2 py-1 rounded">{f.name}</span>))}</div>}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddOnPageModal(false)}>Cancel</Button>
              <Button className="gap-1" onClick={handleAddOnPage} disabled={addingWork}>{addingWork ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : <><Plus size={14} /> Add</>}</Button>
            </div>
          </div>
        </div>
      )}

      {showEditOnPageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowEditOnPageModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Edit On-Page Work</h3>
              <button onClick={() => setShowEditOnPageModal(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Description / Notes</label>
                <textarea
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  value={editOnPageForm.text}
                  onChange={e => setEditOnPageForm({ ...editOnPageForm, text: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Add More Files</label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => editOnPageFileRef.current?.click()}><Paperclip size={14} /> Select Files</Button>
                  <span className="text-xs text-slate-500">{editOnPageFiles ? `${editOnPageFiles.length} selected` : 'No new files'}</span>
                  <input ref={editOnPageFileRef} type="file" multiple className="hidden" onChange={e => setEditOnPageFiles(e.target.files)} />
                </div>
                {editOnPageFiles && <div className="flex flex-wrap gap-2 mt-2">{Array.from(editOnPageFiles).map((f: File, i: number) => (<span key={i} className="text-xs bg-slate-50 px-2 py-1 rounded">{f.name}</span>))}</div>}
              </div>
              {(() => {
                const item = myLeadWork.find((w: any) => w.id === showEditOnPageModal);
                if (!item || item.files.length === 0) return null;
                return (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Current Files</label>
                    <div className="flex flex-wrap gap-2">
                      {item.files.map((f: any, i: number) => {
                        const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                        return (
                          <div key={i} className="relative group">
                            {isImg ? (
                              <img src={`/uploads/${f.filename}`} className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-slate-600 bg-white px-2 py-1 rounded border border-slate-200"><FileText size={12} /> {f.originalName}</span>
                            )}
                            <button className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] hidden group-hover:flex items-center justify-center" onClick={() => deleteLeadWorkFile(item.id, f.filename)}>
                              <X size={8} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEditOnPageModal(null)}>Cancel</Button>
              <Button className="gap-1" onClick={handleEditOnPage} disabled={editingOnPage}>{editingOnPage ? <><Loader2 size={14} className="animate-spin" /> Updating...</> : 'Update'}</Button>
            </div>
          </div>
        </div>
      )}

      {showSubmitReportModal && (() => {
        const project = projects.find(p => p.id === reportForm.projectId);
        if (!project) return null;
        const projectOnPage = myLeadWork.filter((w: any) => w.projectId === reportForm.projectId);
        const approvedOffPage = myWorkReviews.filter((w: any) => w.projectId === reportForm.projectId && w.status === 'APPROVED');
        const toName = reportForm.toId === seoManagerId ? seoManagerName : salesManagerName;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowSubmitReportModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden z-10 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Submit Final Report</h3>
                  <p className="text-xs text-slate-500">To {toName} — {project.name}</p>
                </div>
                <button onClick={() => setShowSubmitReportModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
              </div>

              <div className="px-6 py-5 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Report Date</label>
                  <input
                    type="date"
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reportDate}
                    onChange={e => setReportDate(e.target.value)}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-5 h-5 bg-purple-500/20 rounded flex items-center justify-center"><FileText size={10} className="text-purple-400" /></div>
                    On-Page Report ({projectOnPage.length} items)
                  </h4>
                  {projectOnPage.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                      <p className="text-sm text-slate-500">No on-page work added yet</p>
                      <Button size="sm" variant="outline" className="mt-2 gap-1" onClick={() => { setShowSubmitReportModal(false); openAddOnPageModal(reportForm.projectId); }}>
                        <Plus size={14} /> Add On-Page Work First
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {projectOnPage.map((item: any) => (
                        <div key={item.id} className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                          {item.text && <p className="text-sm text-slate-600 mb-2">{item.text}</p>}
                          {item.files.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.files.map((f: any, i: number) => {
                                const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                return isImg ? (
                                  <img key={i} src={`/uploads/${f.filename}`} className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                                ) : (
                                  <span key={i} className="flex items-center gap-1 text-xs text-blue-600 bg-white px-2 py-1 rounded border border-slate-200"><FileText size={12} /> {f.originalName}</span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-5 h-5 bg-orange-500/20 rounded flex items-center justify-center"><Globe size={10} className="text-orange-400" /></div>
                    Off-Page Report ({approvedOffPage.length} approved items)
                  </h4>
                  {approvedOffPage.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                      <p className="text-sm text-slate-500">No approved off-page work yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {approvedOffPage.map((work: any) => (
                        <div key={work.id} className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                          {work.text && <p className="text-sm text-slate-600 mb-2">{work.text}</p>}
                          {work.files.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {work.files.map((f: any, i: number) => {
                                const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.filename);
                                return isImg ? (
                                  <img key={i} src={`/uploads/${f.filename}`} className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                                ) : (
                                  <span key={i} className="flex items-center gap-1 text-xs text-blue-600 bg-white px-2 py-1 rounded border border-slate-200"><FileText size={12} /> {f.originalName}</span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setShowSubmitReportModal(false)}>Cancel</Button>
                <Button className="gap-2" onClick={handleSubmitReport} disabled={submittingReport || (projectOnPage.length === 0 && approvedOffPage.length === 0)}>
                  {submittingReport ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> Submit Report to {toName}</>}
                </Button>
              </div>
            </div>
          </div>
        );
       })()}

       {/* Simple Report Modal */}
       {showSimpleReportModal && (() => {
         const project = projects.find(p => p.id === simpleReportForm.projectId);
         if (!project) return null;
         const toName = simpleReportForm.toId === seoManagerId ? seoManagerName : salesManagerName;
         const isEditing = !!editingReportId;

         return (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setShowSimpleReportModal(false); setEditingReportId(null); }} />
             <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden z-10">
               <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                 <div>
                   <h3 className="text-lg font-bold text-slate-900">{isEditing ? 'Edit & Resubmit Report' : 'Submit Quick Report'}</h3>
                   <p className="text-xs text-slate-500">To {toName} — {project.name}</p>
                 </div>
                 <button onClick={() => { setShowSimpleReportModal(false); setEditingReportId(null); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
               </div>

               <div className="px-6 py-5 space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                   <input
                     type="text"
                     className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="e.g., Monthly Report, Bi-Weekly Report"
                     value={simpleReportTitle}
                     onChange={e => setSimpleReportTitle(e.target.value)}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Notes / Description</label>
                   <textarea
                     className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                     placeholder="Add any additional details..."
                     value={simpleReportNotes}
                     onChange={e => setSimpleReportNotes(e.target.value)}
                   />
                 </div>
                 {isEditing && (
                   <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                     Previous version was rejected. Update the content above and resubmit.
                   </div>
                 )}
                 <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Attachments (optional)</label>
                   <input
                     type="file"
                     multiple
                     ref={simpleFileInputRef}
                     className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-lg file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                     onChange={e => setSimpleReportFiles(e.target.files)}
                   />
                   {simpleReportFiles && simpleReportFiles.length > 0 && (
                     <p className="text-xs text-slate-500 mt-1">{simpleReportFiles.length} file(s) selected</p>
                   )}
                 </div>
               </div>

               <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                 <Button variant="outline" onClick={() => { setShowSimpleReportModal(false); setEditingReportId(null); }}>Cancel</Button>
                 <Button className="gap-2" onClick={handleSimpleReportSubmit} disabled={submittingSimple || !simpleReportTitle.trim()}>
                   {submittingSimple ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> {isEditing ? 'Resubmit to' : 'Submit Report to'} {toName}</>}
                 </Button>
               </div>
             </div>
           </div>
         );
       })()}

       {showUpdateReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowUpdateReviewModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{updateReviewStatus === 'APPROVED' ? 'Approve' : 'Request Changes'}</h3>
              <button onClick={() => setShowUpdateReviewModal(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <textarea className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" placeholder={updateReviewStatus === 'CHANGES_REQUESTED' ? 'What needs to be changed...' : 'Optional comment...'} value={updateReviewComment} onChange={e => setUpdateReviewComment(e.target.value)} />
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowUpdateReviewModal(null)}>Cancel</Button>
              <Button variant={updateReviewStatus === 'APPROVED' ? 'primary' : 'danger'} className="gap-1" onClick={handleUpdateReview} disabled={updateReviewing || (updateReviewStatus === 'CHANGES_REQUESTED' && !updateReviewComment.trim())}>
                {updateReviewing ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : updateReviewStatus === 'APPROVED' ? <><CheckCircle2 size={14} /> Approve</> : <><RotateCcw size={14} /> Send Back</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAssignDesignerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAssignDesignerModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Assign Design Task to {designerName}</h3>
              <button onClick={() => setShowAssignDesignerModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg text-sm">
                <p className="font-semibold text-pink-400">{projects.find(p => p.id === assignDesignerForm.projectId)?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Task Description</label>
                <textarea className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" placeholder="Describe what images/designs are needed..." value={assignDesignerForm.text} onChange={e => setAssignDesignerForm({ ...assignDesignerForm, text: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Reference Images</label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => assignDesignerImgRef.current?.click()}><Image size={14} /> Select Images</Button>
                  <span className="text-xs text-slate-500">{assignDesignerImages ? `${assignDesignerImages.length} selected` : 'None'}</span>
                  <input ref={assignDesignerImgRef} type="file" multiple accept="image/*" className="hidden" onChange={e => setAssignDesignerImages(e.target.files)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Reference Documents</label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => assignDesignerDocRef.current?.click()}><Paperclip size={14} /> Select Files</Button>
                  <span className="text-xs text-slate-500">{assignDesignerDocs ? `${assignDesignerDocs.length} selected` : 'None'}</span>
                  <input ref={assignDesignerDocRef} type="file" multiple className="hidden" onChange={e => setAssignDesignerDocs(e.target.files)} />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAssignDesignerModal(false)}>Cancel</Button>
              <Button className="gap-1" onClick={handleAssignDesigner} disabled={assigningDesigner}>{assigningDesigner ? <><Loader2 size={14} className="animate-spin" /> Assigning...</> : <><Palette size={14} /> Assign to {designerName}</>}</Button>
            </div>
          </div>
        </div>
       )}

       {/* Quick Monthly Report Modal */}
       {showQuickMonthlyReportModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowQuickMonthlyReportModal(null)} />
           <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
             <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
               <h3 className="text-lg font-bold text-slate-900">Quick Monthly Report</h3>
               <button onClick={() => setShowQuickMonthlyReportModal(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
             </div>
             <form onSubmit={(e) => { e.preventDefault(); handleQuickMonthlyReportSubmit(); }}>
               <div className="px-6 py-5 space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Report Title</label>
                   <input
                     type="text"
                     className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="e.g., March 2025 GMB Progress"
                     value={quickMonthlyTitle}
                     onChange={e => setQuickMonthlyTitle(e.target.value)}
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Monthly Summary</label>
                   <textarea
                     className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                     placeholder="Describe work done this month..."
                     value={quickMonthlyNotes}
                     onChange={e => setQuickMonthlyNotes(e.target.value)}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Report Month</label>
                   <input
                     type="month"
                     className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={quickMonthlyWorkDate}
                     onChange={e => setQuickMonthlyWorkDate(e.target.value)}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Attachments (optional)</label>
                   <input
                     type="file"
                     multiple
                     className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                     onChange={e => setQuickMonthlyFiles(e.target.files)}
                   />
                 </div>
               </div>
               <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                 <Button type="button" variant="outline" onClick={() => setShowQuickMonthlyReportModal(null)}>Cancel</Button>
                 <Button type="submit" className="gap-2" disabled={submittingQuickMonthly || !quickMonthlyTitle.trim()}>
                   {submittingQuickMonthly ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : <><Send size={14} /> Send to Sales Manager</>}
                 </Button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Structured Monthly Report Modal */}
       {showStructuredMonthlyReportModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowStructuredMonthlyReportModal(null)} />
           <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden z-10">
             <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
               <h3 className="text-lg font-bold text-slate-900">Structured Monthly Report</h3>
               <button onClick={() => setShowStructuredMonthlyReportModal(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
             </div>
             <form onSubmit={(e) => { e.preventDefault(); handleStructuredMonthlyReportSubmit(); }}>
               <div className="px-6 py-5 space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">On-Page Work Summary for This Month</label>
                   <textarea
                     className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                     placeholder="Describe all on-page SEO work completed during this month..."
                     value={structuredMonthlyOnPageText}
                     onChange={e => setStructuredMonthlyOnPageText(e.target.value)}
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">On-Page Supporting Files (optional)</label>
                   <input
                     type="file"
                     multiple
                     className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                     onChange={e => setStructuredMonthlyOnPageFiles(e.target.files)}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Off-Page Work Completed This Month</label>
                   <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded p-3">
                     {(() => {
                       const projectId = showStructuredMonthlyReportModal;
                       const project = myProjects.find(p => p.id === projectId);
                       if (!project) return <p className="text-sm text-slate-500">No project found.</p>;
                       const projectWork = workSubmissions.filter((w: any) => w.projectId === projectId && w.status === 'APPROVED');
                       if (projectWork.length === 0) return <p className="text-sm text-slate-500">No approved off-page work yet.</p>;
                       return projectWork.map(work => (
                         <label key={work.id} className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded">
                           <input
                             type="checkbox"
                             checked={selectedMonthlyOffPageWork.includes(work.id)}
                             onChange={e => {
                               if (e.target.checked) {
                                 setSelectedMonthlyOffPageWork(prev => [...prev, work.id]);
                               } else {
                                 setSelectedMonthlyOffPageWork(prev => prev.filter(id => id !== work.id));
                               }
                             }}
                             className="mt-1"
                           />
                           <div className="text-sm">
                             <p className="text-slate-800">{work.text?.substring(0, 100)}...</p>
                             <p className="text-xs text-slate-500">{new Date(work.createdAt).toLocaleDateString()}</p>
                           </div>
                         </label>
                       ));
                     })()}
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Report Month</label>
                   <input
                     type="month"
                     className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={structuredMonthlyWorkDate}
                     onChange={e => setStructuredMonthlyWorkDate(e.target.value)}
                   />
                 </div>
               </div>
               <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                 <Button type="button" variant="outline" onClick={() => setShowStructuredMonthlyReportModal(null)}>Cancel</Button>
                 <Button type="submit" className="gap-2" disabled={submittingStructuredMonthly}>
                   {submittingStructuredMonthly ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : <><FileText size={14} /> Send to Sales Manager</>}
                 </Button>
               </div>
             </form>
           </div>
         </div>
       )}

     </div>
   );
 }
