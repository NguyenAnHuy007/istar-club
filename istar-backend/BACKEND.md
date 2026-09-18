# iStar Backend — Kiến Trúc & Tài Liệu Kỹ Thuật

REST API service quản lý nhân sự, cơ cấu tổ chức và tuyển chọn thành viên cho CLB Nghệ thuật iStar (Đại học Công nghiệp Hà Nội - HaUI).

---

## 1. Công Nghệ & Cấu Trúc Dự Án

- **Core**: Java 21, Spring Boot 4.x (`spring-boot-starter-data-jpa`, `spring-boot-starter-security`, `spring-boot-starter-validation`, `spring-boot-starter-webmvc`).
- **Database & Persistence**: PostgreSQL, Spring Data JPA Auditing (`@CreatedDate`, `@LastModifiedDate`), Optimistic Locking (`@Version`).
- **Security & Auth**: Stateless JWT (JJWT `0.12.6`), BCrypt, RBAC phân quyền hạt nhân (`@PreAuthorize("hasAuthority('...')")`).
- **Tiện ích**: Apache POI (SXSSF streaming Excel), Lombok.

### 1.1 Cấu Trúc Thư Mục Rút Gọn

```
istar-backend/
├── src/main/java/com/haui/istar/
│   ├── IstarApplication.java
│   ├── config/            # SecurityConfig, CorsConfig, GlobalExceptionHandler, DataSeeder
│   ├── controller/
│   │   ├── admin/         # AdminApplication, AdminUser, RecruitmentAdmin, Interview, Reception, Dashboard...
│   │   ├── auth/          # AuthController (register - mặc định inactive, login - cấp JWT)
│   │   ├── publicapi/     # PublicRecruitment, PublicCommonCode
│   │   └── user/          # ApplicationFormController, UserController
│   ├── dto/               # application/, auth/, common/, dashboard/, recruitment/, user/
│   ├── exception/         # BadRequestException, ResourceNotFoundException, UnauthorizedException
│   ├── model/             # Application, ApplicationDepartment, User, UserDepartment, Recruitment, Permission...
│   │   └── enums/         # ApplicationStatus, Department, Position, Role, Area
│   ├── repository/        # UserRepository, ApplicationRepository, RecruitmentRepository...
│   │   └── specification/ # ApplicationSpecification, UserSpecification
│   ├── security/          # JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService, UserPrincipal
│   ├── service/           # Service interfaces & impl/ (AdminApplication, Auth, Interview, Recruitment...)
│   └── util/              # ExcelExporter, FileUploadUtil, ServiceUpdateUtils, UserValidator
└── src/main/resources/    # application.properties (DB, JWT, upload configs)
```

---

## 2. Quy Tắc Nghiệp Vụ & Bất Biến (Domain Invariants)

### 2.1 4 Ban Chuẩn Hóa
Hệ thống cố định đúng 4 ban chính (`Department` enum), không có ban con (`SubDepartment`):
1. `MUSIC` (Ban Âm nhạc)
2. `RAP` (Ban Rap)
3. `MEDIA_AND_EVENT` (Ban Truyền thông và Tổ chức Sự kiện)
4. `DANCE` (Ban Vũ đạo)

### 2.2 Phân Quyền IT (RBAC) & Chức Vụ Tổ Chức (`Position`)
- **Tổ chức (`Position`)**: Cấp CLB (`PRESIDENT`, `VICE_PRESIDENT` - giới hạn quota, cấm cơ sở `NINH_BINH`; `AREA_MANAGER`, `MEMBER`) và cấp Ban (`DEPARTMENT_HEAD` - tối đa 1 người/ban có lock kiểm tra, `MEMBER`). 1 user có thể giữ nhiều chức danh ở các ban khác nhau.
- **Phân quyền IT**: Quản lý qua `PermissionGroup` (tương ứng System Roles: `ADMIN`, `RECEPTIONIST`, `INTERVIEWER`, `REVIEWER`, `MEMBER`) chứa các `Permission` nguyên tử (`PERM_<CODE>`).
- **UserPrincipal Authorities**: Cấp cả prefix `ROLE_<GROUP>` lẫn `PERM_<CODE>` và alias `<CODE>` gốc để tương thích kiểm tra `@PreAuthorize`.
- **CORS & An toàn Sắp xếp**: `SecurityConfig` hỗ trợ `allowedOriginPatterns: http://localhost:*`, `http://127.0.0.1:*`. Các Service kiểm tra null-safe với `sortDirection`, `page`, `size` (giới hạn tối đa 500).

