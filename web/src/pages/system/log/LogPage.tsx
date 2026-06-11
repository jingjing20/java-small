import { useEffect, useState } from 'react'
import { Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { getOperLogs } from '@/api/log'
import type { SysOperLog } from '@/api/types'

const PAGE_SIZE = 20

export default function LogPage() {
  const [data, setData] = useState<SysOperLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageNum, setPageNum] = useState(1)

  useEffect(() => {
    setLoading(true)
    getOperLogs({ pageNum, pageSize: PAGE_SIZE })
      .then((res) => { setData(res.records); setTotal(res.total) })
      .finally(() => setLoading(false))
  }, [pageNum])

  const columns: ColumnsType<SysOperLog> = [
    { title: '标题', dataIndex: 'title', width: 120 },
    { title: '操作类型', dataIndex: 'businessType', width: 120 },
    { title: '请求方法', dataIndex: 'requestMethod', width: 80 },
    { title: '请求地址', dataIndex: 'requestUri', width: 200, ellipsis: true },
    { title: '操作人', dataIndex: 'operatorName', width: 100 },
    { title: '操作IP', dataIndex: 'operatorIp', width: 130 },
    { title: '耗时(ms)', dataIndex: 'costMillis', width: 90 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number) => <Tag color={v === 1 ? 'success' : 'error'}>{v === 1 ? '成功' : '失败'}</Tag>,
    },
    { title: '时间', dataIndex: 'createTime', width: 170 },
  ]

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{
        current: pageNum,
        pageSize: PAGE_SIZE,
        total,
        showTotal: (t) => `共 ${t} 条`,
        onChange: (page) => setPageNum(page),
      }}
    />
  )
}
