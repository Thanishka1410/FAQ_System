import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT token into requests if it exists in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('samagama_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name, email, password) => {
    const response = await api.post('/auth/register-admin', { name, email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const faqService = {
  getAll: async (category = 'All', sort = 'newest') => {
    const response = await api.get('/faqs', {
      params: { category, sort },
    });
    return response.data;
  },
  search: async (q, category = 'All') => {
    const response = await api.get('/faqs/search', {
      params: { q, category },
    });
    return response.data;
  },
  create: async (faqData) => {
    const response = await api.post('/faqs', faqData);
    return response.data;
  },
  update: async (id, faqData) => {
    const response = await api.put(`/faqs/${id}`, faqData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/faqs/${id}`);
    return response.data;
  },
  markHelpful: async (id) => {
    const response = await api.post(`/faqs/${id}/helpful`);
    return response.data;
  },
  markNotHelpful: async (id) => {
    const response = await api.post(`/faqs/${id}/not-helpful`);
    return response.data;
  },
  recordView: async (id) => {
    const response = await api.post(`/faqs/${id}/view`);
    return response.data;
  },
  syncLocalFile: async () => {
    const response = await api.post('/faqs/sync-file');
    return response.data;
  },
};

export const questionService = {
  checkDuplicate: async (title, description = '', category = '') => {
    const response = await api.post('/questions/check-duplicate', {
      title,
      description,
      category,
    });
    return response.data;
  },
  submit: async (questionData) => {
    const response = await api.post('/questions', questionData);
    return response.data;
  },
  getAll: async (category = 'All', status = 'All') => {
    const response = await api.get('/questions', {
      params: { category, status },
    });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },
  answer: async (id, answerText, addToFAQ = false) => {
    const response = await api.put(`/questions/${id}/answer`, {
      answer: answerText,
      addToFAQ,
    });
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/questions/${id}/status`, { status });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },
};

export const analyticsService = {
  getSummary: async () => {
    const response = await api.get('/analytics/summary');
    return response.data;
  },
};

export const yakshaService = {
  query: async (queryText) => {
    const response = await api.post('/yaksha-mini/query', { query: queryText });
    return response.data;
  },
  getStatus: async () => {
    const response = await api.get('/yaksha-mini/status');
    return response.data;
  }
};

export default api;
