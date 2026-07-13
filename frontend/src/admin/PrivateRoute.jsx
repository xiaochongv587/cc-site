import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// 保护后台路由：未登录跳转到登录页
export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#1a0b2e] text-white/70">
        加载中...
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}
