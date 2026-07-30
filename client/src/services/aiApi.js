import api from './api';

/**
 * AI Service APIs wrapper using existing axios client
 */
export const analyzeLibrary = () => api.post('/ai/analyze');
export const getAiRecommendations = () => api.post('/ai/recommend');
export const smartSearchAi = (query) => api.post('/ai/search', { query });
export const generateItemDetails = (title, type) => api.post('/ai/generate', { title, type });
