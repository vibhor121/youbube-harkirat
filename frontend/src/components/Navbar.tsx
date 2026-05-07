import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { isAuthenticated, userId, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      navigate(`/?q=${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/')
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-[#0f0f0f] border-b border-[#272727]">
      <Link to="/" className="flex items-center gap-1 text-white no-underline">
        <div className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">▶</div>
        <span className="text-xl font-bold tracking-tight">YourTube</span>
      </Link>

      <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 hidden sm:block">
        <div className="flex">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#121212] border border-[#303030] rounded-l-full px-4 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="bg-[#222] border border-l-0 border-[#303030] px-5 rounded-r-full hover:bg-[#333]">
            🔍
          </button>
        </div>
      </form>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link
              to="/upload"
              className="flex items-center gap-1 text-sm text-white bg-[#272727] hover:bg-[#3f3f3f] px-3 py-1.5 rounded-full transition-colors"
            >
              <span>＋</span> Upload
            </Link>
            <Link
              to={`/profile/${userId}`}
              className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm"
            >
              U
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm text-blue-400 border border-blue-400 hover:bg-blue-400/10 px-3 py-1.5 rounded-full transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}
