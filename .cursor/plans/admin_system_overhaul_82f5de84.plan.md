---
name: 后台管理系统整改
overview: 先修数据损坏和安全漏洞（P0/P1），再按方案A落地菜单系统，最后补前端体验和代码质量。
todos:
  - id: p0-user-detail-api
    content: "P0: 新建用户详情接口（返回roleIds），列表接口脱敏（去掉password字段）"
    status: completed
  - id: p0-frontend-edit-fix
    content: "P0: 前端编辑用户时请求详情接口，回显已选角色"
    status: completed
  - id: p1-disabled-token
    content: "P1: JWT过滤器中检查用户是否被禁用，禁用则401"
    status: completed
  - id: p1-soft-delete-conflict
    content: "P1: 软删除+唯一索引冲突——删除前改写username/role_code"
    status: completed
  - id: p1-cleanup-associations
    content: "P1: 删除用户/角色时清理关联表（sys_user_role / sys_role_menu）"
    status: completed
  - id: p1-role-code-unique
    content: "P1: 角色创建/编辑时校验role_code唯一性"
    status: completed
  - id: p1-login-error-message
    content: "P1: 登录错误信息统一，防止枚举用户"
    status: completed
  - id: p2-menu-crud-backend
    content: "P2: 菜单管理后端补全CRUD（新增/编辑/删除+树查询）"
    status: completed
  - id: p2-menu-page-frontend
    content: "P2: 菜单管理前端重建为完整CRUD（支持目录/菜单/按钮三种类型）"
    status: completed
  - id: p2-path-alignment
    content: "P2: 前端路由路径与后端seed对齐（/system/user -> /system/users）"
    status: completed
  - id: p3-loading-states
    content: "P3: 所有Modal加提交中状态，登录按钮加loading"
    status: completed
  - id: p3-validation
    content: "P3: 后端补校验（密码长度、邮箱格式、手机号格式）"
    status: completed
  - id: p3-frontend-dedup
    content: "P3: 抽取前端公共CRUD hook/组件，消除User/Role页面重复代码"
    status: completed
  - id: p3-misc-frontend
    content: "P3: AuthGuard失败处理、401清理Zustand、404页面、网页标题"
    status: completed
isProject: false
---

## 第一阶段: P0 — 数据损坏和安全漏洞（最优先）

### 第1步: 用户详情接口 + 密码脱敏

**问题:** 编辑用户时拿不到已有的 roleIds，提交后会清空角色；用户列表接口直接返回了密码 hash。

**改动:**

1. 新建 `UserDetailResponse` DTO（`src/main/java/com/zhihao/admin/module/system/dto/`）:
   - 字段: id, deptId, username, nickname, email, phone, status, remark, roleIds (List\<Long\>)
   - 不包含 password

2. `UserController`:
   - 新增 `GET /{id}` 接口，返回 `ApiResponse<UserDetailResponse>`
   - `page()` 返回类型从 `PageResult<SysUser>` 改为不含 password 的 DTO

3. `UserService`:
   - 新增 `getDetail(Long id)`: 加载用户 + 查 sys_user_role 拿到 roleIds，映射到 DTO
   - `page()` 结果映射到脱敏 DTO

### 第2步: 前端编辑用户回显角色

**文件:** `web/src/pages/system/user/UserPage.tsx`

- `openEdit`: 调用新的 `getUserDetail(record.id)` 接口获取 roleIds
- `form.setFieldsValue` 中包含 `roleIds`
- 用户信息和角色数据都拿到后再打开弹窗

---

## 第二阶段: P1 — 数据一致性

### 第3步: 禁用用户后 token 立即失效

**文件:** `src/main/java/com/zhihao/admin/security/JwtAuthenticationFilter.java`

`loadUserByUsername` 之后，检查 `isEnabled()`。如果用户被禁用，清空 SecurityContext，走 401。

### 第4步: 软删除 + 唯一索引冲突

**做法:** 删除前把 `username` 改写为 `username:123`（加主键），释放唯一索引，然后再逻辑删除。

**文件:** `UserService.delete()` — 先改 username 再 deleteById。

`RoleService.delete()` 同理，改写 `role_code`。

### 第5步: 删除时清理关联表

**文件:** `UserService.delete()`, `RoleService.delete()`

- 删除用户前: 先删 `sys_user_role` 中该用户的记录
- 删除角色前: 先删 `sys_role_menu` 和 `sys_user_role` 中该角色的记录（RoleService 需要注入 SysUserRoleMapper）
- 两个 delete 方法都加 `@Transactional`

