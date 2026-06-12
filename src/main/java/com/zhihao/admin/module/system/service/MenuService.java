package com.zhihao.admin.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhihao.admin.common.constant.MenuType;
import com.zhihao.admin.common.constant.SystemConstants;
import com.zhihao.admin.common.exception.BusinessException;
import com.zhihao.admin.common.util.TreeUtils;
import com.zhihao.admin.module.system.dto.MenuRequest;
import com.zhihao.admin.module.system.dto.MenuTreeResponse;
import com.zhihao.admin.module.system.entity.SysMenu;
import com.zhihao.admin.module.system.mapper.SysMenuMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final SysMenuMapper menuMapper;

    public List<MenuTreeResponse> tree() {
        List<MenuTreeResponse> nodes = menuMapper.selectList(new LambdaQueryWrapper<>()).stream()
                .map(MenuTreeResponse::from)
                .toList();
        return TreeUtils.build(nodes, MenuTreeResponse::getId, MenuTreeResponse::getParentId,
                MenuTreeResponse::getSort, (parent, child) -> parent.getChildren().add(child),
                SystemConstants.ROOT_PARENT_ID);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long create(MenuRequest request) {
        validateMenuRequest(request);
        SysMenu menu = new SysMenu();
        apply(menu, request);
        menuMapper.insert(menu);
        return menu.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, MenuRequest request) {
        validateMenuRequest(request);
        SysMenu menu = requireMenu(id);
        if (id.equals(request.parentId())) {
            throw new BusinessException("menu cannot be its own parent");
        }
        apply(menu, request);
        menuMapper.updateById(menu);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        requireMenu(id);
        Long childCount = menuMapper.selectCount(new LambdaQueryWrapper<SysMenu>().eq(SysMenu::getParentId, id));
        if (childCount > 0) {
            throw new BusinessException("menu has children");
        }
        menuMapper.deleteById(id);
    }

    private SysMenu requireMenu(Long id) {
        SysMenu menu = menuMapper.selectById(id);
        if (menu == null) {
            throw new BusinessException("menu not found");
        }
        return menu;
    }

    private void validateMenuRequest(MenuRequest request) {
        if (MenuType.BUTTON.equals(request.menuType()) && !StringUtils.hasText(request.permission())) {
            throw new BusinessException("button menu requires permission");
        }
        if (MenuType.PAGE.equals(request.menuType()) && !StringUtils.hasText(request.path())) {
            throw new BusinessException("page menu requires path");
        }
    }

    private void apply(SysMenu menu, MenuRequest request) {
        menu.setParentId(request.parentId());
        menu.setMenuName(request.menuName());
        menu.setMenuType(request.menuType());
        menu.setPath(request.path());
        menu.setComponent(request.component());
        menu.setPermission(request.permission());
        menu.setIcon(request.icon());
        menu.setSort(request.sort());
        menu.setVisible(request.visible());
        menu.setStatus(request.status());
    }
}
