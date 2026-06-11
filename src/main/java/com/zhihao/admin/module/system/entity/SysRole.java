package com.zhihao.admin.module.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhihao.admin.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@TableName("sys_role")
@EqualsAndHashCode(callSuper = true)
public class SysRole extends BaseEntity {

    private String roleCode;
    private String roleName;
    private Integer sort;
    private Integer status;
    private String remark;
}
