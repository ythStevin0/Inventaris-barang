import api from './api';

export async function getItems() {
  const response = await api.get('/items');
  return response.data.data ?? [];
}

export async function createItem(payload) {
  const response = await api.post('/items', payload);
  return response.data;
}
