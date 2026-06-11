import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from '@/stores/authStore'
import { getMe } from '@/api/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(!user && !!token)

  useEffect(() => {
    if (!token || user) return
    getMe()
      .then(setUser)
      .finally(() => setLoading(false))
  }, [token, user, setUser])

  if (!token) return <Navigate to="/login" replace />
  if (loading) return <Spin fullscreen />
  return <>{children}</>
}
