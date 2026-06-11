import { useEffect, useState, useCallback } from 'react'
import {
  Table,
  Button,
  Space,
  Form,
  Input,
  Select,
  Modal,
  Drawer,
  Popconfirm,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  getDictTypes,
  createDictType,
  updateDictType,
  deleteDictType,
  getDictData,
  createDictData,
  updateDictData,
  deleteDictData,
} from '@/api/dict'
import type { SysDictType, SysDictData, DictTypeRequest, DictDataRequest } from '@/api/types'
import AuthButton from '@/components/AuthButton'
import StatusTag from '@/components/StatusTag'

const PAGE_SIZE = 10

export default function DictPage() {
  const [types, setTypes] = useState<SysDictType[]>([])
  const [typeTotal, setTypeTotal] = useState(0)
  const [typeLoading, setTypeLoading] = useState(false)
  const [typePage, setTypePage] = useState(1)

  const [typeModalOpen, setTypeModalOpen] = useState(false)
  const [typeConfirmLoading, setTypeConfirmLoading] = useState(false)
  const [editingType, setEditingType] = useState<SysDictType | null>(null)
  const [typeForm] = Form.useForm()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentType, setCurrentType] = useState<SysDictType | null>(null)
  const [dictData, setDictData] = useState<SysDictData[]>([])
  const [dictDataTotal, setDictDataTotal] = useState(0)
  const [dictDataPage, setDictDataPage] = useState(1)
  const [dictDataLoading, setDictDataLoading] = useState(false)

  const [dataModalOpen, setDataModalOpen] = useState(false)
  const [dataConfirmLoading, setDataConfirmLoading] = useState(false)
  const [editingData, setEditingData] = useState<SysDictData | null>(null)
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

  const openCreateType = () => {
    setEditingType(null)
    typeForm.resetFields()
    typeForm.setFieldsValue({ status: 1 })
    setTypeModalOpen(true)
  }

  const openEditType = (record: SysDictType) => {
    setEditingType(record)
    typeForm.setFieldsValue({
      dictName: record.dictName,
      dictType: record.dictType,
      status: record.status,
      remark: record.remark,
    })
    setTypeModalOpen(true)
  }

  const handleTypeModalOk = async () => {
    const values: DictTypeRequest = await typeForm.validateFields()
    setTypeConfirmLoading(true)
    try {
      if (editingType) {
        await updateDictType(editingType.id, values)
      } else {
        await createDictType(values)
      }
      setTypeModalOpen(false)
      fetchTypes(typePage)
    } finally {
      setTypeConfirmLoading(false)
    }
  }

  const handleDeleteType = async (id: number) => {
    await deleteDictType(id)
    fetchTypes(typePage)
  }

  const openDrawer = (record: SysDictType) => {
    setCurrentType(record)
    setDictDataPage(1)
    fetchDictData(record.id, 1)
    setDrawerOpen(true)
  }

  const openCreateData = () => {
    setEditingData(null)
    dataForm.resetFields()
    dataForm.setFieldsValue({ status: 1, sort: 0 })
    setDataModalOpen(true)
  }

  const openEditData = (record: SysDictData) => {
    setEditingData(record)
    dataForm.setFieldsValue({
      dictLabel: record.dictLabel,
      dictValue: record.dictValue,
      sort: record.sort,
      status: record.status,
      remark: record.remark,
    })
    setDataModalOpen(true)
  }

  const handleDataModalOk = async () => {
    const values = await dataForm.validateFields()
    setDataConfirmLoading(true)
    try {
      const payload: DictDataRequest = { ...values, dictTypeId: currentType!.id }
      if (editingData) {
        await updateDictData(editingData.id, payload)
      } else {
        await createDictData(payload)
      }
      setDataModalOpen(false)
      fetchDictData(currentType!.id, dictDataPage)
    } finally {
      setDataConfirmLoading(false)
    }
  }

  const handleDeleteData = async (id: number) => {
    await deleteDictData(id)
    fetchDictData(currentType!.id, dictDataPage)
  }

  const typeColumns: ColumnsType<SysDictType> = [
    { title: '字典名称', dataIndex: 'dictName', width: 160 },
    { title: '字典类型', dataIndex: 'dictType', width: 180 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number) => <StatusTag value={v} />,
    },
    { title: '备注', dataIndex: 'remark' },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => openDrawer(record)}>字典项</Button>
          <AuthButton perm="system:dict:edit">
            <Button size="small" type="link" onClick={() => openEditType(record)}>编辑</Button>
          </AuthButton>
          <AuthButton perm="system:dict:delete">
            <Popconfirm title="确认删除？需先清空字典项" onConfirm={() => handleDeleteType(record.id)}>
              <Button size="small" type="link" danger>删除</Button>
            </Popconfirm>
          </AuthButton>
        </Space>
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
      render: (v: number) => <StatusTag value={v} />,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space>
          <AuthButton perm="system:dict:edit">
            <Button size="small" type="link" onClick={() => openEditData(record)}>编辑</Button>
          </AuthButton>
          <AuthButton perm="system:dict:delete">
            <Popconfirm title="确认删除？" onConfirm={() => handleDeleteData(record.id)}>
              <Button size="small" type="link" danger>删除</Button>
            </Popconfirm>
          </AuthButton>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <AuthButton perm="system:dict:add">
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateType}>
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
        title={editingType ? '编辑字典类型' : '新增字典类型'}
        open={typeModalOpen}
        onOk={handleTypeModalOk}
        onCancel={() => setTypeModalOpen(false)}
        confirmLoading={typeConfirmLoading}
        destroyOnHidden
      >
        <Form form={typeForm} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
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
        width={640}
        extra={
          <AuthButton perm="system:dict:add">
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openCreateData}>
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
        title={editingData ? '编辑字典项' : '新增字典项'}
        open={dataModalOpen}
        onOk={handleDataModalOk}
        onCancel={() => setDataModalOpen(false)}
        confirmLoading={dataConfirmLoading}
        destroyOnHidden
      >
        <Form form={dataForm} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
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
