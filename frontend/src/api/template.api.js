import { apiClient } from './axios';

export const fetchTemplates = async () => {
  const response = await apiClient.get('/templates');
  return response.data;
};

export const createTemplate = async (data) => {
  const response = await apiClient.post('/templates', data);
  return response.data;
};

export const updateTemplate = async (id, data) => {
  const response = await apiClient.put(`/templates/${id}`, data);
  return response.data;
};

export const deleteTemplate = async (id) => {
  const response = await apiClient.delete(`/templates/${id}`);
  return response.data;
};

export const applyTemplate = async (id) => {
  const response = await apiClient.post(`/templates/${id}/apply`);
  return response.data;
};
