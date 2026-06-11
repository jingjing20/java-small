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
import com.zhihao.admin.module.system.mapper.SysRoleMapper;
import com.zhihao.admin.module.system.mapper.SysRoleMenuMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final SysRoleMapper roleMapper;
    private final SysRoleMenuMapper roleMenuMapper;

    public PageResult<SysRole> page(PageQuery query) {
        return PageResult.from(roleMapper.selectPage(Page.of(query.getPageNum(), query.getPageSize()),
                new LambdaQueryWrapper<SysRole>().orderByAsc(SysRole::getSort)));
    }

    public Long create(RoleRequest request) {
        SysRole role = new SysRole();
        apply(role, request);
        roleMapper.insert(role);
        return role.getId();
    }

    public void update(Long id, RoleRequest request) {
        SysRole role = requireRole(id);
        apply(role, request);
        roleMapper.updateById(role);
    }

    public void delete(Long id) {
        roleMapper.deleteById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateMenus(Long roleId, RoleMenuUpdateRequest request) {
        requireRole(roleId);
        roleMenuMapper.delete(new LambdaQueryWrapper<SysRoleMenu>().eq(SysRoleMenu::getRoleId, roleId));
        request.menuIds().stream().distinct().forEach(menuId -> {
            SysRoleMenu roleMenu = new SysRoleMenu();
            roleMenu.setRoleId(roleId);
            roleMenu.setMenuId(menuId);
            roleMenuMapper.insert(roleMenu);
        });
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

    private void apply(SysRole role, RoleRequest request) {
        role.setRoleCode(request.roleCode());
        role.setRoleName(request.roleName());
        role.setSort(request.sort());
        role.setStatus(request.status());
        role.setRemark(request.remark());
    }
}
