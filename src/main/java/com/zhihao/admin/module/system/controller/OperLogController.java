package com.zhihao.admin.module.system.controller;

import com.zhihao.admin.common.api.ApiResponse;
import com.zhihao.admin.common.api.PageQuery;
import com.zhihao.admin.common.api.PageResult;
import com.zhihao.admin.module.system.entity.SysOperLog;
import com.zhihao.admin.module.system.service.OperLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/system/operation-logs")
@RequiredArgsConstructor
public class OperLogController {

    private final OperLogService operLogService;

    @GetMapping
    @PreAuthorize("hasAuthority('system:operlog:list')")
    public ApiResponse<PageResult<SysOperLog>> page(@Valid PageQuery query) {
        return ApiResponse.ok(operLogService.page(query));
    }
}
