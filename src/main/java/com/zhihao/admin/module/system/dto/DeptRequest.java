package com.zhihao.admin.module.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DeptRequest(
        @NotNull Long parentId,
        @NotBlank String deptName,
        Integer sort,
        String leader,
        String phone,
        @NotNull Integer status) {
}
