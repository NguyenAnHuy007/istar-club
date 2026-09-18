# AGENTS.md — iStar Club (Quick Reference)

> **Tài liệu quy chuẩn đầy đủ**: Xem [.agents/rules/project-guidelines.md](file:///d:/Study/Project/iStar/istar-club/.agents/rules/project-guidelines.md)

---

## Tóm Tắt Dự Án

Hệ thống quản lý và tuyển thành viên cho **CLB Nghệ thuật iStar** — HaUI.

- **Backend**: Java 21, Spring Boot 4.x, PostgreSQL | API tại `http://localhost:8080`
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4 | UI tại `http://localhost:3000`
- **4 Ban**: `MUSIC`, `RAP`, `MEDIA_AND_EVENT`, `DANCE` (cố định, không có ban con)
- **2 Cơ sở**: `NINH_BINH` (Cơ sở 3, mặc định), `HANOI` (Cơ sở 1)

## Tài Liệu Tham Chiếu

| Tài liệu | Đường dẫn | Nội dung |
|---|---|---|
| **Quy chuẩn toàn diện** | [project-guidelines.md](file:///d:/Study/Project/iStar/istar-club/.agents/rules/project-guidelines.md) | Kiến trúc, domain invariants, giao thức tài liệu, quy tắc kỹ thuật |
| **Backend Architecture** | [BACKEND.md](file:///d:/Study/Project/iStar/istar-club/istar-backend/BACKEND.md) | API catalog, data model, service layer |
| **Frontend Architecture** | [FRONTEND.md](file:///d:/Study/Project/iStar/istar-club/istar-frontend/FRONTEND.md) | Routes, components, RBAC, UI Kit |
| **Design Tokens** | [design-tokens.md](file:///d:/Study/Project/iStar/istar-club/.agents/rules/design-tokens.md) | Màu sắc, typography, atmospheric system |
| **Component Guidelines** | [component-guidelines.md](file:///d:/Study/Project/iStar/istar-club/.agents/rules/component-guidelines.md) | Spec component, motion, anti-patterns, responsive |
| **README** | [README.md](file:///d:/Study/Project/iStar/istar-club/README.md) | Hướng dẫn cài đặt và khởi chạy nhanh |

## Quy Tắc Bất Biến Nhanh

1. **Trước khi sửa backend** → đọc `BACKEND.md`. Sau khi sửa → cập nhật `BACKEND.md`.
2. **Trước khi sửa frontend** → đọc `FRONTEND.md`. Sau khi sửa → cập nhật `FRONTEND.md`.
3. **Thay đổi kiến trúc** → cập nhật `project-guidelines.md` và file này.
4. **Không** dùng `clear()`+`addAll()` cho `user_departments` (Hibernate INSERT-before-DELETE).
5. **Không** dùng `input[type="date"]` native — thay bằng `FilterDatePicker`.
6. **Không** dùng icon `Sparkles` — thay bằng icon ngữ cảnh.
7. **Không** hardcode course array tĩnh — dùng `useCommonCodes()` hoặc `getAllCourses()`.

## Lệnh Nhanh

```powershell
cd istar-backend; ./mvnw spring-boot:run   # Backend :8080
cd istar-frontend; npm run dev             # Frontend :3000
```
