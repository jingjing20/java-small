package com.zhihao.admin.module.system.controller;

import com.zhihao.admin.common.api.ApiResponse;
import com.zhihao.admin.common.api.PageResult;
import com.zhihao.admin.common.log.OperationLog;
import com.zhihao.admin.module.system.dto.PasswordResetRequest;
import com.zhihao.admin.module.system.dto.UserCreateRequest;
import com.zhihao.admin.module.system.dto.UserQuery;
import com.zhihao.admin.module.system.dto.UserUpdateRequest;
import com.zhihao.admin.module.system.entity.SysUser;
import com.zhihao.admin.module.system.service.UserService;
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
@RequestMapping("/api/system/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('system:user:list')")
    public ApiResponse<PageResult<SysUser>> page(@Valid UserQuery query) {
        PageResult<SysUser> res = userService.page(query);
        return ApiResponse.ok(res);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('system:user:add')")
    @OperationLog(title = "User", businessType = "create")
    public ApiResponse<Long> create(@Valid @RequestBody UserCreateRequest request) {
        return ApiResponse.ok(userService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('system:user:edit')")
    @OperationLog(title = "User", businessType = "update")
    public ApiResponse<Void> update(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        userService.update(id, request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:user:delete')")
    @OperationLog(title = "User", businessType = "delete")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}/password")
    @PreAuthorize("hasAuthority('system:user:password')")
    @OperationLog(title = "User", businessType = "resetPassword")
    public ApiResponse<Void> resetPassword(@PathVariable Long id, @Valid @RequestBody PasswordResetRequest request) {
        userService.resetPassword(id, request);
        return ApiResponse.ok();
    }
}
