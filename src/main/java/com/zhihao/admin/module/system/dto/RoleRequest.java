package com.zhihao.admin.module.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RoleRequest(@NotBlank String roleCode, @NotBlank String roleName, Integer sort,
                          @NotNull Integer status, String remark) {
}
