package com.zhihao.admin.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhihao.admin.common.constant.SystemConstants;
import com.zhihao.admin.common.util.TreeUtils;
import com.zhihao.admin.module.system.dto.MenuTreeResponse;
import com.zhihao.admin.module.system.mapper.SysMenuMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}
