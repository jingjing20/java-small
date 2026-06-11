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
  Tree,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getRoleMenuIds,
  updateRoleMenus,
} from '@/api/role'
import { getMenuTree } from '@/api/menu'
import type { SysRole, RoleRequest, MenuTreeNode } from '@/api/types'
import AuthButton from '@/components/AuthButton'

const PAGE_SIZE = 10

function toTreeData(nodes: MenuTreeNode[]): object[] {
  return nodes.map((n) => ({
    title: n.menuName,
    key: n.id,
    children: n.children?.length ? toTreeData(n.children) : undefined,
  }))
}

export default function RolePage() {
  const [data, setData] = useState<SysRole[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageNum, setPageNum] = useState(1)
  const [menuTree, setMenuTree] = useState<object[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<SysRole | null>(null)
  const [menuModalOpen, setMenuModalOpen] = useState(false)
  const [menuRoleId, setMenuRoleId] = useState<number | null>(null)
  const [checkedKeys, setCheckedKeys] = useState<number[]>([])

  const [form] = Form.useForm()

  const fetchData = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const res = await getRoles({ pageNum: page, pageSize: PAGE_SIZE })
      setData(res.records)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(pageNum)
    getMenuTree().then((tree) => setMenuTree(toTreeData(tree)))
  }, [fetchData, pageNum])

  const openCreate = () => {
    setEditingRole(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (record: SysRole) => {
    setEditingRole(record)
    form.setFieldsValue({
      roleCode: record.roleCode,
      roleName: record.roleName,
      sort: record.sort,
      status: record.status,
      remark: record.remark,
    })
    setModalOpen(true)
  }

  const handleModalOk = async () => {
    const values: RoleRequest = await form.validateFields()
    if (editingRole) {
      await updateRole(editingRole.id, values)
    } else {
      await createRole(values)
    }
    setModalOpen(false)
    fetchData(pageNum)
  }

  const handleDelete = async (id: number) => {
    await deleteRole(id)
    fetchData(pageNum)
  }

  const openMenuModal = async (id: number) => {
    setMenuRoleId(id)
    const ids = await getRoleMenuIds(id)
    setCheckedKeys(ids)
    setMenuModalOpen(true)
  }

  const handleMenuOk = async () => {
    if (menuRoleId) await updateRoleMenus(menuRoleId, checkedKeys)
    setMenuModalOpen(false)
  }

  const columns: ColumnsType<SysRole> = [
    { title: '角色编码', dataIndex: 'roleCode', width: 140 },
    { title: '角色名称', dataIndex: 'roleName', width: 140 },
    { title: '排序', dataIndex: 'sort', width: 80 },
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
          <AuthButton perm="system:role:edit">
            <Button size="small" type="link" onClick={() => openEdit(record)}>编辑</Button>
          </AuthButton>
          <AuthButton perm="system:role:menus">
            <Button size="small" type="link" onClick={() => openMenuModal(record.id)}>分配菜单</Button>
          </AuthButton>
          <AuthButton perm="system:role:delete">
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
        <AuthButton perm="system:role:add">
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增</Button>
        </AuthButton>
      </div>

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

      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="roleCode" label="角色编码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roleName" label="角色名称" rules={[{ required: true }]}>
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

      <Modal
        title="分配菜单权限"
        open={menuModalOpen}
        onOk={handleMenuOk}
        onCancel={() => setMenuModalOpen(false)}
        width={480}
        destroyOnClose
      >
        <Tree
          checkable
          treeData={menuTree}
          checkedKeys={checkedKeys}
          onCheck={(keys) => setCheckedKeys(keys as number[])}
          defaultExpandAll
        />
      </Modal>
    </>
  )
}
