package com.zhihao.admin.module.system.controller;

import com.zhihao.admin.common.api.ApiResponse;
import com.zhihao.admin.common.log.OperationLog;
import com.zhihao.admin.module.system.dto.MenuRequest;
import com.zhihao.admin.module.system.dto.MenuTreeResponse;
import com.zhihao.admin.module.system.service.MenuService;
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
@RequestMapping("/api/system/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/tree")
    @PreAuthorize("hasAnyAuthority('system:menu:list', 'system:role:menus')")
    public ApiResponse<List<MenuTreeResponse>> tree() {
        return ApiResponse.ok(menuService.tree());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('system:menu:add')")
    @OperationLog(title = "Menu", businessType = "create")
    public ApiResponse<Long> create(@Valid @RequestBody MenuRequest request) {
        return ApiResponse.ok(menuService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('system:menu:edit')")
    @OperationLog(title = "Menu", businessType = "update")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody MenuRequest request) {
        menuService.update(id, request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:menu:delete')")
    @OperationLog(title = "Menu", businessType = "delete")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        menuService.delete(id);
        return ApiResponse.ok();
    }
}
