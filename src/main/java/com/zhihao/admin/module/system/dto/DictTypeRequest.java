package com.zhihao.admin.module.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DictTypeRequest(@NotBlank String dictName, @NotBlank String dictType,
                              @NotNull Integer status, String remark) {
}
