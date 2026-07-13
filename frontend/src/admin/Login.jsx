import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, User, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username.trim(), password)
      navigate('/admin')
    } catch (err) {
      setError(err?.response?.data?.message || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e] px-6">
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        <div className="flex flex-col items-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <Lock size={28} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-white">管理后台</h1>
          <p className="mt-1 text-sm text-white/50">登录以管理你的网站内容</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 rounded-2xl bg-white/10 p-6 backdrop-blur-xl ring-1 ring-white/10">
          <label className="mb-1 block text-xs text-white/60">用户名</label>
          <div className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2.5">
            <User size={16} className="text-gray-400" />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-800 outline-none"
              placeholder="admin"
            />
          </div>

          <label className="mb-1 mt-4 block text-xs text-white/60">密码</label>
          <div className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2.5">
            <Lock size={16} className="text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-800 outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="mt-3 text-center text-xs text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-500 py-2.5 font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            登录
          </button>

          <p className="mt-4 text-center text-xs text-white/40">
            默认账号：admin / admin123
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-white/30">Powered by Flask + React</p>
      </motion.div>
    </div>
  )
}
