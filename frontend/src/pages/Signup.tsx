import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const GENDERS = ['Male', 'Female', 'Others'] as const

export default function Signup() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    channelName: '',
    gender: 'Male' as (typeof GENDERS)[number],
    description: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.signup(form)
      navigate('/login')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const inputClass =
    'w-full bg-[#121212] border border-[#303030] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors'
  const labelClass = 'block text-sm text-gray-400 mb-1.5'

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-[#1f1f1f] rounded-2xl p-8 border border-[#272727]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1 mb-2">
            <div className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">▶</div>
            <span className="text-xl font-bold">YourTube</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-200">Create account</h1>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Username</label>
            <input type="text" value={form.username} onChange={set('username')} className={inputClass} required minLength={3} />
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input type="password" value={form.password} onChange={set('password')} className={inputClass} required minLength={6} />
          </div>

          <div>
            <label className={labelClass}>Channel name</label>
            <input type="text" value={form.channelName} onChange={set('channelName')} className={inputClass} required minLength={3} />
          </div>

          <div>
            <label className={labelClass}>Gender</label>
            <select value={form.gender} onChange={set('gender')} className={inputClass + ' cursor-pointer'}>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Description <span className="text-gray-600">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={2}
              className={inputClass + ' resize-none'}
              placeholder="Tell viewers about your channel"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-1"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
