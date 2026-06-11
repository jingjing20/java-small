package com.zhihao.admin.module.system.controller;

import com.zhihao.admin.common.api.ApiResponse;
import com.zhihao.admin.module.system.dto.DeptTreeResponse;
import com.zhihao.admin.module.system.service.DeptService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/system/depts")
@RequiredArgsConstructor
public class DeptController {

    private final DeptService deptService;

    @GetMapping("/tree")
    @PreAuthorize("hasAuthority('system:dept:list')")
    public ApiResponse<List<DeptTreeResponse>> tree() {
        return ApiResponse.ok(deptService.tree());
    }
}
