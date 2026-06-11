package com.zhihao.admin.module.system.controller;

import com.zhihao.admin.common.api.ApiResponse;
import com.zhihao.admin.common.api.PageQuery;
import com.zhihao.admin.common.api.PageResult;
import com.zhihao.admin.common.log.OperationLog;
import com.zhihao.admin.module.system.dto.DictDataRequest;
import com.zhihao.admin.module.system.dto.DictTypeRequest;
import com.zhihao.admin.module.system.entity.SysDictData;
import com.zhihao.admin.module.system.entity.SysDictType;
import com.zhihao.admin.module.system.service.DictService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/system")
@RequiredArgsConstructor
public class DictController {

    private final DictService dictService;

    @GetMapping("/dict-types")
    @PreAuthorize("hasAuthority('system:dict:list')")
    public ApiResponse<PageResult<SysDictType>> typePage(@Valid PageQuery query) {
        return ApiResponse.ok(dictService.typePage(query));
    }

    @PostMapping("/dict-types")
    @PreAuthorize("hasAuthority('system:dict:add')")
    @OperationLog(title = "DictType", businessType = "create")
    public ApiResponse<Long> createType(@Valid @RequestBody DictTypeRequest request) {
        return ApiResponse.ok(dictService.createType(request));
    }

    @GetMapping("/dict-data")
    @PreAuthorize("hasAuthority('system:dict:list')")
    public ApiResponse<PageResult<SysDictData>> dataPage(@Valid PageQuery query,
                                                         @RequestParam(required = false) Long dictTypeId) {
        return ApiResponse.ok(dictService.dataPage(query, dictTypeId));
    }

    @PostMapping("/dict-data")
    @PreAuthorize("hasAuthority('system:dict:add')")
    @OperationLog(title = "DictData", businessType = "create")
    public ApiResponse<Long> createData(@Valid @RequestBody DictDataRequest request) {
        return ApiResponse.ok(dictService.createData(request));
    }
}
