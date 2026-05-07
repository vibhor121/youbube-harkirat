import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../contexts/AuthContext'

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0]
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v')
    return null
  } catch {
    return null
  }
}

export default function Upload() {
  const [form, setForm] = useState({ videoUrl: '', thumbnail: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { userId } = useAuth()
  const navigate = useNavigate()

  const handleVideoUrlChange = (url: string) => {
    const ytId = extractYouTubeId(url)
    setForm((prev) => ({
      videoUrl: url,
      thumbnail: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : prev.thumbnail,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.uploadVideo(form)
      navigate(`/profile/${userId}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-[#121212] border border-[#303030] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors'

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Upload video</h1>

      <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#272727]">
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {form.thumbnail && (
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2">Thumbnail preview</p>
            <img
              src={form.thumbnail}
              alt="thumbnail preview"
              className="w-full aspect-video object-cover rounded-xl bg-[#121212]"
              onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Video URL</label>
            <input
              type="url"
              value={form.videoUrl}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              className={inputClass}
              placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Thumbnail URL</label>
            <input
              type="url"
              value={form.thumbnail}
              onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
              className={inputClass}
              placeholder="https://..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-1"
          >
            {loading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  )
}
