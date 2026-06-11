package com.zhihao.admin.module.system.controller;

import com.zhihao.admin.common.api.ApiResponse;
import com.zhihao.admin.common.api.PageQuery;
import com.zhihao.admin.common.api.PageResult;
import com.zhihao.admin.common.log.OperationLog;
import com.zhihao.admin.module.system.dto.RoleMenuUpdateRequest;
import com.zhihao.admin.module.system.dto.RoleRequest;
import com.zhihao.admin.module.system.entity.SysRole;
import com.zhihao.admin.module.system.service.RoleService;
import java.util.List;
import jakarta.validation.Valid;
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
@RequestMapping("/system/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAuthority('system:role:list')")
    public ApiResponse<PageResult<SysRole>> page(@Valid PageQuery query) {
        return ApiResponse.ok(roleService.page(query));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('system:role:add')")
    @OperationLog(title = "Role", businessType = "create")
    public ApiResponse<Long> create(@Valid @RequestBody RoleRequest request) {
        return ApiResponse.ok(roleService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('system:role:edit')")
    @OperationLog(title = "Role", businessType = "update")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody RoleRequest request) {
        roleService.update(id, request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:role:delete')")
    @OperationLog(title = "Role", businessType = "delete")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return ApiResponse.ok();
    }

    @GetMapping("/{id}/menus")
    @PreAuthorize("hasAuthority('system:role:menus')")
    public ApiResponse<List<Long>> getMenuIds(@PathVariable Long id) {
        return ApiResponse.ok(roleService.getMenuIds(id));
    }

    @PutMapping("/{id}/menus")
    @PreAuthorize("hasAuthority('system:role:menus')")
    @OperationLog(title = "Role", businessType = "assignMenus")
    public ApiResponse<Void> updateMenus(@PathVariable Long id, @Valid @RequestBody RoleMenuUpdateRequest request) {
        roleService.updateMenus(id, request);
        return ApiResponse.ok();
    }
}
