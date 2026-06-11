package com.zhihao.admin.module.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DictDataRequest(@NotNull Long dictTypeId, @NotBlank String dictLabel, @NotBlank String dictValue,
                              Integer sort, @NotNull Integer status, String remark) {
}
