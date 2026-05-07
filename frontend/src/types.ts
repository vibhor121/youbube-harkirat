export interface User {
  id: string
  username: string
  channelName: string
  profilePicture?: string | null
  banner?: string | null
  subscriberCount: number
  description?: string | null
  gender: string
  uploads?: Upload[]
}

export interface Upload {
  id: string
  videoUrl: string
  thumbnail: string
  userId: string
  createdAt: string
  user?: {
    id: string
    username: string
    channelName: string
    profilePicture?: string | null
    subscriberCount?: number
    description?: string | null
  }
}