### 第6步: 角色编码唯一性校验

**文件:** `RoleService.create()`, `RoleService.update()`

新增 `ensureRoleCodeAvailable(code, ignoreId)` 方法，和用户侧 `ensureUsernameAvailable` 同样的模式。

### 第7步: 统一登录错误信息

**文件:** `AuthService.login()`

两种错误情况（用户不存在、用户被禁用）统一返回 `"invalid username or password"`，不暴露账号是否存在。

---

## 第三阶段: P2 — 方案A: 菜单作为权限载体 + 完整CRUD

### 第8步: 菜单CRUD后端

**文件:** `MenuController.java`, `MenuService.java`, 新建DTO

`MenuController` 新增:
- `POST /` — 新增菜单（根据 menuType 区分目录/菜单/按钮）
- `PUT /{id}` — 编辑菜单
- `DELETE /{id}` — 删除菜单（先检查是否有子菜单）

`MenuService` 新增:
- `create()`, `update()`, `delete()`
- delete 前检查 `hasChildren`

DTO 字段: parentId, menuName, menuType (M/C/B), path, component, permission, icon, sort, visible, status

校验: menuType=B 时 permission 必填；menuType=C 时 path 必填。

### 第9步: 菜单管理前端重建

**文件:** `web/src/pages/system/menu/MenuPage.tsx`

- 保留树形表格展示
- 新增操作列：编辑/删除按钮（用 AuthButton 控制权限 `system:menu:edit` / `system:menu:delete`）
- 新增"新增"按钮（`system:menu:add`）
- 弹窗表单: 上级菜单（树形选择）、菜单名称、菜单类型（单选 M/C/B）、路由路径（M/C时显示）、组件路径（C时显示）、权限标识（B/C时显示）、图标、排序、可见性、状态

### 第10步: 前端路由路径对齐

**文件:** `web/src/router/index.tsx`, `web/src/layouts/AdminLayout.tsx`

与后端 seed 数据对齐:
- `/system/user` → `/system/users`
- `/system/role` → `/system/roles`
- `/system/menu` → `/system/menus`
- `/system/dept` → `/system/depts`
- `/system/dict` → `/system/dicts`
- `/system/log` → `/system/operation-logs`

同步更新 `NAV_ITEMS` 的 key 和 router 的 children path。

---

## 第四阶段: P3 — 体验优化和代码质量

### 第11步: 加载状态

- 所有CRUD弹窗: 加 `confirmLoading`，提交中禁用确认按钮
- 登录页: 登录按钮加 loading 状态

### 第12步: 后端校验

- `UserCreateRequest.password`: 加 `@Size(min=6, max=32)`
- `PasswordResetRequest.password`: 加 `@Size(min=6, max=32)`
- `UserCreateRequest.email`: 加 `@Email`（可选）
- `UserCreateRequest.phone`: 加 `@Pattern` 手机号格式（可选）

### 第13步: 前端去重

从 UserPage/RolePage 中抽取公共 hook `usePageTable<T>`:
- 统一管理 dataSource、loading、query、fetchData
- 统一分页参数

抽取 `StatusTag` 组件，替代各页面重复的启用/禁用标签。

### 第14步: 其他前端修复

- `AuthGuard.tsx`: getMe 失败时 clear() + 跳转登录页，而不是渲染空白布局
- `request.ts` 401 处理: 同时调用 `authStore.getState().clear()`
- 新增 404 兜底路由
- `index.html`: 标题从 "Vite + React + TS" 改为正常名称

---

## 执行顺序

```
第1-2步 (P0) → 第3-7步 (P1) → 第8-10步 (P2) → 第11-14步 (P3)
```

每步单独提交。P0/P1 是纯 bug 修复，不改变产品行为。P2 是产品决策落地。P3 是体验打磨。

## 涉及文件速查

| 阶段 | 后端 | 前端 |
|------|------|------|
| P0 | `UserController`, `UserService`, 新建 UserDetailResponse | `UserPage.tsx`, `user.ts` 新增接口 |
| P1 | `JwtAuthenticationFilter`, `UserService.delete`, `RoleService.delete`, `RoleService`, `AuthService.login` | 无 |
| P2 | `MenuController`, `MenuService`, 新建DTO | `MenuPage.tsx`, `router/index.tsx`, `AdminLayout.tsx` |
| P3 | DTO校验注解 | `AuthGuard.tsx`, `request.ts`, `LoginPage.tsx`, 各页面Modal, `index.html` |
