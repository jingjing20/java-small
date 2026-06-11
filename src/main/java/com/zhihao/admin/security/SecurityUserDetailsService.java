package com.zhihao.admin.security;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhihao.admin.common.exception.BusinessException;
import com.zhihao.admin.common.exception.ErrorCode;
import com.zhihao.admin.module.system.entity.SysMenu;
import com.zhihao.admin.module.system.entity.SysRole;
import com.zhihao.admin.module.system.entity.SysRoleMenu;
import com.zhihao.admin.module.system.entity.SysUser;
import com.zhihao.admin.module.system.entity.SysUserRole;
import com.zhihao.admin.module.system.mapper.SysMenuMapper;
import com.zhihao.admin.module.system.mapper.SysRoleMapper;
import com.zhihao.admin.module.system.mapper.SysRoleMenuMapper;
import com.zhihao.admin.module.system.mapper.SysUserMapper;
import com.zhihao.admin.module.system.mapper.SysUserRoleMapper;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class SecurityUserDetailsService implements UserDetailsService {

    private final SysUserMapper userMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final SysRoleMapper roleMapper;
    private final SysRoleMenuMapper roleMenuMapper;
    private final SysMenuMapper menuMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        SysUser user = userMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, username)
                .last("limit 1"));
        if (user == null) {
            throw new UsernameNotFoundException("user not found");
        }
        Set<String> permissions = loadPermissions(user.getId());
        List<SimpleGrantedAuthority> authorities = permissions.stream()
                .map(SimpleGrantedAuthority::new)
                .toList();
        return new LoginUser(user.getId(), user.getDeptId(), user.getUsername(), user.getPassword(),
                user.getStatus(), permissions, authorities);
    }

    public LoginUser requireCurrentUser() {
        LoginUser user = SecurityUtils.currentUser();
        if (user == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        return user;
    }

    private Set<String> loadPermissions(Long userId) {
        List<Long> roleIds = userRoleMapper.selectList(new LambdaQueryWrapper<SysUserRole>()
                        .eq(SysUserRole::getUserId, userId))
                .stream()
                .map(SysUserRole::getRoleId)
                .toList();
        if (roleIds.isEmpty()) {
            return Set.of();
        }
        Set<String> permissions = new HashSet<>();
        List<SysRole> roles = roleMapper.selectBatchIds(roleIds);
        roles.stream()
                .filter(role -> role.getStatus() != null && role.getStatus() == 1)
                .map(role -> "ROLE_" + role.getRoleCode())
                .forEach(permissions::add);
        List<Long> menuIds = roleMenuMapper.selectList(new LambdaQueryWrapper<SysRoleMenu>()
                        .in(SysRoleMenu::getRoleId, roleIds))
                .stream()
                .map(SysRoleMenu::getMenuId)
                .distinct()
                .toList();
        if (menuIds.isEmpty()) {
            return permissions;
        }
        menuMapper.selectBatchIds(menuIds).stream()
                .map(SysMenu::getPermission)
                .filter(StringUtils::hasText)
                .forEach(permissions::add);
        return permissions;
    }
}
