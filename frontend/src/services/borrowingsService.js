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
  let data = payload;
  let headers = {};
  if (payload.return_proof_image instanceof File) {
    data = new FormData();
    for (const key in payload) {
      if (key === 'items') {
        payload[key].forEach((item, index) => {
          for (const itemKey in item) {
            if (item[itemKey] !== null && item[itemKey] !== undefined) {
              data.append(`items[${index}][${itemKey}]`, item[itemKey]);
            }
          }
        });
      } else if (payload[key] !== null && payload[key] !== undefined) {
        data.append(key, payload[key]);
      }
    }
    headers['Content-Type'] = 'multipart/form-data';
  }

  const response = await api.post(`/borrowings/${id}/return`, data, { headers });
  return response.data;
}
