/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'SALES_MANAGER' | 'SEO_MANAGER' | 'SEO_LEAD' | 'OFF_PAGE_SPECIALIST' | 'INTERN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type ProjectStatus = 'NEW' | 'VERIFIED' | 'WAITING_FOR_INFO' | 'ASSIGNED' | 'ON_PAGE' | 'OFF_PAGE' | 'COMPLETED';

export interface Project {
  id: string;
  name: string;
  clientName: string;
  status: ProjectStatus;
  assignedTo: string[]; // User IDs
  lastUpdate: string;
  createdAt: string;
  description: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  assignedTo: string; // User ID
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  type: 'ON_PAGE' | 'OFF_PAGE';
}

export interface Request {
  id: string;
  fromId: string;
  toRole: UserRole;
  projectId: string;
  content: string;
  status: 'PENDING' | 'RESOLVED';
  createdAt: string;
}
