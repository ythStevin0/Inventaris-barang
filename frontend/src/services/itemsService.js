import api from './api';

export async function getItems(filters = {}) {
  const response = await api.get('/items', {
    params: filters,
  });

  return response.data;
}

export async function createItem(payload) {
  const response = await api.post('/items', payload);
  return response.data;
}
export async function updateItem(id, payload) {
  const response = await api.put(`/items/${id}`, payload);
  return response.data;
}

export async function deleteItem(id) {
  const response = await api.delete(`/items/${id}`);
  return response.data;
}

export async function importItems(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/items/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}
