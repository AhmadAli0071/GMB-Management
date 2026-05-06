import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle, Clock, FileText, Loader2, Send, Bell } from 'lucide-react';
import { Card, Button, Badge, StatCard } from '../ui/Common';
import { useApp } from '../../AppContext';
import { useChatNotify } from '../../ChatNotifyContext';
import { useSocket } from '../../SocketContext';

export function InternDashboard() {
  const { currentUser, tasks, projects, users, updateTaskStatus } = useApp();
  const { unreadCounts, notificationPermission, requestNotificationPermission } = useChatNotify();
  const { onActivityNotification, offActivityNotification } = useSocket();
  const [loadingTask, setLoadingTask] = useState<string | null>(null);

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

  const myTasks = tasks.filter(t => t.assignedTo === currentUser.id);
  const todoTasks = myTasks.filter(t => t.status === 'TODO');
  const inProgressTasks = myTasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = myTasks.filter(t => ['SUBMITTED', 'REVIEWED', 'COMPLETED'].includes(t.status));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {currentUser.name}!</h1>
          <p className="text-slate-400 mt-1">You have {todoTasks.length + inProgressTasks.length} tasks to focus on today.</p>
        </div>
        <div className="flex items-center gap-3">
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
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Completed</p>
            <p className="text-lg font-bold text-green-400">{completedTasks.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-bold">
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={FileText} label="To Do" value={todoTasks.length} iconBg="bg-slate-900/50" iconColor="text-slate-400" />
        <StatCard icon={Clock} label="In Progress" value={inProgressTasks.length} iconBg="bg-yellow-500/10" iconColor="text-yellow-600" />
        <StatCard icon={CheckCircle2} label="Completed" value={completedTasks.length} iconBg="bg-green-500/10" iconColor="text-green-400" />
      </div>

      {inProgressTasks.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Clock size={18} className="text-yellow-500" />
            In Progress
            <Badge variant="yellow">{inProgressTasks.length}</Badge>
          </h3>
          <div className="space-y-4">
            {inProgressTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              const assignedBy = users[task.assignedBy];
              return (
                <Card key={task.id} className="p-6 border-l-4 border-l-yellow-400">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-yellow-500/10 rounded-lg">
                        <Clock size={20} className="text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100">{task.title}</h4>
                        <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="blue">{task.type.replace('_', ' ')}</Badge>
                          <Badge variant={task.priority === 'HIGH' ? 'red' : task.priority === 'MEDIUM' ? 'yellow' : 'gray'}>{task.priority} Priority</Badge>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <FileText size={12} /> {project?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="gap-2 shrink-0" disabled={loadingTask === task.id} onClick={async () => {
                      setLoadingTask(task.id);
                      try { await updateTaskStatus(task.id, 'SUBMITTED'); } finally { setLoadingTask(null); }
                    }}>
                      {loadingTask === task.id ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : <><Send size={14} /> Submit</>}
                    </Button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700/30 flex items-center gap-2 text-[11px] text-slate-500">
                    <span>Assigned by {assignedBy?.name}</span>
                    <span>·</span>
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {todoTasks.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Circle size={18} className="text-slate-500" />
            To Do
            <Badge variant="gray">{todoTasks.length}</Badge>
          </h3>
          <div className="space-y-4">
            {todoTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              const assignedBy = users[task.assignedBy];
              return (
                <Card key={task.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <button className="mt-1">
                        <Circle size={24} className="text-gray-200 hover:text-yellow-300 transition-colors" />
                      </button>
                      <div>
                        <h4 className="font-bold text-slate-100">{task.title}</h4>
                        <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="blue">{task.type.replace('_', ' ')}</Badge>
                          <Badge variant={task.priority === 'HIGH' ? 'red' : task.priority === 'MEDIUM' ? 'yellow' : 'gray'}>{task.priority}</Badge>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <FileText size={12} /> {project?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="gap-2 shrink-0" disabled={loadingTask === task.id} onClick={async () => {
                      setLoadingTask(task.id);
                      try { await updateTaskStatus(task.id, 'IN_PROGRESS'); } finally { setLoadingTask(null); }
                    }}>
                      {loadingTask === task.id ? <><Loader2 size={14} className="animate-spin" /> Starting...</> : <><Clock size={14} /> Start</>}
                    </Button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700/30 flex items-center gap-2 text-[11px] text-slate-500">
                    <span>Assigned by {assignedBy?.name}</span>
                    <span>·</span>
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-500">
            <CheckCircle2 size={18} />
            Completed
            <Badge variant="green">{completedTasks.length}</Badge>
          </h3>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <div key={task.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-green-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-500 line-through">{task.title}</p>
                    <p className="text-[11px] text-slate-600">{projects.find(p => p.id === task.projectId)?.name}</p>
                  </div>
                </div>
                <Badge variant={task.status === 'SUBMITTED' ? 'yellow' : task.status === 'REVIEWED' ? 'blue' : 'green'} className="text-[9px]">
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {myTasks.length === 0 && (
        <Card className="p-12 text-center border-dashed">
          <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
            <CheckCircle2 size={32} />
          </div>
          <h4 className="font-bold text-slate-100">All caught up!</h4>
          <p className="text-sm text-slate-400 mt-1">No tasks assigned for today. Check back later.</p>
        </Card>
      )}
    </div>
  );
}
