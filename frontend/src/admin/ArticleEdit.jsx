import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { adminApi } from '../api/client'
import { useTheme } from '../context/ThemeContext'
import ImageUpload from './ImageUpload'

const EMPTY = {
  title: '', summary: '', category: '技术', tags: [], cover: '',
  content: '# 新文章\n\n开始写作...', published: true,
}

export default function ArticleEdit() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { dark } = useTheme()

  const [form, setForm] = useState(EMPTY)
  const [tagsInput, setTagsInput] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    adminApi
      .article(id)
      .then((data) => {
        setForm({ ...EMPTY, ...data })
        setTagsInput((data.tags || []).join(', '))
      })
      .catch(() => setError('加载文章失败'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const onSave = async () => {
    if (!form.title.trim()) {
      setError('标题不能为空')
      return
    }
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      tags: tagsInput.split(',').map((s) => s.trim()).filter(Boolean),
    }
    try {
      if (isEdit) await adminApi.updateArticle(id, payload)
      else await adminApi.createArticle(payload)
      navigate('/admin/articles')
    } catch (err) {
      setError(err?.response?.data?.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="py-20 text-center text-gray-400">加载中...</div>

  return (
    <div>
      <button onClick={() => navigate('/admin/articles')} className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-theme-primary">
        <ArrowLeft size={16} /> 返回列表
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gradient">{isEdit ? '编辑文章' : '新建文章'}</h1>
        <button onClick={onSave} disabled={saving} className="btn-primary !px-4 !py-2 !text-sm disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 保存
        </button>
      </div>

      {error && <p className="mt-3 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_280px]">
        {/* 主编辑区 */}
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <label className="mb-1 block text-xs font-medium text-gray-500">标题</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} className="input-field" placeholder="文章标题" />

            <label className="mb-1 mt-4 block text-xs font-medium text-gray-500">摘要</label>
            <textarea value={form.summary} onChange={(e) => set('summary', e.target.value)} rows={2} className="input-field resize-none" placeholder="一句话摘要" />
          </div>

          <div className="overflow-hidden rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100" data-color-mode={dark ? 'dark' : 'light'}>
            <label className="mb-2 block px-2 pt-1 text-xs font-medium text-gray-500">正文（Markdown）</label>
            <MDEditor value={form.content} onChange={(v) => set('content', v || '')} height={460} />
          </div>
        </div>

        {/* 侧栏设置 */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">分类</label>
              <input value={form.category} onChange={(e) => set('category', e.target.value)} className="input-field" placeholder="技术" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">标签（英文逗号分隔）</label>
              <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="input-field" placeholder="React, 全栈" />
            </div>
            <ImageUpload value={form.cover} onChange={(url) => set('cover', url)} />
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">发布</span>
              <button
                type="button"
                onClick={() => set('published', !form.published)}
                className={`relative h-6 w-11 rounded-full transition ${form.published ? 'bg-theme-primary' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${form.published ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
