package com.haui.istar.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.haui.istar.dto.auth.LoginRequest;
import com.haui.istar.dto.auth.RegisterRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
public class AuthControllerTest {

    @Autowired
    private WebApplicationContext context;

    private ObjectMapper objectMapper;
    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        objectMapper = new ObjectMapper();

        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    @DisplayName("Đăng ký thành công với thông tin hợp lệ")
    void testRegister_Success() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("testuser_01")
                .password("password123")
                .email("testuser_01@gmail.com")
                .firstName("Nguyen")
                .lastName("An")
                .school("CNTT")
                .majorClass("KTPM01")
                .course("K16")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đăng ký thành công!"))
                .andExpect(jsonPath("$.data.username").value("testuser_01"))
                .andExpect(jsonPath("$.data.email").value("testuser_01@gmail.com"));
    }

    @Test
    @DisplayName("Đăng ký thất bại khi trùng Username")
    void testRegister_DuplicateUsername() throws Exception {
        RegisterRequest request1 = RegisterRequest.builder()
                .username("duplicate_user")
                .password("password123")
                .email("user1@gmail.com")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk());

        RegisterRequest request2 = RegisterRequest.builder()
                .username("duplicate_user")
                .password("password123")
                .email("user2@gmail.com")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Username đã tồn tại!"));
    }

    @Test
    @DisplayName("Đăng ký thất bại khi trùng Email")
    void testRegister_DuplicateEmail() throws Exception {
        RegisterRequest request1 = RegisterRequest.builder()
                .username("user_email_1")
                .password("password123")
                .email("same_email@gmail.com")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk());

        RegisterRequest request2 = RegisterRequest.builder()
                .username("user_email_2")
                .password("password123")
                .email("same_email@gmail.com")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Email đã tồn tại!"));
    }

    @Test
    @DisplayName("Đăng ký thất bại khi thiếu thông tin bắt buộc")
    void testRegister_ValidationError() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("")
                .password("123")
                .email("invalid-email")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Đăng nhập thành công và trả về JWT Token")
    void testLogin_Success() throws Exception {
        // Đăng ký trước
        RegisterRequest registerReq = RegisterRequest.builder()
                .username("login_test_user")
                .password("secret123")
                .email("login_test@gmail.com")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk());

        // Thực hiện đăng nhập
        LoginRequest loginReq = new LoginRequest("login_test_user", "secret123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đăng nhập thành công!"))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.type").value("Bearer"))
                .andExpect(jsonPath("$.data.username").value("login_test_user"));
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi sai mật khẩu")
    void testLogin_WrongPassword() throws Exception {
        RegisterRequest registerReq = RegisterRequest.builder()
                .username("wrong_pass_user")
                .password("correct_pass")
                .email("wrong_pass@gmail.com")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk());

        LoginRequest loginReq = new LoginRequest("wrong_pass_user", "incorrect_pass");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());
    }
}
