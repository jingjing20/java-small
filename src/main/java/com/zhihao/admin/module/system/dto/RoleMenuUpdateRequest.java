package com.zhihao.admin.module.system.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record RoleMenuUpdateRequest(@NotNull List<Long> menuIds) {
}
