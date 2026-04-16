/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  User, 
  Users,
  FileText, 
  CheckCircle2, 
  Activity, 
  MessageSquare,
  Search,
  Filter,
  MoreVertical,
  Plus
} from 'lucide-react';
import { Card, Button, Badge, Input } from './ui/Common';
import { MOCK_PROJECTS, MOCK_TASKS, MOCK_USERS } from '../constants';
import { Project } from '../types';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetailPage({ projectId, onBack }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const project = MOCK_PROJECTS.find(p => p.id === projectId) || MOCK_PROJECTS[0];
  const projectTasks = MOCK_TASKS.filter(t => t.projectId === project.id);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'on-page', label: 'On-Page Tasks', icon: CheckCircle2 },
    { id: 'off-page', label: 'Off-Page Tasks', icon: Activity },
    { id: 'timeline', label: 'Activity Timeline', icon: Clock },
  ];

  const steps = [
    { name: 'New', status: 'completed' },
    { name: 'Verified', status: 'completed' },
    { name: 'Assigned', status: 'current' },
    { name: 'On-Page', status: 'upcoming' },
    { name: 'Off-Page', status: 'upcoming' },
    { name: 'Completed', status: 'upcoming' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{project.name}</h1>
            <Badge variant="blue" className="mt-1">{project.status}</Badge>
          </div>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <User size={16} />
            Client: <span className="text-blue-600">{project.clientName}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <MessageSquare size={18} />
            <span>Comments</span>
          </Button>
          <Button className="gap-2">
            <CheckCircle2 size={18} />
            <span>Mark as Completed</span>
          </Button>
        </div>
      </div>

      {/* Progress Tracker */}
      <Card className="p-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
          {steps.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-3 bg-white px-4">
              <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all ${
                step.status === 'completed' ? 'bg-blue-600 border-blue-100 text-white' :
                step.status === 'current' ? 'bg-white border-blue-600 text-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.2)]' :
                'bg-white border-gray-100 text-gray-300'
              }`}>
                {step.status === 'completed' ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <span className={`text-xs font-bold tracking-wider uppercase ${
                step.status === 'upcoming' ? 'text-gray-300' : 'text-gray-900'
              }`}>{step.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-8 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-4 border-b-2 font-semibold text-sm transition-all whitespace-nowrap px-1 ${
              activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Project Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{project.description}</p>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-600" />
                    Key Dates
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Project Started</span>
                      <span className="font-semibold">{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Last Updated</span>
                      <span className="font-semibold">{new Date(project.lastUpdate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Estimated Completion</span>
                      <span className="font-semibold">Dec 15, 2024</span>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Users size={18} className="text-blue-600" />
                    Team Members
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {project.assignedTo.map(id => {
                      const user = MOCK_USERS[id];
                      return (
                        <div key={id} className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-gray-50 border border-gray-100">
                          <img src={user?.avatar} className="w-8 h-8 rounded-full" alt={user?.name} referrerPolicy="no-referrer" />
                          <div className="leading-tight">
                            <p className="text-xs font-bold">{user?.name}</p>
                            <p className="text-[10px] text-gray-400 capitalize">{user?.role.toLowerCase().replace('_', ' ')}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>

            <Card className="p-6 h-fit sticky top-24">
              <h3 className="font-bold text-lg mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3 text-sm h-11 border-gray-100 hover:bg-gray-50">
                  <FileText size={16} className="text-blue-600" />
                  Technical Audit File
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 text-sm h-11 border-gray-100 hover:bg-gray-50">
                  <Activity size={16} className="text-purple-600" />
                  Backlink Report
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 text-sm h-11 border-gray-100 hover:bg-gray-50">
                  <CheckCircle2 size={16} className="text-green-600" />
                  Monthly Performance
                </Button>
              </div>
              <div className="mt-8">
                <Input label="Add Note" placeholder="Quick internal note..." />
                <Button variant="secondary" size="sm" className="mt-2 w-full">Save Note</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Simplified Task Lists for other tabs */}
        {(activeTab === 'on-page' || activeTab === 'off-page') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search tasks..." className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 border-none shadow-sm" />
                </div>
                <Button variant="ghost" className="gap-2 text-gray-500">
                  <Filter size={16} />
                  <span>Filter</span>
                </Button>
              </div>
              <Button size="sm" className="gap-2">
                <Plus size={16} />
                <span>Add Task</span>
              </Button>
            </div>
            
            <Card className="overflow-hidden">
              <div className="divide-y divide-gray-50">
                {projectTasks.filter(t => t.type === (activeTab === 'on-page' ? 'ON_PAGE' : 'OFF_PAGE')).map(task => (
                  <div key={task.id} className="p-5 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.status === 'COMPLETED' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 hover:border-blue-300'}`}>
                        {task.status === 'COMPLETED' ? <CheckCircle2 size={14} /> : null}
                      </button>
                      <div>
                        <p className={`font-bold text-sm ${task.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant={task.status === 'COMPLETED' ? 'green' : task.status === 'IN_PROGRESS' ? 'blue' : 'gray'}>{task.status}</Badge>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <User size={10} />
                            Assigned to: {MOCK_USERS[task.assignedTo]?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded-full">
                      <MoreVertical size={16} className="text-gray-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="max-w-2xl mx-auto py-10">
            <div className="relative space-y-12">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100 z-0" />
              {[
                { user: 'Muaz', action: 'completed keyword research', desc: 'Added 50+ high-intent keywords for mapping.', time: 'Mar 15, 10:30 AM' },
                { user: 'Ali', action: 'assigned project to Muaz', desc: 'Official kickoff of the On-page phase.', time: 'Mar 12, 02:15 PM' },
                { user: 'Khuzaima', action: 'onboarded client', desc: 'Received initial audit approval and payment.', time: 'Mar 01, 11:00 AM' },
              ].map((update, i) => (
                <div key={i} className="relative z-10 flex gap-6 pl-12 group">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-blue-50 border-2 border-white ring-4 ring-white flex items-center justify-center text-blue-600 transition-all group-hover:scale-110">
                    <Activity size={14} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{update.user}</span>
                      <span className="text-gray-500 text-sm">{update.action}</span>
                    </div>
                    <p className="text-sm text-gray-400 italic mb-2">"{update.desc}"</p>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-300">{update.time}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="font-bold text-sm mb-4">Post an Update</h4>
              <textarea placeholder="What happened today?" className="w-full p-4 text-sm bg-white border border-gray-100 rounded-xl min-h-[100px] mb-4 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
              <Button size="sm" className="w-full">Post to Timeline</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
