package com.zhihao.admin.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhihao.admin.common.api.PageQuery;
import com.zhihao.admin.common.api.PageResult;
import com.zhihao.admin.common.exception.BusinessException;
import com.zhihao.admin.module.system.dto.RoleMenuUpdateRequest;
import com.zhihao.admin.module.system.dto.RoleRequest;
import com.zhihao.admin.module.system.entity.SysRole;
import com.zhihao.admin.module.system.entity.SysRoleMenu;
import com.zhihao.admin.module.system.entity.SysUserRole;
import com.zhihao.admin.module.system.mapper.SysRoleMapper;
import com.zhihao.admin.module.system.mapper.SysRoleMenuMapper;
import com.zhihao.admin.module.system.mapper.SysUserRoleMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final SysRoleMapper roleMapper;
    private final SysRoleMenuMapper roleMenuMapper;
    private final SysUserRoleMapper userRoleMapper;

    public PageResult<SysRole> page(PageQuery query) {
        return PageResult.from(roleMapper.selectPage(Page.of(query.getPageNum(), query.getPageSize()),
                new LambdaQueryWrapper<SysRole>().orderByAsc(SysRole::getSort)));
    }

    @Transactional(rollbackFor = Exception.class)
    public Long create(RoleRequest request) {
        ensureRoleCodeAvailable(request.roleCode(), null);
        SysRole role = new SysRole();
        apply(role, request);
        roleMapper.insert(role);
        return role.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, RoleRequest request) {
        SysRole role = requireRole(id);
        ensureRoleCodeAvailable(request.roleCode(), id);
        apply(role, request);
        roleMapper.updateById(role);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        SysRole role = requireRole(id);
        role.setRoleCode(role.getRoleCode() + ":" + role.getId());
        roleMapper.updateById(role);
        roleMenuMapper.delete(new LambdaQueryWrapper<SysRoleMenu>().eq(SysRoleMenu::getRoleId, id));
        userRoleMapper.delete(new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getRoleId, id));
        roleMapper.deleteById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateMenus(Long roleId, RoleMenuUpdateRequest request) {
        requireRole(roleId);
        roleMenuMapper.delete(new LambdaQueryWrapper<SysRoleMenu>().eq(SysRoleMenu::getRoleId, roleId));
        List<SysRoleMenu> roleMenus = request.menuIds().stream().distinct().map(menuId -> {
            SysRoleMenu roleMenu = new SysRoleMenu();
            roleMenu.setRoleId(roleId);
            roleMenu.setMenuId(menuId);
            return roleMenu;
        }).toList();
        if (!roleMenus.isEmpty()) {
            roleMenuMapper.insertBatch(roleMenus);
        }
    }

    public List<Long> getMenuIds(Long roleId) {
        requireRole(roleId);
        return roleMenuMapper.selectList(
                new LambdaQueryWrapper<SysRoleMenu>().eq(SysRoleMenu::getRoleId, roleId)
        ).stream().map(SysRoleMenu::getMenuId).toList();
    }

    private SysRole requireRole(Long id) {
        SysRole role = roleMapper.selectById(id);
        if (role == null) {
            throw new BusinessException("role not found");
        }
        return role;
    }

    private void ensureRoleCodeAvailable(String roleCode, Long ignoreId) {
        SysRole role = roleMapper.selectOne(new LambdaQueryWrapper<SysRole>()
                .eq(SysRole::getRoleCode, roleCode)
                .ne(ignoreId != null, SysRole::getId, ignoreId)
                .last("limit 1"));
        if (role != null) {
            throw new BusinessException("role code already exists");
        }
    }

    private void apply(SysRole role, RoleRequest request) {
        role.setRoleCode(request.roleCode());
        role.setRoleName(request.roleName());
        role.setSort(request.sort());
        role.setStatus(request.status());
        role.setRemark(request.remark());
    }
}
