package com.zhihao.admin.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhihao.admin.common.constant.SystemConstants;
import com.zhihao.admin.common.util.TreeUtils;
import com.zhihao.admin.module.system.dto.DeptTreeResponse;
import com.zhihao.admin.module.system.mapper.SysDeptMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeptService {

    private final SysDeptMapper deptMapper;

    public List<DeptTreeResponse> tree() {
        List<DeptTreeResponse> nodes = deptMapper.selectList(new LambdaQueryWrapper<>()).stream()
                .map(DeptTreeResponse::from)
                .toList();
        return TreeUtils.build(nodes, DeptTreeResponse::getId, DeptTreeResponse::getParentId,
                DeptTreeResponse::getSort, (parent, child) -> parent.getChildren().add(child),
                SystemConstants.ROOT_PARENT_ID);
    }
}
