import { useAuthStore } from '@/stores/authStore'

interface Props {
  perm: string
  children: React.ReactNode
}

export default function AuthButton({ perm, children }: Props) {
  const hasPermission = useAuthStore((s) => s.hasPermission)
  if (!hasPermission(perm)) return null
  return <>{children}</>
}
