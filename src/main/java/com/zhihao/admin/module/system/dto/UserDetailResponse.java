package com.zhihao.admin.module.system.dto;

import com.zhihao.admin.module.system.entity.SysUser;
import java.util.List;

public record UserDetailResponse(
        Long id,
        Long deptId,
        String username,
        String nickname,
        String email,
        String phone,
        Integer status,
        String remark,
        List<Long> roleIds) {

    public static UserDetailResponse from(SysUser user, List<Long> roleIds) {
        return new UserDetailResponse(
                user.getId(),
                user.getDeptId(),
                user.getUsername(),
                user.getNickname(),
                user.getEmail(),
                user.getPhone(),
                user.getStatus(),
                user.getRemark(),
                roleIds);
    }
}
