---
name: Express Dept Pilot
overview: 在 `server/` 新建 Express + TypeScript + Prisma 后端，以 Dept 模块为试点，复用现有 MySQL 与前端 API 契约；附带最小 Auth/权限/操作日志基础设施，使前端无需改动即可联调。
todos:
  - id: scaffold-server
    content: 创建 server/ 项目：package.json、tsconfig、Express 入口、env 配置
    status: completed
  - id: prisma-schema
    content: 手写 prisma/schema.prisma（dept/user/role/menu/oper_log 相关表），generate client
    status: completed
  - id: common-infra
    content: 实现 ApiResponse、ErrorCode、TreeUtils、全局 error-handler
    status: completed
  - id: auth-minimal
    content: 实现 JWT + login/me/logout + permission.service 权限加载
    status: completed
  - id: middleware
    content: 实现 auth、permission、validate、operation-log 中间件
    status: completed
  - id: dept-module
    content: 实现 dept.routes + dept.service（4 个 API，对标 Java 逻辑）
    status: completed
  - id: vite-proxy
    content: 更新 web/vite.config.ts proxy 指向 localhost:3000
    status: completed
  - id: manual-verify
    content: 启动服务，前端登录并验证部门 CRUD 全流程
    status: completed
isProject: false
---

# Express + Prisma 试点：Dept 模块

## 目标

将 Java 版 [DeptController](src/main/java/com/zhihao/admin/module/system/controller/DeptController.java) 及其依赖翻译成 Node 实现，**API 路径、请求体、响应格式与 Java 版完全一致**，前端 [web/src/api/dept.ts](web/src/api/dept.ts) 零改动。

```mermaid
flowchart LR
  subgraph frontend [web React]
    DeptPage --> deptApi
    LoginPage --> authApi
  end
  subgraph express [server Express TS]
    authRoutes --> authMiddleware
    deptRoutes --> permissionMiddleware
    deptRoutes --> operationLogMiddleware
    deptRoutes --> deptService
    authMiddleware --> prisma
    deptService --> prisma
    operationLogMiddleware --> prisma
  end
  deptApi -->|"/api/system/depts/*"| deptRoutes
  authApi -->|"/api/auth/*"| authRoutes
  prisma --> mysql[(MySQL spring_admin)]
```

## 范围边界

| 纳入 | 不纳入 |
|------|--------|
| `server/` 全新 Express 项目 | Java 代码删除或修改 |
| Dept 4 个 API | User/Role/Menu/Dict/OperLog 业务 API |
| 最小 Auth（login / me / logout） | Swagger / Knife4j |
| JWT 鉴权 + 权限中间件 | 单元测试（除非你后续要求） |
| 操作日志写入 `sys_oper_log` | Prisma migrate（直接对接已有表） |

Dept 带 `@PreAuthorize` 和 `@OperationLog`，没有 Auth 基础设施前端无法登录联调，因此 **Auth 是最小前置，不算扩 scope**。

## 目录结构

```
server/
  package.json
  tsconfig.json
  .env.example
  prisma/schema.prisma
  src/
    index.ts                 # 启动入口
    app.ts                   # Express 实例 + 中间件挂载
    config/env.ts
    common/
      api-response.ts        # 对齐 Java ApiResponse { code, message, data }
      errors.ts              # BusinessException + ErrorCode
      constants.ts           # ROOT_PARENT_ID = 0
      tree-utils.ts          # 移植 TreeUtils.build
    lib/prisma.ts
    middleware/
      auth.ts                # Bearer JWT 解析，挂载 req.user
      permission.ts          # requireAuthority / requireAnyAuthority
      validate.ts            # zod 校验
      operation-log.ts       # 对标 OperationLogAspect
      error-handler.ts       # 对标 GlobalExceptionHandler
    modules/
      auth/
        auth.routes.ts
        auth.service.ts
        permission.service.ts  # 移植 SecurityUserDetailsService.loadPermissions
      dept/
        dept.routes.ts
        dept.service.ts
        dept.schema.ts         # zod DeptRequest
```

## 核心实现对照

### 1. Prisma Schema

基于 [schema.sql](src/main/resources/db/schema.sql) 手写 `schema.prisma`，本次至少建模：

- `SysDept`、`SysUser`（删除校验用）
- `SysUserRole`、`SysRole`、`SysRoleMenu`、`SysMenu`（权限加载用）
- `SysOperLog`（操作日志用）

要点：

- 字段用 `@map("snake_case")` + `@@map("sys_dept")` 对齐现有表
- **逻辑删除**：所有查询加 `where: { deleted: 0 }`；删除用 `update({ deleted: 1 })`，对标 MyBatis Plus `logic-delete-field`
- `BigInt` ID：Prisma 返回 BigInt，响应层 `Number(id)` 序列化（种子数据 id 很小，安全）
- `prisma db pull` 可选，但手写更可控；**不跑 migrate**，避免改动生产库结构

### 2. API 契约（与 Java 完全一致）

