interface Props {
  url: string
  thumbnail: string
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v')
    if (u.hostname === 'youtu.be') return u.pathname.slice(1)
    if (u.pathname.includes('/embed/')) return u.pathname.split('/embed/')[1].split('/')[0]
  } catch {}
  return null
}

function getVimeoId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('vimeo.com')) {
      const match = u.pathname.match(/\/(\d+)/)
      return match ? match[1] : null
    }
  } catch {}
  return null
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)
}

export default function VideoPlayer({ url, thumbnail }: Props) {
  const youtubeId = getYouTubeId(url)
  const vimeoId = getVimeoId(url)

  if (youtubeId) {
    return (
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  if (vimeoId) {
    return (
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
          title="Vimeo video player"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  if (isDirectVideo(url)) {
    return (
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
        <video
          src={url}
          poster={thumbnail}
          controls
          autoPlay
          className="w-full h-full"
        />
      </div>
    )
  }

  // Fallback: show thumbnail with link-out
  return (
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative group">
      <img src={thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors"
      >
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
          ▶
        </div>
      </a>
    </div>
  )
}
