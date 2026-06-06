import api from './api';

export async function getCategories() {
  const response = await api.get('/categories');
  return response.data.data ?? [];
}

export async function createCategory(payload) {
  const response = await api.post('/categories', payload);
  return response.data;
}

export async function updateCategory(id, payload) {
  const response = await api.put(`/categories/${id}`, payload);
  return response.data;
}

export async function deleteCategory(id) {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
}
