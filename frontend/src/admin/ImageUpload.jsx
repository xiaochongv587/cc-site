import { useRef, useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { adminApi } from '../api/client'

// 图片上传：上传成功后回填 URL
export default function ImageUpload({ value, onChange, label = '封面图片' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const onSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const res = await adminApi.upload(file)
      onChange(res.url)
    } catch (err) {
      setError(err?.response?.data?.message || '上传失败')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative">
            <img src={value} alt="预览" className="h-16 w-24 rounded-lg object-cover ring-1 ring-gray-200" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-white"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-16 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 transition hover:border-theme-primary hover:text-theme-primary"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span className="text-[10px]">上传</span>
          </button>
        )}
        <div className="flex-1">
          <input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="或粘贴图片 URL"
            className="input-field !py-2 text-xs"
          />
          {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onSelect} />
    </div>
  )
}
