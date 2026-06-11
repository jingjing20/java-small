package com.zhihao.admin.module.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhihao.admin.common.api.PageQuery;
import com.zhihao.admin.common.api.PageResult;
import com.zhihao.admin.common.exception.BusinessException;
import com.zhihao.admin.module.system.dto.DictDataRequest;
import com.zhihao.admin.module.system.dto.DictTypeRequest;
import com.zhihao.admin.module.system.entity.SysDictData;
import com.zhihao.admin.module.system.entity.SysDictType;
import com.zhihao.admin.module.system.mapper.SysDictDataMapper;
import com.zhihao.admin.module.system.mapper.SysDictTypeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DictService {

    private final SysDictTypeMapper dictTypeMapper;
    private final SysDictDataMapper dictDataMapper;

    public PageResult<SysDictType> typePage(PageQuery query) {
        return PageResult.from(dictTypeMapper.selectPage(Page.of(query.getPageNum(), query.getPageSize()),
                new LambdaQueryWrapper<SysDictType>().orderByDesc(SysDictType::getCreateTime)));
    }

    public Long createType(DictTypeRequest request) {
        SysDictType type = new SysDictType();
        type.setDictName(request.dictName());
        type.setDictType(request.dictType());
        type.setStatus(request.status());
        type.setRemark(request.remark());
        dictTypeMapper.insert(type);
        return type.getId();
    }

    public PageResult<SysDictData> dataPage(PageQuery query, Long dictTypeId) {
        return PageResult.from(dictDataMapper.selectPage(Page.of(query.getPageNum(), query.getPageSize()),
                new LambdaQueryWrapper<SysDictData>()
                        .eq(dictTypeId != null, SysDictData::getDictTypeId, dictTypeId)
                        .orderByAsc(SysDictData::getSort)));
    }

    public Long createData(DictDataRequest request) {
        if (dictTypeMapper.selectById(request.dictTypeId()) == null) {
            throw new BusinessException("dict type not found");
        }
        SysDictData data = new SysDictData();
        data.setDictTypeId(request.dictTypeId());
        data.setDictLabel(request.dictLabel());
        data.setDictValue(request.dictValue());
        data.setSort(request.sort());
        data.setStatus(request.status());
        data.setRemark(request.remark());
        dictDataMapper.insert(data);
        return data.getId();
    }
}
