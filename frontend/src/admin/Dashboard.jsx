import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, FolderGit2, Award, Eye, Sparkles, PlusCircle, Lightbulb,
} from 'lucide-react'
import { adminApi } from '../api/client'

export default function Dashboard() {
  const [stats, setStats] = useState({ articles: 0, projects: 0, skills: 0, views: 0 })

  useEffect(() => {
    adminApi.dashboard().then(setStats).catch(() => {})
  }, [])

  const cards = [
    { label: '文章总数', value: stats.articles, icon: FileText, bar: 'bg-blue-500', chip: 'from-blue-500 to-blue-600' },
    { label: '项目总数', value: stats.projects, icon: FolderGit2, bar: 'bg-emerald-500', chip: 'from-emerald-500 to-green-600' },
    { label: '技能数量', value: stats.skills, icon: Award, bar: 'bg-fuchsia-500', chip: 'from-fuchsia-500 to-pink-600' },
    { label: '总阅读量', value: stats.views, icon: Eye, bar: 'bg-orange-500', chip: 'from-orange-400 to-orange-500' },
  ]

  return (
    <div>
      <PageHeading icon={Sparkles} title="概览" subtitle="查看网站整体数据情况" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="relative overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <span className={`absolute inset-x-0 top-0 h-1 ${c.bar}`} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400">{c.label}</p>
                <p className="mt-2 text-3xl font-extrabold">{c.value}</p>
              </div>
              <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.chip} text-white shadow`}>
                <c.icon size={20} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <h2 className="flex items-center gap-2 text-lg font-bold">📈 欢迎使用管理后台</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          在这里你可以管理文章、项目、技能和个人信息。使用左侧导航切换不同的管理模块。
        </p>
        <div className="mt-4 flex gap-3">
          <Link to="/admin/articles" className="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/30">
            管理文章
          </Link>
          <Link to="/admin/projects" className="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/30">
            管理项目
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <FileText size={16} className="text-theme-primary" /> 快速操作
          </h3>
          <div className="mt-4 space-y-2">
            <QuickAction to="/admin/articles/new" icon={FileText} label="新建文章" />
            <QuickAction to="/admin/projects" icon={FolderGit2} label="新建项目" />
            <QuickAction to="/admin/skills" icon={PlusCircle} label="添加技能" />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Lightbulb size={16} className="text-amber-500" /> 提示
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-500">
            <li>• 文章支持 Markdown 格式编写</li>
            <li>• 精选项目会在首页优先展示</li>
            <li>• 技能熟练度用于首页进度条展示</li>
            <li>• 个人信息会显示在网站各处</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-theme-primary/10 hover:text-theme-primary">
      <Icon size={16} /> {label}
    </Link>
  )
}

export function PageHeading({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">
          {Icon && <Icon size={22} className="text-theme-primary" />}
          <span className="text-gradient">{title}</span>
        </h1>
        {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
