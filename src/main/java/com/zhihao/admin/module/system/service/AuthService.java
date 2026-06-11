package com.zhihao.admin.module.system.service;

import com.zhihao.admin.common.exception.BusinessException;
import com.zhihao.admin.module.system.dto.CurrentUserResponse;
import com.zhihao.admin.module.system.dto.LoginRequest;
import com.zhihao.admin.module.system.dto.LoginResponse;
import com.zhihao.admin.security.JwtService;
import com.zhihao.admin.security.LoginUser;
import com.zhihao.admin.security.SecurityUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String TOKEN_TYPE = "Bearer";
    private final SecurityUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        try {
            LoginUser user = (LoginUser) userDetailsService.loadUserByUsername(request.username());
            if (!user.isEnabled() || !passwordEncoder.matches(request.password(), user.getPassword())) {
                throw new BusinessException("invalid username or password");
            }
            return new LoginResponse(jwtService.createToken(user), TOKEN_TYPE);
        } catch (UsernameNotFoundException ex) {
            throw new BusinessException("invalid username or password");
        }
    }

    public CurrentUserResponse me() {
        LoginUser user = userDetailsService.requireCurrentUser();
        return new CurrentUserResponse(user.getUserId(), user.getDeptId(), user.getUsername(), user.getPermissions());
    }
}
