# iStar Backend — Tổng quan dự án

Tệp này tóm tắt toàn bộ backend của dự án iStar, kèm các thay đổi gần đây (tái cấu trúc DTO, tách `UserService`, thống nhất lỗi, bảo mật endpoint).

---

## 1. Mục đích
Dự án là backend cho hệ thống quản lý câu lạc bộ (iStar). Nó cung cấp:
- Xác thực người dùng bằng JWT (đăng ký / đăng nhập)
- Phân quyền theo vai trò (số role) để truy cập các module A/B/C/D
- API quản trị (Admin) để quản lý user: xem, tìm kiếm phân trang, cập nhật, vô hiệu hóa, xóa mềm
- API user để người dùng xem/cập nhật profile và đổi mật khẩu

## 2. Công nghệ chính
- Java 17
- Spring Boot (Web, Security, Data JPA)
- Lombok
- JJWT (io.jsonwebtoken)
- PostgreSQL

## 3. Cấu trúc mã nguồn (đường dẫn chính)
- `src/main/java/com/haui/istar/`
  - `controller/`
    - `auth/` — `AuthController.java` (register, login)
    - `admin/` — `AdminUserController.java` (quản trị user)
    - `user/` — `UserController.java` (user self-service: profile, change password)
    - `Module*Controller.java` — các route mẫu theo role
  - `service/` và `service/impl/`
    - `AuthService` / `AuthServiceImpl` — đăng ký & đăng nhập
    - `UserService` / `UserServiceImpl` — logic liên quan profile (get/update/change password)
    - `AdminUserService` / `AdminUserServiceImpl` — logic quản trị user
  - `model/` — JPA entities
    - `User.java` — users (username, password, email, firstName, lastName, birthday, address, part, phoneNumber, isActive, isDeleted, roles)
    - `UserRole.java` — user_roles (user_id, role)
  - `repository/`
    - `UserRepository.java` — extends `JpaRepository` + `JpaSpecificationExecutor` (tìm kiếm động)
    - `UserSpecification.java` — builder cho Specification (search)
  - `security/`
    - `JwtTokenProvider.java`, `JwtAuthenticationFilter.java`, `CustomUserDetailsService.java`, `UserPrincipal.java`
  - `dto/` (tái cấu trúc)
    - `dto/common/` — `ApiResponse`, `UserDto` (chung)
    - `dto/auth/` — `RegisterRequest`, `LoginRequest`, `LoginResponse`
    - `dto/user/` — `UpdateProfileRequest`, `ChangePasswordRequest`
    - `dto/admin/` — `UpdateUserRequest`, `UserSearchCriteria`
  - `config/` — `SecurityConfig.java`, `GlobalExceptionHandler.java`
  - `exception/` — `ResourceNotFoundException`, `BadRequestException`, `UnauthorizedException`

## 4. Những thay đổi quan trọng gần đây
- Tái cấu trúc DTO: chia theo `common`, `auth`, `user`, `admin` để dễ quản lý.
- Tách `UserService` (không đặt API profile trong `AuthService`):
  - `UserService` chứa `getProfile`, `updateProfile`, `changePassword`.
  - `AuthService` chỉ còn `register` và `login`.
- `UserController`:
  - Bảo vệ bằng `@PreAuthorize("isAuthenticated()")`.
  - Sử dụng `@AuthenticationPrincipal UserPrincipal` để lấy user id thay vì extract thủ công.
  - Endpoints:
    - `GET /api/user/me` — lấy profile
    - `PUT /api/user/me` — cập nhật profile (không được sửa username/password)
    - `PUT /api/user/me/change-password` — đổi mật khẩu (cần oldPassword)
- `AdminUserController`:
  - Không cho phép admin cập nhật `username` qua endpoint `PUT /api/admin/users/{id}` (trả 400 nếu payload có `username`).
- Lỗi & exception handling:
  - Thêm custom exceptions: `ResourceNotFoundException`, `BadRequestException`, `UnauthorizedException`.
  - `GlobalExceptionHandler` được cập nhật để trả `ApiResponse.error(...)` cho các exception này với HTTP status phù hợp.
- Security & JWT:
  - JWT payload vẫn chứa `sub` (userId), `username`, `roles`.
  - `jwt.secret` khuyến nghị lưu ở biến môi trường / secret manager (hiện có giá trị tạm trong `application.properties` — KHÔNG commit giá trị thật vào repo).

## 5. Các endpoint chính (tóm tắt)
- Auth:
  - `POST /api/auth/register` — đăng ký
  - `POST /api/auth/login` — đăng nhập (trả JWT)
- User (self-service):
  - `GET /api/user/me` — xem profile (yêu cầu đăng nhập)
  - `PUT /api/user/me` — cập nhật profile (không đổi username/password)
  - `PUT /api/user/me/change-password` — đổi mật khẩu (yêu cầu oldPassword)
- Admin (role = 0):
  - `GET /api/admin/users` — danh sách phân trang
  - `POST /api/admin/users/search` — tìm kiếm phân trang
  - `GET /api/admin/users/{id}` — chi tiết
  - `PUT /api/admin/users/{id}` — cập nhật (KHÔNG cho đổi username)
  - `DELETE /api/admin/users/{id}` — xóa mềm
  - `PUT /api/admin/users/{id}/deactivate` — vô hiệu hóa
  - `PUT /api/admin/users/{id}/activate` — kích hoạt

## 6. Cách build & chạy (local)
Yêu cầu: Java 17, Maven wrapper.

- Build:

```powershell
cd D:\Study\Project\iStar\istar-club\istar-backend
.\mvnw.cmd -DskipTests package
```

- Chạy:

```powershell
.\mvnw.cmd spring-boot:run
```

## 7. Kiểm tra & testing nhanh
- Build đã kiểm tra: `mvnw.cmd clean compile -DskipTests` — BUILD SUCCESS trong môi trường hiện tại.
- Test flow:
  1. Tạo / đăng nhập user (AuthController) để lấy JWT.
  2. Gọi `GET /api/user/me` với header `Authorization: Bearer <token>`.
  3. Gọi `PUT /api/user/me` (payload không có `username` nor `password`).
  4. Gọi `PUT /api/user/me/change-password` với `{ oldPassword, newPassword }`.
  5. Admin: thử `PUT /api/admin/users/{id}` có trường `username` → sẽ bị từ chối (400).

## 8. Gợi ý cải tiến tiếp theo
- Thêm unit/integration tests cho `UserController` và `AdminUserController` (MockMvc).
- Thêm trường audit (`createdAt`, `updatedAt`, `deletedAt`) cho `User`.
- Cân nhắc sử dụng RSA keys (RS256) cho JWT; dùng public key để verify ở các service khác.
- Thêm Swagger/OpenAPI để document API.
- Triển khai secret management (Vault, AWS Secrets Manager, Azure Key Vault).

---

Nếu bạn muốn, tôi có thể cập nhật `README.md` chính, tạo Postman collection, hoặc viết vài unit tests mẫu. Bạn muốn tôi làm gì tiếp theo?
