import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
  sendMessage: (data: any) => void;
  onMessage: (callback: (data: any) => void) => void;
  offMessage: (callback: (data: any) => void) => void;
  onMessageEdited: (callback: (data: any) => void) => void;
  offMessageEdited: (callback: (data: any) => void) => void;
  onMessageDeleted: (callback: (data: any) => void) => void;
  offMessageDeleted: (callback: (data: any) => void) => void;
  onChatCleared: (callback: (data: any) => void) => void;
  offChatCleared: (callback: (data: any) => void) => void;
  joinDM: (conversationId: string) => void;
  leaveDM: (conversationId: string) => void;
  onDMMessage: (callback: (data: any) => void) => void;
  offDMMessage: (callback: (data: any) => void) => void;
  onDMMessageEdited: (callback: (data: any) => void) => void;
  offDMMessageEdited: (callback: (data: any) => void) => void;
  onDMMessageDeleted: (callback: (data: any) => void) => void;
  offDMMessageDeleted: (callback: (data: any) => void) => void;
  onDMChatCleared: (callback: (data: any) => void) => void;
  offDMChatCleared: (callback: (data: any) => void) => void;
  onDMNotification: (callback: (data: any) => void) => void;
  offDMNotification: (callback: (data: any) => void) => void;
  onDataChanged: (callback: (data: any) => void) => void;
  offDataChanged: (callback: (data: any) => void) => void;
  onActivityNotification: (callback: (data: any) => void) => void;
  offActivityNotification: (callback: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io({
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));
    newSocket.on('connect_error', () => setConnected(false));

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinProject = useCallback((projectId: string) => {
    socket?.emit('join-project', projectId);
  }, [socket]);

  const leaveProject = useCallback((projectId: string) => {
    socket?.emit('leave-project', projectId);
  }, [socket]);

  const sendMessage = useCallback((data: any) => {
    socket?.emit('send-message', data);
  }, [socket]);

  const onMessage = useCallback((callback: (data: any) => void) => {
    socket?.on('new-message', callback);
  }, [socket]);

  const offMessage = useCallback((callback: (data: any) => void) => {
    socket?.off('new-message', callback);
  }, [socket]);

  const onMessageEdited = useCallback((callback: (data: any) => void) => {
    socket?.on('message-edited', callback);
  }, [socket]);

  const offMessageEdited = useCallback((callback: (data: any) => void) => {
    socket?.off('message-edited', callback);
  }, [socket]);

  const onMessageDeleted = useCallback((callback: (data: any) => void) => {
    socket?.on('message-deleted', callback);
  }, [socket]);

  const offMessageDeleted = useCallback((callback: (data: any) => void) => {
    socket?.off('message-deleted', callback);
  }, [socket]);

  const onChatCleared = useCallback((callback: (data: any) => void) => {
    socket?.on('chat-cleared', callback);
  }, [socket]);

  const offChatCleared = useCallback((callback: (data: any) => void) => {
    socket?.off('chat-cleared', callback);
  }, [socket]);

  const joinDM = useCallback((conversationId: string) => {
    socket?.emit('join-dm', conversationId);
  }, [socket]);

  const leaveDM = useCallback((conversationId: string) => {
    socket?.emit('leave-dm', conversationId);
  }, [socket]);

  const onDMMessage = useCallback((callback: (data: any) => void) => {
    socket?.on('dm-new-message', callback);
  }, [socket]);

  const offDMMessage = useCallback((callback: (data: any) => void) => {
    socket?.off('dm-new-message', callback);
  }, [socket]);

  const onDMMessageEdited = useCallback((callback: (data: any) => void) => {
    socket?.on('dm-message-edited', callback);
  }, [socket]);

  const offDMMessageEdited = useCallback((callback: (data: any) => void) => {
    socket?.off('dm-message-edited', callback);
  }, [socket]);

  const onDMMessageDeleted = useCallback((callback: (data: any) => void) => {
    socket?.on('dm-message-deleted', callback);
  }, [socket]);

  const offDMMessageDeleted = useCallback((callback: (data: any) => void) => {
    socket?.off('dm-message-deleted', callback);
  }, [socket]);

  const onDMChatCleared = useCallback((callback: (data: any) => void) => {
    socket?.on('dm-chat-cleared', callback);
  }, [socket]);

  const offDMChatCleared = useCallback((callback: (data: any) => void) => {
    socket?.off('dm-chat-cleared', callback);
  }, [socket]);

  const onDMNotification = useCallback((callback: (data: any) => void) => {
    socket?.on('dm-notification', callback);
  }, [socket]);

  const offDMNotification = useCallback((callback: (data: any) => void) => {
    socket?.off('dm-notification', callback);
  }, [socket]);

  const onDataChanged = useCallback((callback: (data: any) => void) => {
    socket?.on('data-changed', callback);
  }, [socket]);

  const offDataChanged = useCallback((callback: (data: any) => void) => {
    socket?.off('data-changed', callback);
  }, [socket]);

  const onActivityNotification = useCallback((callback: (data: any) => void) => {
    socket?.on('activity-notification', callback);
  }, [socket]);

  const offActivityNotification = useCallback((callback: (data: any) => void) => {
    socket?.off('activity-notification', callback);
  }, [socket]);

  return (
    <SocketContext.Provider value={{
      socket, connected,
      joinProject, leaveProject, sendMessage,
      onMessage, offMessage,
      onMessageEdited, offMessageEdited,
      onMessageDeleted, offMessageDeleted,
      onChatCleared, offChatCleared,
      joinDM, leaveDM,
      onDMMessage, offDMMessage,
      onDMMessageEdited, offDMMessageEdited,
      onDMMessageDeleted, offDMMessageDeleted,
      onDMChatCleared, offDMChatCleared,
      onDMNotification, offDMNotification,
      onDataChanged, offDataChanged,
      onActivityNotification, offActivityNotification,
    }}>
      {children}
    </SocketContext.Provider>
  );
}
