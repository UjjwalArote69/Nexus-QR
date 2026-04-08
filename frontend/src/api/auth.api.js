import API from './axios';

export const registerUser = async (userData) => {
  const response = await API.post('/users/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await API.post('/users/login', credentials);
  return response.data;
};

export const fetchProfile = async () => {
  // This request will now automatically include the Bearer token!
  const response = await API.get('/users/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await API.put('/users/profile', data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await API.put('/users/password', data);
  return response.data;
};

export const deleteAccount = async (password) => {
  const response = await API.delete('/users/account', { data: { password } });
  return response.data;
};