### 2.3 Cơ Chế Đồng Bộ Đa Ban (In-Place Reconciliation)
- Bảng `user_departments` có ràng buộc unique `(user_id, department)`.
- **Quy tắc**: Vì Hibernate `ActionQueue` thực thi INSERT trước DELETE, không dùng `clear()` rồi `addAll()`. Luôn reconciliation tại chỗ:
  1. `removeIf` các ban bị bỏ (kích hoạt `orphanRemoval = true`).
  2. Cập nhật `position` của ban giữ nguyên (lệnh UPDATE, không xóa thực thể).
  3. Chỉ INSERT ban mới phát sinh.

### 2.4 Vòng Đời Đơn Tuyển & Phỏng Vấn (Application Lifecycle)

```mermaid
graph LR
    SUBMITTED -->|Lễ tân Check-in| CHECKED_IN
    SUBMITTED -->|Vắng mặt| NO_SHOW
    CHECKED_IN <-->|Đổi trạng thái| NO_SHOW
    CHECKED_IN -->|Nhận PV| INTERVIEWING
    INTERVIEWING -->|Chấm điểm 0-10| INTERVIEWED
    INTERVIEWED -->|Admin duyệt| APPROVED
    INTERVIEWED -->|Admin từ chối| REJECTED
    APPROVED -->|Tạo User| PROVISIONED[Tài khoản User]
```

- **Tự động gán đợt tuyển**: `POST /api/auth/applications` tự bind vào đợt đang active (`findByIsActiveTrueAndIsDeletedFalse()`). Nếu không có đợt active ➜ HTTP 400.
- **Khóa tranh chấp phỏng vấn đa ban**: Khi 1 ban nhận PV (`start-multi`), đơn và ban chuyển `INTERVIEWING`. Ban khác không thể nhận đồng thời. Khi hoàn tất (`complete-multi`): nếu tất cả các ban của ứng viên đạt `INTERVIEWED` ➜ đơn chuyển `INTERVIEWED`; nếu còn ban khác `CHECKED_IN` ➜ đơn hoàn về `CHECKED_IN` để ban còn lại phỏng vấn tiếp.
- **Enum Deserialization**: `ApplicationStatus` có `@JsonCreator` (`fromString`) và `@JsonValue` (`toValue`), hỗ trợ cả mã code lẫn text tiếng Việt.
- **Mốc thời gian Check-in & Hoàn tất PV**:
  - `checkedInAt`: Tự động ghi nhận `LocalDateTime.now()` khi lễ tân/admin thực hiện check-in đơn.
  - `interviewedAt`: Tự động ghi nhận `LocalDateTime.now()` khi tất cả các ban của ứng viên hoàn tất phỏng vấn (`INTERVIEWED`).
  - **Sắp xếp tự động cho Phỏng vấn viên (`INTERVIEWER`)**: Danh sách hàng chờ tự động áp dụng `checkedInAt ASC nullsLast` để ứng viên check-in trước luôn hiển thị trước.

### 2.5 Kiểm Soát Đồng Thời (Optimistic Locking)
- `Application` và `ApplicationDepartment` sử dụng `@Version`.
- Tránh lost update khi nhiều interviewer/admin cùng thao tác. Xung đột trả về HTTP 409 Conflict yêu cầu reload dữ liệu.

### 2.6 Vòng Đời Kích Hoạt Tài Khoản (Account Activation)
- Đăng ký mới (`POST /api/auth/register`): Tạo tài khoản với `isActive = false`, quyền `MEMBER`.
- Đăng nhập: `UserPrincipal.isEnabled()` trả về `isActive`. Khi tài khoản chưa kích hoạt, `DaoAuthenticationProvider` ném `DisabledException`.
- `GlobalExceptionHandler` bắt `DisabledException`, trả về HTTP 403 Forbidden: `"ACCOUNT_INACTIVE: Tài khoản của bạn chưa được kích hoạt. Vui lòng chờ Quản trị viên phê duyệt!"`.
- Admin kích hoạt/vô hiệu qua `PUT /api/admin/users/{id}/activate` và `deactivate` (hỗ trợ cả bulk API).

