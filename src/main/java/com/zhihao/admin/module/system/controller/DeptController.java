package com.zhihao.admin.module.system.controller;

import com.zhihao.admin.common.api.ApiResponse;
import com.zhihao.admin.common.log.OperationLog;
import com.zhihao.admin.module.system.dto.DeptRequest;
import com.zhihao.admin.module.system.dto.DeptTreeResponse;
import com.zhihao.admin.module.system.service.DeptService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system/depts")
@RequiredArgsConstructor
public class DeptController {

    private final DeptService deptService;

    @GetMapping("/tree")
    @PreAuthorize("hasAnyAuthority('system:dept:list', 'system:user:add', 'system:user:edit')")
    public ApiResponse<List<DeptTreeResponse>> tree() {
        return ApiResponse.ok(deptService.tree());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('system:dept:add')")
    @OperationLog(title = "Dept", businessType = "create")
    public ApiResponse<Long> create(@Valid @RequestBody DeptRequest request) {
        return ApiResponse.ok(deptService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('system:dept:edit')")
    @OperationLog(title = "Dept", businessType = "update")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody DeptRequest request) {
        deptService.update(id, request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:dept:delete')")
    @OperationLog(title = "Dept", businessType = "delete")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        deptService.delete(id);
        return ApiResponse.ok();
    }
}
