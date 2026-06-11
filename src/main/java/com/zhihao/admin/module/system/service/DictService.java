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
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DictService {

    private final SysDictTypeMapper dictTypeMapper;
    private final SysDictDataMapper dictDataMapper;

    public PageResult<SysDictType> typePage(PageQuery query) {
        return PageResult.from(dictTypeMapper.selectPage(Page.of(query.getPageNum(), query.getPageSize()),
                new LambdaQueryWrapper<SysDictType>().orderByDesc(SysDictType::getCreateTime)));
    }

    @Transactional(rollbackFor = Exception.class)
    public Long createType(DictTypeRequest request) {
        ensureDictTypeAvailable(request.dictType(), null);
        SysDictType type = new SysDictType();
        applyType(type, request);
        dictTypeMapper.insert(type);
        return type.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateType(Long id, DictTypeRequest request) {
        SysDictType type = requireType(id);
        ensureDictTypeAvailable(request.dictType(), id);
        applyType(type, request);
        dictTypeMapper.updateById(type);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteType(Long id) {
        requireType(id);
        Long dataCount = dictDataMapper.selectCount(
                new LambdaQueryWrapper<SysDictData>().eq(SysDictData::getDictTypeId, id));
        if (dataCount > 0) {
            throw new BusinessException("dict type has data");
        }
        dictTypeMapper.deleteById(id);
    }

    public PageResult<SysDictData> dataPage(PageQuery query, Long dictTypeId) {
        return PageResult.from(dictDataMapper.selectPage(Page.of(query.getPageNum(), query.getPageSize()),
                new LambdaQueryWrapper<SysDictData>()
                        .eq(dictTypeId != null, SysDictData::getDictTypeId, dictTypeId)
                        .orderByAsc(SysDictData::getSort)));
    }

    @Transactional(rollbackFor = Exception.class)
    public Long createData(DictDataRequest request) {
        requireType(request.dictTypeId());
        SysDictData data = new SysDictData();
        applyData(data, request);
        dictDataMapper.insert(data);
        return data.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateData(Long id, DictDataRequest request) {
        SysDictData data = requireData(id);
        if (!data.getDictTypeId().equals(request.dictTypeId())) {
            throw new BusinessException("dict data type cannot be changed");
        }
        applyData(data, request);
        dictDataMapper.updateById(data);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteData(Long id) {
        requireData(id);
        dictDataMapper.deleteById(id);
    }

    private SysDictType requireType(Long id) {
        SysDictType type = dictTypeMapper.selectById(id);
        if (type == null) {
            throw new BusinessException("dict type not found");
        }
        return type;
    }

    private SysDictData requireData(Long id) {
        SysDictData data = dictDataMapper.selectById(id);
        if (data == null) {
            throw new BusinessException("dict data not found");
        }
        return data;
    }

    private void ensureDictTypeAvailable(String dictType, Long ignoreId) {
        SysDictType existing = dictTypeMapper.selectOne(new LambdaQueryWrapper<SysDictType>()
                .eq(SysDictType::getDictType, dictType)
                .ne(ignoreId != null, SysDictType::getId, ignoreId)
                .last("limit 1"));
        if (existing != null) {
            throw new BusinessException("dict type already exists");
        }
    }

    private void applyType(SysDictType type, DictTypeRequest request) {
        type.setDictName(request.dictName());
        type.setDictType(request.dictType());
        type.setStatus(request.status());
        type.setRemark(request.remark());
    }

    private void applyData(SysDictData data, DictDataRequest request) {
        data.setDictTypeId(request.dictTypeId());
        data.setDictLabel(request.dictLabel());
        data.setDictValue(request.dictValue());
        data.setSort(request.sort());
        data.setStatus(request.status());
        data.setRemark(request.remark());
    }
}
