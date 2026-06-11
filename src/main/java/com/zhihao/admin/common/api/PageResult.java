package com.zhihao.admin.common.api;

import com.baomidou.mybatisplus.core.metadata.IPage;
import java.util.List;
import lombok.Getter;

@Getter
public class PageResult<T> {

    private final long total;
    private final long pageNum;
    private final long pageSize;
    private final List<T> records;

    private PageResult(long total, long pageNum, long pageSize, List<T> records) {
        this.total = total;
        this.pageNum = pageNum;
        this.pageSize = pageSize;
        this.records = records;
    }

    public static <T> PageResult<T> from(IPage<T> page) {
        return new PageResult<>(page.getTotal(), page.getCurrent(), page.getSize(), page.getRecords());
    }
}
