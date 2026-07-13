import { Link, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, FileText, FolderGit2, Globe, Moon, Sun, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useLang } from '../context/LangContext'
import { useTheme } from '../context/ThemeContext'

function BrandLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-theme-gradient text-white font-extrabold shadow-md">
        W
      </span>
      <span className="font-display text-lg font-extrabold text-gradient">
        My Website
      </span>
    </Link>
  )
}

export default function Navbar() {
  const { t, lang, toggleLang } = useLang()
  const { dark, toggleDark } = useTheme()
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/', label: t('nav.home'), icon: Home, end: true },
    { to: '/blog', label: t('nav.blog'), icon: FileText },
    { to: '/projects', label: t('nav.projects'), icon: FolderGit2 },
  ]

  const linkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
      isActive
        ? 'bg-theme-primary/10 text-theme-primary'
        : 'muted hover:text-theme-primary'
    }`

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-3"
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 card-glass px-4 py-2.5 rounded-2xl">
        <BrandLogo />

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              <l.icon size={15} />
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold muted hover:text-theme-primary transition"
            title="切换语言"
          >
            <Globe size={15} />
            {lang === 'zh' ? '中' : 'EN'}
          </button>
          <button
            onClick={toggleDark}
            className="grid h-8 w-8 place-items-center rounded-full muted hover:text-theme-primary transition"
            title="切换深色模式"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden grid h-8 w-8 place-items-center rounded-full muted"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden mx-auto mt-2 max-w-5xl card-glass rounded-2xl p-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <l.icon size={15} />
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </motion.header>
  )
}
