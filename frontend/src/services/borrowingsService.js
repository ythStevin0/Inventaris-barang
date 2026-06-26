import api from './api';

export async function getBorrowings(filters = {}) {
  const response = await api.get('/borrowings', { params: filters });
  return response.data;
}

export async function getBorrowingById(id) {
  const response = await api.get(`/borrowings/${id}`);
  return response.data;
}

export async function createBorrowing(payload) {
  const response = await api.post('/borrowings', payload);
  return response.data;
}

export async function approveBorrowing(id) {
  const response = await api.post(`/borrowings/${id}/approve`);
  return response.data;
}

export async function rejectBorrowing(id, notes = '') {
  const response = await api.post(`/borrowings/${id}/reject`, { notes });
  return response.data;
}

export async function requestReturn(id) {
  const response = await api.post(`/borrowings/${id}/request-return`);
  return response.data;
}

export async function returnBorrowing(id, payload) {
  const response = await api.post(`/borrowings/${id}/return`, payload);
  return response.data;
}
