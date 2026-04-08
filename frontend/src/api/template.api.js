import API from './axios';

export const fetchTemplates = async () => {
  const response = await API.get('/templates');
  return response.data;
};

export const createTemplate = async (data) => {
  const response = await API.post('/templates', data);
  return response.data;
};

export const updateTemplate = async (id, data) => {
  const response = await API.put(`/templates/${id}`, data);
  return response.data;
};

export const deleteTemplate = async (id) => {
  const response = await API.delete(`/templates/${id}`);
  return response.data;
};

export const applyTemplate = async (id) => {
  const response = await API.post(`/templates/${id}/apply`);
  return response.data;
};
