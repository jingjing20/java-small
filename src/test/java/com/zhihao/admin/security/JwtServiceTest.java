package com.zhihao.admin.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

class JwtServiceTest {

    @Test
    void createdTokenCanExposeUsernameAndUserId() {
        JwtService jwtService = new JwtService(new JwtProperties("test", "12345678901234567890123456789012", 30));
        LoginUser user = new LoginUser(1L, 2L, "admin", "hash", 1, Set.of("system:user:list"),
                List.of(new SimpleGrantedAuthority("system:user:list")));

        String token = jwtService.createToken(user);

        assertThat(jwtService.getUsername(token)).isEqualTo("admin");
        assertThat(jwtService.getUserId(token)).isEqualTo(1L);
    }
}
