import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

// 轻量粒子背景：canvas 绘制缓慢漂浮的点，尊重 prefers-reduced-motion
export default function ParticleBackground({ density = 60 }) {
  const canvasRef = useRef(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let particles = []
    let width = 0
    let height = 0

    const readPrimary = () => {
      const val = getComputedStyle(document.documentElement)
        .getPropertyValue('--theme-primary')
        .trim()
      return val || '99 102 241'
    }

    const resize = () => {
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const init = () => {
      resize()
      const count = Math.min(density, Math.floor((width * height) / 14000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.4 + 0.15,
      }))
    }

    const draw = () => {
      const color = readPrimary()
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color.split(' ').join(',')}, ${p.a})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    const drawStatic = () => {
      const color = readPrimary()
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color.split(' ').join(',')}, ${p.a})`
        ctx.fill()
      }
    }

    init()
    if (prefersReduced) drawStatic()
    else draw()

    const onResize = () => {
      init()
      if (prefersReduced) drawStatic()
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [density, prefersReduced])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
