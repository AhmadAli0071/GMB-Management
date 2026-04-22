const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function headers() {
  const h = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function request(method, path, body) {
  const opts = { method, headers: headers() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  register: (data) => request('POST', '/auth/register', data),

  getUsers: () => request('GET', '/users'),
  getProjects: () => request('GET', '/projects'),
  createProject: (data) => request('POST', '/projects', data),
  updateProject: (id, data) => request('PUT', `/projects/${id}`, data),
  deleteProject: (id) => request('DELETE', `/projects/${id}`),
  updateProjectStage: (id, stage) => request('PUT', `/projects/${id}/stage`, { stage }),
  assignToLead: (id, leadId, comment) => request('PUT', `/projects/${id}/assign`, { leadId, comment }),

  getTasks: () => request('GET', '/tasks'),
  createTask: (data) => request('POST', '/tasks', data),
  updateTaskStatus: (id, status) => request('PUT', `/tasks/${id}/status`, { status }),

  getRequests: () => request('GET', '/requests'),
  createRequest: (data) => request('POST', '/requests', data),
  respondToRequest: (id, response) => request('PUT', `/requests/${id}/respond`, { response }),

  getActivities: () => request('GET', '/activities'),
  sendUpdate: (projectId, content) => request('POST', '/activities/update', { projectId, content }),

  getAssignments: () => request('GET', '/assignments'),
  createAssignment: (formData) => {
    const token = getToken();
    return fetch(`${API_BASE}/assignments`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(res => {
      if (!res.ok) return res.json().then(e => { throw new Error(e.error || 'Failed'); });
      return res.json();
    });
  },
  updateAssignmentStatus: (id, status) => request('PUT', `/assignments/${id}/status`, { status }),

  getWorkSubmissions: () => request('GET', '/work'),
  submitWork: (formData) => {
    const token = getToken();
    return fetch(`${API_BASE}/work`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(res => {
      if (!res.ok) return res.json().then(e => { throw new Error(e.error || 'Failed'); });
      return res.json();
    });
  },
  reviewWork: (id, status, reviewComment) => request('PUT', `/work/${id}/review`, { status, reviewComment }),

  getProjectUpdates: () => request('GET', '/updates'),
  submitProjectUpdate: (formData) => {
    const token = getToken();
    return fetch(`${API_BASE}/updates`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(res => {
      if (!res.ok) return res.json().then(e => { throw new Error(e.error || 'Failed'); });
      return res.json();
    });
  },
  reviewProjectUpdate: (id, status, reviewComment) => request('PUT', `/updates/${id}/review`, { status, reviewComment }),
  reviewSection: (id, section, status, comment) => request('PUT', `/updates/${id}/review-section`, { section, status, comment }),
  updateWork: (id, formData) => {
    const token = getToken();
    return fetch(`${API_BASE}/work/${id}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(res => {
      if (!res.ok) return res.json().then(e => { throw new Error(e.error || 'Failed'); });
      return res.json();
    });
  },
  deleteWorkFile: (id, filename) => request('DELETE', `/work/${id}/file/${filename}`),
  deleteWork: (id) => request('DELETE', `/work/${id}`),

  getLeadWork: () => request('GET', '/lead-work'),
  createLeadWork: (formData) => {
    const token = getToken();
    return fetch(`${API_BASE}/lead-work`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(res => {
      if (!res.ok) return res.json().then(e => { throw new Error(e.error || 'Failed'); });
      return res.json();
    });
  },
  updateLeadWork: (id, formData) => {
    const token = getToken();
    return fetch(`${API_BASE}/lead-work/${id}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(res => {
      if (!res.ok) return res.json().then(e => { throw new Error(e.error || 'Failed'); });
      return res.json();
    });
  },
  deleteLeadWorkFile: (id, filename) => request('DELETE', `/lead-work/${id}/file/${filename}`),
  deleteLeadWork: (id) => request('DELETE', `/lead-work/${id}`),

  getChatMessages: (projectId, before) => {
    const params = before ? `?before=${before}` : '';
    return request('GET', `/chat/${projectId}${params}`);
  },
  sendChatMessage: (projectId, data) => request('POST', `/chat/${projectId}`, data),
  uploadChatFile: (projectId, formData) => {
    const token = getToken();
    return fetch(`${API_BASE}/chat/${projectId}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(res => {
      if (!res.ok) return res.json().then(e => { throw new Error(e.error || 'Failed'); });
      return res.json();
    });
  },
  editChatMessage: (projectId, messageId, text) => request('PUT', `/chat/${projectId}/message/${messageId}`, { text }),
  deleteChatMessage: (projectId, messageId) => request('DELETE', `/chat/${projectId}/message/${messageId}`),
  hideChatMessage: (projectId, messageId) => request('POST', `/chat/${projectId}/message/${messageId}/hide`),
  clearChat: (projectId) => request('DELETE', `/chat/${projectId}/clear`),

  getDMMessages: (projectId, targetUserId, before) => {
    const params = before ? `?before=${before}` : '';
    return request('GET', `/chat/dm/${projectId}/${targetUserId}${params}`);
  },
  sendDM: (projectId, targetUserId, data) => request('POST', `/chat/dm/${projectId}/${targetUserId}`, data),
  uploadDMFile: (projectId, targetUserId, formData) => {
    const token = getToken();
    return fetch(`${API_BASE}/chat/dm/${projectId}/${targetUserId}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(res => {
      if (!res.ok) return res.json().then(e => { throw new Error(e.error || 'Failed'); });
      return res.json();
    });
  },
  editDM: (projectId, targetUserId, messageId, text) => request('PUT', `/chat/dm/${projectId}/${targetUserId}/message/${messageId}`, { text }),
  deleteDM: (projectId, targetUserId, messageId) => request('DELETE', `/chat/dm/${projectId}/${targetUserId}/message/${messageId}`),
  hideDM: (projectId, targetUserId, messageId) => request('POST', `/chat/dm/${projectId}/${targetUserId}/message/${messageId}/hide`),
  clearDM: (projectId, targetUserId) => request('DELETE', `/chat/dm/clear/${projectId}/${targetUserId}`),
};
