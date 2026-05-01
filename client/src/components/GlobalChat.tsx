import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, Paperclip, Mic, Download, MoreVertical, Edit3, Trash2, EyeOff, Square, ChevronLeft, Search } from 'lucide-react';
import { useSocket } from '../SocketContext';
import { useApp } from '../AppContext';
import { useChatNotify } from '../ChatNotifyContext';
import { api } from '../api';
import { ROLE_LABELS, UserRole } from '../types';

interface GlobalChatProps {
  onBack: () => void;
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

function getGlobalConvId(u1: string, u2: string) {
  return [u1, u2].sort().join('_dm_');
}

export function GlobalChat({ onBack }: GlobalChatProps) {
  const { currentUser, users } = useApp();
  const { joinDMGlobal, leaveDMGlobal, onDMMessage, offDMMessage, onDMMessageEdited, offDMMessageEdited, onDMMessageDeleted, offDMMessageDeleted, onDMChatCleared, offDMChatCleared, connected } = useSocket();
  const { clearUnread, clearActivity } = useChatNotify();

  const allUsers = useMemo(() => {
    return (Object.values(users) as any[]).filter((u: any) => u.id !== currentUser.id);
  }, [users, currentUser.id]);

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
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
  const recordStartRef = useRef<number>(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const conversationId = useMemo(() => {
    if (!selectedUserId) return '';
    return getGlobalConvId(currentUser.id, selectedUserId);
  }, [selectedUserId, currentUser.id]);

  useEffect(() => {
    if (selectedUserId) {
      loadMessages();
      joinDMGlobal(conversationId);
    }
    return () => {
      if (conversationId) leaveDMGlobal(conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  const loadMessages = async () => {
    if (!selectedUserId) return;
    try {
      const msgs = await api.getGlobalDMMessages(selectedUserId);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load global DM:', err);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setMessages([]);
    setEditingId(null);
    setMenuOpenId(null);
    setShowClearConfirm(false);
    clearUnread('global', userId);
    clearActivity('global');
  };

  const handleNewDM = useCallback((data: any) => {
    if (data.conversationId === conversationId) {
      if (data.senderId === currentUser.id) {
        setUploading(false);
        setSending(false);
      }
      setMessages(prev => {
        if (prev.some(m => m._id === data._id)) return prev;
        return [...prev, data];
      });
    }
  }, [conversationId, currentUser.id]);

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

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending || !selectedUserId) return;
    setSending(true);
    setInputText('');
    try {
      await api.sendGlobalDM(selectedUserId, { text, type: 'TEXT' });
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
      await api.uploadGlobalDMFile(selectedUserId, formData);
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
          await api.uploadGlobalDMFile(selectedUserId, formData);
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
      await api.editGlobalDM(selectedUserId, editingId, editText.trim());
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
      await api.hideGlobalDM(selectedUserId, msg._id);
      setMessages(prev => prev.filter(m => m._id !== msg._id));
    } catch (err) {
      console.error('Failed to hide:', err);
    }
  };

  const handleDeleteForEveryone = async (msg: ChatMessage) => {
    setMenuOpenId(null);
    if (!selectedUserId) return;
    try {
      await api.deleteGlobalDM(selectedUserId, msg._id);
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
      await api.clearGlobalDM(selectedUserId);
      setMessages([]);
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Failed to clear:', err);
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

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return allUsers;
    const q = searchQuery.toLowerCase();
    return allUsers.filter(u => u.name.toLowerCase().includes(q));
  }, [allUsers, searchQuery]);

  return (
    <div className="flex h-[80vh] bg-white rounded-xl overflow-hidden border border-slate-200">
      {/* Users List Sidebar */}
      <div className="w-72 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800">Messages</h3>
            <button onClick={onBack} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <ChevronLeft size={20} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredUsers.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">No users found</div>
          ) : (
            filteredUsers.map((user: any) => {
              const isSelected = user.id === selectedUserId;
              const avatarColors = [
                'from-blue-400 to-blue-600',
                'from-purple-400 to-purple-600',
                'from-pink-400 to-pink-600',
                'from-teal-400 to-teal-600',
                'from-orange-400 to-orange-600',
                'from-cyan-400 to-cyan-600',
                'from-indigo-400 to-indigo-600',
                'from-rose-400 to-rose-600',
              ];
              const idx = Object.keys(users).indexOf(user.id) % avatarColors.length;
              const avatarGradient = avatarColors[idx];
              return (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-blue-50'}`}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-base font-bold text-white shrink-0 shadow-md`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-700'}`}>{user.name}</p>
                    <p className={`text-[11px] truncate ${isSelected ? 'text-white/70' : 'text-slate-500'}`}>{ROLE_LABELS[user.role as UserRole] || user.role}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3 shrink-0">
              <button onClick={onBack} className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
                <ChevronLeft size={20} />
              </button>
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="truncate font-medium text-slate-900 block text-[15px]">{selectedUser.name}</span>
                <span className="text-[12px] text-slate-500">{connected ? 'online' : 'offline'}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {showClearConfirm ? (
                  <div className="flex items-center gap-1">
                    <button onClick={handleClearChat} className="px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded hover:bg-blue-400">Yes</button>
                    <button onClick={() => setShowClearConfirm(false)} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded hover:bg-slate-200">No</button>
                  </div>
                ) : (
                  <button onClick={() => setShowClearConfirm(true)} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors" title="Clear Chat">
                    <Trash size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0 bg-slate-50/50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <p className="text-center text-sm text-slate-500">No messages yet. Say hi to {selectedUser.name}!</p>
                </div>
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
                            className={`mt-1 p-0.5 rounded transition-all duration-150 shrink-0 ${showMenu ? 'opacity-100' : 'opacity-0 group-hover/msg:opacity-100'} text-slate-500 hover:text-slate-900`}
                          >
                            <MoreVertical size={14} />
                          </button>
                        )}

                        <div className="min-w-0">
                          <div className={`px-2.5 py-1.5 rounded-lg text-[14.2px] ${
                            msg.deleted
                              ? 'bg-slate-50 text-slate-400 italic'
                              : own
                                ? 'bg-blue-500 text-white rounded-tr-none'
                                : 'bg-slate-100 text-slate-800 rounded-tl-none'
                          }`}>
                            {msg.deleted ? (
                              <p className="text-[13px] italic">
                                {own ? 'You deleted this message' : 'This message was deleted'}
                              </p>
                            ) : isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editText}
                                  onChange={e => setEditText(e.target.value)}
                                  onKeyDown={handleEditKeyDown}
                                  className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[120px]"
                                />
                                <button onClick={handleSaveEdit} className="text-[10px] text-blue-500 font-medium shrink-0">Save</button>
                                <button onClick={handleCancelEdit} className="text-[10px] text-slate-500 shrink-0">Cancel</button>
                              </div>
                            ) : (
                              <>
                                {msg.type === 'TEXT' && <p className="whitespace-pre-wrap break-words leading-[19px]">{msg.text}</p>}

                                {msg.type === 'FILE' && msg.fileUrl && (
                                  <div className="space-y-1">
                                    {msg.fileType?.startsWith('image/') ? (
                                      <div className="relative group/img rounded overflow-hidden">
                                        <a href={`/uploads/chat/${msg.fileUrl}`} target="_blank" className="block">
                                          <img src={`/uploads/chat/${msg.fileUrl}`} alt={msg.fileName} className="max-w-full rounded max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                                        </a>
                                        <a href={`/uploads/chat/${msg.fileUrl}`} download className="absolute bottom-1.5 right-1.5 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-black/80" title="Download">
                                          <Download size={14} />
                                        </a>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <a href={`/uploads/chat/${msg.fileUrl}`} target="_blank" className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-xs">
                                          <Paperclip size={12} /> {msg.fileName || 'File'}
                                        </a>
                                        <a href={`/uploads/chat/${msg.fileUrl}`} download className="flex items-center gap-1 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-xs" title="Download">
                                          <Download size={12} />
                                        </a>
                                      </div>
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
                                    {msg.voiceDuration && msg.voiceDuration > 0 && <span className="text-[10px] text-slate-500 block">{Math.round(msg.voiceDuration)}s</span>}
                                  </div>
                                )}
                              </>
                            )}
                            {!msg.deleted && (
                              <span className={`text-[11px] float-right mt-1 ml-2 ${own ? 'text-white/70' : 'text-slate-400'}`}>
                                {formatTime(msg.createdAt)} {msg.edited && <i>edited</i>} {own && '✓✓'}
                              </span>
                            )}
                          </div>
                        </div>

                        {own && !msg.deleted && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(showMenu ? null : msg._id); }}
                            className={`mt-1 p-0.5 rounded transition-all duration-150 shrink-0 ${showMenu ? 'opacity-100' : 'opacity-0 group-hover/msg:opacity-100'} text-slate-500 hover:text-slate-900`}
                          >
                            <MoreVertical size={14} />
                          </button>
                        )}
                      </div>

                      {showMenu && (
                        <div ref={menuRef} className={`absolute z-50 top-8 ${own ? 'right-0' : 'left-0'} bg-white border border-slate-200 rounded-lg shadow-2xl py-1 min-w-[170px]`}>
                          {own && msg.type === 'TEXT' && !isEditing && (
                            <button onClick={() => handleEditMessage(msg)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-100 transition-colors">
                              <Edit3 size={14} /> Edit Message
                            </button>
                          )}
                          <button onClick={() => handleDeleteForMe(msg)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-100 transition-colors">
                            <EyeOff size={14} /> Delete for Me
                          </button>
                          {own && (
                            <button onClick={() => handleDeleteForEveryone(msg)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-100 transition-colors">
                              <Trash2 size={14} /> Delete for Everyone
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
              <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <span className="text-xs text-red-400 font-medium">Recording</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono ml-auto">{formatDuration(recordingDuration)}</span>
                  <button onClick={stopRecording} className="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-400 transition-colors shrink-0" title="Stop">
                    <Square size={12} fill="currentColor" />
                  </button>
                </div>
              </div>
            )}

            {!recording && (
              <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 shrink-0">
                {uploading && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[11px] text-slate-500">Uploading...</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls" onChange={handleFileUpload} />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="p-2 text-slate-500 hover:text-slate-900 rounded-lg transition-colors shrink-0 disabled:opacity-40">
                    <Paperclip size={20} />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message"
                    className="flex-1 px-3 py-2 bg-slate-100 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none min-w-0"
                  />
                  <button onClick={startRecording} disabled={uploading} className="p-2 text-slate-500 hover:text-slate-900 rounded-lg transition-colors shrink-0 disabled:opacity-40" title="Record Voice">
                    <Mic size={20} />
                  </button>
                  <button onClick={handleSend} disabled={!inputText.trim() || sending} className="p-2 text-slate-500 hover:text-slate-900 rounded-lg transition-colors shrink-0 disabled:opacity-40">
                    <Send size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={32} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">Select a user to chat</h3>
              <p className="text-sm text-slate-500">Choose someone from the list to start a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
