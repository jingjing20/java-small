package com.zhihao.admin.module.system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UserCreateRequest(
        Long deptId,
        @NotBlank String username,
        @NotBlank String nickname,
        @NotBlank @Size(min = 6, max = 32) String password,
        @Email(regexp = "^$|.+@.+\\..+") String email,
        @Pattern(regexp = "^$|^1[3-9]\\d{9}$", message = "invalid phone number") String phone,
        @NotNull Integer status,
        String remark,
        List<Long> roleIds) {
}
