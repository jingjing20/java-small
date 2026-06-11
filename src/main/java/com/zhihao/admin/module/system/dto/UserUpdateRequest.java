package com.zhihao.admin.module.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record UserUpdateRequest(
        Long deptId,
        @NotBlank String nickname,
        String email,
        String phone,
        @NotNull Integer status,
        String remark,
        List<Long> roleIds) {
}
