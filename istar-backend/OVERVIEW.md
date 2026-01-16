# iStar Backend — Tổng quan & Phân tích Dự án (Unified)

Tài liệu này hợp nhất toàn bộ thông tin từ `PROJECT_OVERVIEW.md` và `BUSINESS_REQUIREMENTS.md`, đồng thời phân tích sự khác biệt giữa tài liệu và mã nguồn thực tế, cùng các đề xuất cải tiến.

---

## 1. Tổng Quan Dự Án

**iStar Backend** là hệ thống REST API quản lý thành viên và hoạt động của Câu Lạc Bộ iStar. Hệ thống hỗ trợ:
- Quản lý cơ cấu tổ chức (Ban chủ nhiệm, Ban chuyên môn, Phân ban).
- Tuyển thành viên (nộp đơn, duyệt/từ chối).
- Quản lý hồ sơ thành viên, phân quyền và chức vụ.
- Báo cáo thống kê và xuất dữ liệu.

### Công nghệ sử dụng
- **Core**: Java 17, Spring Boot 3+ (Web, Security, Data JPA).
- **Database**: PostgreSQL (hoặc tương thích JPA).
- **Security**: JWT (JJWT), Spring Security.
- **Tools**: Maven, Lombok, Apache POI (Excel).

---

## 2. Nghiệp Vụ & Cơ Cấu Tổ Chức

### 2.1. Cấu trúc nhân sự
*   **Ban Chủ Nhiệm**:
    *   01 Chủ nhiệm (Position: `PRESIDENT`)
    *   02 Phó chủ nhiệm (Position: `VICE_PRESIDENT`)
*   **Ban Chuyên Môn** (4 Ban):
    *   Mỗi ban có 01 Trưởng ban (Position: `DEPARTMENT_HEAD`).
    *   Danh sách ban (`Department`): `MUSIC` (Âm nhạc), `DANCE` (Nhảy), `TRADITIONAL_DANCE` (Múa), `EVENT` (Sự kiện).
*   **Phân Ban (SubDepartment)** (Chỉ áp dụng cho Ban Âm Nhạc):
    *   `SINGING` (Hát), `RAP` (Rap), `INSTRUMENT` (Nhạc cụ).
    *   Các ban khác mặc định là `NONE`.
*   **Khu Vực (Area)**:
    *   `HANOI`: Hoạt động đầy đủ.
    *   `NINH_BINH`: Có 03 Ban phụ trách khu vực (Position: `AREA_MANAGER`).

### 2.2. Phân biệt Role và Position (Quan trọng)
Trong dự án này, cần phân biệt rõ hai khái niệm thường bị nhầm lẫn:
1.  **Role (Quyền hệ thống)**: Xác định quyền gọi API.
    *   `ADMIN`: Quản trị toàn hệ thống.
    *   `HEAD`: Quản lý cấp ban.
    *   `MEMBER`: Thành viên thường.
2.  **Position (Chức vụ CLB)**: Xác định vai trò nghiệp vụ và các giới hạn số lượng.
    *   `PRESIDENT`, `VICE_PRESIDENT`
    *   `DEPARTMENT_HEAD`
    *   `AREA_MANAGER`
    *   `MEMBER`

*Ví dụ mapping*: Một `VICE_PRESIDENT` có thể có Role là `ADMIN` (quản trị hệ thống) hoặc `HEAD` (chỉ quản lý ban), tùy phân công.

---

## 3. Ràng Buộc Nghiệp Vụ (Business Rules)

### 3.1. Ràng buộc số lượng (Position Limits)
| Chức vụ (Position) | Giới hạn | Phạm vi |
| :--- | :--- | :--- |
| **PRESIDENT** | Tối đa 1 | Toàn CLB |
| **VICE_PRESIDENT** | Tối đa 2 | Toàn CLB |
| **DEPARTMENT_HEAD** | Tối đa 1 | Mỗi Ban (Tổng 4) |
| **AREA_MANAGER** | Tối đa 3 | Chỉ hoạt động tại Ninh Bình |

### 3.2. Ràng buộc Khu vực (Area Constraints)
*   User thuộc khu vực `NINH_BINH` **KHÔNG** được giữ chức vụ: `PRESIDENT`, `VICE_PRESIDENT`, `DEPARTMENT_HEAD`.
*   Chức vụ `AREA_MANAGER` bắt buộc phải thuộc khu vực `NINH_BINH`.

### 3.3. Ràng buộc Phân ban (SubDepartment Constraints)
*   Nếu `Department` == `MUSIC` -> `SubDepartment` phải là `SINGING`, `RAP`, hoặc `INSTRUMENT`.
*   Nếu `Department` != `MUSIC` -> `SubDepartment` phải là `NONE`.

---

## 4. Phân tích: Các điểm Sai/Thiếu & Bất cập (Discrepancies Analysis)

Đây là các vấn đề được tìm thấy khi so sánh tài liệu nghiệp vụ với mã nguồn và các best-practices:

### 4.1. Sai lệch giữa Tài liệu và Mã nguồn (Critical)
*   **(Sai trong Docs)** Tài liệu `BUSINESS_REQUIREMENTS.md` phần Validation Logic mẫu sử dụng `Role` để kiểm tra giới hạn số lượng (ví dụ: `case ADMIN: countByRole(ADMIN)`).
    *   *Thực tế*: Điều này sai về mặt logic. `Role.ADMIN` là quyền hệ thống, có thể có nhiều admin (IT support, dev). Giới hạn "1 Chủ nhiệm" phải dựa trên `User.position == PRESIDENT`.
    *   *Mã nguồn*: `UserValidator` hiện tại đã làm đúng (check theo Position), nhưng tài liệu nghiệp vụ cần được cập nhật để tránh gây nhầm lẫn cho dev sau này.