### 2.7 An Toàn Kiểu & Stream Mapping
- Trích xuất `Department` từ `UserDepartment` luôn kiểm tra null: `user.getUserDepartments() != null`, `.filter(Objects::nonNull)` và dùng lambda `ud -> ud.getDepartment()` tránh lỗi strict null analysis.

### 2.8 Khởi Tạo Dữ Liệu Mẫu & Tách Biệt Môi Trường (Data Seeding & Production Strategy)
- **Tách biệt 2 Seeder độc lập**:
  - **`SystemDataSeeder` (`@Order(1)`)**: Dữ liệu hệ thống cốt lõi thiết yếu (giữ lại trên môi trường Production):
    - Danh mục quyền nguyên tử (`permissions`) & nhóm quyền (`ADMIN`, `RECEPTIONIST`, `INTERVIEWER`, `REVIEWER`, `MEMBER`).
    - Tài khoản quản trị viên mặc định: `admin` / `admin123` (Role `ADMIN`, Position `PRESIDENT`, `isActive=true`).
    - Gán toàn bộ quyền `PERM_*` cho tài khoản `admin`.
    - Danh mục dùng chung `common_codes` (`SCHOOL` các trường/khoa HaUI, `COURSE` K12-K21).
    - Các thế hệ CLB (`Gen 7`, `Gen 8`).
    - Cấu hình trang chủ mặc định (`LandingConfig`).
  - **`MockDataSeeder` (`@Order(2)`)**: Dữ liệu kiểm thử phục vụ phát triển & demo (dễ dàng vô hiệu hóa hoặc loại bỏ khi deploy Production):
    - Tài khoản nhân sự test: Lễ tân (`receptionist`), Phỏng vấn viên 4 ban (`interviewer_music`, `interviewer_dance`, `interviewer_rap`, `interviewer_media`), Xét duyệt viên (`reviewer`).
    - 2 đợt tuyển: Gen 7 (đã đóng) và Gen 8 (Active).
    - 12 hồ sơ ứng viên mẫu bao phủ đầy đủ tất cả các trạng thái: `SUBMITTED`, `CHECKED_IN`, `INTERVIEWING`, `INTERVIEWED`, `APPROVED`, `REJECTED`, `NO_SHOW`, kèm điểm số phỏng vấn (0-10), nhận xét chi tiết và đa nguyện vọng ban.
- **Chiến lược DDL**: Cấu hình chuẩn `spring.jpa.hibernate.ddl-auto=update` duy trì dữ liệu toàn vẹn sau khi đã làm sạch schema qua chu kỳ `create-drop`.

### 2.9 Quy Chuẩn Lưu Trữ Tệp Tin & Phân Vùng Thư Mục (Uploads Storage Architecture)
- **Cấu trúc phân vùng thư mục con**:
  - `uploads/avatars/`: Ảnh đại diện, ảnh thẻ chân dung của ứng viên và người dùng hệ thống. Kiểm duyệt qua `validateAvatar`: tối đa 5MB, hỗ trợ JPEG, PNG, WEBP.
  - `uploads/landing/`: Ảnh các section trang chủ (Hero banner, Bento grid các ban, kỷ niệm/thành tích). Kiểm duyệt qua `validateLandingImage`: tối đa 10MB, hỗ trợ JPEG, PNG, WEBP, GIF.
