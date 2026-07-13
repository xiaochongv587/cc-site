import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react'
import { useLang } from '../context/LangContext'

export default function Footer({ profile }) {
  const { t } = useLang()
  const year = new Date().getFullYear()
  const social = profile?.social || {}

  const socials = [
    { href: social.github, icon: Github },
    { href: social.twitter, icon: Twitter },
    { href: social.linkedin, icon: Linkedin },
    { href: profile?.email ? `mailto:${profile.email}` : '', icon: Mail },
  ].filter((s) => s.href)

  return (
    <footer className="relative mt-20 overflow-hidden bg-[#0f1024] text-gray-300">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-theme-secondary/20 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-theme-gradient text-white font-extrabold">
                W
              </span>
              <span className="font-display text-lg font-extrabold text-white">
                My Website
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-400">
              {t('footer.desc')}
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-gray-300 transition hover:bg-theme-primary hover:text-white"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-200">
              {t('footer.nav')}
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-theme-primary">{t('nav.home')}</Link></li>
              <li><Link to="/blog" className="hover:text-theme-primary">{t('nav.blog')}</Link></li>
              <li><Link to="/projects" className="hover:text-theme-primary">{t('nav.projects')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-200">
              {t('footer.contact')}
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              {social.github && (
                <li><a href={social.github} target="_blank" rel="noreferrer" className="hover:text-theme-primary">GitHub</a></li>
              )}
              {social.linkedin && (
                <li><a href={social.linkedin} target="_blank" rel="noreferrer" className="hover:text-theme-primary">LinkedIn</a></li>
              )}
              {profile?.email && (
                <li><a href={`mailto:${profile.email}`} className="hover:text-theme-primary">Email</a></li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>© {year} My Website · {t('footer.rights')}</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={12} className="fill-red-500 text-red-500" /> {t('footer.madeWith')}{' '}
            <span className="text-theme-primary">React + Tailwind</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
