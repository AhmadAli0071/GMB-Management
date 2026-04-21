import React, { useState } from 'react';
import {
  ArrowLeft, Clock, Calendar, Users, FileText, CheckCircle2,
  Activity, Phone, Mail, ExternalLink, Shield,
} from 'lucide-react';
import { Card, Button, Badge, Input } from './ui/Common';
import { useApp } from '../AppContext';
import { ALL_STAGES, STAGE_LABELS, STAGE_COLORS } from '../types';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetailPage({ projectId, onBack }: ProjectDetailProps) {
  const { currentUser, projects, tasks, activities, users, updateProjectStage } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const project = projects.find(p => p.id === projectId);
  if (!project) return <div className="text-center py-20 text-slate-500">Project not found</div>;

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const projectActivities = activities.filter(a => a.projectId === project.id).slice(0, 20);
  const onPageTasks = projectTasks.filter(t => t.type === 'ON_PAGE');
  const offPageTasks = projectTasks.filter(t => t.type === 'OFF_PAGE');

  const currentStageIndex = ALL_STAGES.indexOf(project.stage);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'on-page', label: `On-Page (${onPageTasks.length})`, icon: CheckCircle2 },
    { id: 'off-page', label: `Off-Page (${offPageTasks.length})`, icon: ExternalLink },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ];

  const canAdvanceStage = () => {
    if (currentUser.role === 'SALES_MANAGER' && (project.stage === 'CLIENT_COMMUNICATION' || project.stage === 'VERIFICATION')) return true;
    if (currentUser.role === 'SEO_MANAGER' && project.stage === 'READY_FOR_ASSIGNMENT') return true;
    if (currentUser.role === 'SEO_LEAD' && ['ASSIGNED_TO_LEAD', 'ON_PAGE_IN_PROGRESS', 'OFF_PAGE_IN_PROGRESS', 'REVIEW'].includes(project.stage)) return true;
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 font-medium transition-colors mb-4 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">{project.name}</h1>
            <Badge variant={STAGE_COLORS[project.stage]}>{STAGE_LABELS[project.stage]}</Badge>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${project.verificationStatus === 'VERIFIED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              <Shield size={11} /> {project.verificationStatus === 'VERIFIED' ? 'Verified' : 'Unverified'}
            </span>
          </div>
          <p className="text-slate-400 mt-2 font-medium">Category: <span className="text-blue-400">{project.businessCategory || 'N/A'}</span></p>
        </div>
        <div className="flex gap-3">
          {nextAction && canAdvanceStage() && (
            <Button className="gap-2" onClick={() => updateProjectStage(project.id, nextAction.stage)}>
              <CheckCircle2 size={18} />
              <span>{nextAction.label}</span>
            </Button>
          )}
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-700/50 z-0" />
          {ALL_STAGES.map((stage, i) => {
            const isCompleted = i < currentStageIndex;
            const isCurrent = i === currentStageIndex;
            return (
              <div key={stage} className="relative z-10 flex flex-col items-center gap-2 bg-slate-700 px-3">
                <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all ${
                  isCompleted ? 'bg-blue-600 border-blue-500/20 text-white' :
                  isCurrent ? 'bg-slate-700 border-blue-600 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.2)]' :
                  'bg-slate-700 border-slate-700/50 text-slate-600'
                }`}>
                  {isCompleted ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
                </div>
                <span className={`text-[10px] font-bold tracking-wider uppercase text-center max-w-[80px] ${
                  isCurrent ? 'text-blue-400' : isCompleted ? 'text-slate-300' : 'text-slate-600'
                }`}>{STAGE_LABELS[stage].split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex border-b border-slate-700/50 gap-8 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-4 border-b-2 font-semibold text-sm transition-all whitespace-nowrap px-1 ${
              activeTab === tab.id ? 'border-blue-600 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Project Description</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{project.specialInstructions || project.targetKeywords || 'GMB Optimization Project'}</p>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Calendar size={18} className="text-blue-400" /> Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Category</span>
                      <span className="font-semibold">{project.businessCategory || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 flex items-center gap-1"><Mail size={12} /> Email</span>
                      <span className="font-semibold text-blue-400">{project.businessEmail}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 flex items-center gap-1"><Phone size={12} /> Phone</span>
                      <span className="font-semibold">{project.businessPhone}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Category</span>
                      <span className="font-semibold">{project.businessCategory || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Location</span>
                      <span className="font-semibold">{project.businessCity}{project.businessState ? `, ${project.businessState}` : ''}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Status</span>
                      <span className={`font-bold flex items-center gap-1 ${project.verificationStatus === 'VERIFIED' ? 'text-green-400' : 'text-red-400'}`}>
                        <Shield size={12} /> {project.verificationStatus === 'VERIFIED' ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Created</span>
                      <span className="font-semibold">{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Last Update</span>
                      <span className="font-semibold">{new Date(project.lastUpdate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users size={18} className="text-blue-400" /> Team</h3>
                  <div className="space-y-3">
                    {project.assignedTo.map(id => {
                      const user = users[id];
                      return (
                        <div key={id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50">
                          <img src={user?.avatar} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                          <div>
                            <p className="text-xs font-bold">{user?.name}</p>
                            <p className="text-[10px] text-slate-500">{user?.role.replace('_', ' ')}</p>
                          </div>
                        </div>
                      );
                    })}
                    {project.assignedTo.length === 0 && <p className="text-sm text-slate-500">No team assigned yet</p>}
                  </div>
                </Card>
              </div>
            </div>
            <Card className="p-6 h-fit sticky top-24">
              <h3 className="font-bold text-lg mb-4">Task Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-slate-400">Total Tasks</span><span className="font-bold">{projectTasks.length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Completed</span><span className="font-bold text-green-400">{projectTasks.filter(t => t.status === 'COMPLETED').length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">In Progress</span><span className="font-bold text-blue-400">{projectTasks.filter(t => t.status === 'IN_PROGRESS').length}</span></div>
                <div className="h-2 bg-slate-700/50 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${projectTasks.length > 0 ? (projectTasks.filter(t => t.status === 'COMPLETED').length / projectTasks.length) * 100 : 0}%` }} />
                </div>
              </div>
            </Card>
          </div>
        )}

        {(activeTab === 'on-page' || activeTab === 'off-page') && (
          <div className="space-y-4">
            {(activeTab === 'on-page' ? onPageTasks : offPageTasks).map(task => {
              const assignee = users[task.assignedTo];
              return (
                <Card key={task.id} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.status === 'COMPLETED' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-700/50'}`}>
                      {task.status === 'COMPLETED' && <CheckCircle2 size={14} />}
                    </button>
                    <div>
                      <p className={`font-bold text-sm ${task.status === 'COMPLETED' ? 'text-slate-500 line-through' : ''}`}>{task.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant={task.status === 'COMPLETED' ? 'green' : task.status === 'IN_PROGRESS' ? 'blue' : 'gray'}>{task.status.replace('_', ' ')}</Badge>
                        <Badge variant={task.priority === 'HIGH' ? 'red' : 'gray'} className="text-[9px]">{task.priority}</Badge>
                        <span className="text-[11px] text-slate-500">{assignee?.name}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
            {(activeTab === 'on-page' ? onPageTasks : offPageTasks).length === 0 && (
              <Card className="p-12 text-center text-slate-500">No {activeTab} tasks yet</Card>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="max-w-2xl mx-auto py-6">
            <div className="relative space-y-8">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-700/50 z-0" />
              {projectActivities.map(activity => {
                const user = users[activity.userId];
                return (
                  <div key={activity.id} className="relative z-10 flex gap-4 pl-12 group">
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-blue-500/10 border-2 border-slate-800 ring-4 ring-slate-800 flex items-center justify-center text-blue-400">
                      <Activity size={14} />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-bold">{user?.name}</span> {activity.content}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
              {projectActivities.length === 0 && (
                <div className="text-center text-slate-500 py-10">No activity yet for this project</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
