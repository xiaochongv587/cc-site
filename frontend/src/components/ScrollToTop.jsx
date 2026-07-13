import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

// 路由切换时回到顶部
export function ScrollRestore() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])
  return null
}

// 悬浮返回顶部按钮
export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 grid h-11 w-11 place-items-center rounded-full bg-theme-gradient text-white shadow-glass-lg"
          aria-label="返回顶部"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
