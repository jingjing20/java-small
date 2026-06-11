package com.zhihao.admin.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhihao.admin.common.api.PageResult;
import com.zhihao.admin.common.exception.BusinessException;
import com.zhihao.admin.module.system.dto.PasswordResetRequest;
import com.zhihao.admin.module.system.dto.UserCreateRequest;
import com.zhihao.admin.module.system.dto.UserDetailResponse;
import com.zhihao.admin.module.system.dto.UserQuery;
import com.zhihao.admin.module.system.dto.UserUpdateRequest;
import com.zhihao.admin.module.system.entity.SysUser;
import com.zhihao.admin.module.system.entity.SysUserRole;
import com.zhihao.admin.module.system.mapper.SysUserMapper;
import com.zhihao.admin.module.system.mapper.SysUserRoleMapper;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserService {

    private final SysUserMapper userMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final PasswordEncoder passwordEncoder;

    public PageResult<UserDetailResponse> page(UserQuery query) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<SysUser>()
                .like(StringUtils.hasText(query.getUsername()), SysUser::getUsername, query.getUsername())
                .like(StringUtils.hasText(query.getPhone()), SysUser::getPhone, query.getPhone())
                .eq(query.getStatus() != null, SysUser::getStatus, query.getStatus())
                .orderByDesc(SysUser::getCreateTime);
        Page<SysUser> page = userMapper.selectPage(Page.of(query.getPageNum(), query.getPageSize()), wrapper);
        Page<UserDetailResponse> mapped = new Page<>(page.getCurrent(), page.getSize(), page.getTotal());
        mapped.setRecords(page.getRecords().stream()
                .map(u -> UserDetailResponse.from(u, null))
                .toList());
        return PageResult.from(mapped);
    }

    public UserDetailResponse getDetail(Long id) {
        SysUser user = requireUser(id);
        List<Long> roleIds = userRoleMapper.selectList(
                new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getUserId, id)
        ).stream().map(SysUserRole::getRoleId).toList();
        return UserDetailResponse.from(user, roleIds);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long create(UserCreateRequest request) {
        ensureUsernameAvailable(request.username(), null);
        SysUser user = new SysUser();
        user.setDeptId(request.deptId());
        user.setUsername(request.username());
        user.setNickname(request.nickname());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setStatus(request.status());
        user.setRemark(request.remark());
        userMapper.insert(user);
        replaceRoles(user.getId(), request.roleIds());
        return user.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, UserUpdateRequest request) {
        SysUser user = requireUser(id);
        user.setDeptId(request.deptId());
        user.setNickname(request.nickname());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setStatus(request.status());
        user.setRemark(request.remark());
        userMapper.updateById(user);
        replaceRoles(id, request.roleIds());
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        SysUser user = requireUser(id);
        user.setUsername(user.getUsername() + ":" + user.getId());
        userMapper.updateById(user);
        userRoleMapper.delete(new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getUserId, id));
        userMapper.deleteById(id);
    }

    public void resetPassword(Long id, PasswordResetRequest request) {
        SysUser user = requireUser(id);
        user.setPassword(passwordEncoder.encode(request.password()));
        userMapper.updateById(user);
    }

    private SysUser requireUser(Long id) {
        SysUser user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException("user not found");
        }
        return user;
    }

    private void ensureUsernameAvailable(String username, Long ignoreId) {
        SysUser user = userMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, username)
                .ne(ignoreId != null, SysUser::getId, ignoreId)
                .last("limit 1"));
        if (user != null) {
            throw new BusinessException("username already exists");
        }
    }

    private void replaceRoles(Long userId, List<Long> roleIds) {
        userRoleMapper.delete(new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getUserId, userId));
        if (roleIds == null || roleIds.isEmpty()) {
            return;
        }
        List<SysUserRole> userRoles = roleIds.stream()
                .distinct()
                .map(roleId -> {
                    SysUserRole ur = new SysUserRole();
                    ur.setUserId(userId);
                    ur.setRoleId(roleId);
                    return ur;
                })
                .collect(Collectors.toList());
        userRoleMapper.insertBatch(userRoles);
    }
}
