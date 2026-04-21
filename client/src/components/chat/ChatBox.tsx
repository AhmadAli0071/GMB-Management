import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, Paperclip, Mic, Download, MoreVertical, Edit3, Trash2, EyeOff, Trash, Square, ChevronDown, MessageCircle } from 'lucide-react';
import { useSocket } from '../../SocketContext';
import { useApp } from '../../AppContext';
import { useChatNotify } from '../../ChatNotifyContext';
import { api } from '../../api';
import { ROLE_LABELS, UserRole } from '../../types';

interface ChatBoxProps {
  projectId: string;
}

interface ChatMessage {
  _id: string;
  conversationId?: string;
  senderId: string;
  text: string;
  type: 'TEXT' | 'FILE' | 'VOICE';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  edited?: boolean;
  deleted?: boolean;
  createdAt: string;
}

function getConvId(u1: string, u2: string, projectId: string) {
  return [u1, u2].sort().join('_dm_') + '_' + projectId;
}

export function ChatBox({ projectId }: ChatBoxProps) {
  const { currentUser, users } = useApp();
  const {
    joinDM, leaveDM,
    onDMMessage, offDMMessage,
    onDMMessageEdited, offDMMessageEdited,
    onDMMessageDeleted, offDMMessageDeleted,
    onDMChatCleared, offDMChatCleared,
    connected
  } = useSocket();
   const { unreadCounts, clearUnread, clearActivity, activeChatUserId, setActiveChatUserId } = useChatNotify();

  const otherUsers = useMemo(() => {
    return (Object.values(users) as any[]).filter((u: any) => u.id !== currentUser.id);
  }, [users, currentUser.id]);

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const recordStartRef = useRef<number>(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const conversationId = useMemo(() => {
    if (!selectedUserId) return '';
    return getConvId(currentUser.id, selectedUserId, projectId);
  }, [selectedUserId, currentUser.id, projectId]);

  const projectUnreadMap = unreadCounts[projectId] || {};
  const projectTotalUnread = (Object.values(projectUnreadMap) as number[]).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (selectedUserId) {
      setActiveChatUserId(selectedUserId);
    } else {
      setActiveChatUserId(null);
    }
    return () => { setActiveChatUserId(null); };
  }, [selectedUserId]);

  useEffect(() => {
    if (conversationId) {
      joinDM(conversationId);
      loadMessages();
    }
    return () => {
      if (conversationId) leaveDM(conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNewDM = useCallback((data: any) => {
    if (data.conversationId === conversationId) {
      setMessages(prev => {
        if (prev.some(m => m._id === data._id)) return prev;
        return [...prev, data];
      });
    }
  }, [conversationId]);

  const handleDMEdited = useCallback((data: any) => {
    if (data.conversationId === conversationId) {
      setMessages(prev => prev.map(m =>
        m._id === data.messageId ? { ...m, text: data.text, edited: data.edited } : m
      ));
    }
  }, [conversationId]);

  const handleDMDeleted = useCallback((data: any) => {
    if (data.conversationId === conversationId) {
      setMessages(prev => prev.map(m =>
        m._id === data.messageId
          ? { ...m, deleted: true, type: 'TEXT', text: '', fileUrl: '', fileName: '', fileType: '', voiceUrl: '', voiceDuration: 0 }
          : m
      ));
    }
  }, [conversationId]);

  const handleDMCleared = useCallback((data: any) => {
    if (data.conversationId === conversationId && data.userId === currentUser.id) {
      setMessages([]);
    }
  }, [conversationId, currentUser.id]);

  useEffect(() => {
    onDMMessage(handleNewDM);
    return () => { offDMMessage(handleNewDM); };
  }, [handleNewDM, onDMMessage, offDMMessage]);

  useEffect(() => {
    onDMMessageEdited(handleDMEdited);
    return () => { offDMMessageEdited(handleDMEdited); };
  }, [handleDMEdited, onDMMessageEdited, offDMMessageEdited]);

  useEffect(() => {
    onDMMessageDeleted(handleDMDeleted);
    return () => { offDMMessageDeleted(handleDMDeleted); };
  }, [handleDMDeleted, onDMMessageDeleted, offDMMessageDeleted]);

  useEffect(() => {
    onDMChatCleared(handleDMCleared);
    return () => { offDMChatCleared(handleDMCleared); };
  }, [handleDMCleared, onDMChatCleared, offDMChatCleared]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  useEffect(() => {
    if (selectedUserId && inputRef.current) inputRef.current.focus();
  }, [selectedUserId]);

  const loadMessages = async () => {
    if (!selectedUserId) return;
    try {
      const msgs = await api.getDMMessages(projectId, selectedUserId);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load DM messages:', err);
    }
  };

    const handleSelectUser = (userId: string) => {
      setSelectedUserId(userId);
      setDropdownOpen(false);
      setMessages([]);
      setEditingId(null);
      setMenuOpenId(null);
      setShowClearConfirm(false);
      clearUnread(projectId, userId);
      clearActivity(projectId);
    };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending || !selectedUserId) return;
    setSending(true);
    setInputText('');
    try {
      await api.sendDM(projectId, selectedUserId, { text, type: 'TEXT' });
    } catch (err) {
      console.error('Failed to send DM:', err);
      setInputText(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploading || !selectedUserId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.uploadDMFile(projectId, selectedUserId, formData);
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    if (!selectedUserId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'voice.webm', { type: 'audio/webm' });
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('duration', String(recordingDuration));
          await api.uploadDMFile(projectId, selectedUserId, formData);
        } catch (err) {
          console.error('Voice upload failed:', err);
        } finally {
          setUploading(false);
          setRecordingDuration(0);
        }
      };
      recordStartRef.current = Date.now();
      setRecordingDuration(0);
      recorder.start(1000);
      setMediaRecorder(recorder);
      setRecording(true);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch {
      console.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    setRecordingDuration(Math.round((Date.now() - recordStartRef.current) / 1000));
    mediaRecorder?.stop();
    setRecording(false);
    setMediaRecorder(null);
  };

  const handleEditMessage = (msg: ChatMessage) => {
    setEditingId(msg._id);
    setEditText(msg.text);
    setMenuOpenId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editText.trim() || !selectedUserId) return;
    try {
      await api.editDM(projectId, selectedUserId, editingId, editText.trim());
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('Failed to edit:', err);
    }
  };

  const handleCancelEdit = () => { setEditingId(null); setEditText(''); };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
    if (e.key === 'Escape') handleCancelEdit();
  };

  const handleDeleteForMe = async (msg: ChatMessage) => {
    setMenuOpenId(null);
    if (!selectedUserId) return;
    try {
      await api.hideDM(projectId, selectedUserId, msg._id);
      setMessages(prev => prev.filter(m => m._id !== msg._id));
    } catch (err) {
      console.error('Failed to hide:', err);
    }
  };

  const handleDeleteForEveryone = async (msg: ChatMessage) => {
    setMenuOpenId(null);
    if (!selectedUserId) return;
    try {
      await api.deleteDM(projectId, selectedUserId, msg._id);
      setMessages(prev => prev.map(m =>
        m._id === msg._id
          ? { ...m, deleted: true, type: 'TEXT', text: '', fileUrl: '', fileName: '', fileType: '', voiceUrl: '', voiceDuration: 0 }
          : m
      ));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleClearChat = async () => {
    if (!selectedUserId) return;
    try {
      await api.clearDM(projectId, selectedUserId);
      setMessages([]);
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getSenderName = (senderId: string) => (users as any)[senderId]?.name || 'Unknown';
  const isOwnMessage = (senderId: string) => senderId === currentUser.id;
  const selectedUser = selectedUserId ? (users as any)[selectedUserId] : null;

  return (
    <div className="flex flex-col h-full max-h-[70vh] lg:max-h-none bg-slate-900/50 rounded-xl border border-slate-700/50">
      <div className="px-3 py-2 bg-slate-800/80 border-b border-slate-700/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${connected ? 'bg-green-500' : 'bg-red-500'}`} />

          <div className="relative flex-1 min-w-0" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between gap-1.5 px-2.5 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                {selectedUser ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate font-medium">{selectedUser.name}</span>
                  </>
                ) : (
                  <>
                    <MessageCircle size={14} className="text-slate-500 shrink-0" />
                    <span className="text-slate-400">Select user...</span>
                  </>
                )}
                {projectTotalUnread > 0 && !selectedUserId && (
                  <span className="bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0 animate-pulse">
                    {projectTotalUnread > 99 ? '99+' : projectTotalUnread}
                  </span>
                )}
              </div>
              <ChevronDown size={15} className={`shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto overflow-x-hidden">
                {otherUsers.length === 0 ? (
                  <div className="px-3 py-3 text-xs text-slate-500">No users available</div>
                ) : (
                  otherUsers.map((user: any) => {
                    const unread = projectUnreadMap[user.id] || 0;
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-slate-700/70 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                          selectedUserId === user.id ? 'bg-blue-600/30 text-blue-300' : 'text-slate-300'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          selectedUserId === user.id ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300'
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="truncate font-medium">{user.name}</div>
                          <div className="text-[11px] text-slate-500">{ROLE_LABELS[user.role as UserRole] || user.role}</div>
                        </div>
                        {unread > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shrink-0">
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2 shrink-0">
          {showClearConfirm ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-red-400">Clear?</span>
              <button onClick={handleClearChat} className="px-2 py-0.5 bg-red-600 text-white text-[10px] rounded hover:bg-red-500">Yes</button>
              <button onClick={() => setShowClearConfirm(false)} className="px-2 py-0.5 bg-slate-600 text-white text-[10px] rounded hover:bg-slate-500">No</button>
            </div>
          ) : (
            selectedUserId && (
              <button onClick={() => setShowClearConfirm(true)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors" title="Clear Chat">
                <Trash size={14} />
              </button>
            )
          )}
        </div>
      </div>

      {!selectedUserId ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3 relative">
            <MessageCircle size={28} className="text-slate-600" />
            {projectTotalUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-bounce">
                {projectTotalUnread > 99 ? '99+' : projectTotalUnread}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mb-1">Select a user to start chatting</p>
          <p className="text-[10px] text-slate-600">Choose from the dropdown above</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {messages.length === 0 && (
              <p className="text-center text-xs text-slate-600 py-8">No messages yet. Start the conversation!</p>
            )}
            {messages.map((msg) => {
              const own = isOwnMessage(msg.senderId);
              const isEditing = editingId === msg._id;
              const showMenu = menuOpenId === msg._id;
              return (
                <div key={msg._id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                  <div className="relative max-w-[80%] group/msg">
                    <div className="flex items-start gap-1">
                      {!own && !msg.deleted && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(showMenu ? null : msg._id); }}
                          className={`mt-1.5 p-0.5 rounded transition-all duration-150 shrink-0 ${showMenu ? 'opacity-100 text-slate-300 bg-slate-700/60' : 'opacity-0 group-hover/msg:opacity-50 hover:!opacity-100 text-slate-400 hover:text-slate-300 hover:bg-slate-700/60'}`}
                        >
                          <MoreVertical size={14} />
                        </button>
                      )}

                      <div className="min-w-0">
                        <div className={`px-3 py-2 rounded-xl text-sm ${
                          msg.deleted
                            ? 'bg-slate-800/40 text-slate-500 border border-slate-700/30 italic rounded-xl'
                            : own
                              ? 'bg-blue-600/90 text-white rounded-br-sm'
                              : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-sm'
                        }`}>
                          {msg.deleted ? (
                            <p className="text-xs italic">
                              {own ? 'You deleted this message' : `This message was deleted by ${getSenderName(msg.senderId)}`}
                            </p>
                          ) : isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                onKeyDown={handleEditKeyDown}
                                className="flex-1 px-2 py-1 bg-slate-900/70 border border-slate-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[120px]"
                              />
                              <button onClick={handleSaveEdit} className="text-[10px] text-green-400 hover:text-green-300 font-medium shrink-0">Save</button>
                              <button onClick={handleCancelEdit} className="text-[10px] text-slate-400 hover:text-slate-300 shrink-0">Cancel</button>
                            </div>
                          ) : (
                            <>
                              {msg.type === 'TEXT' && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}

                              {msg.type === 'FILE' && msg.fileUrl && (
                                <div className="space-y-1">
                                  {msg.fileType?.startsWith('image/') ? (
                                    <img src={`/uploads/chat/${msg.fileUrl}`} alt={msg.fileName} className="max-w-full rounded-lg max-h-48 object-cover" />
                                  ) : (
                                    <a href={`/uploads/chat/${msg.fileUrl}`} target="_blank" download className="flex items-center gap-1 text-blue-300 hover:underline text-xs">
                                      <Download size={12} /> {msg.fileName || 'File'}
                                    </a>
                                  )}
                                  {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                                </div>
                              )}

                              {msg.type === 'VOICE' && msg.voiceUrl && (
                                <div className="space-y-1">
                                  <audio controls preload="metadata" className="h-8 max-w-[220px]">
                                    <source src={`/uploads/chat/${msg.voiceUrl}`} type="audio/webm" />
                                    <source src={`/uploads/chat/${msg.voiceUrl}`} type="audio/ogg" />
                                  </audio>
                                  {msg.voiceDuration && msg.voiceDuration > 0 && <span className="text-[10px] text-slate-400 block">{Math.round(msg.voiceDuration)}s</span>}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 ${own ? 'justify-end mr-1' : 'ml-1'}`}>
                          <span className="text-[10px] text-slate-600">{formatTime(msg.createdAt)}</span>
                          {msg.edited && !msg.deleted && <span className="text-[10px] text-slate-600 italic">edited</span>}
                        </div>
                      </div>

                      {own && !msg.deleted && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(showMenu ? null : msg._id); }}
                          className={`mt-1.5 p-0.5 rounded transition-all duration-150 shrink-0 ${showMenu ? 'opacity-100 text-slate-300 bg-slate-700/60' : 'opacity-0 group-hover/msg:opacity-50 hover:!opacity-100 text-slate-400 hover:text-slate-300 hover:bg-slate-700/60'}`}
                        >
                          <MoreVertical size={14} />
                        </button>
                      )}
                    </div>

                    {showMenu && (
                      <div ref={menuRef} className={`absolute z-50 top-8 ${own ? 'right-0' : 'left-0'} bg-slate-800 border border-slate-600 rounded-lg shadow-2xl py-1 min-w-[170px]`}>
                        {own && msg.type === 'TEXT' && !isEditing && (
                          <button onClick={() => handleEditMessage(msg)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700/70 transition-colors">
                            <Edit3 size={13} /> Edit Message
                          </button>
                        )}
                        <button onClick={() => handleDeleteForMe(msg)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700/70 transition-colors">
                          <EyeOff size={13} /> Delete for Me
                        </button>
                        {own && (
                          <button onClick={() => handleDeleteForEveryone(msg)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-900/30 transition-colors">
                            <Trash2 size={13} /> Delete for Everyone
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {recording && (
            <div className="px-3 py-2 border-t border-slate-700/50 bg-slate-800/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-xs text-red-400 font-medium">Recording</span>
                </div>
                <div className="flex items-center gap-[3px]">
                  {[...Array(12)].map((_, i) => (
                    <span key={i} className="inline-block w-[3px] bg-red-400/70 rounded-full animate-pulse"
                      style={{ height: `${8 + Math.random() * 16}px`, animationDelay: `${i * 0.1}s`, animationDuration: `${0.4 + Math.random() * 0.4}s` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-300 font-mono ml-auto">{formatDuration(recordingDuration)}</span>
                <button onClick={stopRecording} className="p-1.5 bg-red-600 rounded-lg text-white hover:bg-red-500 transition-colors shrink-0" title="Stop Recording">
                  <Square size={14} fill="currentColor" />
                </button>
              </div>
            </div>
          )}

          {!recording && (
            <div className="px-3 py-2 border-t border-slate-700/50 bg-slate-800/50 shrink-0">
              {uploading && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px] text-slate-400">Uploading...</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls" onChange={handleFileUpload} />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors shrink-0 disabled:opacity-40">
                  <Paperclip size={16} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selectedUser?.name || ''}...`}
                  className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 min-w-0"
                />
                <button onClick={startRecording} disabled={uploading} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors shrink-0 disabled:opacity-40" title="Record Voice">
                  <Mic size={16} />
                </button>
                <button onClick={handleSend} disabled={!inputText.trim() || sending} className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0">
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
