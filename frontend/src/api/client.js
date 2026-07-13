import axios from 'axios'

// 统一 API 封装：注入 token、处理 401
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

const TOKEN_KEY = 'cc_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      tokenStore.clear()
      // 仅在后台路由下自动跳转登录，避免打断公开页面
      if (window.location.pathname.startsWith('/admin')) {
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// ---------------- 公开接口 ----------------
export const publicApi = {
  profile: () => api.get('/public/profile').then((r) => r.data),
  theme: () => api.get('/public/theme').then((r) => r.data),
  stats: () => api.get('/public/stats').then((r) => r.data),
  skills: () => api.get('/public/skills').then((r) => r.data),
  projects: () => api.get('/public/projects').then((r) => r.data),
  articles: (params) => api.get('/public/articles', { params }).then((r) => r.data),
  article: (id) => api.get(`/public/articles/${id}`).then((r) => r.data),
  tags: () => api.get('/public/tags').then((r) => r.data),
  categories: () => api.get('/public/categories').then((r) => r.data),
}

// ---------------- 认证 ----------------
export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
}

// ---------------- 管理接口 ----------------
export const adminApi = {
  dashboard: () => api.get('/admin/dashboard').then((r) => r.data),

  articles: () => api.get('/admin/articles').then((r) => r.data),
  article: (id) => api.get(`/admin/articles/${id}`).then((r) => r.data),
  createArticle: (data) => api.post('/admin/articles', data).then((r) => r.data),
  updateArticle: (id, data) => api.put(`/admin/articles/${id}`, data).then((r) => r.data),
  deleteArticle: (id) => api.delete(`/admin/articles/${id}`).then((r) => r.data),

  projects: () => api.get('/admin/projects').then((r) => r.data),
  createProject: (data) => api.post('/admin/projects', data).then((r) => r.data),
  updateProject: (id, data) => api.put(`/admin/projects/${id}`, data).then((r) => r.data),
  deleteProject: (id) => api.delete(`/admin/projects/${id}`).then((r) => r.data),

  skills: () => api.get('/admin/skills').then((r) => r.data),
  createSkill: (data) => api.post('/admin/skills', data).then((r) => r.data),
  updateSkill: (id, data) => api.put(`/admin/skills/${id}`, data).then((r) => r.data),
  deleteSkill: (id) => api.delete(`/admin/skills/${id}`).then((r) => r.data),

  getProfile: () => api.get('/admin/profile').then((r) => r.data),
  updateProfile: (data) => api.put('/admin/profile', data).then((r) => r.data),

  getTheme: () => api.get('/admin/theme').then((r) => r.data),
  updateTheme: (data) => api.put('/admin/theme', data).then((r) => r.data),

  upload: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post('/admin/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}

export default api
