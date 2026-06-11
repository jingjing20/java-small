CREATE DATABASE IF NOT EXISTS spring_admin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE spring_admin;

CREATE TABLE IF NOT EXISTS sys_dept (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT NOT NULL DEFAULT 0,
    dept_name VARCHAR(64) NOT NULL,
    sort INT DEFAULT 0,
    leader VARCHAR(64),
    phone VARCHAR(32),
    status TINYINT NOT NULL DEFAULT 1,
    create_time DATETIME,
    update_time DATETIME,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dept_id BIGINT,
    username VARCHAR(64) NOT NULL,
    nickname VARCHAR(64) NOT NULL,
    password VARCHAR(128) NOT NULL,
    email VARCHAR(128),
    phone VARCHAR(32),
    status TINYINT NOT NULL DEFAULT 1,
    remark VARCHAR(255),
    create_time DATETIME,
    update_time DATETIME,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_sys_user_username (username)
);

CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_code VARCHAR(64) NOT NULL,
    role_name VARCHAR(64) NOT NULL,
    sort INT DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1,
    remark VARCHAR(255),
    create_time DATETIME,
    update_time DATETIME,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_sys_role_code (role_code)
);

CREATE TABLE IF NOT EXISTS sys_menu (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT NOT NULL DEFAULT 0,
    menu_name VARCHAR(64) NOT NULL,
    menu_type VARCHAR(16) NOT NULL,
    path VARCHAR(128),
    component VARCHAR(128),
    permission VARCHAR(128),
    icon VARCHAR(64),
    sort INT DEFAULT 0,
    visible TINYINT NOT NULL DEFAULT 1,
    status TINYINT NOT NULL DEFAULT 1,
    create_time DATETIME,
    update_time DATETIME,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sys_user_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    UNIQUE KEY uk_sys_user_role (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS sys_role_menu (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    menu_id BIGINT NOT NULL,
    UNIQUE KEY uk_sys_role_menu (role_id, menu_id)
);

CREATE TABLE IF NOT EXISTS sys_dict_type (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dict_name VARCHAR(64) NOT NULL,
    dict_type VARCHAR(64) NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    remark VARCHAR(255),
    create_time DATETIME,
    update_time DATETIME,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_sys_dict_type (dict_type)
);

CREATE TABLE IF NOT EXISTS sys_dict_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dict_type_id BIGINT NOT NULL,
    dict_label VARCHAR(64) NOT NULL,
    dict_value VARCHAR(64) NOT NULL,
    sort INT DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1,
    remark VARCHAR(255),
    create_time DATETIME,
    update_time DATETIME,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sys_oper_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(64),
    business_type VARCHAR(64),
    method VARCHAR(255),
    request_method VARCHAR(16),
    request_uri VARCHAR(255),
    operator_name VARCHAR(64),
    operator_id BIGINT,
    operator_ip VARCHAR(64),
    status TINYINT,
    error_message VARCHAR(512),
    cost_millis BIGINT,
    create_time DATETIME,
    update_time DATETIME,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT NOT NULL DEFAULT 0
);

INSERT IGNORE INTO sys_dept (id, parent_id, dept_name, sort, leader, phone, status, create_time, update_time, deleted)
VALUES (1, 0, 'Headquarters', 1, 'admin', '10000000000', 1, NOW(), NOW(), 0);

INSERT IGNORE INTO sys_user (id, dept_id, username, nickname, password, status, create_time, update_time, deleted)
VALUES (1, 1, 'admin', 'Administrator', '$2a$10$xvMYjAtxeE.XwuGnTYMMLOuUai/mW0BeUwH0jgw0ivPq6tQcZlZli', 1, NOW(), NOW(), 0);

INSERT IGNORE INTO sys_role (id, role_code, role_name, sort, status, create_time, update_time, deleted)
VALUES (1, 'admin', 'Administrator', 1, 1, NOW(), NOW(), 0);

INSERT IGNORE INTO sys_user_role (id, user_id, role_id) VALUES (1, 1, 1);

INSERT IGNORE INTO sys_menu (id, parent_id, menu_name, menu_type, path, component, permission, sort, visible, status, create_time, update_time, deleted)
VALUES
(100, 0, 'System', 'M', '/system', 'Layout', NULL, 1, 1, 1, NOW(), NOW(), 0),
(101, 100, 'User', 'C', '/system/users', 'system/user/index', 'system:user:list', 1, 1, 1, NOW(), NOW(), 0),
(102, 100, 'Role', 'C', '/system/roles', 'system/role/index', 'system:role:list', 2, 1, 1, NOW(), NOW(), 0),
(103, 100, 'Menu', 'C', '/system/menus', 'system/menu/index', 'system:menu:list', 3, 1, 1, NOW(), NOW(), 0),
(104, 100, 'Dept', 'C', '/system/depts', 'system/dept/index', 'system:dept:list', 4, 1, 1, NOW(), NOW(), 0),
(105, 100, 'Dict', 'C', '/system/dicts', 'system/dict/index', 'system:dict:list', 5, 1, 1, NOW(), NOW(), 0),
(106, 100, 'Operation Log', 'C', '/system/operation-logs', 'system/operlog/index', 'system:operlog:list', 6, 1, 1, NOW(), NOW(), 0),
(201, 101, 'User Add', 'B', NULL, NULL, 'system:user:add', 1, 1, 1, NOW(), NOW(), 0),
(202, 101, 'User Edit', 'B', NULL, NULL, 'system:user:edit', 2, 1, 1, NOW(), NOW(), 0),
(203, 101, 'User Delete', 'B', NULL, NULL, 'system:user:delete', 3, 1, 1, NOW(), NOW(), 0),
(204, 101, 'User Password', 'B', NULL, NULL, 'system:user:password', 4, 1, 1, NOW(), NOW(), 0),
(205, 102, 'Role Add', 'B', NULL, NULL, 'system:role:add', 1, 1, 1, NOW(), NOW(), 0),
(206, 102, 'Role Edit', 'B', NULL, NULL, 'system:role:edit', 2, 1, 1, NOW(), NOW(), 0),
(207, 102, 'Role Delete', 'B', NULL, NULL, 'system:role:delete', 3, 1, 1, NOW(), NOW(), 0),
(208, 102, 'Role Menus', 'B', NULL, NULL, 'system:role:menus', 4, 1, 1, NOW(), NOW(), 0),
(209, 105, 'Dict Add', 'B', NULL, NULL, 'system:dict:add', 1, 1, 1, NOW(), NOW(), 0),
(210, 103, 'Menu Add', 'B', NULL, NULL, 'system:menu:add', 1, 1, 1, NOW(), NOW(), 0),
(211, 103, 'Menu Edit', 'B', NULL, NULL, 'system:menu:edit', 2, 1, 1, NOW(), NOW(), 0),
(212, 103, 'Menu Delete', 'B', NULL, NULL, 'system:menu:delete', 3, 1, 1, NOW(), NOW(), 0),
(213, 104, 'Dept Add', 'B', NULL, NULL, 'system:dept:add', 1, 1, 1, NOW(), NOW(), 0),
(214, 104, 'Dept Edit', 'B', NULL, NULL, 'system:dept:edit', 2, 1, 1, NOW(), NOW(), 0),
(215, 104, 'Dept Delete', 'B', NULL, NULL, 'system:dept:delete', 3, 1, 1, NOW(), NOW(), 0),
(216, 105, 'Dict Edit', 'B', NULL, NULL, 'system:dict:edit', 2, 1, 1, NOW(), NOW(), 0),
(217, 105, 'Dict Delete', 'B', NULL, NULL, 'system:dict:delete', 3, 1, 1, NOW(), NOW(), 0);

INSERT IGNORE INTO sys_role_menu (id, role_id, menu_id)
SELECT id, 1, id FROM sys_menu WHERE deleted = 0;

INSERT IGNORE INTO sys_dict_type (id, dict_name, dict_type, status, create_time, update_time, deleted)
VALUES (1, 'System Status', 'sys_status', 1, NOW(), NOW(), 0);

INSERT IGNORE INTO sys_dict_data (id, dict_type_id, dict_label, dict_value, sort, status, create_time, update_time, deleted)
VALUES (1, 1, 'Enabled', '1', 1, 1, NOW(), NOW(), 0),
       (2, 1, 'Disabled', '0', 2, 1, NOW(), NOW(), 0);
