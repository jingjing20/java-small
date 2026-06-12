export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export function ok<T>(data: T): ApiResponse<T> {
  return { code: 0, message: 'ok', data }
}

export function okVoid(): ApiResponse<null> {
  return { code: 0, message: 'ok', data: null }
}

export function fail(code: number, message: string): ApiResponse<null> {
  return { code, message, data: null }
}
