package com.zhihao.admin.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class PasswordHashTest {

    private static final String SCHEMA_HASH =
            "$2a$10$xvMYjAtxeE.XwuGnTYMMLOuUai/mW0BeUwH0jgw0ivPq6tQcZlZli";

    @Test
    void schemaHashMatchesReadmePassword() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        assertThat(encoder.matches("password", SCHEMA_HASH)).isTrue();
    }
}
