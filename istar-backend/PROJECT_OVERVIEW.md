# iStar Backend — Tổng quan dự án (Phiên bản cập nhật)

Tệp này mô tả ngắn gọn cấu trúc, các thành phần chính, các endpoint quan trọng và hướng dẫn build/run cho dự án iStar Backend tại thời điểm này.

---

## 1. Mục đích

iStar Backend là dịch vụ REST API cho hệ thống quản lý câu lạc bộ iStar. Mục tiêu chính:
- Cung cấp xác thực JWT (register / login) và phân quyền theo vai trò.
- Cung cấp API user để quản lý thông tin cá nhân (profile, đổi mật khẩu).
- Cung cấp API admin để quản trị users và xử lý các đơn ứng tuyển (applications).
- Hỗ trợ xuất báo cáo (Excel) và các thao tác tìm kiếm phân trang.

## 2. Công nghệ chính

- Java 17
- Spring Boot (Web, Security, Data JPA)
- Lombok
- Apache POI (Excel export)
- JJWT (JWT)
- PostgreSQL (hoặc bất kỳ RDBMS tương thích JPA)
- Maven (maven wrapper `mvnw.cmd` có sẵn)

---

## 3. Cấu trúc mã nguồn chính

Đường dẫn gốc: `src/main/java/com/haui/istar/`

- `controller/` — REST controllers
  - `auth/` — xác thực (AuthController)
  - `admin/` — API dành cho admin (AdminUserController, AdminApplicationController)
  - `user/` — API dành cho người dùng (UserController, ApplicationFormController)

- `dto/` — Data Transfer Objects (đã tổ chức theo chức năng)
  - `dto.application` — DTO liên quan "application" (application request/response/search/update)
  - `dto.auth` — DTO cho auth (RegisterRequest, LoginRequest/Response)
  - `dto.user` — DTO cho user (UpdateProfileRequest, ChangePasswordRequest)
  - `dto.admin` — DTO admin (UpdateUserRequest, UserSearchCriteria)
  - `dto.common` — DTO dùng chung (ApiResponse, UserDto, ...)

- `service/` — Interfaces và `service/impl/` — implementations
  - `AuthService` / `AuthServiceImpl` — đăng ký, đăng nhập
  - `UserService` / `UserServiceImpl` — profile, change password
  - `AdminUserService` / `AdminUserServiceImpl` — quản trị users
  - `ApplicationFormService` / `ApplicationFormServiceImpl` — xử lý đơn ứng tuyển của user
  - `AdminApplicationService` / `AdminApplicationServiceImpl` — logic admin cho applications (search, approve, reject)

- `model/` — JPA entities
  - `User.java` — thực thể người dùng (department enum, audit fields)
  - `Application.java` — thực thể đơn ứng tuyển (status enum, audit fields)
  - `UserRole.java` — mapping user-role
  - `model/enums/` — chứa enum `Department`, `ApplicationStatus` (tách riêng)

- `repository/` — Spring Data repositories
  - `ApplicationRepository.java`, `UserRepository.java`, `UserRoleRepository.java`
  - `repository/specification/` — chứa `UserSpecification`, `ApplicationSpecification` cho tìm kiếm động (Specification API)

- `security/` — security components
  - `JwtTokenProvider`, `JwtAuthenticationFilter`, `CustomUserDetailsService`, `UserPrincipal`

- `config/` — cấu hình chung
  - `SecurityConfig.java`, `GlobalExceptionHandler.java`

- `util/` — helpers
  - `ExcelExporter.java` — xuất danh sách đơn ra file Excel

- `exception/` — custom exceptions
  - `ResourceNotFoundException`, `BadRequestException`, `UnauthorizedException`

---

## 4. Những thay đổi, tối ưu đáng chú ý (gần đây)

- Tái cấu trúc DTO theo chức năng (`dto.application`, `dto.auth`, `dto.user`, `dto.admin`, `dto.common`) để dễ quản lý.
- Đổi `RegisterApplicationForm` thành `Application` (entity), kèm `ApplicationRepository`.
- Thêm `AdminApplicationService` và `AdminApplicationController` để tách rõ logic admin cho applications.
- Thống nhất đổi trường `part` → `department` và sử dụng enum `Department` (giá trị `MODERN_DANCE` sửa lỗi chính tả).
- Thêm audit fields (`createdAt`, `updatedAt`) cho entities chính.
- Thêm `ApplicationStatus` enum (PENDING/APPROVED/REJECTED) và logic approve/reject.
- Tách các Specification vào `repository/specification/` để hỗ trợ tìm kiếm động và pagination.

---

## 5. Các endpoint chính (tóm tắt)

### Authentication (Public - không cần token)
- POST `/api/auth/register` — đăng ký tài khoản mới
- POST `/api/auth/login` — đăng nhập (trả JWT token)

