import { useEffect } from 'react'

// 轻量 SEO：动态设置 title / description / og 标签
export default function SEO({ title, description, image }) {
  useEffect(() => {
    if (title) document.title = `${title} · My Website`

    const setMeta = (selector, attr, value) => {
      if (!value) return
      let el = document.head.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        const [key, val] = selector.replace('meta[', '').replace(']', '').split('=')
        el.setAttribute(key, val.replace(/["']/g, ''))
        document.head.appendChild(el)
      }
      el.setAttribute(attr, value)
    }

    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[property="og:image"]', 'content', image)
  }, [title, description, image])

  return null
}
