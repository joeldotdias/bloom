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
  name: string
  bio: string | null
  pfp: string | null
  joinedAt: string
  isOwner: boolean
}

export type UpdateProfileData = {
  name: string
  bio: string
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
    const response = await api.get('/users/me')
    return response.data
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.put('/users/profile', data)
    return response.data
  },
}
