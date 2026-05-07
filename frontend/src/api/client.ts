import type { User, Upload } from '../types'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(path, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }

  return res.json()
}

export const api = {
  signup: (data: {
    username: string
    password: string
    channelName: string
    gender: string
    description?: string
  }) =>
    request<{ token: string; userId: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { username: string; password: string }) =>
    request<{ token: string; userId: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getUser: (id: string) => request<User>(`/users/${id}`),

  getVideos: () => request<Upload[]>('/api/videos'),

  uploadVideo: (data: { videoUrl: string; thumbnail: string }) =>
    request<Upload>('/uploads', { method: 'POST', body: JSON.stringify(data) }),

  getUpload: (id: string) => request<Upload>(`/uploads/${id}`),

  deleteUpload: (id: string) =>
    request<{ message: string }>(`/uploads/${id}`, { method: 'DELETE' }),
}
