import { motion } from 'framer-motion'

// 单条技能进度：进入视口时动画填充
export default function SkillBar({ name, level }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-xs font-semibold text-theme-primary">{level}%</span>
      </div>
      <div className="skill-bar">
        <motion.span
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
