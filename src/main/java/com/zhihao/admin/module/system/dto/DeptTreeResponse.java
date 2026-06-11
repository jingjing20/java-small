package com.zhihao.admin.module.system.dto;

import com.zhihao.admin.module.system.entity.SysDept;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class DeptTreeResponse {
    private Long id;
    private Long parentId;
    private String deptName;
    private Integer sort;
    private Integer status;
    private List<DeptTreeResponse> children = new ArrayList<>();

    public static DeptTreeResponse from(SysDept dept) {
        DeptTreeResponse response = new DeptTreeResponse();
        response.setId(dept.getId());
        response.setParentId(dept.getParentId());
        response.setDeptName(dept.getDeptName());
        response.setSort(dept.getSort());
        response.setStatus(dept.getStatus());
        return response;
    }
}
