package com.zhihao.admin.module.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhihao.admin.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@TableName("sys_user")
@EqualsAndHashCode(callSuper = true)
public class SysUser extends BaseEntity {

    private Long deptId;
    private String username;
    private String nickname;
    private String password;
    private String email;
    private String phone;
    private Integer status;
    private String remark;
}