- **Tiện ích lưu trữ (`FileUploadUtil`)**: Hỗ trợ `saveFile(String uploadDir, String subFolder, MultipartFile file)`, tự động tạo folder con nếu chưa tồn tại, sinh tên file ngẫu nhiên an toàn (`UUID`), và trả về đường dẫn tương đối `/uploads/{subFolder}/{fileName}`.
- **Tự động dọn dẹp & giải phóng bộ nhớ (`LandingConfigServiceImpl`)**: Khi cập nhật cấu hình trang chủ (`updateHomepageConfig`), service tự động trích xuất các đường dẫn `/uploads/landing/...`, xóa sạch các tệp ảnh cũ bị thay thế khỏi đĩa cứng (`Files.deleteIfExists`) và quét dọn các file mồ côi (orphans > 15 phút không còn thuộc cấu hình active).
- **Tương thích đa nền tảng (`WebMvcConfig` & `SecurityConfig`)**: `addResourceLocations(uploadPath.toUri().toString())` sử dụng URI chuẩn (`file:///`), khắc phục triệt để lỗi phân giải ký tự ổ đĩa trên Windows (`D:/...`) và hỗ trợ đường dẫn trên Linux; CORS mở rộng hỗ trợ cả phương thức `HEAD` tránh trả về 403 khi kiểm tra resource tĩnh.

### 2.10 Quy Chuẩn Xử Lý Excel (Export & Import)
- **Tối ưu hiển thị cột (Min-width ~150px)**:
  - `ExcelExporter` đặt `sheet.setDefaultColumnWidth(22)` và tính toán độ rộng tự động với ngưỡng tối thiểu `Math.max(colWidth, 22 * 256)`. Tránh tình trạng co cụm text trên màn hình độ phân giải cao.
- **Chuẩn hóa giá trị trạng thái xuất khẩu**:
  - Trạng thái hồ sơ được xuất ra định dạng nhãn hiển thị tiếng Việt (`app.getStatus().getDisplayName()`) thay vì mã enum thô (`SUBMITTED`, `CHECKED_IN`...).
- **Sheet Hướng dẫn & Danh mục trong Excel Template**:
  - `generateTemplate()` bổ sung sheet thứ hai `"Hướng Dẫn & Mã Danh Mục"`, cung cấp bảng tra cứu toàn diện:
    - **Cơ sở**: `NINH_BINH` (Cơ sở 3 - Ninh Bình), `HANOI` (Cơ sở 1 - Hà Nội).
    - **Ban ứng tuyển**: `MUSIC` (Ban Âm nhạc), `RAP` (Ban Rap), `MEDIA_AND_EVENT` (Ban Truyền thông & Tổ chức Sự kiện), `DANCE` (Ban Vũ đạo).
    - **Mã trường/khoa**: `CNTT_TT`, `CK`, `DL`, `NN`, `D_DT`...
    - **Quy tắc định dạng**: Ngày sinh (`YYYY-MM-DD` hoặc `DD/MM/YYYY`), email hợp lệ, định dạng số điện thoại và liên kết Facebook.
- **Nhập dữ liệu (`ExcelImporter`)**:
  - Hồ sơ ứng viên nạp qua file Excel luôn được gắn tự động vào đợt tuyển đang active với trạng thái khởi tạo `SUBMITTED`.

### 2.10 Quy Chuẩn Validation & Bảo Mật Dữ Liệu Đầu Vào (Input Validation & Defense-in-Depth)
- **Phương châm**: Không tin tưởng dữ liệu từ client (Zero-Trust Client Input). Toàn bộ DTO tiếp nhận dữ liệu từ Controller đều được kiểm soát nghiêm ngặt qua Hibernate Validator (`jakarta.validation`).
- **Ràng buộc trường định dạng**:
  - `phoneNumber`: Tuân theo định dạng số điện thoại Việt Nam `^(0|\\+84)[0-9]{9,10}$`.
  - `birthday`: Bắt buộc `@Past` (chặn ngày sinh ở tương lai).
  - `facebookUrl`: Giới hạn tối đa 255 ký tự và kiểm tra tiền tố URL hợp lệ (`http://` hoặc `https://`).
  - `email`: `@Email` chuẩn hóa kết hợp giới hạn `@Size(max = 100)` tương thích cột cơ sở dữ liệu.
  - `username`: Tuân thủ biểu thức chính quy `^[a-zA-Z0-9_.-]+$` (độ dài 3-50 ký tự), đồng bộ tuyệt đối với regex trên Frontend.
  - `interviewScore`: Thang điểm nghiêm ngặt từ `0.0` đến `10.0` (`@DecimalMin("0.0")`, `@DecimalMax("10.0")`).
