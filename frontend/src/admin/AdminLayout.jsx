import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, FolderGit2, Award, Palette, UserCircle,
  LogOut, ExternalLink,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/admin', label: '概览', icon: LayoutDashboard, end: true },
  { to: '/admin/articles', label: '文章管理', icon: FileText },
  { to: '/admin/projects', label: '项目管理', icon: FolderGit2 },
  { to: '/admin/skills', label: '技能管理', icon: Award },
  { to: '/admin/theme', label: '主题管理', icon: Palette },
  { to: '/admin/profile', label: '个人信息', icon: UserCircle },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-theme-gradient text-white shadow'
        : 'text-gray-500 hover:bg-gray-100 hover:text-theme-primary'
    }`

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* 侧边栏 */}
      <aside className="fixed inset-y-0 left-0 flex w-56 flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-theme-gradient font-extrabold text-white">
            W
          </span>
          <div>
            <p className="text-sm font-bold leading-tight">管理后台</p>
            <p className="text-[11px] text-gray-400">Personal Website</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>
              <n.icon size={17} />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 hover:bg-gray-100"
          >
            <ExternalLink size={14} /> 查看网站
          </a>
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-theme-primary/10 text-sm font-bold text-theme-primary">
              {(user?.username || 'A').slice(0, 1).toUpperCase()}
            </span>
            <span className="text-sm font-medium">{user?.username || 'admin'}</span>
          </div>
          <button
            onClick={onLogout}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-rose-50 hover:text-rose-500"
          >
            <LogOut size={15} /> 退出登录
          </button>
        </div>
      </aside>

      {/* 内容区 */}
      <main className="ml-56 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
