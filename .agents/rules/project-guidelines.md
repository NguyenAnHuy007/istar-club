---
trigger: always_on
description: Nguồn chân lý duy nhất — quy tắc phát triển, bất biến nghiệp vụ, kiến trúc và giao thức cập nhật tài liệu cho iStar Club monorepo
globs: **/*.java, **/*.js, **/*.jsx, **/*.ts, **/*.tsx, **/*.css
---

# iStar Club — Quy Chuẩn Phát Triển Toàn Diện

Tài liệu tập trung duy nhất cho **AI agents** và lập trình viên: kiến trúc, quy tắc nghiệp vụ, giao thức tài liệu và chuẩn kỹ thuật.

> **Tài liệu tham chiếu chi tiết**:
> - [istar-backend/BACKEND.md](file:///d:/Study/Project/iStar/istar-club/istar-backend/BACKEND.md) — Kiến trúc backend & catalog API
> - [istar-frontend/FRONTEND.md](file:///d:/Study/Project/iStar/istar-club/istar-frontend/FRONTEND.md) — Kiến trúc frontend, popup specs, RBAC & UI Kit
> - [design-tokens.md](file:///d:/Study/Project/iStar/istar-club/.agents/rules/design-tokens.md) — Màu sắc, typography, token hệ thống
> - [component-guidelines.md](file:///d:/Study/Project/iStar/istar-club/.agents/rules/component-guidelines.md) — Spec component, animation, anti-patterns, responsive

---

## 1. Kiến Trúc & Cấu Trúc Monorepo

- **`istar-backend/`**: Java 21, Spring Boot 4.x (Data JPA, Security, JJWT `0.12.6`, POI SXSSF, PostgreSQL).
- **`istar-frontend/`**: Next.js 16.3.4 (App Router), React 19.2.8, Tailwind CSS v4, Lucide React, Framer Motion, Axios.

```
istar-club/
├── README.md                                # Onboarding guide cho developer mới
├── AGENTS.md                                # Tóm tắt nhanh → trỏ đến file này
├── istar-backend/
│   ├── BACKEND.md                           # Kiến trúc backend & danh mục API (BẮT BUỘC ĐỌC)
│   └── src/main/java/com/haui/istar/
│       ├── config/                          # SecurityConfig, CorsConfig, GlobalExceptionHandler, DataSeeder
│       ├── controller/ (admin/, auth/, publicapi/, user/)
│       ├── dto/ (application/, auth/, common/, dashboard/, recruitment/, user/)
│       ├── model/ (Application, ApplicationDepartment, User, UserDepartment, Recruitment, enums/...)
│       ├── repository/ & specification/     # Repositories, ApplicationSpecification, UserSpecification
│       ├── security/                        # JwtTokenProvider, JwtAuthenticationFilter, UserPrincipal
│       ├── service/ & impl/                 # Service layer
│       └── util/                            # ExcelExporter, FileUploadUtil, UserValidator
└── istar-frontend/
    ├── FRONTEND.md                          # Kiến trúc frontend, popup specs & UI Kit (BẮT BUỘC ĐỌC)
    └── src/
        ├── app/ (auth)/, (public)/, admin/  # Routes & layouts (?popup=true ẩn sidebar/topbar)
        ├── components/admin/                # AdminGuard, AdminOverview, AdminSidebar, AdminTopBar
        │   ├── common/                      # Data Table UI Kit: DataTable, TablePagination, FilterBar,
        │   │                                # FilterDatePicker, PageHeader, TableActionButtons, BulkActionBar
        │   ├── dashboard/charts/            # 3D SVG Charts: IsometricBarChart3D, DepthDonutChart3D...
        │   └── interview/, applications/, recruitments/, users/ # Domain components, sub-tabs & popups
        ├── constants/                       # departments.ts (DEPARTMENTS_LIST, DEPARTMENT_LABELS), schools.ts
        ├── hooks/                           # useCommonCodes.ts, useFileUpload.ts, useApplicationEditing.ts
        ├── services/                        # apiClient (Axios interceptor), authService, domain services
        ├── types/                           # TypeScript interfaces & getApplicationStatusConfig
        └── utils/                           # broadcast.ts (notifyOpener), area.ts (getStoredArea), format.ts
```

---

## 2. Giao Thức Tài Liệu Bắt Buộc

### 2.1 Trước Khi Sửa Code
- **Backend**: Đọc [BACKEND.md](file:///d:/Study/Project/iStar/istar-club/istar-backend/BACKEND.md) để nắm kiến trúc và catalog API.
- **Frontend**: Đọc [FRONTEND.md](file:///d:/Study/Project/iStar/istar-club/istar-frontend/FRONTEND.md) để nắm UI/UX workflows, RBAC, popup specs, design tokens.
- **Frontend UI**: Đọc [design-tokens.md](file:///d:/Study/Project/iStar/istar-club/.agents/rules/design-tokens.md) và [component-guidelines.md](file:///d:/Study/Project/iStar/istar-club/.agents/rules/component-guidelines.md).

### 2.2 Sau Khi Sửa Code
- **`.java` file thay đổi** → Cập nhật [BACKEND.md](file:///d:/Study/Project/iStar/istar-club/istar-backend/BACKEND.md): API endpoints mới/sửa/xóa, service logic, data model.
- **Frontend file thay đổi** (`.tsx`, `.ts`, `.css`) ảnh hưởng UI/logic → Cập nhật [FRONTEND.md](file:///d:/Study/Project/iStar/istar-club/istar-frontend/FRONTEND.md): routes, modals, RBAC buttons, filters, design tokens.
- **Thay đổi kiến trúc toàn cục** → Cập nhật file này (`project-guidelines.md`) và `AGENTS.md`.

### 2.3 Tìm Kiếm Trước Khi Implement
Trước khi tạo feature/API/module mới:
1. Tìm kiếm codebase (cả backend lẫn frontend) để tìm logic liên quan.
2. Tái sử dụng pattern, config, helper có sẵn — tránh duplicate.
3. Xác định tất cả file phụ thuộc cần cập nhật đồng thời.

---

## 3. Bất Biến Nghiệp Vụ Cốt Lõi (Domain Invariants)

### 3.1 4 Ban Cố Định (Không Có Ban Con)
Hệ thống cố định đúng 4 ban chính (`Department` enum), không có ban con:
- `MUSIC` (Ban Âm nhạc), `RAP` (Ban Rap), `MEDIA_AND_EVENT` (Ban TT&TCSK), `DANCE` (Ban Vũ đạo).
- Tuyệt đối không dùng lại `SubDepartment`.
- Tên rút gọn trên UI: **"Ban TT&TCSK"**.

### 3.2 Đa Ban & In-Place Reconciliation
- 1 User → nhiều ban (`user_departments`). 1 Ứng viên → nhiều ban (`application_departments`).
- `user_departments` unique `(user_id, department)`. Hibernate `ActionQueue` chạy INSERT trước DELETE.
- **Cấm** `clear()` rồi `addAll()`. Luôn thực hiện 3 bước:
  1. `removeIf` các ban bị bỏ (`orphanRemoval = true`)
  2. Cập nhật `position` của ban giữ nguyên tại chỗ (UPDATE)
  3. Chỉ INSERT ban thực sự mới

### 3.3 Phân Cấp Chức Vụ & Phân Quyền
- **Cấp CLB** (`user.position`): `PRESIDENT`, `VICE_PRESIDENT` (giới hạn quota, cấm `NINH_BINH`), `AREA_MANAGER`, `MEMBER`.
- **Cấp Ban** (`user_departments.position`): `DEPARTMENT_HEAD` (tối đa 1 người/ban), `MEMBER`.
- **Phân quyền IT** (`PermissionGroup`): `ADMIN`, `RECEPTIONIST`, `INTERVIEWER`, `REVIEWER`, `MEMBER` → cấp `ROLE_<GROUP>` và `PERM_<CODE>`.

### 3.4 Vòng Đời Đơn Ứng Tuyển & Ma Trận Phân Quyền
```
SUBMITTED ➜ CHECKED_IN (hoặc NO_SHOW) ➜ INTERVIEWING ➜ INTERVIEWED ➜ APPROVED / REJECTED ➜ Tạo tài khoản
```
- **ADMIN**: Toàn quyền. Check-in, phỏng vấn, duyệt/từ chối, đảo trạng thái. Bulk: vắng mặt, duyệt/từ chối hàng loạt (chỉ `INTERVIEWED`).
- **RECEPTIONIST**: Tạo đơn offline (`CHECKED_IN`), check-in/vắng mặt/hoàn tác, sửa thông tin (không sửa status). Bulk: vắng mặt.
- **INTERVIEWER**: Chỉ xem `CHECKED_IN`/`INTERVIEWING` đợt active mà ban mình chưa chấm điểm. Bị khóa khi ban khác đang phỏng vấn.
- **Tự động**: Tất cả ban `INTERVIEWED` → đơn `INTERVIEWED`. Còn ban chưa xong → hoàn về `CHECKED_IN`.

### 3.5 Optimistic Locking & Điểm Phỏng Vấn
- `@Version` trên cả `Application` và `ApplicationDepartment`. Xung đột → HTTP 409 Conflict.
- Điểm 0.0 – 10.0 (cả FE lẫn BE). Input dùng `.no-spinner`. Textarea nhận xét tự co giãn (`scrollHeight`), cho phép `resize-y`.

### 3.6 Phiên Làm Việc & Kích Hoạt Tài Khoản
- **JWT**: Client giải mã `exp`, `AuthContext` tự đặt timer đăng xuất. Axios bắt 401 → `/login?expired=true&redirect=...`.
- **Tài khoản mới**: `isActive = false`. `DisabledException` → HTTP 403 `ACCOUNT_INACTIVE` → `InactiveAccountModal`.

### 3.7 Cơ Sở Phỏng Vấn (Area)
- `NINH_BINH` (Cơ sở 3, mặc định) và `HANOI` (Cơ sở 1).
- Nhãn chuẩn trên toàn UI: **"Cơ sở 3 (Ninh Bình)"** và **"Cơ sở 1 (Hà Nội)"**.
- `/admin/interview`: `AreaSelectModal` tự nhắc khi vào trang, lưu `sessionStorage`, lọc toàn bộ danh sách và stats.

### 3.8 Chuẩn UI Kit & Hiệu Năng
- Tất cả trang danh sách dùng `src/components/admin/common/`: `DataTable`, `TablePagination`, `FilterBar`, `FilterDatePicker`, `PageHeader`, `TableActionButtons`, `BulkActionBar`.
- Container: `max-w-[1720px]`, bảng `min-w-[960px] overflow-x-auto`.
- Loại bỏ animation `translateY` nặng (`AdminListLayout` tĩnh) → đảm bảo 60 FPS.
- Phân trang chuẩn: `sizeOptions={[10, 20, 30, 50, 100]}`, mặc định `20`, `unitName="ứng viên"`.

### 3.9 Dữ Liệu Mẫu & DDL
- `DataSeeder` seed: tài khoản mặc định (admin/admin123, receptionist, 4 interviewer, reviewer), 2 đợt (Gen 7 đóng, Gen 8 active), 12 hồ sơ 7 trạng thái.
- DDL: `spring.jpa.hibernate.ddl-auto=update` để bền vững. Dùng `create-drop` khi cần reset sạch, sau đó trả về `update`.

### 3.10 Excel & Rich Text
- **Export**: cột min 150px (`22 * 256`), trạng thái nhãn tiếng Việt, sheet "Hướng Dẫn & Mã Danh Mục".
- **Import**: `ExcelImporter` → tự gán đợt tuyển active, trạng thái khởi tạo `SUBMITTED`.
- **Rich Text**: `Recruitment.description` (TEXT). `RichTextEditor.tsx` WYSIWYG. `/apply` render `prose prose-invert`.

### 3.11 Chống Race Condition Phỏng Vấn
- Cờ `isAreaInitialized` + guard `if (!targetArea) return;` trước mọi API request.
- `statsReqIdRef` và `appReqIdRef` loại bỏ response cũ ghi đè kết quả mới.

### 3.12 DRY — Single Source of Truth
- `src/constants/departments.ts`: `DEPARTMENTS_LIST`, `DEPARTMENT_LABELS`, `getDepartmentName()`.
- `src/constants/schools.ts`: `HAUI_SCHOOLS`, `SCHOOL_CODE_MAP`.
- `src/types/application.ts`: `getApplicationStatusConfig(status)`.
- `src/utils/`: `broadcast.ts`, `area.ts`, `format.ts`.
- `src/hooks/`: `useCommonCodes`, `useFileUpload`, `useApplicationEditing`.

### 3.13 Bộ Lọc Khóa Học Động
- `useCommonCodes()`: Không truyền limit → gọi `getAllCourses()` (K12–K21). Fallback list K12–K21.
- `/admin/interview`: Merge server courses + courses thực tế trong `allActiveApplications`.
- `/admin/applications`: `FilterSelect` lọc theo khóa, tích hợp `activeFilterCount`.

---

## 4. Quy Chuẩn Kỹ Thuật

### 4.1 Backend
- **Kiến trúc**: `Controller` ➜ `Service` ➜ `Repository`. Không lộ JPA Entity ra API — dùng DTO.
- **Bảo mật**: `@PreAuthorize("hasAuthority('...')")` trên mọi endpoint nhạy cảm.
- **Xóa mềm**: `isDeleted = true`. Stream mapping: dùng lambda `ud -> ud.getDepartment()` thay method reference tránh strict null.

### 4.2 Frontend
- Next.js App Router. Dùng `"use client"` đúng chỗ.
- Mọi API call qua `src/services/apiClient.ts` hoặc service module tương ứng.
- **Design System**: Màu chủ đạo `#255798`. Tuân thủ [design-tokens.md](file:///d:/Study/Project/iStar/istar-club/.agents/rules/design-tokens.md) và [component-guidelines.md](file:///d:/Study/Project/iStar/istar-club/.agents/rules/component-guidelines.md). Không tự ý dùng màu khác hay tạo ad-hoc style.
- `input[type="date"]` mặc định của browser: **cấm hoàn toàn** — thay bằng `FilterDatePicker`.
- `Sparkles` icon: **cấm** — thay bằng icon ngữ cảnh (`CalendarRange`, `Award`, `UserPlus`...).

---

## 5. Lệnh Thường Dùng

```powershell
# Backend (http://localhost:8080)
cd istar-backend; ./mvnw spring-boot:run

# Frontend (http://localhost:3000)
cd istar-frontend; npm run dev

# Kiểm thử build
cd istar-backend; ./mvnw test
cd istar-frontend; npm run lint; npm run build
```