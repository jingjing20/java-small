import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Form,
  Input,
  Select,
  Modal,
  Popconfirm,
  TreeSelect,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getDeptTree, createDept, updateDept, deleteDept } from '@/api/dept'
import type { DeptRequest, DeptTreeNode } from '@/api/types'
import AuthButton from '@/components/AuthButton'
import StatusTag from '@/components/StatusTag'

function toParentTreeData(nodes: DeptTreeNode[], excludeId?: number): object[] {
  return nodes
    .filter((n) => n.id !== excludeId)
    .map((n) => ({
      title: n.deptName,
      value: n.id,
      children: n.children?.length ? toParentTreeData(n.children, excludeId) : undefined,
    }))
}

export default function DeptPage() {
  const [data, setData] = useState<DeptTreeNode[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [editingDept, setEditingDept] = useState<DeptTreeNode | null>(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      setData(await getDeptTree())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => {
    setEditingDept(null)
    form.resetFields()
    form.setFieldsValue({ parentId: 0, status: 1, sort: 0 })
    setModalOpen(true)
  }

  const openEdit = (record: DeptTreeNode) => {
    setEditingDept(record)
    form.setFieldsValue({
      parentId: record.parentId,
      deptName: record.deptName,
      sort: record.sort,
      leader: record.leader,
      phone: record.phone,
      status: record.status ?? 1,
    })
    setModalOpen(true)
  }

  const handleModalOk = async () => {
    const values: DeptRequest = await form.validateFields()
    setConfirmLoading(true)
    try {
      if (editingDept) {
        await updateDept(editingDept.id, values)
      } else {
        await createDept(values)
      }
      setModalOpen(false)
      fetchData()
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    await deleteDept(id)
    fetchData()
  }

  const columns: ColumnsType<DeptTreeNode> = [
    { title: '部门名称', dataIndex: 'deptName', width: 200 },
    { title: '负责人', dataIndex: 'leader', width: 120 },
    { title: '联系电话', dataIndex: 'phone', width: 140 },
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
          <AuthButton perm="system:dept:edit">
            <Button size="small" type="link" onClick={() => openEdit(record)}>编辑</Button>
          </AuthButton>
          <AuthButton perm="system:dept:delete">
            <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
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
        <AuthButton perm="system:dept:add">
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增</Button>
        </AuthButton>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        expandable={{ defaultExpandAllRows: true }}
      />

      <Modal
        title={editingDept ? '编辑部门' : '新增部门'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={confirmLoading}
        destroyOnHidden
        width={520}
      >
        <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item name="parentId" label="上级部门" rules={[{ required: true }]}>
            <TreeSelect
              treeData={[{ title: '根部门', value: 0, children: toParentTreeData(data, editingDept?.id) }]}
              placeholder="请选择上级部门"
            />
          </Form.Item>
          <Form.Item name="deptName" label="部门名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="leader" label="负责人">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
