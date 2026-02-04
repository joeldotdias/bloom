import { api } from '@/lib/api/index.ts'

export type UserProfile = {
  username: string
  email: string | null // null if not owner
  name: string
  bio: string | null
  pfp: string | null
  location: string | null
  joinedAt: string
  isOwner: boolean
}

export type UpdateProfileData = {
  name: string
  bio: string
  location: string
}

export type UserSummary = {
  username: string
  name: string
  pfp: string | null
}

export const userApi = {
  getMe: async (): Promise<UserProfile> => {
    const res = await api.get('/users/me')
    return res.data
  },

  getUser: async (username: string): Promise<UserProfile> => {
    const res = await api.get(`/users/${username}`)
    return res.data
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.put('/users/profile', data)
    return response.data
  },

  uploadPfp: async (blob: Blob) => {
    const formData = new FormData()
    formData.append('image', blob)

    const res = await api.post('/users/me/pfp', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  search: async (query: string): Promise<Array<UserSummary>> => {
    if (!query) {
      return []
    }

    const res = await api.get('/users/search', { params: { query } })
    return res.data
  },
}
