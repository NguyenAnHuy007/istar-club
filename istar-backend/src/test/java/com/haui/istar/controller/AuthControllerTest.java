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
                .andExpect(jsonPath("$.message").value("Đăng ký thành công! Tài khoản của bạn đang chờ Quản trị viên kích hoạt."))
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

    @Autowired
    private com.haui.istar.repository.UserRepository userRepository;

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
    @DisplayName("Đăng nhập thất bại khi tài khoản mới đăng ký chưa kích hoạt (ACCOUNT_INACTIVE)")
    void testLogin_NewlyRegisteredUser_Inactive() throws Exception {
        // Đăng ký tài khoản mới (mặc định isActive = false)
        RegisterRequest registerReq = RegisterRequest.builder()
                .username("inactive_test_user")
                .password("secret123")
                .email("inactive_test@gmail.com")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk());

        // Đăng nhập ngay khi chưa kích hoạt -> trả về 403 Forbidden kèm ACCOUNT_INACTIVE
        LoginRequest loginReq = new LoginRequest("inactive_test_user", "secret123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("ACCOUNT_INACTIVE")));
    }

    @Test
    @DisplayName("Đăng nhập thành công khi tài khoản đã được kích hoạt")
    void testLogin_Success_WhenActive() throws Exception {
        // Đăng ký tài khoản
        RegisterRequest registerReq = RegisterRequest.builder()
                .username("active_test_user")
                .password("secret123")
                .email("active_test@gmail.com")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk());

        // Kích hoạt tài khoản
        userRepository.findByUsername("active_test_user").ifPresent(user -> {
            user.setIsActive(true);
            userRepository.save(user);
        });

        // Thực hiện đăng nhập sau khi kích hoạt
        LoginRequest loginReq = new LoginRequest("active_test_user", "secret123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đăng nhập thành công!"))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.type").value("Bearer"))
                .andExpect(jsonPath("$.data.username").value("active_test_user"));
    }

    @Test
    @DisplayName("Đăng nhập thành công với tài khoản Admin mặc định")
    void testLogin_DefaultAdmin() throws Exception {
        LoginRequest loginReq = new LoginRequest("admin", "admin123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.username").value("admin"));
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi sai mật khẩu")
    void testLogin_WrongPassword() throws Exception {
        // Tạo và kích hoạt user
        RegisterRequest registerReq = RegisterRequest.builder()
                .username("wrong_pass_user")
                .password("correct_pass")
                .email("wrong_pass@gmail.com")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk());

        userRepository.findByUsername("wrong_pass_user").ifPresent(user -> {
            user.setIsActive(true);
            userRepository.save(user);
        });

        LoginRequest loginReq = new LoginRequest("wrong_pass_user", "incorrect_pass");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());
    }
}
