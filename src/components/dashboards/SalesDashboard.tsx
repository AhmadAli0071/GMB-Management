/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Users, ArrowUpRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../ui/Common';
import { MOCK_PROJECTS, MOCK_REQUESTS } from '../../constants';

export function SalesDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', client: '', description: '' });

  const stats = [
    { label: 'Total Projects', value: '24', icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Projects', value: '18', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Info', value: '4', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Urgent Requests', value: '2', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would involve a state update or API call.
    // For this UI demo, we'll just simulate a successful addition.
    console.log('Creating project:', formData);
    setIsModalOpen(false);
    setFormData({ name: '', client: '', description: '' });
    alert('Project created successfully!');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage clients and onboard new SEO projects</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Add New Project</span>
        </Button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New SEO Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input 
            label="Project Name" 
            placeholder="e.g. Website Growth 2024" 
            required 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input 
            label="Client Name" 
            placeholder="e.g. Acme Corp" 
            required 
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px]"
              placeholder="Brief overview of project goals..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
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
            <h3 className="font-bold text-lg">Active Projects</h3>
            <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                  <th className="px-6 py-3">Project Name</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_PROJECTS.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-semibold text-sm">{project.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{project.clientName}</td>
                    <td className="px-6 py-4">
                      <Badge variant={project.status === 'NEW' ? 'green' : project.status === 'VERIFIED' ? 'blue' : project.status === 'WAITING_FOR_INFO' ? 'yellow' : 'gray'}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" />
              Recent Requests
            </h3>
            <div className="space-y-4">
              {MOCK_REQUESTS.map(req => (
                <div key={req.id} className="p-3 border border-red-100 bg-red-50/30 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">Urgent Access</span>
                    <span className="text-[10px] text-gray-400">2h ago</span>
                  </div>
                  <p className="text-xs font-medium text-gray-800 line-clamp-2">{req.content}</p>
                  <Button variant="danger" size="sm" className="w-full text-[10px] h-7">Resolve Now</Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Users size={18} className="text-blue-500" />
              Client Activity
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 shrink-0">
                    <img src={`https://picsum.photos/seed/client${i}/32/32`} className="w-full h-full rounded-full object-cover" alt="client" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs">
                      <span className="font-bold">Adam Smith</span> added documents to <span className="font-semibold text-blue-600">TechStyle Project</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">10 minutes ago</p>
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
