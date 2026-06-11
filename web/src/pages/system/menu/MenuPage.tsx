import { useEffect, useState } from 'react'
import { Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { getMenuTree } from '@/api/menu'
import type { MenuTreeNode } from '@/api/types'

const MENU_TYPE_LABEL: Record<string, string> = {
  M: '目录',
  C: '页面',
  B: '按钮',
}

const MENU_TYPE_COLOR: Record<string, string> = {
  M: 'blue',
  C: 'green',
  B: 'orange',
}

export default function MenuPage() {
  const [data, setData] = useState<MenuTreeNode[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getMenuTree()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const columns: ColumnsType<MenuTreeNode> = [
    { title: '菜单名称', dataIndex: 'menuName', width: 200 },
    {
      title: '类型',
      dataIndex: 'menuType',
      width: 80,
      render: (v: string) => <Tag color={MENU_TYPE_COLOR[v]}>{MENU_TYPE_LABEL[v] ?? v}</Tag>,
    },
    { title: '路由路径', dataIndex: 'path', width: 180 },
    { title: '组件', dataIndex: 'component', width: 200 },
    { title: '权限标识', dataIndex: 'permission' },
    { title: '排序', dataIndex: 'sort', width: 80 },
  ]

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      expandable={{ defaultExpandAllRows: true }}
    />
  )
}