| 方法 | 路径 | 权限 | 响应 data |
|------|------|------|-----------|
| GET | `/api/system/depts/tree` | `system:dept:list` 等任一 | `DeptTreeNode[]` |
| POST | `/api/system/depts` | `system:dept:add` | `number`（新 id） |
| PUT | `/api/system/depts/:id` | `system:dept:edit` | `null` |
| DELETE | `/api/system/depts/:id` | `system:dept:delete` | `null` |

统一响应：

```json
{ "code": 0, "message": "ok", "data": ... }
```

业务错误：`code: 1000`，HTTP 400，message 为具体文案（如 `"dept has children"`），对标 [BusinessException](src/main/java/com/zhihao/admin/common/exception/BusinessException.java)。

### 3. Dept 业务逻辑

直接移植 [DeptService](src/main/java/com/zhihao/admin/module/system/service/DeptService.java)：

- `tree()`：查全部未删除部门 → `DeptTreeResponse.from` → [TreeUtils.build](src/main/java/com/zhihao/admin/common/util/TreeUtils.java)
- `create()`：写入字段 + `createTime/updateTime/createBy/updateBy`（对标 [MybatisMetaObjectHandler](src/main/java/com/zhihao/admin/config/MybatisMetaObjectHandler.java)）
- `update()`：禁止 `id === parentId`
- `delete()`：有子部门或有用户则抛 BusinessException，否则逻辑删除

校验用 zod，对标 [DeptRequest](src/main/java/com/zhihao/admin/module/system/dto/DeptRequest.java)：`parentId`、`deptName`、`status` 必填。

### 4. 最小 Auth

移植 [AuthController](src/main/java/com/zhihao/admin/module/system/controller/AuthController.java) + [AuthService](src/main/java/com/zhihao/admin/module/system/service/AuthService.java)：

- `POST /api/auth/login`：bcrypt 校验（`bcryptjs`，兼容 Java `$2a$` 种子密码）
- `GET /api/auth/me`：返回 userId、deptId、username、permissions
- `POST /api/auth/logout`：空操作返回 ok

JWT 用 `jsonwebtoken`，claims 对齐 [JwtService](src/main/java/com/zhihao/admin/security/JwtService.java)：

- `issuer`、`sub`（username）、`userId` claim
- secret / expiration 从 `.env` 读取，与 [application-local.yml](src/main/resources/application-local.yml.example) 保持一致

权限加载移植 [SecurityUserDetailsService.loadPermissions](src/main/java/com/zhihao/admin/security/SecurityUserDetailsService.java)：角色 `ROLE_{roleCode}` + 菜单 `permission` 字段。

### 5. 中间件

```mermaid
sequenceDiagram
  participant Client
  participant Auth as authMiddleware
  participant Perm as permissionMiddleware
  participant Handler as deptHandler
  participant Log as operationLogMiddleware

  Client->>Auth: Bearer token
  Auth->>Perm: req.user + permissions
  Perm->>Handler: authority check
  Handler->>Log: write sys_oper_log
  Log->>Client: ApiResponse
```

- **auth**：除 `POST /api/auth/login` 外全部需认证；无效 token 不阻断请求但无 user（对标 Java filter 行为），无 user 时返回 401
- **permission**：`hasAuthority` / `hasAnyAuthority`，无权限返回 `code: 403`
- **operation-log**：仅 dept 的 POST/PUT/DELETE，对标 [OperationLogAspect](src/main/java/com/zhihao/admin/common/log/OperationLogAspect.java)，写 `sys_oper_log`

### 6. 前端联调改动

仅改 [vite.config.ts](web/vite.config.ts) proxy target：

```ts
'/api': { target: 'http://localhost:3000', changeOrigin: true }
```

Express 监听 `3000`，Java 仍可用 `8080`，两套后端可并存切换。

### 7. 环境配置

`server/.env.example`：

```
DATABASE_URL="mysql://root:password@localhost:3306/spring_admin"
JWT_SECRET="your-jwt-secret-at-least-32-bytes"
JWT_ISSUER="spring-admin-system"
JWT_EXPIRATION_MINUTES=120
PORT=3000
NODE_ENV=development
```

## 验证步骤

1. MySQL 已执行 [schema.sql](src/main/resources/db/schema.sql) 种子数据
2. `cd server && npm install && npx prisma generate && npm run dev`
3. `cd web && npm run dev`
4. 登录 `admin` / 种子密码
5. 部门管理页：树查询、新增、编辑、删除（含子部门/用户占用报错）

## 后续扩展路径

本次打好的 `server/src/common/` + `middleware/` + `modules/auth/` 可直接复用，下一批模块按同样模式追加：

`user` → `role` → `menu` → `dict` → `operlog`

每个模块只需新增 `routes + service + schema`，不重复造基础设施。

## 风险与处理

- **JWT secret 不一致**：Express `.env` 必须与 Java `application-local.yml` 相同，否则旧 token 无效
- **BigInt 序列化**：响应前显式转 `number`，避免 JSON 序列化报错
- **时区**：`create_time` 用 `new Date()`，与 Java `LocalDateTime.now()` 行为足够接近
