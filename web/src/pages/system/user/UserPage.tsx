import { useEffect, useState, useCallback } from 'react'
import {
  Table,
  Button,
  Space,
  Form,
  Input,
  Select,
  Modal,
  Popconfirm,
  Tag,
  Row,
  Col,
  TreeSelect,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
} from '@/api/user'
import { getDeptTree } from '@/api/dept'
import { getRoles } from '@/api/role'
import type { SysUser, UserQuery, DeptTreeNode, SysRole } from '@/api/types'
import AuthButton from '@/components/AuthButton'

const PAGE_SIZE = 10

function toDeptTreeData(nodes: DeptTreeNode[]): object[] {
  return nodes.map((n) => ({
    title: n.deptName,
    value: n.id,
    children: n.children?.length ? toDeptTreeData(n.children) : undefined,
  }))
}

export default function UserPage() {
  const [data, setData] = useState<SysUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState<UserQuery>({ pageNum: 1, pageSize: PAGE_SIZE })
  const [deptTree, setDeptTree] = useState<object[]>([])
  const [roles, setRoles] = useState<SysRole[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SysUser | null>(null)
  const [pwdModalOpen, setPwdModalOpen] = useState(false)
  const [pwdUserId, setPwdUserId] = useState<number | null>(null)

  const [form] = Form.useForm()
  const [pwdForm] = Form.useForm()
  const [searchForm] = Form.useForm()

  const fetchData = useCallback(async (q: UserQuery) => {
    setLoading(true)
    try {
      const res = await getUsers(q)
      setData(res.records)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(query)
    getDeptTree().then((tree) => setDeptTree(toDeptTreeData(tree)))
    getRoles({ pageNum: 1, pageSize: 100 }).then((res) => setRoles(res.records))
  }, [fetchData, query])

  const handleSearch = (values: UserQuery) => {
    const newQuery = { ...values, pageNum: 1, pageSize: PAGE_SIZE }
    setQuery(newQuery)
  }

  const openCreate = () => {
    setEditingUser(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (record: SysUser) => {
    setEditingUser(record)
    form.setFieldsValue({
      deptId: record.deptId,
      nickname: record.nickname,
      email: record.email,
      phone: record.phone,
      status: record.status,
      remark: record.remark,
    })
    setModalOpen(true)
  }

  const handleModalOk = async () => {
    const values = await form.validateFields()
    if (editingUser) {
      await updateUser(editingUser.id, values)
    } else {
      await createUser(values)
    }
    setModalOpen(false)
    fetchData(query)
  }

  const handleDelete = async (id: number) => {
    await deleteUser(id)
    fetchData(query)
  }

  const openPwd = (id: number) => {
    setPwdUserId(id)
    pwdForm.resetFields()
    setPwdModalOpen(true)
  }

  const handlePwdOk = async () => {
    const { password } = await pwdForm.validateFields()
    if (pwdUserId) await resetPassword(pwdUserId, password)
    setPwdModalOpen(false)
  }

  const columns: ColumnsType<SysUser> = [
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '昵称', dataIndex: 'nickname', width: 120 },
    { title: '手机', dataIndex: 'phone', width: 130 },
    { title: '邮箱', dataIndex: 'email', width: 180 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number) => <Tag color={v === 1 ? 'success' : 'error'}>{v === 1 ? '启用' : '禁用'}</Tag>,
    },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <AuthButton perm="system:user:edit">
            <Button size="small" type="link" onClick={() => openEdit(record)}>编辑</Button>
          </AuthButton>
          <AuthButton perm="system:user:password">
            <Button size="small" type="link" onClick={() => openPwd(record.id)}>重置密码</Button>
          </AuthButton>
          <AuthButton perm="system:user:delete">
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
      <Form form={searchForm} onFinish={handleSearch} layout="inline" style={{ marginBottom: 16 }}>
        <Row gutter={[8, 8]} style={{ width: '100%' }}>
          <Col>
            <Form.Item name="username">
              <Input placeholder="用户名" allowClear />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="phone">
              <Input placeholder="手机号" allowClear />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="status">
              <Select placeholder="状态" allowClear style={{ width: 100 }}>
                <Select.Option value={1}>启用</Select.Option>
                <Select.Option value={0}>禁用</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col>
            <Space>
              <Button htmlType="submit" type="primary">搜索</Button>
              <Button onClick={() => { searchForm.resetFields(); setQuery({ pageNum: 1, pageSize: PAGE_SIZE }) }}>重置</Button>
            </Space>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <AuthButton perm="system:user:add">
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增</Button>
            </AuthButton>
          </Col>
        </Row>
      </Form>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: query.pageNum,
          pageSize: query.pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (page, size) => setQuery((q) => ({ ...q, pageNum: page, pageSize: size })),
        }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {!editingUser && (
            <>
              <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="password" label="密码" rules={[{ required: true }]}>
                <Input.Password />
              </Form.Item>
            </>
          )}
          <Form.Item name="nickname" label="昵称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="deptId" label="部门">
            <TreeSelect treeData={deptTree} placeholder="请选择部门" allowClear />
          </Form.Item>
          <Form.Item name="roleIds" label="角色">
            <Select mode="multiple" placeholder="请选择角色" allowClear>
              {roles.map((r) => (
                <Select.Option key={r.id} value={r.id}>{r.roleName}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机">
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

      <Modal
        title="重置密码"
        open={pwdModalOpen}
        onOk={handlePwdOk}
        onCancel={() => setPwdModalOpen(false)}
        destroyOnClose
      >
        <Form form={pwdForm} layout="vertical">
          <Form.Item name="password" label="新密码" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
