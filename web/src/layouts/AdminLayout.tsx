import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Typography, theme } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  ApartmentOutlined,
  BookOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'
import { logout } from '@/api/auth'

const { Sider, Header, Content } = Layout

const NAV_ITEMS = [
  { key: '/system/user', icon: <UserOutlined />, label: '用户管理', perm: 'system:user:list' },
  { key: '/system/role', icon: <TeamOutlined />, label: '角色管理', perm: 'system:role:list' },
  { key: '/system/menu', icon: <MenuOutlined />, label: '菜单管理', perm: 'system:menu:list' },
  { key: '/system/dept', icon: <ApartmentOutlined />, label: '部门管理', perm: 'system:dept:list' },
  { key: '/system/dict', icon: <BookOutlined />, label: '字典管理', perm: 'system:dict:list' },
  { key: '/system/log', icon: <FileTextOutlined />, label: '操作日志', perm: 'system:operlog:list' },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, hasPermission, clear } = useAuthStore()
  const { token: cssToken } = theme.useToken()

  const menuItems = NAV_ITEMS.filter((item) => hasPermission(item.perm)).map(
    ({ key, icon, label }) => ({ key, icon, label }),
  )

  const handleLogout = async () => {
    await logout().catch(() => {})
    clear()
    navigate('/login', { replace: true })
  }

  const userMenu = {
    items: [{ key: 'logout', icon: <LogoutOutlined />, label: '退出登录' }],
    onClick: ({ key }: { key: string }) => { if (key === 'logout') handleLogout() },
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark">
        <div
          style={{
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: collapsed ? 14 : 18,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {collapsed ? 'Admin' : 'Admin System'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: cssToken.colorBgContainer,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderBottom: `1px solid ${cssToken.colorBorderSecondary}`,
          }}
        >
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} size="small" />
              <Typography.Text>{user?.username}</Typography.Text>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, background: cssToken.colorBgContainer, borderRadius: cssToken.borderRadius, padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
