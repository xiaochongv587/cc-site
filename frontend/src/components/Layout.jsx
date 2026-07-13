import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTopButton from './ScrollToTop'
import { publicApi } from '../api/client'

// 公开页面统一布局：导航 + 内容 + 页脚
export default function Layout() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    publicApi.profile().then(setProfile).catch(() => setProfile(null))
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet context={{ profile }} />
      </main>
      <Footer profile={profile} />
      <ScrollToTopButton />
    </div>
  )
}