### User Profile (Authenticated - cần token)
- GET `/api/users/me` — lấy thông tin profile của user hiện tại
- PUT `/api/users/me` — cập nhật profile (không đổi username/password)
- PUT `/api/users/me/change-password` — đổi mật khẩu (cần oldPassword)

### Applications - Đơn ứng tuyển (Authenticated - cần token)
- POST `/api/applications` — nộp đơn ứng tuyển mới
- PUT `/api/applications/{id}` — cập nhật đơn của user
- DELETE `/api/applications/{id}` — xóa đơn của user

### Admin - Quản lý Users (Cần role ADMIN hoặc ROLE_0)
- GET `/api/admin/users` — danh sách người dùng (pagination)
- POST `/api/admin/users/search` — tìm kiếm người dùng với filter (Specification + pagination)
- GET `/api/admin/users/{id}` — xem chi tiết user
- PUT `/api/admin/users/{id}` — cập nhật thông tin user (không cho đổi username)
- DELETE `/api/admin/users/{id}` — xóa mềm user
- PUT `/api/admin/users/{id}/deactivate` — vô hiệu hóa tài khoản
- PUT `/api/admin/users/{id}/activate` — kích hoạt lại tài khoản

### Admin - Quản lý Applications (Cần role ADMIN hoặc ROLE_0)
- POST `/api/admin/applications/search` — tìm kiếm đơn ứng tuyển (pagination + filter)
- GET `/api/admin/applications/{id}` — xem chi tiết đơn
- PUT `/api/admin/applications/{id}` — admin cập nhật đơn
- DELETE `/api/admin/applications/{id}` — xóa đơn
- PUT `/api/admin/applications/{id}/approve` — duyệt đơn (status → APPROVED)
- PUT `/api/admin/applications/{id}/reject` — từ chối đơn (status → REJECTED)
- GET `/api/admin/applications/export-excel` — xuất tất cả đơn ra file Excel

---

## 6. Cấu hình Security

SecurityConfig đã được tối ưu với logic rõ ràng theo từng nhóm endpoint:

```java
// Public - không cần authentication
/api/auth/**                    → permitAll()
/api/public/**                  → permitAll()

// Admin - cần role ADMIN hoặc ROLE_0
/api/admin/**                   → hasAnyRole("0", "ADMIN")

// User authenticated endpoints
/api/users/me/**                → authenticated()
/api/applications/**            → authenticated()

// Module endpoints theo role cụ thể
/api/module-a/**                → hasRole("1")
/api/module-b/**                → hasRole("2")
/api/module-c/**                → hasRole("3")
/api/module-d/**                → hasRole("4")

// Default
anyRequest()                    → authenticated()
```

**Lưu ý:** 
- Thứ tự requestMatchers từ cụ thể đến chung để tránh conflict
- Controllers có thể thêm `@PreAuthorize` để double-check permission
- JWT token cần có trong header: `Authorization: Bearer <token>`

---

## 7. Cách build & chạy (local)

Yêu cầu môi trường: Java 17, Maven (wrapper có sẵn)

- Build (skip tests):

```powershell
cd D:\Study\Project\iStar\istar-club\istar-backend
.\mvnw.cmd clean package -DskipTests
```

- Run:

```powershell
.\mvnw.cmd spring-boot:run
```

- Kiểm tra compile nhanh:

```powershell
.\mvnw.cmd clean compile -DskipTests
```

---

## 8. Database & migration notes

- Nếu đang migrate từ schema cũ, cần:
  - Đổi tên cột `part` → `department` trong `users` (SQL) và map sang giá trị enum.
  - Đổi tên bảng `application_forms` → `applications` nếu cần.
  - Thêm cột audit `created_at`, `updated_at` cho các bảng.
  - Cập nhật dữ liệu enum `MORDEN_DANCE` → `MODERN_DANCE` nếu có.

Khuyến nghị: tạo migration script dùng Flyway hoặc Liquibase để an toàn.

---

## 9. Testing & quality gates

- Tích hợp unit tests và integration tests cho các service quan trọng (Auth, User, AdminUser, AdminApplication).
- Kiểm tra các quality gates trước khi deploy: build, lint, unit tests, integration tests.
- Nên thêm tests cho `ApplicationSpecification` và `AdminApplicationService`.

---

## 10. Tài liệu & next steps đề xuất

1. Thêm Swagger/OpenAPI để auto-generate tài liệu API.
2. Thêm Postman collection export cho QA.
3. Viết unit tests mẫu (MockMvc) cho `UserController` và `AdminApplicationController`.
4. Triển khai secret manager cho `jwt.secret`.
5. Xem xét dùng RS256 (asymmetric) cho JWT nếu cần xác thực bên ngoài.

---

Nếu bạn muốn, tôi sẽ:
- Cập nhật file `README.md` dựa trên nội dung này;
- Tạo Postman collection mẫu;
- Viết 3 unit tests mẫu cho `ApplicationFormService` và `AdminApplicationService`.

Bạn muốn tôi làm việc nào tiếp theo?
