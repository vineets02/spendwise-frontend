import axios from 'axios'

// normalize base URL (no trailing slash)
const BASE_RAW = import.meta.env.VITE_API_BASE_URL
export const API_BASE = BASE_RAW.replace(/\/+$/, '')

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  // withCredentials: false  // keep false for your current CORS setup
})

// Attach token if present
api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token')
  if (t) config.headers.Authorization = `Bearer ${t}`
  return config
})

// Unwrap server errors into a consistent shape
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      'Request failed'
    return Promise.reject({ status, message: msg })
  }
)
