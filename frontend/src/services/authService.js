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

export async function updateProfileRequest(formData) {
  // We use post to /profile instead of put because of formData (multipart/form-data)
  // Laravel supports method spoofing with _method=PUT if needed, but our route is POST
  const response = await api.post('/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}
