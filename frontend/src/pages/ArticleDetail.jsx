import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { ArrowLeft, Calendar, Eye, Tag } from 'lucide-react'
import 'highlight.js/styles/github-dark.css'
import { publicApi } from '../api/client'
import { useLang } from '../context/LangContext'
import SEO from '../components/SEO'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export default function ArticleDetail() {
  const { id } = useParams()
  const { t } = useLang()
  const [article, setArticle] = useState(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    publicApi
      .article(id)
      .then(setArticle)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="py-40 text-center muted">{t('common.loading')}</div>
  if (error || !article)
    return (
      <div className="py-40 text-center">
        <p className="muted">{t('blog.empty')}</p>
        <Link to="/blog" className="btn-primary mt-6">{t('blog.back')}</Link>
      </div>
    )

  return (
    <>
      <SEO title={article.title} description={article.summary} image={article.cover} />
      <article className="mx-auto max-w-3xl px-6 pt-28 pb-16">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium muted transition hover:text-theme-primary">
          <ArrowLeft size={16} /> {t('blog.back')}
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          {article.category && <span className="eyebrow">{article.category}</span>}
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            {article.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm muted">
            <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(article.createdAt)}</span>
            <span className="flex items-center gap-1"><Eye size={14} /> {article.views}</span>
          </div>

          {article.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Tag size={14} className="muted" />
              {article.tags.map((tg) => (
                <Link
                  key={tg}
                  to={`/blog?tag=${encodeURIComponent(tg)}`}
                  className="rounded-full bg-theme-primary/10 px-2.5 py-0.5 text-xs font-medium text-theme-primary"
                >
                  #{tg}
                </Link>
              ))}
            </div>
          )}

          {article.cover && (
            <img src={article.cover} alt={article.title} className="mt-6 w-full rounded-2xl" />
          )}

          <div className="prose-article mt-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {article.content || ''}
            </ReactMarkdown>
          </div>
        </motion.div>
      </article>
    </>
  )
}
