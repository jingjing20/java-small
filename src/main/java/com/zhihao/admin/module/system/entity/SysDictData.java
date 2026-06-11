package com.zhihao.admin.module.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhihao.admin.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@TableName("sys_dict_data")
@EqualsAndHashCode(callSuper = true)
public class SysDictData extends BaseEntity {

    private Long dictTypeId;
    private String dictLabel;
    private String dictValue;
    private Integer sort;
    private Integer status;
    private String remark;
}
