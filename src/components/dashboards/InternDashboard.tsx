/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  FileText, 
  Info,
  Calendar
} from 'lucide-react';
import { Card, Button, Badge } from '../ui/Common';
import { MOCK_TASKS, MOCK_PROJECTS } from '../../constants';

export function InternDashboard() {
  const myTasks = MOCK_TASKS.filter(t => t.assignedTo === 'intern1');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, Hassan!</h1>
          <p className="text-gray-500 mt-1">You have {myTasks.length} tasks to focus on today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Growth Points</p>
            <p className="text-lg font-bold text-blue-600">450 XP</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
            H
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-600">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed</p>
            <h3 className="text-2xl font-bold">12</h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-yellow-600">
          <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">In Progress</p>
            <h3 className="text-2xl font-bold">3</h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-purple-600">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Days Active</p>
            <h3 className="text-2xl font-bold">45</h3>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-3">
          My Tasks
          <Badge variant="blue" className="px-2">{myTasks.length}</Badge>
        </h3>
        
        {myTasks.length > 0 ? (
          <div className="space-y-4">
            {myTasks.map((task) => (
              <Card key={task.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <button className="mt-1 flex-shrink-0">
                      <Circle size={24} className="text-gray-200 hover:text-blue-200 transition-colors" />
                    </button>
                    <div>
                      <h4 className="font-bold text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <FileText size={14} />
                        {MOCK_PROJECTS.find(p => p.id === task.projectId)?.name}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="blue">{task.type}</Badge>
                        <Badge variant="gray">High Priority</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 shrink-0">
                    <CheckCircle2 size={16} />
                    <span>Complete</span>
                  </Button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                  <div className="flex items-center gap-2">
                    <Info size={12} />
                    <span>Assigned by Awais</span>
                  </div>
                  <span>Due in 2 days</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="font-bold text-gray-900">All caught up!</h4>
            <p className="text-sm text-gray-500 mt-1">No tasks assigned for today. Time to learn something new!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
