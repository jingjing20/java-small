package com.zhihao.admin.module.system.dto;

import com.zhihao.admin.module.system.entity.SysMenu;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class MenuTreeResponse {
    private Long id;
    private Long parentId;
    private String menuName;
    private String menuType;
    private String path;
    private String component;
    private String permission;
    private String icon;
    private Integer sort;
    private Integer visible;
    private Integer status;
    private List<MenuTreeResponse> children = new ArrayList<>();

    public static MenuTreeResponse from(SysMenu menu) {
        MenuTreeResponse response = new MenuTreeResponse();
        response.setId(menu.getId());
        response.setParentId(menu.getParentId());
        response.setMenuName(menu.getMenuName());
        response.setMenuType(menu.getMenuType());
        response.setPath(menu.getPath());
        response.setComponent(menu.getComponent());
        response.setPermission(menu.getPermission());
        response.setIcon(menu.getIcon());
        response.setSort(menu.getSort());
        response.setVisible(menu.getVisible());
        response.setStatus(menu.getStatus());
        return response;
    }
}
