package com.zhihao.admin.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static LoginUser currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof LoginUser user)) {
            return null;
        }
        return user;
    }

    public static Long currentUserIdOrNull() {
        LoginUser user = currentUser();
        return user == null ? null : user.getUserId();
    }
}
