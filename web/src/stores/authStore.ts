import { create } from 'zustand'
import type { CurrentUser } from '@/api/types'

interface AuthState {
  token: string | null
  user: CurrentUser | null
  setToken: (token: string) => void
  setUser: (user: CurrentUser) => void
  clear: () => void
  hasPermission: (perm: string) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,
  setToken: (token) => {
    localStorage.setItem('token', token)
    set({ token })
  },
  setUser: (user) => set({ user }),
  clear: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null })
  },
  hasPermission: (perm) => {
    const { user } = get()
    if (!user) return false
    return user.permissions.includes(perm) || user.permissions.includes('ROLE_admin')
  },
}))
