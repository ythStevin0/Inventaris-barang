import api from './api';

export const getMaintenanceLogs = async () => {
  const response = await api.get('/maintenance');
  return response.data;
};

export const getMaintenanceLogById = async (id) => {
  const response = await api.get(`/maintenance/${id}`);
  return response.data;
};

export const createMaintenanceLog = async (data) => {
  const response = await api.post('/maintenance', data);
  return response.data;
};

export const updateMaintenanceLog = async (id, data) => {
  const response = await api.put(`/maintenance/${id}`, data);
  return response.data;
};

export const deleteMaintenanceLog = async (id) => {
  const response = await api.delete(`/maintenance/${id}`);
  return response.data;
};
