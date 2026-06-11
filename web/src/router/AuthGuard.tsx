import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from '@/stores/authStore'
import { getMe } from '@/api/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, user, setUser, clear } = useAuthStore()
  const [loading, setLoading] = useState(!user && !!token)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!token || user) return
    getMe()
      .then(setUser)
      .catch(() => {
        clear()
        setFailed(true)
      })
      .finally(() => setLoading(false))
  }, [token, user, setUser, clear])

  if (!token || failed) return <Navigate to="/login" replace />
  if (loading) return <Spin fullscreen />
  return <>{children}</>
}
