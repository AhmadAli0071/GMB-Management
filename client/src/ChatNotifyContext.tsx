import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useApp } from './AppContext';

interface ChatNotifyContextType {
  unreadCounts: Record<string, Record<string, number>>;
  lastActivity: Record<string, number>;
  clearUnread: (projectId: string, userId: string) => void;
  clearActivity: (projectId: string) => void;
  activeChatUserId: string | null;
  setActiveChatUserId: (userId: string | null) => void;
}

const ChatNotifyContext = createContext<ChatNotifyContextType | null>(null);

export function useChatNotify() {
  const ctx = useContext(ChatNotifyContext);
  if (!ctx) throw new Error('useChatNotify must be used within ChatNotifyProvider');
  return ctx;
}

export function ChatNotifyProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, users } = useApp();
  const { onDMNotification, offDMNotification } = useSocket();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, Record<string, number>>>({});
  const [lastActivity, setLastActivity] = useState<Record<string, number>>({});
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);

  const handleDMNotification = useCallback((data: any) => {
    const projectId = data.projectId || '';
    // Update last activity for this project (for both sender and recipient)
    setLastActivity(prev => ({
      ...prev,
      [projectId]: Date.now(),
    }));

    if (data.senderId === currentUser.id) {
      // For sender's own message, we don't update unread counts or show browser notification
      return;
    }

    const senderId = data.senderId;

    // Update unread counts for the recipient
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
        : data.type === 'VOICE' ? '🎤 Voice message' : '📎 File';
      new Notification(`${senderName} sent you a message`, {
        body: preview,
        tag: `dm-notify-${data._id}`,
      } as NotificationOptions);
    }
  }, [currentUser.id, users]);

  useEffect(() => {
    onDMNotification(handleDMNotification);
    return () => { offDMNotification(handleDMNotification); };
  }, [handleDMNotification, onDMNotification, offDMNotification]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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
    }}>
      {children}
    </ChatNotifyContext.Provider>
  );
}
