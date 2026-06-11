package com.zhihao.admin.security;

import java.util.Collection;
import java.util.Set;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class LoginUser implements UserDetails {

    private final Long userId;
    private final Long deptId;
    private final String username;
    private final String password;
    private final Integer status;
    private final Set<String> permissions;
    private final Collection<? extends GrantedAuthority> authorities;

    public LoginUser(Long userId, Long deptId, String username, String password, Integer status,
                     Set<String> permissions, Collection<? extends GrantedAuthority> authorities) {
        this.userId = userId;
        this.deptId = deptId;
        this.username = username;
        this.password = password;
        this.status = status;
        this.permissions = permissions;
        this.authorities = authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status != null && status == 1;
    }
}
