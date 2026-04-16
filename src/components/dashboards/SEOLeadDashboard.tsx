/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FileText, 
  ExternalLink, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  MoreHorizontal,
  Send,
  MessageSquarePlus
} from 'lucide-react';
import { Card, Button, Badge } from '../ui/Common';
import { MOCK_PROJECTS, MOCK_TASKS } from '../../constants';

export function SEOLeadDashboard() {
  const leadProjects = MOCK_PROJECTS.filter(p => p.assignedTo.includes('muaz'));
  const leadTasks = MOCK_TASKS.filter(t => t.assignedTo === 'muaz');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead Console</h1>
          <p className="text-gray-500 mt-1">Control On-Page workflows and coordinate with specialists</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <HelpCircle size={18} />
            <span>Request from Client</span>
          </Button>
          <Button variant="secondary" className="gap-2">
            <Send size={18} />
            <span>Assign Off-Page</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-lg">My Active Projects</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-6">
              {leadProjects.map((project) => (
                <div key={project.id} className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <Badge variant={project.status === 'ON_PAGE' ? 'blue' : 'purple'}>{project.status}</Badge>
                  </div>
                  <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{project.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{project.clientName}</p>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.assignedTo.map((id, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white overflow-hidden ring-1 ring-gray-100">
                          <img src={`https://picsum.photos/seed/${id}/24/24`} alt={id} referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded-full">
                        <MoreHorizontal size={14} />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs">Manage</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-blue-600" />
              On-Page Tasks Board
            </h3>
            <div className="space-y-4">
              {leadTasks.map((task) => (
                <div key={task.id} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <button className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${task.status === 'COMPLETED' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 text-transparent'}`}>
                      <CheckCircle2 size={12} strokeWidth={3} />
                    </button>
                    <div>
                      <p className={`text-sm font-semibold ${task.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] text-gray-400">Project: {MOCK_PROJECTS.find(p => p.id === task.projectId)?.name}</span>
                        <Badge variant={task.priority === 'HIGH' ? 'red' : 'gray'} className="text-[8px] px-1 py-0">{task.priority}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Update Status</Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full border-2 border-dashed border-gray-100 py-4 h-auto text-gray-400 hover:bg-gray-50">
                + Add On-Page Task
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock size={18} className="text-orange-500" />
              Activity Feed
            </h3>
            <div className="space-y-6">
              {[
                { user: 'Awais', action: 'completed backlink analysis', time: '10m ago' },
                { user: 'Hassan', action: 'started GMB optimization', time: '1h ago' },
                { user: 'Ali', action: 'assigned "SaaS Growth" to you', time: '3h ago' },
              ].map((activity, i) => (
                <div key={i} className="relative flex gap-3 pb-6 last:pb-0">
                  {i < 2 && <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-100" />}
                  <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 shrink-0 z-10 overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/32/32`} alt="user" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs">
                      <span className="font-bold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-blue-600 text-white border-none">
            <h3 className="font-bold text-lg mb-2">Collaboration</h3>
            <p className="text-xs text-blue-100 mb-6">Need help with a project or have a request for the Sales team?</p>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full text-blue-700 bg-white border-none hover:bg-blue-50">
                <MessageSquarePlus size={16} className="mr-2" />
                Open Internal Chat
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
