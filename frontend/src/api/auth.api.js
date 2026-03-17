import { apiClient } from './axios';

export const registerUser = async (userData) => {
  const response = await apiClient.post('/users/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await apiClient.post('/users/login', credentials);
  return response.data;
};

export const fetchProfile = async () => {
  // This request will now automatically include the Bearer token!
  const response = await apiClient.get('/users/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await apiClient.put('/users/profile', data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await apiClient.put('/users/password', data);
  return response.data;
};

export const deleteAccount = async (password) => {
  const response = await apiClient.delete('/users/account', { data: { password } });
  return response.data;
};