- **Validation Lồng Nhau (Nested Validation)**:
  - Tất cả danh sách quan hệ con như `departments` trong `ApplicationFormRequest`, `AdminApplicationUpdateRequest` hoặc `userDepartments` trong `RegisterRequest`, `UpdateUserRequest` đều bắt buộc khai báo `@Valid` để kích hoạt validation trên từng phần tử con.
- **Phòng Ngừa Xung Đột Dữ Liệu (Data Integrity Guard)**:
  - `ApplicationFormServiceImpl` thực hiện kiểm tra `seenDepts` để chặn triệt để tình huống đăng ký trùng một ban trong cùng một đơn (`UNIQUE(application_id, department)`), ném `BadRequestException` thân thiện thay vì để nổ ngoại lệ vi phạm khóa chính/khóa duy nhất ở tầng DB.

### 2.11 Ràng Buộc Bảo Mật & Toàn Vẹn Dữ Liệu Nâng Cao (Security & Concurrency Defense)
- **Scoping & Redaction Hồ sơ cho Phỏng vấn viên (`INTERVIEWER`)**:
  - `GET /api/admin/applications/{id}`: Phỏng vấn viên chỉ được xem ứng viên thuộc đợt tuyển đang active và có nguyện vọng vào ban mà mình phụ trách.
  - Tự động lọc/ẩn (redact) thông tin các ban khác: ứng viên ứng tuyển nhiều ban sẽ chỉ thấy ban mình phụ trách trong danh sách `departments`, che giấu toàn bộ điểm số, nhận xét và danh tính interviewer của các ban khác.
- **Quy trình Phỏng vấn chặt chẽ (State Machine Integrity)**:
  - Chỉ cho phép bắt đầu phỏng vấn (`start-multi`) khi nguyện vọng ban đang ở `CHECKED_IN`, và phỏng vấn viên phải được phân công phụ trách ban đó (hoặc quản trị viên `ADMIN`).
  - Chỉ cho phép hoàn tất phỏng vấn (`complete-multi`) khi ban đang ở `INTERVIEWING`, và phải do chính người đã claim phiên phỏng vấn đó hoàn tất (hoặc `ADMIN`).
  - Chặn báo vắng mặt (`NO_SHOW`) khi đơn hoặc bất kỳ ban nào đang trong trạng thái `INTERVIEWING`.
- **Chống Race Condition Kích Hoạt Đợt Tuyển (Pessimistic Locking)**:
  - `RecruitmentRepository.findActiveRecruitmentForUpdate()` áp dụng `@Lock(LockModeType.PESSIMISTIC_WRITE)` để khóa dòng đợt tuyển active hiện tại, đảm bảo an toàn tuyệt đối khi nhiều admin cùng thao tác mở/đóng đợt tuyển đồng thời.
- **Ràng Buộc Tầng Cơ Sở Dữ Liệu (`constraints.sql`)**:
  - Index duy nhất có điều kiện: `idx_unique_active_recruitment` (`WHERE is_active = true AND is_deleted = false`) bảo vệ tầng DB không bao giờ tồn tại >1 đợt tuyển active.
  - Trigger `check_department_head_limit_func` kết hợp `pg_advisory_xact_lock` và kiểm tra chỉ tính user hoạt động (`is_deleted = false AND is_active = true`) đảm bảo mỗi ban tối đa đúng 1 Trưởng ban (`DEPARTMENT_HEAD`).
  - Trigger `check_position_limits_func` dùng `pg_advisory_xact_lock` giới hạn quota `PRESIDENT`, `VICE_PRESIDENT`, và cấm `VICE_PRESIDENT` tại cơ sở `NINH_BINH`.
- **Bảo Vệ Đăng Ký / Cập Nhật Hồ Sơ Cá Nhân**:
  - `RegisterRequest` và `UpdateProfileRequest` dùng `SelfUserDepartmentRequest` (chỉ chọn `department`, không cho phép tự phong `position`). Khi đăng ký mới, server luôn ép cứng `Position.MEMBER`.
  - Cập nhật hồ sơ cá nhân thực hiện in-place reconciliation: giữ nguyên `position` hiện tại của người dùng, không bị ghi đè.
