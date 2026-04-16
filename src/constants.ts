/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Project, Task, Request } from './types';

export const MOCK_USERS: Record<string, User> = {
  khuzaima: {
    id: 'khuzaima',
    name: 'Khuzaima',
    email: 'khuzaima@crossdigi.com',
    role: 'SALES_MANAGER',
    avatar: 'https://picsum.photos/seed/khuzaima/40/40',
  },
  ali: {
    id: 'ali',
    name: 'Ali',
    email: 'ali@crossdigi.com',
    role: 'SEO_MANAGER',
    avatar: 'https://picsum.photos/seed/ali/40/40',
  },
  muaz: {
    id: 'muaz',
    name: 'Muaz',
    email: 'muaz@crossdigi.com',
    role: 'SEO_LEAD',
    avatar: 'https://picsum.photos/seed/muaz/40/40',
  },
  awais: {
    id: 'awais',
    name: 'Awais',
    email: 'awais@crossdigi.com',
    role: 'OFF_PAGE_SPECIALIST',
    avatar: 'https://picsum.photos/seed/awais/40/40',
  },
  intern1: {
    id: 'intern1',
    name: 'Hassan',
    email: 'hassan@crossdigi.com',
    role: 'INTERN',
    avatar: 'https://picsum.photos/seed/intern1/40/40',
  },
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'E-commerce SEO Overhaul',
    clientName: 'TechStyle',
    status: 'ON_PAGE',
    assignedTo: ['muaz', 'awais'],
    lastUpdate: '2024-03-15T10:00:00Z',
    createdAt: '2024-03-01T09:00:00Z',
    description: 'Complete SEO optimization for the TechStyle e-commerce platform.',
  },
  {
    id: 'p2',
    name: 'Real Estate Authority',
    clientName: 'PrimeHomes',
    status: 'NEW',
    assignedTo: [],
    lastUpdate: '2024-03-16T11:00:00Z',
    createdAt: '2024-03-16T08:00:00Z',
    description: 'Local SEO and authority building for PrimeHomes real estate agency.',
  },
  {
    id: 'p3',
    name: 'SaaS Growth Strategy',
    clientName: 'SaaSFlow',
    status: 'VERIFIED',
    assignedTo: ['ali'],
    lastUpdate: '2024-03-14T15:30:00Z',
    createdAt: '2024-03-10T12:00:00Z',
    description: 'Increasing organic reach for SaaSFlow project management tool.',
  },
  {
    id: 'p4',
    name: 'Local Business SEO',
    clientName: 'The Coffee Shop',
    status: 'OFF_PAGE',
    assignedTo: ['muaz', 'awais', 'intern1'],
    lastUpdate: '2024-03-15T16:00:00Z',
    createdAt: '2024-02-28T10:00:00Z',
    description: 'Scaling local map rankings for multiple locations.',
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Keyword Research & Mapping',
    assignedTo: 'muaz',
    status: 'COMPLETED',
    priority: 'HIGH',
    type: 'ON_PAGE',
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Technical Audit Fixes',
    assignedTo: 'muaz',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    type: 'ON_PAGE',
  },
  {
    id: 't3',
    projectId: 'p1',
    title: 'Backlink Analysis',
    assignedTo: 'awais',
    status: 'TODO',
    priority: 'MEDIUM',
    type: 'OFF_PAGE',
  },
  {
    id: 't4',
    projectId: 'p4',
    title: 'GMB Post Creation',
    assignedTo: 'intern1',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    type: 'OFF_PAGE',
  },
];

export const MOCK_REQUESTS: Request[] = [
  {
    id: 'r1',
    fromId: 'muaz',
    toRole: 'SALES_MANAGER',
    projectId: 'p1',
    content: 'Need access to Google Search Console to proceed with audit.',
    status: 'PENDING',
    createdAt: '2024-03-15T14:00:00Z',
  },
];
