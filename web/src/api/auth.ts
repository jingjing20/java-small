import request from './request'
import type { LoginRequest, LoginResponse, CurrentUser } from './types'

export const login = (data: LoginRequest) =>
  request.post<unknown, LoginResponse>('/auth/login', data)

export const getMe = () => request.get<unknown, CurrentUser>('/auth/me')

export const logout = () => request.post<unknown, null>('/auth/logout')
