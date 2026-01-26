import { api } from '@/lib/api.ts'

export type RegisterData = {
  username: string
  email: string
  password: string
  name: string
}

export type LoginData = {
  username: string
  password: string
}

export type UserProfile = {
  username: string
  email: string
}

export const authApi = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  getMe: async (): Promise<UserProfile> => {
    const response = await api.get('/user/me')
    return response.data
  },
}
