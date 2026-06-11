package com.zhihao.admin.module.system.dto;

import jakarta.validation.constraints.NotBlank;

public record PasswordResetRequest(@NotBlank String password) {
}
