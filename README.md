# iStar Club Management & Recruitment System

Hệ thống quản lý hoạt động và tuyển chọn thành viên cho **CLB Nghệ thuật iStar** — Trường Đại học Công nghiệp Hà Nội (HaUI).

---

## Yêu Cầu Môi Trường

| Thành phần | Phiên bản khuyến nghị |
|---|---|
| Java | JDK 21+ |
| Node.js | Node 20 LTS + npm |
| PostgreSQL | 15+ |

---

## Khởi Chạy Nhanh (Quick Start)

### 1. Backend (Spring Boot)

```bash
cd istar-backend
# Cấu hình DB trong src/main/resources/application.properties nếu cần
./mvnw clean spring-boot:run
```

Backend khởi chạy tại **`http://localhost:8080`**.

**Tài khoản mặc định** (tự động seed khi khởi động lần đầu):

| Tài khoản | Mật khẩu | Vai trò |
|---|---|---|
| `admin` | `admin123` | Quản trị viên (toàn quyền) |
| `receptionist` | `password123` | Lễ tân |
| `interviewer_music` | `password123` | Phỏng vấn viên — Ban Âm nhạc |
| `interviewer_dance` | `password123` | Phỏng vấn viên — Ban Vũ đạo |
| `interviewer_rap` | `password123` | Phỏng vấn viên — Ban Rap |
| `interviewer_media` | `password123` | Phỏng vấn viên — Ban TT&TCSK |
| `reviewer` | `password123` | Xét duyệt viên |

### 2. Frontend (Next.js)

```bash
cd istar-frontend
npm install
npm run dev
```

Frontend khởi chạy tại **`http://localhost:3000`**.

---

## Cấu Trúc Dự Án

```
istar-club/
├── istar-backend/     # RESTful API (Java 21, Spring Boot 4.x)
│   └── BACKEND.md     # Kiến trúc, API catalog (đọc trước khi sửa backend)
├── istar-frontend/    # Web App (Next.js 16, React 19, Tailwind CSS v4)
│   └── FRONTEND.md    # Kiến trúc, UI Kit, RBAC (đọc trước khi sửa frontend)
└── .agents/rules/     # Quy chuẩn phát triển cho AI agents & developers
    ├── project-guidelines.md  # Quy tắc tổng diện, domain invariants
    ├── design-tokens.md       # Màu sắc, typography, design system
    └── component-guidelines.md # Spec component, animation, responsive
```

---

## Tài Liệu Kỹ Thuật

| Tài liệu | Nội dung |
|---|---|
| [istar-backend/BACKEND.md](istar-backend/BACKEND.md) | Kiến trúc backend, data model, API catalog đầy đủ |
| [istar-frontend/FRONTEND.md](istar-frontend/FRONTEND.md) | Kiến trúc frontend, popup specs, RBAC, UI Kit |
| [.agents/rules/project-guidelines.md](.agents/rules/project-guidelines.md) | Quy chuẩn kỹ thuật, bất biến nghiệp vụ, giao thức phát triển |
| [.agents/rules/design-tokens.md](.agents/rules/design-tokens.md) | Hệ thống màu sắc, typography, nền không gian |
| [.agents/rules/component-guidelines.md](.agents/rules/component-guidelines.md) | Spec component, motion, anti-patterns, responsive |
