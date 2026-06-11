package com.zhihao.admin.module.system.dto;

import java.util.Set;

public record CurrentUserResponse(Long userId, Long deptId, String username, Set<String> permissions) {
}
