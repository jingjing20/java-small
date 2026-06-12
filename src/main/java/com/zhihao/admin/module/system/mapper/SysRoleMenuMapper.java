package com.zhihao.admin.module.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhihao.admin.module.system.entity.SysRoleMenu;
import java.util.List;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SysRoleMenuMapper extends BaseMapper<SysRoleMenu> {

    @Insert("<script>INSERT INTO sys_role_menu (role_id, menu_id) VALUES " +
            "<foreach collection='list' item='item' separator=','>" +
            "(#{item.roleId}, #{item.menuId})" +
            "</foreach></script>")
    void insertBatch(@Param("list") List<SysRoleMenu> list);
}
