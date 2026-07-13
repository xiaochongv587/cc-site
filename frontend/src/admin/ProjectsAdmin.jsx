import { useEffect, useState } from 'react'
import { FolderGit2, Plus, Pencil, Trash2, ExternalLink, Star, X, Loader2 } from 'lucide-react'
import { adminApi } from '../api/client'
import { PageHeading } from './Dashboard'
import ImageUpload from './ImageUpload'

const EMPTY = {
  name: '', description: '', techStack: [], cover: '',
  githubUrl: '', demoUrl: '', stars: 0, featured: false, sortOrder: 0,
}

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | {..}

  const load = () => {
    setLoading(true)
    adminApi.projects().then(setProjects).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onDelete = async (id) => {
    if (!window.confirm('确定删除该项目吗？')) return
    await adminApi.deleteProject(id)
    load()
  }

  return (
    <div>
      <PageHeading
        icon={FolderGit2}
        title="项目管理"
        subtitle="管理你的作品集项目"
        action={
          <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary !px-4 !py-2 !text-sm">
            <Plus size={16} /> 新建项目
          </button>
        }
      />

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 text-left text-xs text-gray-400">
            <tr>
              <th className="px-5 py-3 font-medium">名称</th>
              <th className="px-3 py-3 font-medium">技术栈</th>
              <th className="px-3 py-3 font-medium">精选</th>
              <th className="px-3 py-3 font-medium">链接</th>
              <th className="px-5 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="py-16 text-center text-gray-400">加载中...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan={5} className="py-16 text-center text-gray-400">暂无项目</td></tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{p.description}</p>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(p.techStack || []).map((tk) => (
                        <span key={tk} className="rounded bg-theme-primary/10 px-1.5 py-0.5 text-xs text-theme-primary">{tk}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    {p.featured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">
                        <Star size={11} className="fill-amber-500 text-amber-500" /> 精选
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    {p.githubUrl ? (
                      <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-theme-primary">
                        <ExternalLink size={15} />
                      </a>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditing({ ...EMPTY, ...p })} className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition hover:bg-theme-primary/10 hover:text-theme-primary">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => onDelete(p.id)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition hover:bg-rose-50 hover:text-rose-500">
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

      {editing && (
        <ProjectModal
          project={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </div>
  )
}

function ProjectModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState(project)
  const [techInput, setTechInput] = useState((project.techStack || []).join(', '))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const isEdit = Boolean(project.id)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const onSave = async () => {
    if (!form.name.trim()) { setError('项目名称不能为空'); return }
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      stars: Number(form.stars) || 0,
      sortOrder: Number(form.sortOrder) || 0,
      techStack: techInput.split(',').map((s) => s.trim()).filter(Boolean),
    }
    try {
      if (isEdit) await adminApi.updateProject(project.id, payload)
      else await adminApi.createProject(payload)
      onSaved()
    } catch (err) {
      setError(err?.response?.data?.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{isEdit ? '编辑项目' : '新建项目'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

        <div className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <Field label="项目名称"><input value={form.name} onChange={(e) => set('name', e.target.value)} className="input-field" /></Field>
          <Field label="描述"><textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} className="input-field resize-none" /></Field>
          <Field label="技术栈（逗号分隔）"><input value={techInput} onChange={(e) => setTechInput(e.target.value)} className="input-field" placeholder="React, Flask" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="GitHub 链接"><input value={form.githubUrl} onChange={(e) => set('githubUrl', e.target.value)} className="input-field" placeholder="https://" /></Field>
            <Field label="演示链接"><input value={form.demoUrl} onChange={(e) => set('demoUrl', e.target.value)} className="input-field" placeholder="https://" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Star 数"><input type="number" value={form.stars} onChange={(e) => set('stars', e.target.value)} className="input-field" /></Field>
            <Field label="排序（越小越前）"><input type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} className="input-field" /></Field>
          </div>
          <ImageUpload value={form.cover} onChange={(url) => set('cover', url)} label="项目封面" />
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">设为精选</span>
            <button type="button" onClick={() => set('featured', !form.featured)} className={`relative h-6 w-11 rounded-full transition ${form.featured ? 'bg-theme-primary' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${form.featured ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">取消</button>
          <button onClick={onSave} disabled={saving} className="btn-primary !px-4 !py-2 !text-sm disabled:opacity-60">
            {saving && <Loader2 size={15} className="animate-spin" />} 保存
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  )
}
