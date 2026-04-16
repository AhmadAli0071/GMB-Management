/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  BarChart, 
  UserPlus,
  Zap
} from 'lucide-react';
import { Card, Button, Badge } from '../ui/Common';
import { MOCK_TASKS, MOCK_PROJECTS } from '../../constants';

export function OffPageDashboard() {
  const offPageTasks = MOCK_TASKS.filter(t => t.assignedTo === 'awais' || t.type === 'OFF_PAGE');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Off-Page Ops</h1>
          <p className="text-gray-500 mt-1">Manage backlinks, authority building, and intern task assignment</p>
        </div>
        <Button className="gap-2">
          <UserPlus size={18} />
          <span>Assign to Intern</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Backlinks Built', value: '142', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Links', value: '18', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Domain Authority', value: '42', icon: BarChart, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'My Interns', value: '3', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, idx) => (
          <Card key={idx} className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
            </div>
            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-lg">Off-Page Task List</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-xs">All</Button>
              <Button variant="ghost" size="sm" className="text-xs">Pending</Button>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {offPageTasks.map((task) => (
              <div key={task.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${task.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                    <ExternalLink size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{task.title}</h4>
                    <p className="text-xs text-gray-500 font-medium">{MOCK_PROJECTS.find(p => p.id === task.projectId)?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right flex flex-col items-end">
                    <Badge variant={task.status === 'COMPLETED' ? 'green' : 'yellow'}>{task.status.replace('_', ' ')}</Badge>
                    <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">{task.priority} Priority</span>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-lg mb-6">Intern Task Tracking</h3>
          <div className="space-y-6 text-sm">
            {[
              { name: 'Hassan', tasks: 4, complete: 3, avatar: 'intern1' },
              { name: 'Zaid', tasks: 6, complete: 2, avatar: 'intern2' },
              { name: 'Sara', tasks: 3, complete: 3, avatar: 'intern3' },
            ].map((intern, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={`https://picsum.photos/seed/${intern.avatar}/24/24`} className="w-6 h-6 rounded-full" alt="intern" referrerPolicy="no-referrer" />
                    <span className="font-bold">{intern.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{intern.complete}/{intern.tasks} Done</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all" 
                    style={{ width: `${(intern.complete / intern.tasks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Link</h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full text-left justify-start font-normal h-10 px-4">
                <CheckCircle2 size={16} className="mr-3 text-green-500" />
                Mark all completed as "Done"
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
