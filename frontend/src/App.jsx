import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import { ScrollRestore } from './components/ScrollToTop'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Projects from './pages/Projects'

// 按需加载：文章详情（Markdown 渲染）与整个管理后台
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'))
const Login = lazy(() => import('./admin/Login'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const Dashboard = lazy(() => import('./admin/Dashboard'))
const ArticlesAdmin = lazy(() => import('./admin/ArticlesAdmin'))
const ArticleEdit = lazy(() => import('./admin/ArticleEdit'))
const ProjectsAdmin = lazy(() => import('./admin/ProjectsAdmin'))
const SkillsAdmin = lazy(() => import('./admin/SkillsAdmin'))
const ProfileAdmin = lazy(() => import('./admin/ProfileAdmin'))
const ThemeAdmin = lazy(() => import('./admin/ThemeAdmin'))

import PrivateRoute from './admin/PrivateRoute'

function Fallback() {
  return <div className="grid min-h-screen place-items-center muted">加载中...</div>
}

export default function App() {
  return (
    <>
      <ScrollRestore />
      <Suspense fallback={<Fallback />}>
        <Routes>
          {/* 用户端 */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<ArticleDetail />} />
            <Route path="/projects" element={<Projects />} />
          </Route>

          {/* 管理端 */}
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="articles" element={<ArticlesAdmin />} />
            <Route path="articles/new" element={<ArticleEdit />} />
            <Route path="articles/:id" element={<ArticleEdit />} />
            <Route path="projects" element={<ProjectsAdmin />} />
            <Route path="skills" element={<SkillsAdmin />} />
            <Route path="profile" element={<ProfileAdmin />} />
            <Route path="theme" element={<ThemeAdmin />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
