import { api } from '@/lib/api/index.ts'

export type UserProfile = {
  username: string
  email: string
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

export const userApi = {
  getMe: async (): Promise<UserProfile> => {
    const response = await api.get('/users/me')
    return response.data
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
}