*   **(Thiếu trong Code gốc)** Logic `SubDepartment` cho Ban Âm nhạc chưa được enforce chặt chẽ trong luồng đăng ký.
    *   *Trạng thái*: **Đã được fix** (Code đã thêm logic validate subDepartment trong `AuthService` và `ApplicationFormService`).

### 4.2. Các vấn đề Kỹ thuật tiềm ẩn (Risks)
1.  **Race Condition (Điều kiện đua)**
    *   *Vấn đề*: Việc kiểm tra giới hạn (ví dụ: `countByPosition >= 1`) thực hiện ở tầng ứng dụng (Java) trước khi `save()`. Nếu 2 request đến cùng lúc, cả 2 đều thấy count = 0 và cùng tạo 2 chủ nhiệm -> Vỡ data integrity.
    *   *Giải pháp*: Cần sử dụng Database Constraint (Unique filtered index) hoặc Pessimistic Locking (`SELECT ... FOR UPDATE`) hoặc Isolation Level Serializable.

2.  **Application Status Flow**
    *   *Vấn đề*: Đơn ứng tuyển (`Application`) có thể chuyển trạng thái tự do (submit -> approved).
    *   *Thiếu sót*: Chưa định nghĩa rõ quy trình: Khi `APPROVED` đơn ứng tuyển, hệ thống có tự động tạo tài khoản `User` không? Có gửi email thông báo không?
    *   *Đề xuất*: Implement quy trình Transactional: Approve Application -> Create User -> Send Email.

3.  **Bảo mật & Xác thực**
    *   *Thiếu sót*: Chưa có cơ chế xác thực email khi đăng ký.
    *   *Thiếu sót*: JWT chưa có cơ chế Refresh Token, dẫn đến trải nghiệm người dùng kém (hết hạn phải login lại) hoặc rủi ro bảo mật (nếu để hạn quá dài).
    *   *Đề xuất*: Thêm verify email flow và Refresh Token rotation.

4.  **Hiệu năng Excel Export**
    *   *Vấn đề*: `ExcelExporter` load toàn bộ list vào RAM. Nếu danh sách applications lên tới hàng nghìn, sẽ gây `OutOfMemoryError`.
    *   *Đề xuất*: Dùng `SXSSFWorkbook` (Streaming API) để ghi file mà không giữ toàn bộ trong bộ nhớ.

---

## 5. Cấu trúc Mã nguồn & Endpoints

### 5.1. Endpoints chính
**Authentication**
- `POST /api/auth/register`: Đăng ký (Có validation Department/SubDepartment strict).
- `POST /api/auth/login`: Lấy JWT.

**Admin Management (`/api/admin/`)**
- `users/*`: CRUD User, kích hoạt/vô hiệu hóa.
- `applications/*`: Duyệt/từ chối đơn, search nâng cao, export Excel.
- *Lưu ý*: Tìm kiếm hỗ trợ Dynamic Specification (theo tên, email, ban, ngày tháng).

**User Personal (`/api/users/me`)**
- Xem/Sửa profile, đổi mật khẩu.

### 5.2. Database Schema (User Table - Updated)
```java
class User {
    Long id;
    String username; String password; String email;
    Role role;              // ADMIN, HEAD, MEMBER
    Position position;      // PRESIDENT, VICE_PRESIDENT...
    Department department;  // MUSIC, DANCE...
    SubDepartment subDept;  // SINGING, RAP... (Nullable)
    Area area;              // HANOI, NINH_BINH
    Boolean isActive;
    // ...Audit fields
}
```

---

## 6. Migration SQL Scripts (Cập nhật)

Do logic nghiệp vụ thay đổi so với thiết kế ban đầu, cần chạy script sau để đồng bộ database:

```sql
-- 1. Thêm cột Area và SubDepartment nếu chưa có
ALTER TABLE users ADD COLUMN IF NOT EXISTS area VARCHAR(50) DEFAULT 'HANOI';
ALTER TABLE users ADD COLUMN IF NOT EXISTS sub_department VARCHAR(50) DEFAULT 'NONE';

-- 2. Validate Data Integrity (Ví dụ: set sub_department về NONE cho các ban khác Music)
UPDATE users SET sub_department = 'NONE' WHERE department != 'MUSIC';

-- 3. (Optional) Tạo partial unique index để chặn lỗi Race Condition ở DB level
-- Chỉ cho phép 1 President active
CREATE UNIQUE INDEX idx_unique_president ON users (position) 
WHERE position = 'PRESIDENT' AND is_active = true;

-- Chỉ cho phép 2 Vice President active (Phức tạp hơn với SQL chuẩn, thường dùng trigger hoặc check constraint)
```

---

## 7. Kế hoạch Hành động (Next Steps)

1.  **Refactor Documentation**: Cập nhật `BUSINESS_REQUIREMENTS.md` để loại bỏ nhầm lẫn Role/Position.
2.  **Concurrency Fix**: Implement locking cho logic `UserValidator`.
3.  **Application Flow**: Xây dựng service `approveApplication` tự động tạo User.
4.  **Testing**: Bổ sung Unit Test cho các case validation phức tạp (Ninh Binh + Position Limits).

---
*Tài liệu được tổng hợp tự động bởi AI Assistant ngày 16/01/2026.*
