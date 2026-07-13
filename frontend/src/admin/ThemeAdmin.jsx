import { useEffect, useState } from 'react'
import { Palette, RotateCcw, Save, Check, Loader2, Sparkles } from 'lucide-react'
import { adminApi } from '../api/client'
import { PageHeading } from './Dashboard'
import { useTheme, applyThemeVars } from '../context/ThemeContext'

const PRESETS = [
  { name: '紫粉渐变', primary: '#8B5CF6', secondary: '#EC4899', accent: '#F59E0B', dot: 'from-violet-500 to-pink-500' },
  { name: '蓝青清新', primary: '#3B82F6', secondary: '#06B6D4', accent: '#F59E0B', dot: 'from-blue-500 to-cyan-500' },
  { name: '绿松自然', primary: '#10B981', secondary: '#14B8A6', accent: '#F59E0B', dot: 'from-emerald-500 to-teal-500' },
  { name: '橙红热情', primary: '#F97316', secondary: '#EF4444', accent: '#F59E0B', dot: 'from-orange-500 to-red-500' },
  { name: '暗黑紫夜', primary: '#6366F1', secondary: '#A855F7', accent: '#F59E0B', dot: 'from-indigo-500 to-purple-500' },
  { name: '极简白', primary: '#3B82F6', secondary: '#6366F1', accent: '#F59E0B', dot: 'from-blue-500 to-indigo-500' },
]

const BG_STYLES = ['渐变背景', '纯色背景', '网格背景']
const RADIUS_OPTIONS = ['直角 (0px)', '小圆角 (8px)', '中圆角 (16px)', '大圆角 (24px)']

const DEFAULT = { primary: '#3B82F6', secondary: '#6366F1', accent: '#F59E0B', preset: '极简白', bgStyle: '渐变背景', radius: '小圆角 (8px)' }

export default function ThemeAdmin() {
  const { updateTheme } = useTheme()
  const [form, setForm] = useState(DEFAULT)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    adminApi.getTheme().then((t) => setForm({ ...DEFAULT, ...t })).catch(() => {})
  }, [])

  // 表单变化时实时预览
  useEffect(() => {
    applyThemeVars(form)
  }, [form])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const applyPreset = (preset) => {
    setForm((f) => ({ ...f, primary: preset.primary, secondary: preset.secondary, accent: preset.accent, preset: preset.name }))
  }

  const onReset = () => setForm(DEFAULT)

  const onSave = async () => {
    setSaving(true)
    try {
      const t = await adminApi.updateTheme(form)
      updateTheme(t)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeading
        icon={Palette}
        title="主题管理"
        subtitle="自定义网站的颜色和样式"
        action={
          <div className="flex gap-2">
            <button onClick={onReset} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <RotateCcw size={15} /> 重置
            </button>
            <button onClick={onSave} disabled={saving} className="btn-primary !px-4 !py-2 !text-sm disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
              {saved ? '已保存' : '保存配置'}
            </button>
          </div>
        }
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* 预设主题 */}
        <Panel title="预设主题">
          <div className="space-y-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                  form.preset === p.name ? 'border-theme-primary bg-theme-primary/5' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className={`h-5 w-5 rounded-md bg-gradient-to-br ${p.dot}`} />
                <span className="font-medium">{p.name}</span>
                {form.preset === p.name && <Check size={15} className="ml-auto text-theme-primary" />}
              </button>
            ))}
          </div>
        </Panel>

        {/* 颜色自定义 */}
        <Panel title="颜色自定义">
          <div className="space-y-4">
            <ColorField label="主色调" value={form.primary} onChange={(v) => set('primary', v)} />
            <ColorField label="次要色" value={form.secondary} onChange={(v) => set('secondary', v)} />
            <ColorField label="强调色" value={form.accent} onChange={(v) => set('accent', v)} />
            <p className="text-xs text-gray-400">提示：保存后会应用到全站并动态生效。</p>
          </div>
        </Panel>

        {/* 实时预览 */}
        <Panel title="实时预览">
          <div className="rounded-xl border border-gray-100 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-theme-gradient text-white">
              <Sparkles size={20} />
            </span>
            <h3 className="mt-3 font-bold">网站标题</h3>
            <p className="mt-1 text-xs text-gray-400">这是一段主题预览示例，展示你选择的效果</p>
            <div className="mt-3 flex gap-2">
              <span className="btn-primary !px-3 !py-1.5 !text-xs">主题按钮</span>
              <span className="btn-secondary !px-3 !py-1.5 !text-xs">次要按钮</span>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
              <span className="h-2 w-2 rounded-full" style={{ background: form.accent }} /> 状态指示器
            </div>
          </div>
        </Panel>
      </div>

      {/* 附加设置 */}
      <Panel title="附加设置" className="mt-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">背景样式</label>
            <select value={form.bgStyle} onChange={(e) => set('bgStyle', e.target.value)} className="input-field">
              {BG_STYLES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">圆角大小</label>
            <select value={form.radius} onChange={(e) => set('radius', e.target.value)} className="input-field">
              {RADIUS_OPTIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </Panel>
    </div>
  )
}

function Panel({ title, children, className = '' }) {
  return (
    <div className={`rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 ${className}`}>
      <h3 className="mb-4 text-sm font-bold text-gray-700">{title}</h3>
      {children}
    </div>
  )
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1.5">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-sm uppercase outline-none" />
      </div>
    </div>
  )
}
