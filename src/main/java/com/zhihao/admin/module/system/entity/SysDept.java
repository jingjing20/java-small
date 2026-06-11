package com.zhihao.admin.module.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhihao.admin.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@TableName("sys_dept")
@EqualsAndHashCode(callSuper = true)
public class SysDept extends BaseEntity {

    private Long parentId;
    private String deptName;
    private Integer sort;
    private String leader;
    private String phone;
    private Integer status;
}
