import API from './axios';

export const fetchFolders = async () => {
  const response = await API.get('/folders');
  return response.data;
};

export const createFolder = async (data) => {
  const response = await API.post('/folders', data);
  return response.data;
};

export const updateFolder = async (id, data) => {
  const response = await API.put(`/folders/${id}`, data);
  return response.data;
};

export const deleteFolder = async (id) => {
  const response = await API.delete(`/folders/${id}`);
  return response.data;
};
