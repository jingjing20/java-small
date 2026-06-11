export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  total: number
  pageNum: number
  pageSize: number
  records: T[]
}

export interface PageQuery {
  pageNum?: number
  pageSize?: number
}

// Auth
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  tokenType: string
}

export interface CurrentUser {
  userId: number
  deptId: number
  username: string
  permissions: string[]
}

// User
export interface SysUser {
  id: number
  deptId: number
  username: string
  nickname: string
  email: string
  phone: string
  status: number
  remark: string
  createTime: string
}

export interface UserQuery extends PageQuery {
  username?: string
  phone?: string
  status?: number
}

export interface UserCreateRequest {
  deptId?: number
  username: string
  nickname: string
  password: string
  email?: string
  phone?: string
  status: number
  remark?: string
  roleIds?: number[]
}

export interface UserUpdateRequest {
  deptId?: number
  nickname: string
  email?: string
  phone?: string
  status: number
  remark?: string
  roleIds?: number[]
}

// Role
export interface SysRole {
  id: number
  roleCode: string
  roleName: string
  sort: number
  status: number
  remark: string
  createTime: string
}

export interface RoleRequest {
  roleCode: string
  roleName: string
  sort?: number
  status: number
  remark?: string
}

// Menu
export interface MenuTreeNode {
  id: number
  parentId: number
  menuName: string
  menuType: string
  path?: string
  component?: string
  permission?: string
  sort?: number
  children: MenuTreeNode[]
}

// Dept
export interface DeptTreeNode {
  id: number
  parentId: number
  deptName: string
  sort?: number
  status?: number
  children: DeptTreeNode[]
}

// Dict
export interface SysDictType {
  id: number
  dictName: string
  dictType: string
  status: number
  remark: string
  createTime: string
}

export interface DictTypeRequest {
  dictName: string
  dictType: string
  status: number
  remark?: string
}

export interface SysDictData {
  id: number
  dictTypeId: number
  dictLabel: string
  dictValue: string
  sort: number
  status: number
  remark: string
  createTime: string
}

export interface DictDataRequest {
  dictTypeId: number
  dictLabel: string
  dictValue: string
  sort?: number
  status: number
  remark?: string
}

// OperLog
export interface SysOperLog {
  id: number
  title: string
  businessType: string
  method: string
  requestMethod: string
  requestUri: string
  operatorName: string
  operatorIp: string
  status: number
  errorMessage: string
  costMillis: number
  createTime: string
}
