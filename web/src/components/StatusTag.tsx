import { Tag } from 'antd'

export default function StatusTag({ value }: { value: number }) {
  return (
    <Tag color={value === 1 ? 'success' : 'error'}>
      {value === 1 ? '启用' : '禁用'}
    </Tag>
  )
}
