package com.zhihao.admin.common.api;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ApiResponseTest {

    @Test
    void okWrapsDataWithSuccessCode() {
        ApiResponse<String> response = ApiResponse.ok("data");

        assertThat(response.getCode()).isZero();
        assertThat(response.getMessage()).isEqualTo("ok");
        assertThat(response.getData()).isEqualTo("data");
    }
}
