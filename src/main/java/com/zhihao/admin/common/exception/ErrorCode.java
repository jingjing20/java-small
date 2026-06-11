package com.zhihao.admin.common.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
    BAD_REQUEST(400, "bad request"),
    UNAUTHORIZED(401, "unauthorized"),
    FORBIDDEN(403, "forbidden"),
    NOT_FOUND(404, "not found"),
    BUSINESS_ERROR(1000, "business error"),
    SYSTEM_ERROR(500, "system error");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
