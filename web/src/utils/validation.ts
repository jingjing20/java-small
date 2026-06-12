export const EMAIL_PATTERN = /^$|.+@.+\..+$/
export const PHONE_PATTERN = /^$|^1[3-9]\d{9}$/

export const emailRule = { pattern: EMAIL_PATTERN, message: '邮箱格式不正确' }
export const phoneRule = { pattern: PHONE_PATTERN, message: '手机号格式不正确' }
