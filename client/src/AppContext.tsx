import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  User, Project, Task, InfoRequest, Activity,
  ProjectStage, TaskStatus, Priority, TaskType,
} from './types';
import { api } from './api';

interface AppContextType {
  currentUser: User;
  users: Record<string, User>;
  projects: Project[];
  tasks: Task[];
  requests: InfoRequest[];
  activities: Activity[];
  loading: boolean;

  createProject: (data: any) => Promise<void>;
  updateProject: (projectId: string, data: any) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  updateProjectStage: (projectId: string, stage: ProjectStage) => Promise<void>;
  assignToLead: (projectId: string, leadId: string, comment?: string) => Promise<void>;

  createTask: (data: { projectId: string; title: string; description: string; assignedTo: string; priority: Priority; type: TaskType }) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;

  createInfoRequest: (projectId: string, content: string) => Promise<void>;
  respondToRequest: (requestId: string, response: string) => Promise<void>;

  sendUpdate: (projectId: string, content: string) => Promise<void>;
  assignments: any[];
  workSubmissions: any[];
  createAssignment: (formData: FormData) => Promise<void>;
  updateAssignmentStatus: (id: string, status: string) => Promise<void>;
  submitWork: (formData: FormData) => Promise<void>;
  reviewWork: (id: string, status: string, reviewComment?: string) => Promise<void>;
  updateWork: (id: string, formData: FormData) => Promise<void>;
  deleteWorkFile: (id: string, filename: string) => Promise<void>;
  projectUpdates: any[];
  submitProjectUpdate: (formData: FormData) => Promise<void>;
  reviewProjectUpdate: (id: string, status: string, reviewComment?: string) => Promise<void>;
  reviewSection: (id: string, section: string, status: string, comment?: string) => Promise<void>;
  leadWork: any[];
  createLeadWork: (formData: FormData) => Promise<void>;
  updateLeadWork: (id: string, formData: FormData) => Promise<void>;
  deleteLeadWorkFile: (id: string, filename: string) => Promise<void>;
  deleteLeadWork: (id: string) => Promise<void>;
  onLogout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ currentUser, onLogout, children }: { currentUser: User; onLogout: () => void; children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [requests, setRequests] = useState<InfoRequest[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [workSubmissions, setWorkSubmissions] = useState<any[]>([]);
  const [projectUpdates, setProjectUpdates] = useState<any[]>([]);
  const [leadWork, setLeadWork] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        api.getProjects(),
        api.getTasks(),
        api.getRequests(),
        api.getActivities(),
        api.getUsers(),
        api.getAssignments(),
        api.getWorkSubmissions(),
        api.getProjectUpdates(),
        api.getLeadWork(),
      ]);
      if (results[0].status === 'fulfilled') setProjects(results[0].value);
      if (results[1].status === 'fulfilled') setTasks(results[1].value);
      if (results[2].status === 'fulfilled') setRequests(results[2].value);
      if (results[3].status === 'fulfilled') setActivities(results[3].value);
      if (results[4].status === 'fulfilled') setUsers(results[4].value);
      if (results[5].status === 'fulfilled') setAssignments(results[5].value);
      if (results[6].status === 'fulfilled') setWorkSubmissions(results[6].value);
      if (results[7].status === 'fulfilled') setProjectUpdates(results[7].value);
      if (results[8].status === 'fulfilled') setLeadWork(results[8].value);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createProject = useCallback(async (data: any) => {
    await api.createProject(data);
    await refreshData();
  }, [refreshData]);

  const updateProject = useCallback(async (projectId: string, data: any) => {
    await api.updateProject(projectId, data);
    await refreshData();
  }, [refreshData]);

  const deleteProject = useCallback(async (projectId: string) => {
    await api.deleteProject(projectId);
    await refreshData();
  }, [refreshData]);

  const updateProjectStage = useCallback(async (projectId: string, stage: ProjectStage) => {
    await api.updateProjectStage(projectId, stage);
    await refreshData();
  }, [refreshData]);

  const assignToLead = useCallback(async (projectId: string, leadId: string, comment?: string) => {
    await api.assignToLead(projectId, leadId, comment);
    await refreshData();
  }, [refreshData]);

  const createTask = useCallback(async (data: { projectId: string; title: string; description: string; assignedTo: string; priority: Priority; type: TaskType }) => {
    await api.createTask(data);
    await refreshData();
  }, [refreshData]);

  const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    await api.updateTaskStatus(taskId, status);
    await refreshData();
  }, [refreshData]);

  const createInfoRequest = useCallback(async (projectId: string, content: string) => {
    await api.createRequest({ projectId, content });
    await refreshData();
  }, [refreshData]);

  const respondToRequest = useCallback(async (requestId: string, response: string) => {
    await api.respondToRequest(requestId, response);
    await refreshData();
  }, [refreshData]);

  const sendUpdate = useCallback(async (projectId: string, content: string) => {
    await api.sendUpdate(projectId, content);
    await refreshData();
  }, [refreshData]);

  const createAssignment = useCallback(async (formData: FormData) => {
    await api.createAssignment(formData);
    await refreshData();
  }, [refreshData]);

  const updateAssignmentStatus = useCallback(async (id: string, status: string) => {
    await api.updateAssignmentStatus(id, status);
    await refreshData();
  }, [refreshData]);

  const submitWork = useCallback(async (formData: FormData) => {
    await api.submitWork(formData);
    await refreshData();
  }, [refreshData]);

  const reviewWork = useCallback(async (id: string, status: string, reviewComment?: string) => {
    await api.reviewWork(id, status, reviewComment);
    await refreshData();
  }, [refreshData]);

  const updateWork = useCallback(async (id: string, formData: FormData) => {
    await api.updateWork(id, formData);
    await refreshData();
  }, [refreshData]);

  const deleteWorkFile = useCallback(async (id: string, filename: string) => {
    await api.deleteWorkFile(id, filename);
    await refreshData();
  }, [refreshData]);

  const submitProjectUpdate = useCallback(async (formData: FormData) => {
    await api.submitProjectUpdate(formData);
    await refreshData();
  }, [refreshData]);

  const reviewProjectUpdate = useCallback(async (id: string, status: string, reviewComment?: string) => {
    await api.reviewProjectUpdate(id, status, reviewComment);
    await refreshData();
  }, [refreshData]);

  const reviewSection = useCallback(async (id: string, section: string, status: string, comment?: string) => {
    await api.reviewSection(id, section, status, comment);
    await refreshData();
  }, [refreshData]);

  const createLeadWork = useCallback(async (formData: FormData) => {
    await api.createLeadWork(formData);
    await refreshData();
  }, [refreshData]);

  const updateLeadWork = useCallback(async (id: string, formData: FormData) => {
    await api.updateLeadWork(id, formData);
    await refreshData();
  }, [refreshData]);

  const deleteLeadWorkFile = useCallback(async (id: string, filename: string) => {
    await api.deleteLeadWorkFile(id, filename);
    await refreshData();
  }, [refreshData]);

  const deleteLeadWork = useCallback(async (id: string) => {
    await api.deleteLeadWork(id);
    await refreshData();
  }, [refreshData]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      projects,
      tasks,
      requests,
      activities,
      loading,
      createProject,
      updateProject,
      deleteProject,
      updateProjectStage,
      assignToLead,
      createTask,
      updateTaskStatus,
      createInfoRequest,
      respondToRequest,
      sendUpdate,
      assignments,
      workSubmissions,
      createAssignment,
      updateAssignmentStatus,
      submitWork,
      reviewWork,
      updateWork,
      deleteWorkFile,
      projectUpdates,
      submitProjectUpdate,
      reviewProjectUpdate,
      reviewSection,
      leadWork,
      createLeadWork,
      updateLeadWork,
      deleteLeadWorkFile,
      deleteLeadWork,
      onLogout,
    }}>
      {children}
    </AppContext.Provider>
  );
}
