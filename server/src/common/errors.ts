export enum ErrorCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  BUSINESS_ERROR = 1000,
  SYSTEM_ERROR = 500,
}

const errorMessages: Record<ErrorCode, string> = {
  [ErrorCode.BAD_REQUEST]: 'bad request',
  [ErrorCode.UNAUTHORIZED]: 'unauthorized',
  [ErrorCode.FORBIDDEN]: 'forbidden',
  [ErrorCode.NOT_FOUND]: 'not found',
  [ErrorCode.BUSINESS_ERROR]: 'business error',
  [ErrorCode.SYSTEM_ERROR]: 'system error',
}

export class BusinessException extends Error {
  readonly code: number

  constructor(message: string)
  constructor(code: ErrorCode)
  constructor(code: number, message: string)
  constructor(codeOrMessage: number | string | ErrorCode, message?: string) {
    if (typeof codeOrMessage === 'string') {
      super(codeOrMessage)
      this.code = ErrorCode.BUSINESS_ERROR
      return
    }
    if (typeof codeOrMessage === 'number' && message !== undefined) {
      super(message)
      this.code = codeOrMessage
      return
    }
    const errorCode = codeOrMessage as ErrorCode
    super(errorMessages[errorCode])
    this.code = errorCode
  }
}
