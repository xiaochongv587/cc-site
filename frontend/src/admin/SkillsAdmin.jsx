import { useEffect, useState } from 'react'
import { Award, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'
import { adminApi } from '../api/client'
import { PageHeading } from './Dashboard'

const EMPTY = { name: '', category: '前端', level: 80, sortOrder: 0 }
const CATEGORIES = ['前端', '后端', '数据库', 'DevOps', '运维', '工具']

export default function SkillsAdmin() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  const load = () => {
    setLoading(true)
    adminApi.skills().then(setSkills).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onDelete = async (id) => {
    if (!window.confirm('确定删除该技能吗？')) return
    await adminApi.deleteSkill(id)
    load()
  }

  return (
    <div>
      <PageHeading
        icon={Award}
        title="技能管理"
        subtitle="管理你的技能和熟练度"
        action={
          <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary !px-4 !py-2 !text-sm">
            <Plus size={16} /> 添加技能
          </button>
        }
      />

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 text-left text-xs text-gray-400">
            <tr>
              <th className="px-5 py-3 font-medium">名称</th>
              <th className="px-3 py-3 font-medium">分类</th>
              <th className="px-3 py-3 font-medium">熟练度</th>
              <th className="px-5 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="py-16 text-center text-gray-400">加载中...</td></tr>
            ) : skills.length === 0 ? (
              <tr><td colSpan={4} className="py-16 text-center text-gray-400">暂无技能</td></tr>
            ) : (
              skills.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-4 font-semibold text-gray-800">{s.name}</td>
                  <td className="px-3 py-4">
                    <span className="rounded-full bg-fuchsia-50 px-2 py-0.5 text-xs text-fuchsia-600">{s.category}</span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-40 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${s.level}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-500">{s.level}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditing({ ...EMPTY, ...s })} className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition hover:bg-theme-primary/10 hover:text-theme-primary">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => onDelete(s.id)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition hover:bg-rose-50 hover:text-rose-500">
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
        <SkillModal skill={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />
      )}
    </div>
  )
}

function SkillModal({ skill, onClose, onSaved }) {
  const [form, setForm] = useState(skill)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const isEdit = Boolean(skill.id)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const onSave = async () => {
    if (!form.name.trim()) { setError('技能名称不能为空'); return }
    setSaving(true)
    setError('')
    const payload = { ...form, level: Number(form.level), sortOrder: Number(form.sortOrder) || 0 }
    try {
      if (isEdit) await adminApi.updateSkill(skill.id, payload)
      else await adminApi.createSkill(payload)
      onSaved()
    } catch (err) {
      setError(err?.response?.data?.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{isEdit ? '编辑技能' : '添加技能'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">名称</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">分类</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input-field">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 flex items-center justify-between text-xs font-medium text-gray-500">
              <span>熟练度</span>
              <span className="text-theme-primary">{form.level}%</span>
            </label>
            <input type="range" min={0} max={100} value={form.level} onChange={(e) => set('level', e.target.value)} className="w-full accent-[rgb(var(--theme-primary))]" />
          </div>
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
