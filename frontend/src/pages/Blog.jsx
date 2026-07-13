import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, Filter, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { publicApi } from '../api/client'
import { useLang } from '../context/LangContext'
import ArticleCard from '../components/ArticleCard'
import SEO from '../components/SEO'

export default function Blog() {
  const { t } = useLang()
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('all')
  const [tag, setTag] = useState('')
  const [keyword, setKeyword] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    publicApi.categories().then(setCategories).catch(() => {})
    publicApi.tags().then(setTags).catch(() => {})
  }, [])

  // 关键词输入做防抖
  useEffect(() => {
    const timer = setTimeout(() => setSearch(keyword), 400)
    return () => clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    setLoading(true)
    publicApi
      .articles({ page, perPage: 9, category, tag: tag || undefined, q: search || undefined })
      .then((data) => {
        setArticles(data.items)
        setTotal(data.total)
        setPages(data.pages || 1)
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [page, category, tag, search])

  // 筛选变化时回到第一页
  useEffect(() => {
    setPage(1)
  }, [category, tag, search])

  return (
    <>
      <SEO title={t('blog.title')} description={t('blog.subtitle')} />
      <Header t={t} />

      <div className="mx-auto max-w-6xl px-6">
        {/* 搜索与筛选 */}
        <div className="card-solid mt-4 p-5">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'rgb(var(--border-color))' }}>
            <Search size={16} className="muted" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t('blog.search')}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Filter size={15} className="muted" />
            <CategoryChip label={t('blog.all')} active={category === 'all'} onClick={() => setCategory('all')} />
            {categories.map((c) => (
              <CategoryChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
            ))}
          </div>

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Tag size={15} className="muted" />
              {tags.map((tg) => (
                <button
                  key={tg.name}
                  onClick={() => setTag(tag === tg.name ? '' : tg.name)}
                  className={`rounded-full px-2.5 py-0.5 text-xs transition ${
                    tag === tg.name
                      ? 'bg-theme-primary text-white'
                      : 'muted hover:text-theme-primary'
                  }`}
                >
                  #{tg.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 结果计数 */}
        <p className="mt-8 text-sm muted">
          {t('blog.found')} <span className="font-semibold text-theme-primary">{total}</span> {t('blog.articlesUnit')}
        </p>

        {/* 文章网格 */}
        {loading ? (
          <div className="py-20 text-center muted">{t('common.loading')}</div>
        ) : articles.length ? (
          <motion.div layout className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </motion.div>
        ) : (
          <div className="py-20 text-center muted">{t('blog.empty')}</div>
        )}

        {/* 分页 */}
        {pages > 1 && (
          <div className="my-12 flex items-center justify-center gap-2">
            <PagerBtn disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={16} />
            </PagerBtn>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                  n === page ? 'bg-theme-gradient text-white' : 'card-solid muted hover:text-theme-primary'
                }`}
              >
                {n}
              </button>
            ))}
            <PagerBtn disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={16} />
            </PagerBtn>
          </div>
        )}
      </div>
    </>
  )
}

function Header({ t }) {
  return (
    <section className="relative overflow-hidden pt-28 pb-8 text-center">
      <div className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-theme-primary/10 blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl px-6">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-theme-gradient text-white shadow-glass-lg">
          <FileText size={24} />
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold sm:text-5xl">
          <span className="text-gradient">{t('blog.title')}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm muted sm:text-base">{t('blog.subtitle')}</p>
      </motion.div>
    </section>
  )
}

function CategoryChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1 text-sm font-medium transition ${
        active ? 'bg-theme-gradient text-white shadow' : 'muted hover:text-theme-primary'
      }`}
    >
      {label}
    </button>
  )
}

function PagerBtn({ children, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-lg card-solid muted transition hover:text-theme-primary disabled:opacity-40"
    >
      {children}
    </button>
  )
}
