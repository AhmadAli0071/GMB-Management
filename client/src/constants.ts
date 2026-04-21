import { User, Project, Task, InfoRequest, Activity } from './types';

export const MOCK_USERS: Record<string, User> = {
  khuzaima: { id: 'khuzaima', name: 'Khuzaima', email: 'khuzaima@crossdigi.com', role: 'SALES_MANAGER', avatar: 'https://picsum.photos/seed/khuzaima/80/80' },
  ali: { id: 'ali', name: 'Ali', email: 'ali@crossdigi.com', role: 'SEO_MANAGER', avatar: 'https://picsum.photos/seed/ali/80/80' },
  muaz: { id: 'muaz', name: 'Muaz', email: 'muaz@crossdigi.com', role: 'SEO_LEAD', avatar: 'https://picsum.photos/seed/muaz/80/80' },
  awais: { id: 'awais', name: 'Awais', email: 'awais@crossdigi.com', role: 'OFF_PAGE_SPECIALIST', avatar: 'https://picsum.photos/seed/awais/80/80' },
  intern1: { id: 'intern1', name: 'Hassan', email: 'hassan@crossdigi.com', role: 'INTERN', avatar: 'https://picsum.photos/seed/intern1/80/80' },
};

export const MOCK_PROJECTS: Project[] = [];

export const MOCK_TASKS: Task[] = [];

export const MOCK_REQUESTS: InfoRequest[] = [];

export const MOCK_ACTIVITIES: Activity[] = [];
