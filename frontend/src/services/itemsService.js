import api from './api';

export async function getItems(filters = {}) {
  const response = await api.get('/items', {
    params: filters,
  });

  return response.data;
}

export async function createItem(payload) {
  let data = payload;
  let headers = {};
  if (payload.image instanceof File) {
    data = new FormData();
    for (const key in payload) {
      if (payload[key] !== null && payload[key] !== undefined) {
        data.append(key, payload[key]);
      }
    }
    headers['Content-Type'] = 'multipart/form-data';
  }
  const response = await api.post('/items', data, { headers });
  return response.data;
}

export async function updateItem(id, payload) {
  if (payload.image instanceof File) {
    let data = new FormData();
    let headers = {};
    for (const key in payload) {
      if (payload[key] !== null && payload[key] !== undefined) {
        data.append(key, payload[key]);
      }
    }
    data.append('_method', 'PUT'); // Laravel workaround for multipart PUT
    headers['Content-Type'] = 'multipart/form-data';
    
    const response = await api.post(`/items/${id}`, data, { headers });
    return response.data;
  } else {
    const response = await api.put(`/items/${id}`, payload);
    return response.data;
  }
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
