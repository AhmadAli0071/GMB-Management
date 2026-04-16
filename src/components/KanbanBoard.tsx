/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  Tag, 
  MessageSquare,
  Grab
} from 'lucide-react';
import { Card, Badge, Button } from './ui/Common';
import { MOCK_TASKS, MOCK_PROJECTS, MOCK_USERS } from '../constants';
import { TaskStatus } from '../types';

interface KanbanColumnProps {
  title: string;
  count: number;
  status: TaskStatus;
  children: React.ReactNode;
  key?: React.Key;
}

function KanbanColumn({ title, count, children }: KanbanColumnProps) {
  return (
    <div className="flex-1 min-w-[300px] flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto pb-6 pr-2 custom-scrollbar">
        {children}
        <Button variant="ghost" className="w-full border-2 border-dashed border-gray-100 py-4 h-auto text-gray-400 hover:bg-gray-50 flex-col gap-1">
          <Plus size={18} />
          <span className="text-xs">Add Task</span>
        </Button>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const columns: { title: string; status: TaskStatus }[] = [
    { title: 'To Do', status: 'TODO' },
    { title: 'In Progress', status: 'IN_PROGRESS' },
    { title: 'Completed', status: 'COMPLETED' },
  ];

  return (
    <div className="flex gap-8 h-[calc(100vh-200px)] overflow-x-auto pb-4 items-start">
      {columns.map(col => {
        const tasks = MOCK_TASKS.filter(t => t.status === col.status);
        return (
          <KanbanColumn key={col.status} title={col.title} count={tasks.length} status={col.status}>
            {tasks.map(task => {
              const project = MOCK_PROJECTS.find(p => p.id === task.projectId);
              const user = MOCK_USERS[task.assignedTo];
              
              return (
                <Card key={task.id} className="p-4 hover:shadow-md cursor-grab active:cursor-grabbing group border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={task.type === 'ON_PAGE' ? 'blue' : 'purple'} className="px-1.5 py-0 text-[9px]">
                      {task.type}
                    </Badge>
                    <button className="text-gray-300 opacity-0 group-hover:opacity-100 p-1">
                      <Grab size={14} />
                    </button>
                  </div>
                  
                  <h4 className="font-bold text-gray-900 text-sm mb-1 leading-snug group-hover:text-blue-600 transition-colors">
                    {task.title}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-medium mb-4">{project?.name}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        <img src={user?.avatar} className="w-5 h-5 rounded-full ring-2 ring-white border border-gray-100" alt={user?.name} referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">{user?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        <span className="text-[10px]">2</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span className="text-[10px]">2d</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </KanbanColumn>
        );
      })}
    </div>
  );
}
