package com.zhihao.admin.module.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhihao.admin.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@TableName("sys_dict_type")
@EqualsAndHashCode(callSuper = true)
public class SysDictType extends BaseEntity {

    private String dictName;
    private String dictType;
    private Integer status;
    private String remark;
}
