package com.zhihao.admin.module.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record UserCreateRequest(
        Long deptId,
        @NotBlank String username,
        @NotBlank String nickname,
        @NotBlank String password,
        String email,
        String phone,
        @NotNull Integer status,
        String remark,
        List<Long> roleIds) {
}