- **Vô Hiệu Hóa Token Tức Thì (Instant Token Revocation)**:
  - `JwtAuthenticationFilter` kiểm tra `userDetails.isEnabled()`. Tài khoản bị Admin vô hiệu hóa (`isActive = false`) sẽ bị chặn request ngay lập tức dù JWT token chưa hết hạn.
- **Phục Vụ File Tĩnh & CORS**:
  - `WebMvcConfig` đăng ký ResourceHandler phục vụ file tĩnh tại đường dẫn `/uploads/**`.
  - `SecurityConfig` cho phép cấu hình `app.cors.allowed-origins` và `permitAll` cho `/uploads/**`.
- **Tạo Tài Khoản Mặc Định Inactive (Invariant 3.6)**:
  - Tài khoản người dùng được tạo từ đơn ứng tuyển trúng tuyển (`POST /api/admin/applications/{id}/create-account`) luôn khởi tạo ở trạng thái vô hiệu hóa (`isActive = false`).

---

## 3. Mô Hình Dữ Liệu Tóm Tắt

```mermaid
erDiagram
    users ||--o{ user_departments : "tham gia"
    users ||--o{ application_departments : "chấm điểm"
    users }o--o{ permission_groups : "có quyền"
    recruitments ||--o{ applications : "thuộc đợt"
    applications ||--o{ application_departments : "nguyện vọng"
    permission_groups }o--o{ permissions : "chứa"
```

- **`users`**: Tài khoản, thông tin cá nhân, `position` cấp CLB, `isActive`, `isDeleted`.
- **`user_departments`**: `(user_id, department)` unique, `position` cấp ban.
- **`recruitments`**: Đợt tuyển (`startDate`, `endDate`, `isActive`, `isDeleted` - tối đa 1 đợt active).
- **`applications`**: Hồ sơ ứng viên (`area` cơ sở HANOI/NINH_BINH, `facebook_url`, SĐT, email, trường lớp), `@Version`.
- **`application_departments`**: Ban ứng tuyển, `status`, `interviewScore` (0.0-10.0), `interviewNotes`, `interviewer_id`, `@Version`.
- **`common_codes`**: Danh mục động (`SCHOOL`, `COURSE`...).
- **`landing_configs`**: Cấu hình nội dung các section trang chủ (`config_key = 'HOMEPAGE'`, `content_json` TEXT, `@Version`).

---

## 4. Danh Mục API Endpoints

### 4.1 Auth & Public (`/api/auth`, `/api/public`)
| Method | Endpoint | Quyền | Mô Tả |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản mới (mặc định `isActive = false`, position `MEMBER`) |
| `POST` | `/api/auth/login` | Public | Đăng nhập (hỗ trợ username hoặc email), cấp JWT token |
| `POST` | `/api/auth/applications` | Public | Nộp đơn online (tự bind đợt tuyển active, ép trạng thái `SUBMITTED`) |
| `POST` | `/api/auth/applications/upload-avatar` | Public | Upload ảnh thẻ/chân dung ứng viên khi nộp đơn online (lưu vào `uploads/avatars/`) |
| `GET` | `/api/public/recruitments/active` | Public | Lấy đợt tuyển đang mở |
| `GET` | `/api/public/common-codes/schools` | Public | Danh sách trường/khoa HaUI |
| `GET` | `/api/public/common-codes/courses` | Public | Danh sách khóa sinh viên (K12 - K21) |
| `GET` | `/api/public/common-codes/recent-courses` | Public | Các khóa gần nhất (`limit` clamped 1-50, mặc định 6) |
| `GET` | `/api/public/homepage` | Public | Lấy cấu hình công khai trang chủ (Hero, About, Departments, Achievements) |

### 4.2 Cá Nhân (`/api/users`)
| Method | Endpoint | Quyền | Mô Tả |
|---|---|---|---|
| `GET` | `/api/users/me` | Authenticated | Xem profile cá nhân |
| `PUT` | `/api/users/me` | Authenticated | Cập nhật profile cá nhân |
| `PUT` | `/api/users/me/change-password` | Authenticated | Đổi mật khẩu |

