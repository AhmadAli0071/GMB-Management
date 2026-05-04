export type UserRole = 'SALES_MANAGER' | 'SEO_MANAGER' | 'SEO_LEAD' | 'OFF_PAGE_SPECIALIST' | 'DESIGNER' | 'DEVELOPER' | 'BOSS' | 'INTERN';

export type ProjectStage =
  | 'CLIENT_COMMUNICATION'
  | 'VERIFICATION'
  | 'READY_FOR_ASSIGNMENT'
  | 'ASSIGNED_TO_LEAD'
  | 'ON_PAGE_IN_PROGRESS'
  | 'OFF_PAGE_IN_PROGRESS'
  | 'REVIEW'
  | 'COMPLETED';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEWED' | 'COMPLETED';
export type TaskType = 'ON_PAGE' | 'OFF_PAGE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  businessCategory: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  businessPhone: string;
  businessEmail: string;
  businessWebsite: string;
  googleMapsLink: string;
  yelpLink: string;
  homeAdvisorLink: string;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED';
  targetKeywords: string;
  competitors: string;
  businessHours: string;
  services: string;
  offerServices: string;
  serviceAreas: string;
  currentReviews: number;
  currentRating: number;
  specialInstructions: string;
  managerComment: string;
  stage: ProjectStage;
  assignedTo: string[];
  createdBy: string;
  lastUpdate: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  status: TaskStatus;
  priority: Priority;
  type: TaskType;
  createdAt: string;
  updatedAt: string;
}

export interface InfoRequest {
  id: string;
  projectId: string;
  fromId: string;
  toRole: UserRole;
  content: string;
  response?: string;
  respondedBy?: string;
  status: 'PENDING' | 'RESPONDED';
  createdAt: string;
  respondedAt?: string;
}

export interface Activity {
  id: string;
  type: 'PROJECT_CREATED' | 'STAGE_CHANGED' | 'TASK_CREATED' | 'TASK_STATUS_CHANGED' | 'REQUEST_CREATED' | 'REQUEST_RESPONDED' | 'UPDATE_SENT';
  userId: string;
  projectId?: string;
  taskId?: string;
  content: string;
  timestamp: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  SALES_MANAGER: 'Sales Manager',
  SEO_MANAGER: 'SEO Manager',
  SEO_LEAD: 'SEO Lead',
  OFF_PAGE_SPECIALIST: 'Off-Page Specialist',
  DESIGNER: 'Designer',
  DEVELOPER: 'Developer',
  BOSS: 'Boss',
  INTERN: 'Intern',
};

export const STAGE_LABELS: Record<ProjectStage, string> = {
  CLIENT_COMMUNICATION: 'Client Communication',
  VERIFICATION: 'Verification',
  READY_FOR_ASSIGNMENT: 'Ready for Assignment',
  ASSIGNED_TO_LEAD: 'Assigned to Lead',
  ON_PAGE_IN_PROGRESS: 'On-Page SEO',
  OFF_PAGE_IN_PROGRESS: 'Off-Page SEO',
  REVIEW: 'Under Review',
  COMPLETED: 'Completed',
};

export const STAGE_COLORS: Record<ProjectStage, 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple' | 'orange'> = {
  CLIENT_COMMUNICATION: 'blue',
  VERIFICATION: 'yellow',
  READY_FOR_ASSIGNMENT: 'purple',
  ASSIGNED_TO_LEAD: 'blue',
  ON_PAGE_IN_PROGRESS: 'blue',
  OFF_PAGE_IN_PROGRESS: 'orange',
  REVIEW: 'yellow',
  COMPLETED: 'green',
};

export const ALL_STAGES: ProjectStage[] = [
  'CLIENT_COMMUNICATION',
  'VERIFICATION',
  'READY_FOR_ASSIGNMENT',
  'ASSIGNED_TO_LEAD',
  'ON_PAGE_IN_PROGRESS',
  'OFF_PAGE_IN_PROGRESS',
  'REVIEW',
  'COMPLETED',
];
