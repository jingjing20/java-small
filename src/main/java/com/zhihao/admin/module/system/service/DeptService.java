package com.zhihao.admin.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhihao.admin.common.constant.SystemConstants;
import com.zhihao.admin.common.exception.BusinessException;
import com.zhihao.admin.common.util.TreeUtils;
import com.zhihao.admin.module.system.dto.DeptRequest;
import com.zhihao.admin.module.system.dto.DeptTreeResponse;
import com.zhihao.admin.module.system.entity.SysDept;
import com.zhihao.admin.module.system.entity.SysUser;
import com.zhihao.admin.module.system.mapper.SysDeptMapper;
import com.zhihao.admin.module.system.mapper.SysUserMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DeptService {

    private final SysDeptMapper deptMapper;
    private final SysUserMapper userMapper;

    public List<DeptTreeResponse> tree() {
        List<DeptTreeResponse> nodes = deptMapper.selectList(new LambdaQueryWrapper<>()).stream()
                .map(DeptTreeResponse::from)
                .toList();
        return TreeUtils.build(nodes, DeptTreeResponse::getId, DeptTreeResponse::getParentId,
                DeptTreeResponse::getSort, (parent, child) -> parent.getChildren().add(child),
                SystemConstants.ROOT_PARENT_ID);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long create(DeptRequest request) {
        SysDept dept = new SysDept();
        apply(dept, request);
        deptMapper.insert(dept);
        return dept.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, DeptRequest request) {
        SysDept dept = requireDept(id);
        if (id.equals(request.parentId())) {
            throw new BusinessException("dept cannot be its own parent");
        }
        apply(dept, request);
        deptMapper.updateById(dept);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        requireDept(id);
        Long childCount = deptMapper.selectCount(new LambdaQueryWrapper<SysDept>().eq(SysDept::getParentId, id));
        if (childCount > 0) {
            throw new BusinessException("dept has children");
        }
        Long userCount = userMapper.selectCount(new LambdaQueryWrapper<SysUser>().eq(SysUser::getDeptId, id));
        if (userCount > 0) {
            throw new BusinessException("dept has users");
        }
        deptMapper.deleteById(id);
    }

    private SysDept requireDept(Long id) {
        SysDept dept = deptMapper.selectById(id);
        if (dept == null) {
            throw new BusinessException("dept not found");
        }
        return dept;
    }

    private void apply(SysDept dept, DeptRequest request) {
        dept.setParentId(request.parentId());
        dept.setDeptName(request.deptName());
        dept.setSort(request.sort());
        dept.setLeader(request.leader());
        dept.setPhone(request.phone());
        dept.setStatus(request.status());
    }
}
