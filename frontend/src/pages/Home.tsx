import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import VideoCard from '../components/VideoCard'
import type { Upload } from '../types'

export default function Home() {
  const [videos, setVideos] = useState<Upload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()

  const query = searchParams.get('q')?.toLowerCase().trim() ?? ''

  useEffect(() => {
    api
      .getVideos()
      .then(setVideos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-gray-400 mt-20">
        <p className="text-4xl mb-4">⚠️</p>
        <p>{error}</p>
      </div>
    )
  }

  const filtered = query
    ? videos.filter(
        (v) =>
          v.user?.channelName?.toLowerCase().includes(query) ||
          v.user?.username?.toLowerCase().includes(query),
      )
    : videos

  if (videos.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-20">
        <p className="text-5xl mb-4">📺</p>
        <p className="text-lg">No videos yet. Be the first to upload!</p>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-20">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-lg">No results for "{searchParams.get('q')}"</p>
      </div>
    )
  }

  return (
    <>
      {query && (
        <p className="text-gray-400 text-sm mb-4">
          Showing results for <span className="text-white font-medium">"{searchParams.get('q')}"</span>
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
        {filtered.map((v) => (
          <VideoCard key={v.id} upload={v} />
        ))}
      </div>
    </>
  )
}
