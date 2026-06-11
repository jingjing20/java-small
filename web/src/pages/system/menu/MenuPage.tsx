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
  Tag,
  TreeSelect,
  Radio,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getMenuTree, createMenu, updateMenu, deleteMenu } from '@/api/menu'
import type { MenuRequest, MenuTreeNode } from '@/api/types'
import AuthButton from '@/components/AuthButton'
import StatusTag from '@/components/StatusTag'

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

function toParentTreeData(nodes: MenuTreeNode[], excludeId?: number): object[] {
  return nodes
    .filter((n) => n.id !== excludeId && (n.menuType === 'M' || n.menuType === 'C'))
    .map((n) => ({
      title: n.menuName,
      value: n.id,
      children: n.children?.length ? toParentTreeData(n.children, excludeId) : undefined,
    }))
}

export default function MenuPage() {
  const [data, setData] = useState<MenuTreeNode[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuTreeNode | null>(null)
  const [menuType, setMenuType] = useState('M')
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      setData(await getMenuTree())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => {
    setEditingMenu(null)
    setMenuType('M')
    form.resetFields()
    form.setFieldsValue({ parentId: 0, menuType: 'M', visible: 1, status: 1, sort: 0 })
    setModalOpen(true)
  }

  const openEdit = (record: MenuTreeNode) => {
    setEditingMenu(record)
    setMenuType(record.menuType)
    form.setFieldsValue({
      parentId: record.parentId,
      menuName: record.menuName,
      menuType: record.menuType,
      path: record.path,
      component: record.component,
      permission: record.permission,
      icon: record.icon,
      sort: record.sort,
      visible: record.visible ?? 1,
      status: record.status ?? 1,
    })
    setModalOpen(true)
  }

  const handleModalOk = async () => {
    const values: MenuRequest = await form.validateFields()
    setConfirmLoading(true)
    try {
      if (editingMenu) {
        await updateMenu(editingMenu.id, values)
      } else {
        await createMenu(values)
      }
      setModalOpen(false)
      fetchData()
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    await deleteMenu(id)
    fetchData()
  }

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
          <AuthButton perm="system:menu:edit">
            <Button size="small" type="link" onClick={() => openEdit(record)}>编辑</Button>
          </AuthButton>
          <AuthButton perm="system:menu:delete">
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
        <AuthButton perm="system:menu:add">
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
        title={editingMenu ? '编辑菜单' : '新增菜单'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={confirmLoading}
        destroyOnHidden
        width={520}
      >
        <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item name="parentId" label="上级菜单" rules={[{ required: true }]}>
            <TreeSelect
              treeData={[{ title: '根目录', value: 0, children: toParentTreeData(data, editingMenu?.id) }]}
              placeholder="请选择上级菜单"
            />
          </Form.Item>
          <Form.Item name="menuName" label="菜单名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="menuType" label="菜单类型" rules={[{ required: true }]}>
            <Radio.Group onChange={(e) => setMenuType(e.target.value)}>
              <Radio value="M">目录</Radio>
              <Radio value="C">页面</Radio>
              <Radio value="B">按钮</Radio>
            </Radio.Group>
          </Form.Item>
          {(menuType === 'M' || menuType === 'C') && (
            <Form.Item name="path" label="路由路径" rules={menuType === 'C' ? [{ required: true }] : []}>
              <Input />
            </Form.Item>
          )}
          {menuType === 'C' && (
            <Form.Item name="component" label="组件路径">
              <Input />
            </Form.Item>
          )}
          {(menuType === 'B' || menuType === 'C') && (
            <Form.Item name="permission" label="权限标识" rules={menuType === 'B' ? [{ required: true }] : []}>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="icon" label="图标">
            <Input />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="visible" label="可见" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={1}>显示</Select.Option>
              <Select.Option value={0}>隐藏</Select.Option>
            </Select>
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
