import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './SocketContext';
import { useApp } from './AppContext';

let audioCtx: AudioContext | null = null;

function playNotificationSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) { /* ignore audio errors */ }
}

interface ChatNotifyContextType {
  unreadCounts: Record<string, Record<string, number>>;
  lastActivity: Record<string, number>;
  clearUnread: (projectId: string, userId: string) => void;
  clearActivity: (projectId: string) => void;
  activeChatUserId: string | null;
  setActiveChatUserId: (userId: string | null) => void;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<NotificationPermission>;
}

const ChatNotifyContext = createContext<ChatNotifyContextType | null>(null);

export function useChatNotify() {
  const ctx = useContext(ChatNotifyContext);
  if (!ctx) throw new Error('useChatNotify must be used within ChatNotifyProvider');
  return ctx;
}

function getActivityMessage(type: string, data: any, users: any, projects: any): string {
  const userName = data.userName || (users[data.fromUserId]?.name) || 'Someone';
  const project = projects.find((p: any) => p.id === data.projectId);
  const projectName = project?.name || 'a project';

  switch (type) {
    case 'REPORT_SUBMITTED':
      return `${userName} submitted a report on ${projectName}`;
    case 'REPORT_REVIEWED':
      const status = data.status === 'APPROVED' ? 'approved' : 'requested changes for';
      return `${userName} ${status} a report on ${projectName}`;
    case 'SECTION_REVIEWED':
      const secStatus = data.sectionStatus === 'APPROVED' ? 'approved' : 'requested changes for';
      const sectionName = data.section === 'onPage' ? 'On-Page' : 'Off-Page';
      return `${userName} ${secStatus} ${sectionName} section on ${projectName}`;
    case 'ASSIGNMENT_CREATED':
      return `${userName} assigned you a task: ${data.title || 'New assignment'}`;
    case 'WORK_SUBMITTED':
      return `${userName} submitted work for review on ${projectName}`;
    case 'WORK_REVIEWED':
      const wkStatus = data.status === 'APPROVED' ? 'approved' : 'requested changes for';
      return `${userName} ${wkStatus} work on ${projectName}`;
    case 'PROJECT_ASSIGNED':
      return `${userName} assigned you to project: ${projectName}`;
    default:
      return `${userName} performed an action on ${projectName}`;
  }
}

export function ChatNotifyProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, users, projects } = useApp();
  const { onDMNotification, offDMNotification, onActivityNotification, offActivityNotification } = useSocket();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, Record<string, number>>>({});
  const [lastActivity, setLastActivity] = useState<Record<string, number>>({});
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) return 'denied';
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission;
  }, []);

  const showDesktopNotification = useCallback((title: string, body: string, tag?: string, projectId?: string) => {
    if (notificationPermission !== 'granted') return;
    try {
      const notification = new Notification(title, {
        body,
        tag: tag || `notify-${Date.now()}`,
        icon: '/favicon.ico',
        requireInteraction: false,
      } as NotificationOptions);

      notification.onclick = () => {
        window.focus();
        if (projectId) {
          // Could navigate to project if router available
          console.log('Navigate to project:', projectId);
        }
      };
    } catch (err) {
      console.error('Failed to show notification:', err);
    }
  }, [notificationPermission]);

  const handleDMNotification = useCallback((data: any) => {
    const projectId = data.projectId || '';
    setLastActivity(prev => ({
      ...prev,
      [projectId]: Date.now(),
    }));

    if (data.senderId === currentUser.id) return;

    const senderId = data.senderId;
    setUnreadCounts(prev => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] || {}),
        [senderId]: ((prev[projectId] || {})[senderId] || 0) + 1,
      },
    }));

    if ('Notification' in window && Notification.permission === 'granted') {
      const senderName = (users as any)[data.senderId]?.name || 'Someone';
      const preview = data.type === 'TEXT'
        ? (data.text?.substring(0, 80) || 'New message')
        : data.type === 'VOICE' ? 'Voice message' : 'File';
      new Notification(`${senderName} sent you a message`, {
        body: preview,
        tag: `dm-notify-${data._id}`,
      } as NotificationOptions);
      playNotificationSound();
    }
  }, [currentUser.id, users, notificationPermission]);

  const handleActivityNotification = useCallback((data: any) => {
    const { type, projectId, userId } = data;

    setLastActivity(prev => ({
      ...prev,
      [projectId || '']: Date.now(),
    }));

    if (userId === currentUser?.id) return;

    showDesktopNotification(
      getActivityMessage(type, data, users, projects),
      `Project: ${(projects.find((p: any) => p.id === projectId)?.name) || 'N/A'}`,
      `activity-${type}-${projectId}`,
      projectId
    );
    playNotificationSound();
  }, [currentUser?.id, users, projects, showDesktopNotification]);

  useEffect(() => {
    onDMNotification(handleDMNotification);
    return () => { offDMNotification(handleDMNotification); };
  }, [handleDMNotification, onDMNotification, offDMNotification]);

  useEffect(() => {
    onActivityNotification(handleActivityNotification);
    return () => { offActivityNotification(handleActivityNotification); };
  }, [handleActivityNotification, onActivityNotification, offActivityNotification]);

  // Auto-request permission only on explicit user gesture (handled by UI button)
  // Removed auto-request to comply with browser policies

  const clearUnread = useCallback((projectId: string, userId: string) => {
    setUnreadCounts(prev => {
      const projectMap = prev[projectId];
      if (!projectMap) return prev;
      const next = { ...prev };
      next[projectId] = { ...projectMap };
      delete next[projectId][userId];
      if (Object.keys(next[projectId]).length === 0) delete next[projectId];
      return next;
    });
  }, []);

  const clearActivity = useCallback((projectId: string) => {
    setLastActivity(prev => {
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
  }, []);

  return (
    <ChatNotifyContext.Provider value={{
      unreadCounts,
      lastActivity,
      clearUnread,
      clearActivity,
      activeChatUserId,
      setActiveChatUserId,
      notificationPermission,
      requestNotificationPermission,
    }}>
      {children}
    </ChatNotifyContext.Provider>
  );
}
