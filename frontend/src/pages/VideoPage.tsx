import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import VideoPlayer from '../components/VideoPlayer'
import VideoCard from '../components/VideoCard'
import type { Upload } from '../types'

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds} seconds ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`
  return `${Math.floor(seconds / 2592000)} months ago`
}

export default function VideoPage() {
  const { id } = useParams<{ id: string }>()
  const { userId } = useAuth()
  const navigate = useNavigate()

  const [video, setVideo] = useState<Upload | null>(null)
  const [related, setRelated] = useState<Upload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [descExpanded, setDescExpanded] = useState(false)

  const isOwner = userId === video?.userId

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setDescExpanded(false)
    Promise.all([api.getUpload(id), api.getVideos()])
      .then(([upload, all]) => {
        setVideo(upload)
        setRelated(all.filter((v) => v.id !== id))
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!video || !confirm('Delete this video?')) return
    try {
      await api.deleteUpload(video.id)
      navigate('/')
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

  if (error || !video) {
    return (
      <div className="text-center text-gray-400 mt-20">
        <p className="text-4xl mb-4">⚠️</p>
        <p>{error || 'Video not found'}</p>
      </div>
    )
  }

  const channel = video.user
  const description = channel?.description || ''

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main column */}
      <div className="flex-1 min-w-0">
        {/* Player */}
        <VideoPlayer url={video.videoUrl} thumbnail={video.thumbnail} />

        {/* Title */}
        <h1 className="text-lg font-bold mt-4 leading-snug">
          {channel?.channelName}'s video
        </h1>

        {/* Channel row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pb-3 border-b border-[#272727]">
          <Link to={`/profile/${video.userId}`} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold shrink-0">
              {channel?.channelName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-sm font-semibold hover:text-gray-300 transition-colors">
                {channel?.channelName ?? 'Unknown Channel'}
              </p>
              <p className="text-xs text-gray-400">
                {(channel?.subscriberCount ?? 0).toLocaleString()} subscribers
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button className="bg-white text-black font-semibold text-sm px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
              Subscribe
            </button>

            <button className="bg-[#272727] hover:bg-[#3f3f3f] text-white text-sm px-4 py-2 rounded-full transition-colors">
              👍 Like
            </button>

            <button className="bg-[#272727] hover:bg-[#3f3f3f] text-white text-sm px-4 py-2 rounded-full transition-colors">
              Share
            </button>

            {isOwner && (
              <button
                onClick={handleDelete}
                className="bg-[#272727] hover:bg-red-700 text-red-400 hover:text-white text-sm px-4 py-2 rounded-full transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Description box */}
        <div
          className="bg-[#1f1f1f] rounded-xl p-4 mt-4 cursor-pointer"
          onClick={() => setDescExpanded((p) => !p)}
        >
          <p className="text-sm text-gray-300 font-semibold mb-1">
            {timeAgo(video.createdAt)}
          </p>

          {description ? (
            <>
              <p className={`text-sm text-gray-400 whitespace-pre-wrap ${!descExpanded ? 'line-clamp-2' : ''}`}>
                {description}
              </p>
              <button className="text-sm font-semibold text-white mt-1 hover:text-gray-300">
                {descExpanded ? 'Show less' : '...more'}
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-500">No description</p>
          )}
        </div>

        {/* Comments placeholder */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Comments</h2>
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-[#272727] shrink-0" />
            <input
              type="text"
              placeholder="Add a comment…"
              className="flex-1 bg-transparent border-b border-[#272727] focus:border-white outline-none text-sm text-white placeholder-gray-600 pb-1 transition-colors"
            />
          </div>
          <p className="text-xs text-gray-600 mt-6">Comments are not yet supported in the backend.</p>
        </div>
      </div>

      {/* Related videos sidebar */}
      <div className="lg:w-[360px] shrink-0">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Up next</h2>
        {related.length === 0 ? (
          <p className="text-sm text-gray-500">No other videos yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {related.map((v) => (
              <Link
                key={v.id}
                to={`/video/${v.id}`}
                className="flex gap-3 group hover:bg-[#1f1f1f] rounded-xl p-2 transition-colors"
              >
                <div className="w-40 aspect-video bg-[#1f1f1f] rounded-lg overflow-hidden shrink-0">
                  <img
                    src={v.thumbnail}
                    alt="thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/160x90/1f1f1f/555?text=Video'
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-2 leading-snug">
                    {v.user?.channelName ?? 'Unknown'}'s video
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{v.user?.channelName}</p>
                  <p className="text-xs text-gray-500">{timeAgo(v.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