### 4.3 Quản Trị Hệ Thống (`/api/admin`)
| Module | Method & Endpoint | Quyền | Mô Tả |
|---|---|---|---|
| **Users** | `GET /api/admin/users` | `PERM_USER_VIEW` | Danh sách user phân trang |
| | `POST /api/admin/users/search` | `PERM_USER_VIEW` | Tìm kiếm user nâng cao (`UserSearchCriteria`) |
| | `GET /api/admin/users/{id}` | `PERM_USER_VIEW` | Chi tiết user |
| | `PUT /api/admin/users/{id}` | `PERM_USER_EDIT` | Sửa user (in-place reconciliation, password null-safe) |
| | `DELETE /api/admin/users/{id}` | `PERM_USER_DELETE` | Xóa mềm user |
| | `PUT /api/admin/users/{id}/activate` | `PERM_USER_EDIT` | Kích hoạt tài khoản đơn lẻ |
| | `PUT /api/admin/users/{id}/deactivate` | `PERM_USER_EDIT` | Vô hiệu hóa tài khoản đơn lẻ |
| | `PUT /api/admin/users/bulk-deactivate` | `PERM_USER_EDIT` | Vô hiệu hóa tài khoản hàng loạt |
| | `POST /api/admin/users/bulk-delete` | `PERM_USER_DELETE` | Xóa mềm tài khoản hàng loạt |
| | `GET /api/admin/users/filters/*` | `PERM_USER_VIEW` | Danh mục positions, departments, courses |
| **Recruitments** | `GET /api/admin/recruitments` | `APPLICATION_VIEW` | Danh sách đợt tuyển |
| | `GET /api/admin/recruitments/active` | `APPLICATION_VIEW` | Đợt tuyển đang active |
| | `POST /api/admin/recruitments` | `PERM_RECRUITMENT_MANAGE` | Tạo đợt tuyển mới |
| | `PUT /api/admin/recruitments/{id}` | `PERM_RECRUITMENT_MANAGE` | Sửa đợt tuyển |
| | `PUT /api/admin/recruitments/{id}/activate` | `PERM_RECRUITMENT_MANAGE` | Mở đợt tuyển (tự đóng đợt cũ) |
| | `PUT /api/admin/recruitments/{id}/close` | `PERM_RECRUITMENT_MANAGE` | Đóng đợt tuyển |
| | `DELETE /api/admin/recruitments/{id}` | `PERM_RECRUITMENT_MANAGE` | Xóa mềm đợt tuyển |
| **Applications** | `POST /api/admin/applications/search` | `APPLICATION_VIEW` | Tìm kiếm đơn (`AdminApplicationSearchCriteria`) |
| | `POST /api/admin/applications` | `APPLICATION_CREATE` | Tạo đơn offline (hỗ trợ trạng thái `CHECKED_IN`) |
| | `GET /api/admin/applications/{id}` | `APPLICATION_VIEW` | Chi tiết đơn |
| | `PUT /api/admin/applications/{id}` | `APPLICATION_EDIT` | Admin sửa toàn diện: đảo trạng thái, sửa điểm, ban |
| | `DELETE /api/admin/applications/{id}/avatar` | `APPLICATION_EDIT` | Xóa ảnh thẻ avatar ứng viên |
| | `PUT /api/admin/applications/{id}/approve` | `APPLICATION_REVIEW` | Duyệt trúng tuyển (chỉ `INTERVIEWED`) |
| | `PUT /api/admin/applications/{id}/reject` | `APPLICATION_REVIEW` | Từ chối đơn (chỉ `INTERVIEWED`) |
| | `POST /api/admin/applications/{id}/create-account` | `ROLE_ADMIN` | Tạo User từ đơn trúng tuyển |
| | `POST /api/admin/applications/export-excel` | `APPLICATION_EXPORT` | Xuất file Excel streaming SXSSF theo tiêu chí lọc (`AdminApplicationSearchCriteria`, bao gồm `area`) |
| | `GET /api/admin/applications/excel-template` | `APPLICATION_EXPORT` | Tải file Excel mẫu chuẩn nhập hồ sơ ứng viên |
| | `POST /api/admin/applications/import-excel` | `APPLICATION_CREATE` | Nhập danh sách hồ sơ ứng viên từ file Excel (multipart/form-data) |
| **Dashboard** | `GET /api/admin/dashboard/stats` | `APPLICATION_VIEW` | Thống kê real-time (7 trạng thái, 4 ban, 7-day trend...) |
| **Commons** | `/api/admin/common-codes/**` | `PERM_SYSTEM_CONFIG` | CRUD danh mục cấu hình dùng chung |
| **Generations**| `/api/admin/generations/**` | `PERM_SYSTEM_CONFIG` | CRUD thế hệ/gen CLB |
| **Homepage**   | `GET /api/admin/homepage` | `PERM_SYSTEM_CONFIG` | Xem cấu hình trang chủ hiện tại |
|                | `PUT /api/admin/homepage` | `PERM_SYSTEM_CONFIG` | Lưu cấu hình trang chủ (Hero, About, Departments 2-6 ban, Achievements) |
|                | `POST /api/admin/homepage/upload-image` | `PERM_SYSTEM_CONFIG` | Upload ảnh phục vụ các section trang chủ (tối đa 10MB, JPG/PNG/WEBP/GIF, lưu vào `uploads/landing/`) |

