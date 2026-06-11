package com.zhihao.admin.module.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MenuRequest(
        @NotNull Long parentId,
        @NotBlank String menuName,
        @NotBlank String menuType,
        String path,
        String component,
        String permission,
        String icon,
        Integer sort,
        @NotNull Integer visible,
        @NotNull Integer status) {
}
