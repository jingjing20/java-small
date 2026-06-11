package com.zhihao.admin.module.system.dto;

import com.zhihao.admin.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class UserQuery extends PageQuery {
    private String username;
    private String phone;
    private Integer status;
}
