import React, { useState } from 'react';
import { Plus, MoreHorizontal, Clock, MessageSquare, Grip } from 'lucide-react';
import { Card, Badge, Button, Modal, Input, Textarea, Select } from './ui/Common';
import { useApp } from '../AppContext';
import { TaskStatus, User } from '../types';

interface KanbanColumnProps {
  title: string;
  color: string;
  children: React.ReactNode;
}

const KanbanColumn: React.FC<{ title: string; color: string; children: React.ReactNode }> = ({ title, color, children }) => {
  const count = React.Children.count(children);
  return (
    <div className="flex-1 min-w-[300px] flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <h3 className="font-bold text-slate-100">{title}</h3>
          <span className="bg-gray-200 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{count}</span>
        </div>
        <button className="text-slate-500 hover:text-slate-400">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pb-6 pr-2 custom-scrollbar">
        {children}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { currentUser, tasks, projects, users, updateTaskStatus, createTask } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ projectId: '', title: '', description: '', assignedTo: '', priority: 'MEDIUM' as const, type: 'ON_PAGE' as const });

  const visibleTasks = tasks.filter(t => {
    if (currentUser.role === 'INTERN') return t.assignedTo === currentUser.id;
    if (currentUser.role === 'OFF_PAGE_SPECIALIST') return t.assignedTo === currentUser.id || t.assignedBy === currentUser.id;
    if (currentUser.role === 'SEO_LEAD') return t.assignedTo === currentUser.id || t.assignedBy === currentUser.id;
    return true;
  });

  const columns: { title: string; status: TaskStatus; color: string }[] = [
    { title: 'To Do', status: 'TODO', color: 'bg-gray-400' },
    { title: 'In Progress', status: 'IN_PROGRESS', color: 'bg-blue-400' },
    { title: 'Submitted', status: 'SUBMITTED', color: 'bg-yellow-400' },
    { title: 'Completed', status: 'COMPLETED', color: 'bg-green-400' },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTask(form);
    setForm({ projectId: '', title: '', description: '', assignedTo: '', priority: 'MEDIUM', type: 'ON_PAGE' });
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Showing {visibleTasks.length} tasks relevant to your role</p>
        <Button size="sm" className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          <span>Add Task</span>
        </Button>
      </div>

      <div className="flex gap-6 h-[calc(100vh-240px)] overflow-x-auto pb-4 items-start">
        {columns.map(col => (
          <KanbanColumn key={col.status} title={col.title} color={col.color}>
            {visibleTasks.filter(t => t.status === col.status).map(task => {
              const project = projects.find(p => p.id === task.projectId);
              const user = users[task.assignedTo];
              return (
                <Card key={task.id} className="p-4 hover:shadow-md cursor-pointer group border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={task.type === 'ON_PAGE' ? 'blue' : 'orange'} className="px-1.5 py-0 text-[9px]">
                      {task.type.replace('_', ' ')}
                    </Badge>
                    <button className="text-slate-600 opacity-0 group-hover:opacity-100 p-1">
                      <Grip size={14} />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm mb-1 leading-snug group-hover:text-blue-400 transition-colors">{task.title}</h4>
                  <p className="text-[10px] text-slate-500 font-medium mb-3">{project?.name}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={user?.avatar} className="w-5 h-5 rounded-full ring-2 ring-slate-800 border border-slate-700/50" referrerPolicy="no-referrer" />
                      <span className="text-[10px] font-bold text-slate-400">{user?.name}</span>
                    </div>
                    <div className="flex gap-1">
                      {task.status === 'TODO' && (
                        <button onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')} className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold hover:bg-blue-100">Start</button>
                      )}
                      {task.status === 'IN_PROGRESS' && currentUser.id === task.assignedTo && (
                        <button onClick={() => updateTaskStatus(task.id, 'SUBMITTED')} className="text-[9px] bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full font-bold hover:bg-yellow-100">Submit</button>
                      )}
                      {task.status === 'SUBMITTED' && currentUser.id === task.assignedBy && (
                        <button onClick={() => updateTaskStatus(task.id, 'COMPLETED')} className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold hover:bg-green-100">Approve</button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </KanbanColumn>
        ))}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Project" required value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
            <option value="">Select project...</option>
            {projects.filter(p => p.stage !== 'COMPLETED').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Input label="Task Title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Keyword Research" />
          <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Task details..." />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}>
              <option value="ON_PAGE">On-Page</option>
              <option value="OFF_PAGE">Off-Page</option>
            </Select>
            <Select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as any })}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Select>
          </div>
          <Select label="Assign To" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
            <option value="">Select person...</option>
            {(Object.values(users) as User[]).map(u => <option key={u.id} value={u.id}>{u.name} ({u.role.replace('_', ' ')})</option>)}
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
