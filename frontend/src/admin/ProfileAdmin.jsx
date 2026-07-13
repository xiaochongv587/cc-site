import { useEffect, useState } from 'react'
import { UserCircle, User, Link2, Languages, Save, Check, Loader2, Settings2 } from 'lucide-react'
import { adminApi } from '../api/client'
import { PageHeading } from './Dashboard'
import ImageUpload from './ImageUpload'

const EMPTY = {
  nickname: '', location: '', website: '', email: '', avatar: '',
  social: { github: '', twitter: '', linkedin: '' },
  stats: { coffee: 0, projects: 0, articles: 0, stars: 0 },
  i18n: {
    zh: { bio: '', roles: [], welcome: '', ctaTitle: '', ctaDesc: '' },
    en: { bio: '', roles: [], welcome: '', ctaTitle: '', ctaDesc: '' },
  },
}

export default function ProfileAdmin() {
  const [form, setForm] = useState(EMPTY)
  const [rolesInput, setRolesInput] = useState({ zh: '', en: '' })
  const [langTab, setLangTab] = useState('zh')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    adminApi
      .getProfile()
      .then((data) => {
        const merged = {
          ...EMPTY,
          ...data,
          social: { ...EMPTY.social, ...(data.social || {}) },
          stats: { ...EMPTY.stats, ...(data.stats || {}) },
          i18n: {
            zh: { ...EMPTY.i18n.zh, ...(data.i18n?.zh || {}) },
            en: { ...EMPTY.i18n.en, ...(data.i18n?.en || {}) },
          },
        }
        setForm(merged)
        setRolesInput({
          zh: (merged.i18n.zh.roles || []).join(', '),
          en: (merged.i18n.en.roles || []).join(', '),
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setSocial = (k, v) => setForm((f) => ({ ...f, social: { ...f.social, [k]: v } }))
  const setStat = (k, v) => setForm((f) => ({ ...f, stats: { ...f.stats, [k]: Number(v) || 0 } }))
  const setI18n = (lang, k, v) =>
    setForm((f) => ({ ...f, i18n: { ...f.i18n, [lang]: { ...f.i18n[lang], [k]: v } } }))

  const onSave = async () => {
    setSaving(true)
    const payload = {
      ...form,
      i18n: {
        zh: { ...form.i18n.zh, roles: rolesInput.zh.split(',').map((s) => s.trim()).filter(Boolean) },
        en: { ...form.i18n.en, roles: rolesInput.en.split(',').map((s) => s.trim()).filter(Boolean) },
      },
    }
    try {
      await adminApi.updateProfile(payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="py-20 text-center text-gray-400">加载中...</div>

  const c = form.i18n[langTab]

  return (
    <div>
      <PageHeading
        icon={UserCircle}
        title="个人信息"
        subtitle="管理你的公开个人信息"
        action={
          <button onClick={onSave} disabled={saving} className="btn-primary !px-4 !py-2 !text-sm disabled:opacity-60">
            {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
            {saved ? '已保存' : '保存'}
          </button>
        }
      />

      <div className="mt-6 space-y-5">
        {/* 基本信息 */}
        <Section icon={User} title="基本信息">
          <ImageUpload value={form.avatar} onChange={(url) => set('avatar', url)} label="头像" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="昵称"><input value={form.nickname} onChange={(e) => set('nickname', e.target.value)} className="input-field" /></Field>
            <Field label="位置"><input value={form.location} onChange={(e) => set('location', e.target.value)} className="input-field" placeholder="中国" /></Field>
            <Field label="个人网站"><input value={form.website} onChange={(e) => set('website', e.target.value)} className="input-field" placeholder="https://" /></Field>
            <Field label="公开邮箱"><input value={form.email} onChange={(e) => set('email', e.target.value)} className="input-field" placeholder="you@example.com" /></Field>
          </div>
        </Section>

        {/* 社交链接 */}
        <Section icon={Link2} title="社交链接">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="GitHub"><input value={form.social.github} onChange={(e) => setSocial('github', e.target.value)} className="input-field" placeholder="https://github.com" /></Field>
            <Field label="Twitter"><input value={form.social.twitter} onChange={(e) => setSocial('twitter', e.target.value)} className="input-field" /></Field>
            <Field label="LinkedIn"><input value={form.social.linkedin} onChange={(e) => setSocial('linkedin', e.target.value)} className="input-field" /></Field>
          </div>
        </Section>

        {/* 多语言内容 */}
        <Section icon={Languages} title="多语言内容">
          <div className="mb-4 flex gap-2">
            <LangTab active={langTab === 'zh'} onClick={() => setLangTab('zh')} label="中文" flag="ZH" />
            <LangTab active={langTab === 'en'} onClick={() => setLangTab('en')} label="English" flag="EN" />
          </div>
          <div className="space-y-4">
            <Field label="个人简介"><textarea value={c.bio} onChange={(e) => setI18n(langTab, 'bio', e.target.value)} rows={3} className="input-field resize-none" /></Field>
            <Field label="职业标签（逗号分隔，用于打字机效果）">
              <input value={rolesInput[langTab]} onChange={(e) => setRolesInput((r) => ({ ...r, [langTab]: e.target.value }))} className="input-field" placeholder="全栈工程师, 技术爱好者" />
            </Field>
            <Field label="欢迎语"><input value={c.welcome} onChange={(e) => setI18n(langTab, 'welcome', e.target.value)} className="input-field" placeholder="你好，我是" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CTA 标题"><input value={c.ctaTitle} onChange={(e) => setI18n(langTab, 'ctaTitle', e.target.value)} className="input-field" placeholder="开始合作" /></Field>
              <Field label="CTA 描述"><input value={c.ctaDesc} onChange={(e) => setI18n(langTab, 'ctaDesc', e.target.value)} className="input-field" placeholder="有想法？想要合作？随时联系我！" /></Field>
            </div>
          </div>
        </Section>

        {/* 统计数据 */}
        <Section icon={Settings2} title="统计数据">
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="咖啡杯数"><input type="number" value={form.stats.coffee} onChange={(e) => setStat('coffee', e.target.value)} className="input-field" /></Field>
            <Field label="项目数"><input type="number" value={form.stats.projects} onChange={(e) => setStat('projects', e.target.value)} className="input-field" /></Field>
            <Field label="文章数"><input type="number" value={form.stats.articles} onChange={(e) => setStat('articles', e.target.value)} className="input-field" /></Field>
            <Field label="Star 数"><input type="number" value={form.stats.stars} onChange={(e) => setStat('stars', e.target.value)} className="input-field" /></Field>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-700">
        <Icon size={16} className="text-theme-primary" /> {title}
      </h3>
      <div className="space-y-4">{children}</div>
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

function LangTab({ active, onClick, label, flag }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        active ? 'bg-theme-primary/10 text-theme-primary' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      <span className="text-[10px] font-bold opacity-70">{flag}</span> {label}
    </button>
  )
}
