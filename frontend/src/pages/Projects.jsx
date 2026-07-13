import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, Search, FolderGit2, Star, Code2, Sparkles } from 'lucide-react'
import { publicApi } from '../api/client'
import { useLang } from '../context/LangContext'
import ProjectCard from '../components/ProjectCard'
import SEO from '../components/SEO'

export default function Projects() {
  const { t } = useLang()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [tech, setTech] = useState('all')

  useEffect(() => {
    publicApi
      .projects()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  const allTech = useMemo(() => {
    const set = new Set()
    projects.forEach((p) => (p.techStack || []).forEach((tk) => set.add(tk)))
    return [...set]
  }, [projects])

  const filtered = useMemo(() => {
    return projects
      .filter((p) => (tech === 'all' ? true : (p.techStack || []).includes(tech)))
      .filter((p) =>
        keyword
          ? (p.name + p.description).toLowerCase().includes(keyword.toLowerCase())
          : true
      )
      .sort((a, b) => Number(b.featured) - Number(a.featured))
  }, [projects, tech, keyword])

  const featuredCount = projects.filter((p) => p.featured).length

  const stats = [
    { icon: FolderGit2, value: projects.length, label: t('projectsPage.total'), color: 'from-violet-500 to-purple-600' },
    { icon: Star, value: featuredCount, label: t('projectsPage.featuredCount'), color: 'from-amber-400 to-orange-500' },
    { icon: Code2, value: allTech.length, label: t('projectsPage.techCount'), color: 'from-emerald-500 to-teal-600' },
  ]

  return (
    <>
      <SEO title={t('projectsPage.title')} description={t('projectsPage.subtitle')} />

      <section className="relative overflow-hidden pt-28 pb-6 text-center">
        <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-theme-secondary/10 blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl px-6">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-glass-lg">
            <Rocket size={24} />
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold sm:text-5xl">
            <span className="text-gradient">{t('projectsPage.title')}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm muted sm:text-base">{t('projectsPage.subtitle')}</p>
        </motion.div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((it, i) => (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-solid flex flex-col items-center gap-2 p-5 text-center"
            >
              <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${it.color} text-white shadow-md`}>
                <it.icon size={20} />
              </span>
              <span className="text-2xl font-extrabold">{it.value}</span>
              <span className="text-xs muted">{it.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="card-solid mt-8 p-5">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'rgb(var(--border-color))' }}>
            <Search size={16} className="muted" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t('projectsPage.search')}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <TechChip label={t('blog.all')} active={tech === 'all'} onClick={() => setTech('all')} />
            {allTech.map((tk) => (
              <TechChip key={tk} label={tk} active={tech === tk} onClick={() => setTech(tk)} />
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm muted">
            {t('projectsPage.found')} <span className="font-semibold text-theme-primary">{filtered.length}</span> {t('projectsPage.projectsUnit')}
          </p>
          <span className="flex items-center gap-1 text-xs muted">
            <Sparkles size={13} className="text-theme-accent" /> {t('projectsPage.featuredFirst')}
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center muted">{t('common.loading')}</div>
        ) : (
          <div className="mt-5 grid gap-5 pb-8 sm:grid-cols-2">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function TechChip({ label, active, onClick }) {
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
