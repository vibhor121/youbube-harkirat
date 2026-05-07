import { Link, useNavigate } from 'react-router-dom'
import type { Upload } from '../types'

function resolveThumbnail(url: string): string {
  try {
    const u = new URL(url)
    let ytId: string | null = null
    if (u.hostname === 'youtu.be') ytId = u.pathname.slice(1).split('?')[0]
    else if (u.hostname.includes('youtube.com')) ytId = u.searchParams.get('v')
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
  } catch {}
  return url
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
  return `${Math.floor(seconds / 2592000)}mo ago`
}

interface Props {
  upload: Upload
  onDelete?: (id: string) => void
}

export default function VideoCard({ upload, onDelete }: Props) {
  const channelName = upload.user?.channelName ?? 'Unknown Channel'
  const userId = upload.user?.id ?? upload.userId
  const navigate = useNavigate()

  return (
    <div className="group flex flex-col gap-2">
      <div
        className="relative w-full aspect-video bg-[#1f1f1f] rounded-xl overflow-hidden cursor-pointer"
        onClick={() => navigate(`/video/${upload.id}`)}
      >
        <img
          src={resolveThumbnail(upload.thumbnail)}
          alt="thumbnail"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/320x180/1f1f1f/555?text=Video'
          }}
        />
      </div>

      <div className="flex gap-3">
        <Link to={`/profile/${userId}`} className="shrink-0">
          <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
            {channelName[0]?.toUpperCase()}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            to={`/video/${upload.id}`}
            className="block text-sm font-semibold text-white leading-snug line-clamp-2 hover:text-gray-300"
          >
            {channelName}'s upload
          </Link>
          <Link
            to={`/profile/${userId}`}
            className="text-xs text-gray-400 hover:text-gray-300 mt-0.5 block"
          >
            {channelName}
          </Link>
          <span className="text-xs text-gray-500">{timeAgo(upload.createdAt)}</span>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(upload.id)}
            className="shrink-0 text-gray-600 hover:text-red-500 text-lg leading-none self-start"
            title="Delete"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
