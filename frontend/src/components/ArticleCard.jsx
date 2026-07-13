import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Eye, ArrowRight } from 'lucide-react'
import { useLang } from '../context/LangContext'

// 依据标题生成稳定的渐变，作为无封面时的占位
const GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-sky-500 to-cyan-500',
  'from-fuchsia-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-rose-500 to-pink-600',
  'from-emerald-500 to-teal-600',
]

function pickGradient(seed = '') {
  let sum = 0
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i)
  return GRADIENTS[sum % GRADIENTS.length]
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export default function ArticleCard({ article }) {
  const { t } = useLang()
  const gradient = pickGradient(article.title)

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group card-solid overflow-hidden"
    >
      <Link to={`/blog/${article.id}`} className="block">
        <div className={`relative h-40 bg-gradient-to-br ${gradient}`}>
          {article.cover ? (
            <img
              src={article.cover}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-6xl font-black text-white/25">
              {article.title.slice(0, 1)}
            </span>
          )}
          {article.category && (
            <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-gray-700 backdrop-blur">
              {article.category}
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="line-clamp-1 text-base font-bold group-hover:text-theme-primary transition">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm muted">{article.summary}</p>
          <div className="mt-4 flex items-center justify-between text-xs muted">
            <span className="flex items-center gap-1">
              <Calendar size={13} /> {formatDate(article.createdAt)}
            </span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye size={13} /> {article.views}
              </span>
              <span className="flex items-center gap-1 text-theme-primary font-medium">
                {t('articles.read')} <ArrowRight size={13} />
              </span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
