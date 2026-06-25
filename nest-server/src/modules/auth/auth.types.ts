export interface LoginUser {
  userId: number
  deptId: number | null
  username: string
  password: string
  status: number
  permissions: Set<string>
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  tokenType: string
}

export interface CurrentUserResponse {
  userId: number
  deptId: number | null
  username: string
  permissions: string[]
}
