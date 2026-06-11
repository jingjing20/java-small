---
name: React Antd 管理前端
overview: 在仓库 web/ 子目录新建 React + Vite + TS + Antd v5 + Zustand 后台管理前端，对接现有 Spring Boot 接口；同时给后端补一个角色菜单回显 GET 接口。
todos:
  - id: backend-role-menus
    content: 后端补 GET /system/roles/{id}/menus 回显接口
    status: completed
  - id: scaffold
    content: 创建 web/ Vite 脚手架，axios 封装、proxy、auth store
    status: completed
  - id: login-layout
    content: 登录页 + 路由守卫 + AdminLayout 侧边菜单
    status: completed
  - id: user-page
    content: 用户管理：分页搜索 + 增删改 + 重置密码
    status: completed
  - id: role-page
    content: 角色管理：CRUD + 分配菜单树勾选回显
    status: completed
  - id: other-pages
    content: 菜单/部门树、字典、操作日志页面
    status: completed
  - id: verify
    content: 前后端联调验证全流程
    status: completed
isProject: false
---

# React + Antd 后台管理前端

## 技术栈与位置

- 位置：`web/`（仓库子目录，独立 npm 工程）
- React 18 + TypeScript + Vite + Ant Design v5 + Zustand + axios + react-router v6
- 开发期跨域：Vite proxy 把 `/auth`、`/system` 转发到 `http://localhost:8080`，不动后端 CORS

## 后端小改动（仅 1 个接口）

- [RoleController](src/main/java/com/zhihao/admin/module/system/controller/RoleController.java) 增加 `GET /system/roles/{id}/menus`，返回 `List<Long>` menuIds，权限 `system:role:menus`，用于编辑角色时回填菜单勾选框。Service 层直接查 `sys_role_menu`。

## 前端结构

```
web/src/
├── api/            axios 实例 + 各模块 API 函数（含 TS 类型定义）
├── stores/         Zustand: auth store（token + 当前用户 + permissions）
├── router/         路由表 + 登录守卫
├── layouts/        AdminLayout（侧边菜单 + Header + 面包屑 + 退出）
├── components/     AuthButton（按权限标识控制按钮显隐）
└── pages/
    ├── login/
    ├── system/user/      列表(分页/搜索) + 新增/编辑弹窗 + 重置密码 + 删除
    ├── system/role/      列表 + CRUD + 分配菜单(Tree 勾选, 回显用新接口)
    ├── system/menu/      菜单树（只读表格树，后端无 CRUD）
    ├── system/dept/      部门树（只读）
    ├── system/dict/      字典类型列表 + 字典数据列表（只有查询+新增，与后端对齐）
    └── system/log/       操作日志分页列表
```

## 核心约定（与后端对齐）

- axios 拦截器：请求带 `Authorization: Bearer <token>`；响应解包 `ApiResponse`，`code !== 0` 统一 `message.error`，`401` 清 token 跳登录
- 分页参数固定 `pageNum`/`pageSize`，响应 `{total, records}`
- 登录流程：`POST /auth/login` 存 token（localStorage + Zustand）→ `GET /auth/me` 拿 `permissions` → 侧边菜单和按钮按权限过滤
- 路由表为前端静态定义，按 `permissions` 中的页面级权限（如 `system:user:list`）过滤菜单项
- 用户表单的 `deptId` 用部门树 TreeSelect，`roleIds` 用角色下拉（取角色列表接口）
- 后端返回的 `password` hash 字段前端直接忽略，不展示
- 不做后端没有的功能：部门/菜单 CRUD、字典改删，页面上不放假按钮

## 实施顺序

1. 后端补 `GET /system/roles/{id}/menus`
2. `web/` 脚手架：Vite + 依赖 + proxy + axios 封装 + auth store
3. 登录页 + 路由守卫 + AdminLayout
4. 用户管理（最复杂，先打样板）
5. 角色管理 + 分配菜单
6. 菜单/部门树、字典、操作日志
7. 启动前后端联调验证：登录 → 各页面 CRUD 走通

## 验证

- 后端 `mvn compile` 通过，新接口用 curl 验证
- 前端 `npm run build` 无 TS 错误
- admin 登录后所有菜单可见、用户 CRUD、角色分配菜单回显正确