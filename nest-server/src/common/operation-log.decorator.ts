import { SetMetadata } from '@nestjs/common'

export const OPERATION_LOG_KEY = 'operationLog'

export interface OperationLogMeta {
  title: string
  businessType: string
}

export const OperationLog = (title: string, businessType: string) =>
  SetMetadata(OPERATION_LOG_KEY, { title, businessType })
