import api from './api';

export async function loginRequest(email, password) {
  const response = await api.post('/login', { email, password });
  return response.data;
}

export async function logoutRequest() {
  await api.post('/logout');
}

export async function meRequest() {
  const response = await api.get('/me');
  return response.data;
}
