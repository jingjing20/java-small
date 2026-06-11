package com.zhihao.admin.module.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhihao.admin.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@TableName("sys_oper_log")
@EqualsAndHashCode(callSuper = true)
public class SysOperLog extends BaseEntity {

    private String title;
    private String businessType;
    private String method;
    private String requestMethod;
    private String requestUri;
    private String operatorName;
    private Long operatorId;
    private String operatorIp;
    private Integer status;
    private String errorMessage;
    private Long costMillis;
}
