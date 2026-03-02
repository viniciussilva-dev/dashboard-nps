import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para log de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Erro na API:', error);
    return Promise.reject(error);
  }
);

export const npsAPI = {
  // Estatísticas gerais
  getStats: () => api.get('/nps/stats'),
  
  // Listar respostas
  getRespostas: (params = {}) => api.get('/nps/respostas', { params }),
  
  // Listar cursos
  getCursos: () => api.get('/nps/cursos'),
  
  // Detalhes de um curso
  getCurso: (nome) => api.get(`/nps/curso/${encodeURIComponent(nome)}`),
};

export default api;
