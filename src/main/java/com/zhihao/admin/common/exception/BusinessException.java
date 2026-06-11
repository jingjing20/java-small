package com.zhihao.admin.common.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(String message) {
        this(ErrorCode.BUSINESS_ERROR.getCode(), message);
    }

    public BusinessException(ErrorCode errorCode) {
        this(errorCode.getCode(), errorCode.getMessage());
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
}
