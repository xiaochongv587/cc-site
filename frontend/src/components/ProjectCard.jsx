import { motion } from 'framer-motion'
import { Code2, Github, ExternalLink, Star } from 'lucide-react'
import { useLang } from '../context/LangContext'

export default function ProjectCard({ project }) {
  const { t } = useLang()

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative card-solid overflow-hidden p-6"
    >
      {project.featured && (
        <div className="absolute -right-9 top-4 rotate-45 bg-theme-accent px-10 py-1 text-[11px] font-semibold text-white shadow">
          ★ {t('projects.featured')}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-md">
          <Code2 size={20} />
        </span>
        <h3 className="text-lg font-bold group-hover:text-theme-primary transition">
          {project.name}
        </h3>
      </div>

      <p className="mt-4 line-clamp-2 text-sm muted">{project.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(project.techStack || []).map((tech) => (
          <span
            key={tech}
            className="rounded-full bg-theme-primary/10 px-2.5 py-0.5 text-xs font-medium text-theme-primary"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-700"
          >
            <Github size={14} /> {t('projects.source')}
          </a>
        )}
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold text-theme-primary transition hover:bg-theme-primary/10"
            style={{ borderColor: 'rgb(var(--theme-primary) / 0.35)' }}
          >
            <ExternalLink size={14} /> {t('projects.demo')}
          </a>
        )}
        {project.stars > 0 && (
          <span className="ml-auto flex items-center gap-1 text-xs muted">
            <Star size={13} className="fill-theme-accent text-theme-accent" />
            {project.stars}
          </span>
        )}
      </div>
    </motion.div>
  )
}
