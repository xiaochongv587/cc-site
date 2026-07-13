import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

// 打字机效果：在多个词间循环输入/删除
export default function TypewriterText({ words = [], className = '' }) {
  const prefersReduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [display, setDisplay] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!words.length) return
    if (prefersReduced) {
      setDisplay(words[0])
      return
    }
    const current = words[index % words.length]
    let timeout

    if (!deleting && display === current) {
      timeout = setTimeout(() => setDeleting(true), 1600)
    } else if (deleting && display === '') {
      setDeleting(false)
      setIndex((i) => (i + 1) % words.length)
    } else {
      const speed = deleting ? 55 : 110
      timeout = setTimeout(() => {
        setDisplay((prev) =>
          deleting
            ? current.slice(0, prev.length - 1)
            : current.slice(0, prev.length + 1)
        )
      }, speed)
    }
    return () => clearTimeout(timeout)
  }, [display, deleting, index, words, prefersReduced])

  return (
    <span className={className}>
      {display}
      <span className="inline-block w-0.5 -mb-1 h-[1em] bg-theme-primary animate-pulse ml-0.5 align-middle" />
    </span>
  )
}
