import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Coffee, FolderGit2, FileText, Star, Code2, Database, Globe, Rocket,
  ChevronDown, Github, Twitter, Linkedin, Mail, ArrowRight, BookOpen, Sparkles,
} from 'lucide-react'
import { publicApi } from '../api/client'
import { useLang } from '../context/LangContext'
import ParticleBackground from '../components/ParticleBackground'
import TypewriterText from '../components/TypewriterText'
import SkillBar from '../components/SkillBar'
import ArticleCard from '../components/ArticleCard'
import ProjectCard from '../components/ProjectCard'
import SEO from '../components/SEO'

// ---------------- fallback 数据（后端不可用时展示） ----------------
const MOCK = {
  profile: {
    nickname: 'Connor',
    email: 'connor@example.com',
    avatar: '',
    social: { github: 'https://github.com/connor', twitter: '', linkedin: '' },
    i18n: {
      zh: {
        bio: '全栈开发者，热爱技术与开源',
        roles: ['全栈工程师', 'React 开发者', 'Python 开发者', '开源爱好者'],
        welcome: '你好，我是',
        ctaTitle: '让我们一起合作',
        ctaDesc: '有想法？想要合作？或者只是想打个招呼？随时联系我！',
      },
      en: {
        bio: 'Full-stack developer who loves tech and open source',
        roles: ['Full Stack Engineer', 'React Developer', 'Python Developer', 'Open Source Lover'],
        welcome: "Hello, I'm",
        ctaTitle: "Let's Collaborate",
        ctaDesc: 'Have an idea? Want to collaborate? Feel free to reach out!',
      },
    },
  },
  stats: { coffee: 1288, projects: 12, articles: 28, stars: 356 },
  skills: [
    { id: 1, name: 'React', category: '前端', level: 90 },
    { id: 2, name: 'Python', category: '后端', level: 90 },
  ],
  articles: [],
  projects: [],
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function useHomeData() {
  const [data, setData] = useState({
    profile: null, stats: null, skills: [], articles: [], projects: [],
  })

  useEffect(() => {
    Promise.allSettled([
      publicApi.profile(),
      publicApi.stats(),
      publicApi.skills(),
      publicApi.articles({ perPage: 3 }),
      publicApi.projects(),
    ]).then(([p, s, sk, a, pr]) => {
      setData({
        profile: p.status === 'fulfilled' ? p.value : MOCK.profile,
        stats: s.status === 'fulfilled' ? s.value : MOCK.stats,
        skills: sk.status === 'fulfilled' ? sk.value : MOCK.skills,
        articles: a.status === 'fulfilled' ? a.value.items : MOCK.articles,
        projects: pr.status === 'fulfilled' ? pr.value : MOCK.projects,
      })
    })
  }, [])

  return data
}

export default function Home() {
  const { t, lang } = useLang()
  const { profile, stats, skills, articles, projects } = useHomeData()

  const p = profile || MOCK.profile
  const s = stats || MOCK.stats
  const content = p.i18n?.[lang] || p.i18n?.zh || MOCK.profile.i18n.zh

  const featuredProjects = useMemo(
    () => projects.filter((x) => x.featured).slice(0, 2),
    [projects]
  )
  const showProjects = featuredProjects.length ? featuredProjects : projects.slice(0, 2)

  const socials = [
    { href: p.social?.github, icon: Github },
    { href: p.social?.twitter, icon: Twitter },
    { href: p.social?.linkedin, icon: Linkedin },
    { href: p.email ? `mailto:${p.email}` : '', icon: Mail },
  ].filter((x) => x.href)

  return (
    <>
      <SEO title={p.nickname} description={content.bio} />
      <Hero p={p} content={content} socials={socials} t={t} />
      <Stats s={s} t={t} />
      <Features t={t} />
      <Skills skills={skills} t={t} />
      <LatestArticles articles={articles} t={t} />
      <FeaturedProjects projects={showProjects} t={t} />
      <CTA content={content} email={p.email} t={t} />
    </>
  )
}

// ---------------- Hero ----------------
function Hero({ p, content, socials, t }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <ParticleBackground />
      <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-theme-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-16 h-80 w-80 rounded-full bg-theme-primary/20 blur-3xl" />

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        <motion.div variants={fadeUp} className="relative mb-6">
          <span className="absolute inset-0 rounded-full border-2 border-theme-primary/40 animate-pulse-ring" />
          <div className="grid h-28 w-28 place-items-center rounded-full bg-theme-gradient text-5xl font-black text-white shadow-glass-lg">
            {p.avatar ? (
              <img src={p.avatar} alt={p.nickname} className="h-full w-full rounded-full object-cover" />
            ) : (
              p.nickname?.slice(0, 1) || 'C'
            )}
          </div>
          <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
        </motion.div>

        <motion.p variants={fadeUp} className="flex items-center gap-1.5 text-sm font-semibold text-theme-secondary">
          <Sparkles size={15} /> {content.welcome}
        </motion.p>

        <motion.h1 variants={fadeUp} className="mt-2 font-display text-5xl font-extrabold sm:text-6xl">
          <span className="text-gradient">{p.nickname}</span>
        </motion.h1>

        <motion.div variants={fadeUp} className="mt-3 text-xl font-semibold sm:text-2xl">
          <TypewriterText words={content.roles?.length ? content.roles : ['Developer']} className="text-theme-primary" />
        </motion.div>

        <motion.p variants={fadeUp} className="mt-4 max-w-xl text-sm leading-relaxed muted sm:text-base">
          {content.bio}
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/blog" className="btn-primary">
            <BookOpen size={16} /> {t('hero.readBlog')} <ArrowRight size={15} />
          </Link>
          <Link to="/projects" className="btn-secondary">
            <FolderGit2 size={16} /> {t('hero.viewProjects')}
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8 flex items-center gap-3">
          {socials.map((soc, i) => (
            <a
              key={i}
              href={soc.href}
              target="_blank"
              rel="noreferrer"
              className="grid h-10 w-10 place-items-center rounded-full card-glass text-theme-primary transition hover:-translate-y-1"
            >
              <soc.icon size={16} />
            </a>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        className="absolute bottom-8 z-10 muted"
      >
        <ChevronDown />
      </motion.div>
    </section>
  )
}

// ---------------- Stats ----------------
function Stats({ s, t }) {
  const items = [
    { icon: Coffee, value: s.coffee, label: t('stats.coffee'), color: 'from-orange-400 to-orange-500' },
    { icon: FolderGit2, value: s.projects, label: t('stats.projects'), color: 'from-violet-500 to-purple-600' },
    { icon: FileText, value: s.articles, label: t('stats.articles'), color: 'from-rose-400 to-pink-500' },
    { icon: Star, value: s.stars, label: t('stats.stars'), color: 'from-amber-400 to-yellow-500' },
  ]
  return (
    <section className="relative mx-auto -mt-4 max-w-5xl px-6 py-10">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((it, i) => (
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
    </section>
  )
}

// ---------------- Features ----------------
function Features({ t }) {
  const cards = [
    { icon: Code2, title: t('features.fullstack.title'), desc: t('features.fullstack.desc'), color: 'from-sky-500 to-blue-600' },
    { icon: Database, title: t('features.arch.title'), desc: t('features.arch.desc'), color: 'from-fuchsia-500 to-purple-600' },
    { icon: Globe, title: t('features.writing.title'), desc: t('features.writing.desc'), color: 'from-amber-400 to-orange-500' },
    { icon: Rocket, title: t('features.innovation.title'), desc: t('features.innovation.desc'), color: 'from-emerald-500 to-teal-600' },
  ]
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeader eyebrow={t('features.eyebrow')} title={t('features.title')} icon={Sparkles} />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            className="card-solid relative overflow-hidden p-6"
          >
            <span className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-md`}>
              <c.icon size={22} />
            </span>
            <h3 className="mt-4 font-bold">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed muted">{c.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ---------------- Skills ----------------
const CATEGORY_DOT = {
  前端: 'bg-pink-500', 后端: 'bg-blue-500', 数据库: 'bg-amber-500',
  运维: 'bg-orange-500', DevOps: 'bg-orange-500', 工具: 'bg-emerald-500',
}

function Skills({ skills, t }) {
  const grouped = useMemo(() => {
    const map = {}
    for (const sk of skills) {
      ;(map[sk.category] ||= []).push(sk)
    }
    return map
  }, [skills])

  if (!skills.length) return null

  return (
    <section className="bg-gradient-to-b from-transparent to-theme-secondary/5 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader eyebrow={t('skills.eyebrow')} title={t('skills.title')} icon={Code2} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(grouped).map(([category, list], i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-solid p-6"
            >
              <h3 className="mb-4 flex items-center gap-2 font-bold">
                <span className={`h-2.5 w-2.5 rounded-full ${CATEGORY_DOT[category] || 'bg-theme-primary'}`} />
                {category}
              </h3>
              <div className="space-y-4">
                {list.map((sk) => (
                  <SkillBar key={sk.id} name={sk.name} level={sk.level} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------- Latest Articles ----------------
function LatestArticles({ articles, t }) {
  if (!articles.length) return null
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-end justify-between">
        <SectionHeader eyebrow={t('articles.eyebrow')} title={t('articles.title')} icon={FileText} align="left" />
        <Link to="/blog" className="flex items-center gap-1 text-sm font-semibold text-theme-primary hover:gap-2 transition-all">
          {t('articles.viewAll')} <ArrowRight size={15} />
        </Link>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  )
}

// ---------------- Featured Projects ----------------
function FeaturedProjects({ projects, t }) {
  if (!projects.length) return null
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeader eyebrow={t('projects.eyebrow')} title={t('projects.title')} icon={FolderGit2} />
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {projects.map((pr) => (
          <ProjectCard key={pr.id} project={pr} />
        ))}
      </div>
    </section>
  )
}

// ---------------- CTA ----------------
function CTA({ content, email, t }) {
  return (
    <section className="mx-auto my-4 max-w-6xl px-6">
      <div className="relative overflow-hidden rounded-3xl bg-theme-gradient px-8 py-16 text-center text-white shadow-glass-lg">
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <h2 className="relative text-3xl font-extrabold sm:text-4xl">{content.ctaTitle}</h2>
        <p className="relative mx-auto mt-3 max-w-lg text-sm text-white/90">{content.ctaDesc}</p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          {email && (
            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 font-semibold text-theme-primary shadow-lg transition hover:-translate-y-0.5">
              <Mail size={16} /> {t('cta.sendEmail')}
            </a>
          )}
          <Link to="/blog" className="inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-2.5 font-semibold text-white transition hover:bg-white/10">
            {t('cta.browseArticles')} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ---------------- 通用区块标题 ----------------
function SectionHeader({ eyebrow, title, icon: Icon, align = 'center' }) {
  const alignCls = align === 'center' ? 'items-center text-center' : 'items-start text-left'
  return (
    <div className={`flex flex-col gap-3 ${alignCls}`}>
      <span className="eyebrow">
        {Icon && <Icon size={13} />} {eyebrow}
      </span>
      <h2 className="section-title">
        <span className="text-gradient">{title}</span>
      </h2>
    </div>
  )
}
