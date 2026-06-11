import axios from 'axios'
import { message } from 'antd'

declare module 'axios' {
  interface AxiosRequestConfig {
    successMessage?: string
  }
}

const request = axios.create({ baseURL: '/api', timeout: 15000 })

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 0) {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
    const successMessage = response.config.successMessage
    if (successMessage) {
      message.success(successMessage)
    }
    return res.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    message.error(error.response?.data?.message || '网络错误')
    return Promise.reject(error)
  },
)

export default request
