package com.zhihao.admin.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhihao.admin.common.api.PageQuery;
import com.zhihao.admin.common.api.PageResult;
import com.zhihao.admin.module.system.entity.SysOperLog;
import com.zhihao.admin.module.system.mapper.SysOperLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OperLogService {

    private final SysOperLogMapper operLogMapper;

    public PageResult<SysOperLog> page(PageQuery query) {
        return PageResult.from(operLogMapper.selectPage(Page.of(query.getPageNum(), query.getPageSize()),
                new LambdaQueryWrapper<SysOperLog>().orderByDesc(SysOperLog::getCreateTime)));
    }

    public void record(SysOperLog log) {
        operLogMapper.insert(log);
    }
}
