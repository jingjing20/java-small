package com.zhihao.admin.module.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhihao.admin.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@TableName("sys_menu")
@EqualsAndHashCode(callSuper = true)
public class SysMenu extends BaseEntity {

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
}
