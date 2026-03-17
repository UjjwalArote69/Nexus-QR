import { apiClient } from './axios';

export const fetchFolders = async () => {
  const response = await apiClient.get('/folders');
  return response.data;
};

export const createFolder = async (data) => {
  const response = await apiClient.post('/folders', data);
  return response.data;
};

export const updateFolder = async (id, data) => {
  const response = await apiClient.put(`/folders/${id}`, data);
  return response.data;
};

export const deleteFolder = async (id) => {
  const response = await apiClient.delete(`/folders/${id}`);
  return response.data;
};
