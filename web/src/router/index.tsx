import { createBrowserRouter, Navigate } from 'react-router-dom'
import AdminLayout from '@/layouts/AdminLayout'
import AuthGuard from './AuthGuard'
import LoginPage from '@/pages/login/LoginPage'
import NotFoundPage from '@/pages/NotFoundPage'
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
      { index: true, element: <Navigate to="/system/users" replace /> },
      { path: 'system/users', element: <UserPage /> },
      { path: 'system/roles', element: <RolePage /> },
      { path: 'system/menus', element: <MenuPage /> },
      { path: 'system/depts', element: <DeptPage /> },
      { path: 'system/dicts', element: <DictPage /> },
      { path: 'system/operation-logs', element: <LogPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default router
