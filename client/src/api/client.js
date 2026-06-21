import axios from 'axios';
import { cacheCollection, getCachedCollection, enqueueOperation } from '../offline/db';
import { flushQueue } from '../offline/syncQueue';

const TAB_BY_RESOURCE = {
  students: 'Students',
  staff: 'Staff',
  classes: 'Classes_Programs',
  attendance: 'Attendance',
  grades: 'Grades_Assessments',
  finance: 'Finance_Fees',
  admissions: 'Admissions',
  documents: 'Certificates_Documents',
  announcements: 'Announcements_Notifications',
};

function authHeaders() {
  const token = localStorage.getItem('campusiq_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function list(resource, params = {}) {
  const tab = TAB_BY_RESOURCE[resource];
  try {
    const res = await axios.get(`/api/${resource}`, { params, headers: authHeaders() });
    if (tab) await cacheCollection(tab, res.data.data);
    return { data: res.data.data, fromCache: false };
  } catch (err) {
    if (tab) {
      const cached = await getCachedCollection(tab);
      return { data: cached, fromCache: true };
    }
    throw err;
  }
}

export async function create(resource, payload) {
  const tab = TAB_BY_RESOURCE[resource];
  if (!navigator.onLine) {
    const op = await enqueueOperation({ tab, action: 'create', payload });
    return { data: { ...payload, id: op.client_id, _pendingSync: true }, queued: true };
  }
  try {
    const res = await axios.post(`/api/${resource}`, payload, { headers: authHeaders() });
    return { data: res.data.data, queued: false };
  } catch (err) {
    // Network blip even though navigator.onLine said true — queue it anyway.
    const op = await enqueueOperation({ tab, action: 'create', payload });
    return { data: { ...payload, id: op.client_id, _pendingSync: true }, queued: true };
  }
}

export async function update(resource, id, payload) {
  const tab = TAB_BY_RESOURCE[resource];
  if (!navigator.onLine) {
    const op = await enqueueOperation({ tab, action: 'update', payload, server_id: id });
    return { data: { ...payload, id, _pendingSync: true }, queued: true };
  }
  try {
    const res = await axios.put(`/api/${resource}/${id}`, payload, { headers: authHeaders() });
    return { data: res.data.data, queued: false };
  } catch (err) {
    const op = await enqueueOperation({ tab, action: 'update', payload, server_id: id });
    return { data: { ...payload, id, _pendingSync: true }, queued: true };
  }
}

export async function getSummary() {
  const res = await axios.get('/api/analytics/summary', { headers: authHeaders() });
  return res.data.data;
}

export async function getRiskFlags() {
  const res = await axios.get('/api/analytics/risk-flags', { headers: authHeaders() });
  return res.data.data;
}

export async function login(email, password) {
  const res = await axios.post('/api/auth/login', { email, password });
  return res.data;
}

export function triggerSync() {
  return flushQueue(() => localStorage.getItem('campusiq_token'));
}
