import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Plus, Pencil, Trash2, Eye, Calendar, Tag } from 'lucide-react'
import { adminApi } from '../api/client'
import { PageHeading } from './Dashboard'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export default function ArticlesAdmin() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminApi.articles().then(setArticles).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onDelete = async (id) => {
    if (!window.confirm('确定删除这篇文章吗？')) return
    await adminApi.deleteArticle(id)
    load()
  }

  return (
    <div>
      <PageHeading
        icon={FileText}
        title="文章管理"
        subtitle="管理你的博客文章内容"
        action={
          <Link to="/admin/articles/new" className="btn-primary !px-4 !py-2 !text-sm">
            <Plus size={16} /> 新建文章
          </Link>
        }
      />

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 text-left text-xs text-gray-400">
            <tr>
              <th className="px-5 py-3 font-medium">标题</th>
              <th className="px-3 py-3 font-medium">分类</th>
              <th className="px-3 py-3 font-medium">状态</th>
              <th className="px-3 py-3 font-medium">阅读量</th>
              <th className="px-3 py-3 font-medium">创建时间</th>
              <th className="px-5 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="py-16 text-center text-gray-400">加载中...</td></tr>
            ) : articles.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-gray-400">暂无文章</td></tr>
            ) : (
              articles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">{a.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{a.summary}</p>
                  </td>
                  <td className="px-3 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-50 px-2 py-0.5 text-xs text-fuchsia-600">
                      <Tag size={11} /> {a.category}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    {a.published ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">✓ 已发布</span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">草稿</span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-gray-500">
                    <span className="flex items-center gap-1"><Eye size={13} /> {a.views}</span>
                  </td>
                  <td className="px-3 py-4 text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={13} /> {formatDate(a.createdAt)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/articles/${a.id}`} className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition hover:bg-theme-primary/10 hover:text-theme-primary">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => onDelete(a.id)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition hover:bg-rose-50 hover:text-rose-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
