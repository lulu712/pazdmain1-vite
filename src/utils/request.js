import axios from 'axios'
import { ElMessage } from 'element-plus'

const http = axios.create({
  baseURL: 'https://v3pz.itndedu.com/v3pz',
  timeout: 10000
})

// ===== 請求攔截 =====
http.interceptors.request.use(
  config => {
    const token = localStorage.getItem('pz_token')

    // 不需要 token 的 API
    const whiteUrl = ['/get/code', '/user/authentication', '/login']

    if (token && !whiteUrl.some(url => config.url.includes(url))) {
      config.headers['x-token'] = token
    }

    return config
  },
  error => Promise.reject(error)
)

// ===== 回應攔截（🔥重點在這）=====
http.interceptors.response.use(
  response => {
    const { code, message } = response.data || {}

    if (code === -1) {
      ElMessage.warning(message || '操作失敗')
    }

    if (code === -2) {
      ElMessage.error('登入已失效，請重新登入')

      // 🔥 斷根
      localStorage.removeItem('pz_token')
      localStorage.removeItem('pz_userInfo')
      localStorage.removeItem('pz_v3pz')


      // 🔥 強制回登入頁
      window.location.href = '/Login'
    }

    return response
  },
  error => Promise.reject(error)
)

export default http
