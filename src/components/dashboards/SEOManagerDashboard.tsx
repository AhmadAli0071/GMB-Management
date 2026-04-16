/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, UserPlus, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { Card, Button, Badge } from '../ui/Common';
import { MOCK_PROJECTS, MOCK_USERS } from '../../constants';

export function SEOManagerDashboard() {
  const verifiedProjects = MOCK_PROJECTS.filter(p => p.status === 'VERIFIED' || p.status === 'NEW');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SEO Operations Control</h1>
          <p className="text-gray-500 mt-1">Review verified projects and assign them to SEO Leads</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <BarChart3 size={18} />
            <span>Reports</span>
          </Button>
          <Button className="gap-2">
            <UserPlus size={18} />
            <span>Manage Team</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-lg">Verified Projects Pipeline</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {verifiedProjects.map((project) => (
              <div key={project.id} className="p-6 hover:bg-gray-50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{project.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">Verified on {new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Status</p>
                    <Badge variant={project.status === 'NEW' ? 'green' : 'blue'}>{project.status}</Badge>
                  </div>
                  <Button variant="primary" size="sm" className="gap-2">
                    <Activity size={14} />
                    <span>Assign to Lead</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-green-500" />
              Team Progress
            </h3>
            <div className="space-y-6">
              {[
                { name: 'Muaz (SEO Lead)', progress: 75, color: 'bg-blue-600' },
                { name: 'Awais (Specialist)', progress: 45, color: 'bg-purple-600' },
                { name: 'Hassan (Intern)', progress: 90, color: 'bg-green-600' },
              ].map((member, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{member.name}</span>
                    <span className="text-gray-400">{member.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${member.color} transition-all duration-500`}
                      style={{ width: `${member.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Project Status Distribution</h3>
            <div className="space-y-4">
              {[
                { label: 'On-Page SEO', count: 12, percentage: 40, color: 'blue' },
                { label: 'Off-Page SEO', count: 8, percentage: 30, color: 'purple' },
                { label: 'Completed', count: 10, percentage: 30, color: 'green' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>{item.label}</span>
                      <span>{item.count} projects</span>
                    </div>
                    <div className="h-1 w-full bg-gray-100 rounded-full">
                      <div className={`h-full bg-${item.color}-500 rounded-full`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
