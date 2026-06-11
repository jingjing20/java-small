import { useEffect, useState } from 'react'
import { Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { getDeptTree } from '@/api/dept'
import type { DeptTreeNode } from '@/api/types'

export default function DeptPage() {
  const [data, setData] = useState<DeptTreeNode[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getDeptTree()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const columns: ColumnsType<DeptTreeNode> = [
    { title: '部门名称', dataIndex: 'deptName', width: 200 },
    { title: '排序', dataIndex: 'sort', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number) => (
        <Tag color={v === 1 ? 'success' : 'error'}>{v === 1 ? '启用' : '禁用'}</Tag>
      ),
    },
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