### 4.4 Tác Nghiệp Lễ Tân & Phỏng Vấn
| Method | Endpoint | Quyền | Mô Tả |
|---|---|---|---|
| `PUT` | `/api/reception/applications/{id}/checkin` | `PERM_APPLICATION_CHECKIN` | Check-in ứng viên (chuyển `CHECKED_IN`, vào queue) |
| `PUT` | `/api/reception/applications/{id}/no-show` | `PERM_APPLICATION_CHECKIN` | Báo vắng mặt (`NO_SHOW`) |
| `PUT` | `/api/reception/applications/{id}/revert-submitted` | `PERM_APPLICATION_CHECKIN` | Hoàn tác về `SUBMITTED` |
| `GET` | `/api/interview/queue` | `PERM_APPLICATION_INTERVIEW` | Danh sách hàng chờ theo ban phụ trách |
| `PUT` | `/api/interview/applications/{id}/start-multi` | `PERM_APPLICATION_INTERVIEW` | Nhận PV đa ban (chuyển `INTERVIEWING`, khóa tranh chấp) |
| `PUT` | `/api/interview/applications/{id}/complete-multi`| `PERM_APPLICATION_INTERVIEW` | Hoàn tất PV: chấm điểm 0-10, nhận xét, auto-promote |

---

## 5. Cấu Hình Ứng Dụng (`application.properties`)

```properties
app.upload.dir=${APP_UPLOAD_DIR:uploads}
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=15MB
```

---

## 6. Triển Khai Sản Xuất (Deployment & Cloud Environment)

### 6.1 Kiến Trúc Triển Khai
- **Containerization**: Multi-stage Docker build (`maven:3.9.9-eclipse-temurin-21-alpine` build artifact, `eclipse-temurin:21-jre-alpine` runtime).
- **Backend Host**: Render Web Service (Docker runtime, khu vực Singapore).
- **Database**: Supabase PostgreSQL 17 (Khu vực Seoul `ap-northeast-2`).
- **Connection Mode**: Supavisor Session Pooler (port 5432) đảm bảo tương thích hoàn toàn mạng IPv4 trên môi trường container Render Free tier.

### 6.2 Danh Mục Biến Môi Trường (Environment Variables)
| Biến môi trường | Mặc định (Local) | Mô tả sản xuất |
|---|---|---|
| `PORT` | `8080` | Render tự cấp cổng động (Dynamic Port binding) |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/istar_club` | JDBC URL kết nối Supavisor Session Pooler: `jdbc:postgresql://aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | `postgres.atslyprrcnzpfvmhsvxm` |
| `SPRING_DATASOURCE_PASSWORD` | `123456` | Mật khẩu database Supabase |
| `JWT_SECRET` | *Secret mặc định* | Khóa ký JWT bảo mật |
| `JWT_EXPIRATION_MS` | `86400000` | Thời hạn hiệu lực JWT token (ms) |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:*,http://127.0.0.1:*,https://*` | Danh sách domain CORS được phép kết nối |
| `APP_UPLOAD_DIR` | `uploads` | Thư mục lưu trữ media/ảnh upload |
