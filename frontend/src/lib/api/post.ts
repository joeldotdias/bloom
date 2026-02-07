import { api } from '@/lib/api/index.ts'

export type Post = {
  id: number
  caption: string
  viewUrl: string
  tags: Array<string>
  createdAt: string
  likeCount: number
  isLikedByMe: boolean
  author: {
    id: number
    username: string
    name: string
    pfp: string
  }
}

export type CreatePostData = {
  caption: string
  imageUrl: string
  tags: Array<string>
}

export const postApi = {
  getUploadUrl: async (
    filename: string,
    contentType: string,
  ): Promise<{ url: string; key: string }> => {
    const res = await api.get(`/posts/upload-url`, {
      params: { filename, contentType },
    })
    return res.data
  },

  uploadImageToS3: async (url: string, blob: Blob) => {
    const res = await fetch(url, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': blob.type },
    })
    if (!res.ok) {
      throw new Error('failed to upload image to S3')
    }
  },

  createPost: async (data: CreatePostData): Promise<Post> => {
    const res = await api.post('/posts', data)
    return res.data
  },

  getPosts: async (username?: string): Promise<Array<Post>> => {
    const res = await api.get('/posts', {
      params: { username },
    })
    return res.data
  },

  deletePost: async (postId: number) => {
    await api.delete(`/posts/${postId}`)
  },

  toggleLike: async (postId: number) => {
    await api.post(`/posts/${postId}/like`)
  },
}
