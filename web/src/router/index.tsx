import { createBrowserRouter, Navigate } from 'react-router-dom'
import AdminLayout from '@/layouts/AdminLayout'
import AuthGuard from './AuthGuard'
import LoginPage from '@/pages/login/LoginPage'
import UserPage from '@/pages/system/user/UserPage'
import RolePage from '@/pages/system/role/RolePage'
import MenuPage from '@/pages/system/menu/MenuPage'
import DeptPage from '@/pages/system/dept/DeptPage'
import DictPage from '@/pages/system/dict/DictPage'
import LogPage from '@/pages/system/log/LogPage'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/system/user" replace /> },
      { path: 'system/user', element: <UserPage /> },
      { path: 'system/role', element: <RolePage /> },
      { path: 'system/menu', element: <MenuPage /> },
      { path: 'system/dept', element: <DeptPage /> },
      { path: 'system/dict', element: <DictPage /> },
      { path: 'system/log', element: <LogPage /> },
    ],
  },
])

export default router
