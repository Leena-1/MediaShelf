import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token automatically if it exists in local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Auth APIs ---
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const getProfile = () => api.get('/auth/profile');
export const logoutUser = () => api.post('/auth/logout');

// --- Item APIs ---
export const getItems = (params) => api.get('/items', { params });
export const getItemById = (id) => api.get(`/items/${id}`);
export const createItem = (data) => api.post('/items', data);
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const toggleFavorite = (id, favorite) => api.patch(`/items/${id}/favorite`, { favorite });
export const getFavorites = () => api.get('/favorites');
export const deleteItem = (id) => api.delete(`/items/${id}`);
export const restoreItem = (id) => api.post(`/items/${id}/restore`);
export const getStats = () => api.get('/items/stats');
export const getDashboard = () => api.get('/dashboard');
export const importItems = (data) => api.post('/items/import', data);
export const uploadPoster = (formData) => api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// --- Review APIs ---
export const addItemReview = (itemId, rating, comment) => api.post(`/items/${itemId}/reviews`, { rating, comment });
export const getItemReviews = (itemId) => api.get(`/items/${itemId}/reviews`);

// --- Collection APIs ---
export const getCollections = () => api.get('/collections');
export const createCollection = (data) => api.post('/collections', data);
export const deleteCollection = (id) => api.delete(`/collections/${id}`);
export const addToCollection = (collectionId, itemId) => api.post(`/collections/${collectionId}/add`, { itemId });
export const removeFromCollection = (collectionId, itemId) => api.post(`/collections/${collectionId}/remove`, { itemId });

// --- Activity Log APIs ---
export const getActivityLogs = () => api.get('/activity');
export const clearActivityLogs = () => api.delete('/activity');

export default api;
