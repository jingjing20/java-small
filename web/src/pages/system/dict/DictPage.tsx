import { useEffect, useState, useCallback } from 'react'
import {
  Table,
  Button,
  Form,
  Input,
  Select,
  Modal,
  Tag,
  Drawer,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  getDictTypes,
  createDictType,
  getDictData,
  createDictData,
} from '@/api/dict'
import type { SysDictType, SysDictData } from '@/api/types'
import AuthButton from '@/components/AuthButton'

const PAGE_SIZE = 10

export default function DictPage() {
  const [types, setTypes] = useState<SysDictType[]>([])
  const [typeTotal, setTypeTotal] = useState(0)
  const [typeLoading, setTypeLoading] = useState(false)
  const [typePage, setTypePage] = useState(1)

  const [typeModalOpen, setTypeModalOpen] = useState(false)
  const [typeForm] = Form.useForm()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentType, setCurrentType] = useState<SysDictType | null>(null)
  const [dictData, setDictData] = useState<SysDictData[]>([])
  const [dictDataTotal, setDictDataTotal] = useState(0)
  const [dictDataPage, setDictDataPage] = useState(1)
  const [dictDataLoading, setDictDataLoading] = useState(false)

  const [dataModalOpen, setDataModalOpen] = useState(false)
  const [dataForm] = Form.useForm()

  const fetchTypes = useCallback(async (page: number) => {
    setTypeLoading(true)
    try {
      const res = await getDictTypes({ pageNum: page, pageSize: PAGE_SIZE })
      setTypes(res.records)
      setTypeTotal(res.total)
    } finally {
      setTypeLoading(false)
    }
  }, [])

  const fetchDictData = useCallback(async (typeId: number, page: number) => {
    setDictDataLoading(true)
    try {
      const res = await getDictData({ dictTypeId: typeId, pageNum: page, pageSize: PAGE_SIZE })
      setDictData(res.records)
      setDictDataTotal(res.total)
    } finally {
      setDictDataLoading(false)
    }
  }, [])

  useEffect(() => { fetchTypes(typePage) }, [fetchTypes, typePage])

  const handleCreateType = async () => {
    const values = await typeForm.validateFields()
    await createDictType(values)
    setTypeModalOpen(false)
    fetchTypes(typePage)
  }

  const openDrawer = (record: SysDictType) => {
    setCurrentType(record)
    setDictDataPage(1)
    fetchDictData(record.id, 1)
    setDrawerOpen(true)
  }

  const handleCreateData = async () => {
    const values = await dataForm.validateFields()
    await createDictData({ ...values, dictTypeId: currentType!.id })
    setDataModalOpen(false)
    fetchDictData(currentType!.id, dictDataPage)
  }

  const typeColumns: ColumnsType<SysDictType> = [
    { title: '字典名称', dataIndex: 'dictName', width: 160 },
    { title: '字典类型', dataIndex: 'dictType', width: 180 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number) => <Tag color={v === 1 ? 'success' : 'error'}>{v === 1 ? '启用' : '禁用'}</Tag>,
    },
    { title: '备注', dataIndex: 'remark' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button size="small" type="link" onClick={() => openDrawer(record)}>查看字典项</Button>
      ),
    },
  ]

  const dataColumns: ColumnsType<SysDictData> = [
    { title: '标签', dataIndex: 'dictLabel', width: 120 },
    { title: '值', dataIndex: 'dictValue', width: 120 },
    { title: '排序', dataIndex: 'sort', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number) => <Tag color={v === 1 ? 'success' : 'error'}>{v === 1 ? '启用' : '禁用'}</Tag>,
    },
  ]

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <AuthButton perm="system:dict:add">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { typeForm.resetFields(); setTypeModalOpen(true) }}>
            新增字典类型
          </Button>
        </AuthButton>
      </div>

      <Table
        rowKey="id"
        columns={typeColumns}
        dataSource={types}
        loading={typeLoading}
        pagination={{
          current: typePage,
          pageSize: PAGE_SIZE,
          total: typeTotal,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (page) => setTypePage(page),
        }}
      />

      <Modal
        title="新增字典类型"
        open={typeModalOpen}
        onOk={handleCreateType}
        onCancel={() => setTypeModalOpen(false)}
        destroyOnClose
      >
        <Form form={typeForm} layout="vertical">
          <Form.Item name="dictName" label="字典名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dictType" label="字典类型" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1} rules={[{ required: true }]}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`字典项 — ${currentType?.dictName ?? ''}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={600}
        extra={
          <AuthButton perm="system:dict:add">
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { dataForm.resetFields(); setDataModalOpen(true) }}>
              新增
            </Button>
          </AuthButton>
        }
      >
        <Table
          rowKey="id"
          columns={dataColumns}
          dataSource={dictData}
          loading={dictDataLoading}
          pagination={{
            current: dictDataPage,
            pageSize: PAGE_SIZE,
            total: dictDataTotal,
            onChange: (page) => {
              setDictDataPage(page)
              fetchDictData(currentType!.id, page)
            },
          }}
        />
      </Drawer>

      <Modal
        title="新增字典项"
        open={dataModalOpen}
        onOk={handleCreateData}
        onCancel={() => setDataModalOpen(false)}
        destroyOnClose
      >
        <Form form={dataForm} layout="vertical">
          <Form.Item name="dictLabel" label="标签" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dictValue" label="值" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1} rules={[{ required: true }]}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
