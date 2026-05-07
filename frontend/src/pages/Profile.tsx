import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import VideoCard from '../components/VideoCard'
import type { User } from '../types'

export default function Profile() {
  const { id } = useParams<{ id: string }>()
  const { userId } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isOwner = userId === id

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api
      .getUser(id)
      .then(setUser)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async (uploadId: string) => {
    if (!confirm('Delete this video?')) return
    try {
      await api.deleteUpload(uploadId)
      setUser((u) =>
        u ? { ...u, uploads: u.uploads?.filter((v) => v.id !== uploadId) } : u
      )
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="text-center text-gray-400 mt-20">
        <p className="text-4xl mb-4">⚠️</p>
        <p>{error || 'User not found'}</p>
      </div>
    )
  }

  const uploads = user.uploads ?? []

  return (
    <div>
      {/* Banner */}
      <div
        className="w-full h-32 sm:h-48 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-xl overflow-hidden mb-0"
        style={user.banner ? { backgroundImage: `url(${user.banner})`, backgroundSize: 'cover' } : {}}
      />

      {/* Channel info */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end px-2 -mt-8 mb-8">
        <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-[#0f0f0f] shrink-0">
          {user.channelName[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.channelName}</h1>
          <p className="text-sm text-gray-400">@{user.username}</p>
          <p className="text-sm text-gray-400">
            {user.subscriberCount.toLocaleString()} subscribers · {uploads.length} videos
          </p>
          {user.description && (
            <p className="text-sm text-gray-400 mt-1 max-w-xl">{user.description}</p>
          )}
        </div>

        {isOwner && (
          <button
            onClick={() => navigate('/upload')}
            className="bg-white text-black font-semibold text-sm px-4 py-2 rounded-full hover:bg-gray-200 transition-colors shrink-0"
          >
            + Upload video
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="border-b border-[#272727] mb-6">
        <span className="inline-block text-sm font-semibold text-white border-b-2 border-white pb-3">
          Videos
        </span>
      </div>

      {/* Videos grid */}
      {uploads.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <p className="text-4xl mb-4">📹</p>
          <p>{isOwner ? 'You haven\'t uploaded any videos yet.' : 'No videos uploaded yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {uploads.map((v) => (
            <VideoCard
              key={v.id}
              upload={{ ...v, user: { id: user.id, username: user.username, channelName: user.channelName, profilePicture: user.profilePicture } }}
              onDelete={isOwner ? handleDelete : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
