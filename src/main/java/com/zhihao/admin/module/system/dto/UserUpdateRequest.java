package com.zhihao.admin.module.system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.util.List;

public record UserUpdateRequest(
        Long deptId,
        @NotBlank String nickname,
        @Email(regexp = "^$|.+@.+\\..+", message = "invalid email") String email,
        @Pattern(regexp = "^$|^1[3-9]\\d{9}$", message = "invalid phone number") String phone,
        @NotNull Integer status,
        String remark,
        List<Long> roleIds) {
}
