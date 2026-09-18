---
trigger: model_decision
description: Component styling specs, motion guidelines, anti-patterns, and mobile responsiveness rules for iStar Club frontend
globs: istar-frontend/**/*.{ts,tsx,css}
---

# Component Guidelines & UI Engineering — iStar Club

Spec kỹ thuật cho từng loại component, quy tắc animation, anti-patterns cấm, và chuẩn responsive cho **iStar Club** frontend.

> **Xem thêm**: [design-tokens.md](file:///d:/Study/Project/iStar/istar-club/.agents/rules/design-tokens.md) cho màu sắc và tokens. [FRONTEND.md](file:///d:/Study/Project/iStar/istar-club/istar-frontend/FRONTEND.md) cho kiến trúc tổng thể.

---

## 1. Mindset Kỹ Thuật Bắt Buộc

Khi đề xuất hoặc implement UI, lấy chuẩn của các **SaaS premium** (Linear, Vercel, Raycast):
- **Aesthetic Benchmark**: Giao diện developer-grade hiện đại, premium.
- **Core Vibe**: Dark mode cinematic × technical precision — near-black không gian được thắp sáng bởi iStar brand blues.
- **Pre-Implementation Check**: Luôn đọc [FRONTEND.md](file:///d:/Study/Project/iStar/istar-club/istar-frontend/FRONTEND.md), kiểm tra `globals.css`, và tìm component primitives hiện có trước khi thêm style mới. **Tái sử dụng token và modal convention — không tự ý tạo one-off color**.

---

## 2. Spec Từng Loại Component

### 2.1 Buttons
- **Primary Button**:
  - Background: `bg-[#255798]` hover `bg-[#316ebf]`, text `#FFFFFF font-medium`
  - Shadow: `shadow-[0_0_0_1px_rgba(37,87,152,0.5),0_4px_16px_rgba(37,87,152,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)]`
  - Active: `active:scale-[0.98]`
- **Secondary/Glass Button**: `bg-white/[0.05]` hover `bg-white/[0.08]`, border `border-white/[0.08]`
- **Ghost Button**: Transparent hover `bg-white/[0.05]`, text muted → foreground

### 2.2 Cards & Surfaces
- **Base Glass Card**:
  - Background: `bg-white/[0.02]` hoặc `bg-gradient-to-b from-white/[0.05] to-white/[0.01]`
  - Border: `border border-white/[0.06]`, radius: `rounded-2xl` (card lớn), `rounded-xl` (sub-element)
  - Backdrop: `backdrop-blur-md` hoặc `backdrop-blur-xl`
  - Hover: lift nhẹ `-2px` → `-4px`, border `border-white/[0.12]`, shadow mở rộng
- **Spotlight Card**: Tính mouse position → glow spotlight `rgba(37, 87, 152, 0.15)` radius 300px

### 2.3 Forms & Inputs
Dùng utility class từ `globals.css`:
- Container: `.form-card`
- Input/Textarea: `.form-input` (border subtle, dark glass bg, focus ring `#255798`)
- Label: `.form-label`, required marker `.required` màu đỏ `#ef4444`
- Checkbox: `.form-checkbox` checked state màu brand

### 2.4 Admin Data Tables
- Divider: `border-white/[0.06]`, header sticky `bg-[#0a0a0c]/80 backdrop-blur-md`
- Row hover: `hover:bg-white/[0.02]`
- **Status Badge**: Compact pill `rounded-full px-2.5 py-0.5 text-xs`, màu semantic (emerald=approved, amber=pending, rose=rejected)

### 2.5 FilterBar & DatePicker (UI Kit chuẩn)
- `FilterBar`: chiều cao `h-10` (40px), `border-white/10`, focus ring `#255798`, popup `z-50 shadow-2xl`
- `FilterDatePicker`: popover dark glass tiếng Việt, ISO `YYYY-MM-DD`, quick picker Tháng/Năm

---

## 3. Motion & Micro-Interactions

- **Library**: Framer Motion + CSS transitions thuần
- **Tốc độ**: Micro-interactions `200ms` → `300ms`
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` hoặc `ease-out`
- **Biên độ**: Translation nhỏ (`2px` → `8px`), scale `0.98` → `1.02` — **cấm bounce/spring quá mạnh**
- **Accessibility**: Luôn có `@media (prefers-reduced-motion: reduce)` fallback về instant/opacity

---

## 4. Anti-Patterns (Nghiêm Cấm)

1. **`#000000` thuần / `#FFFFFF` thuần** cho canvas hoặc body text liên tục
2. **Nền flat solid** không có border hay glass tint
3. **Border nặng** như `border-gray-500` — chỉ dùng hairline bán trong suốt `border-white/[0.06]`
4. **Màu accent ngẫu nhiên** (neon, purple, lạ) — chỉ dùng `#255798` và tông sắc của nó
5. **Bounce / elastic animation** biên độ lớn
6. **Tương phản không đạt** — body text phải đạt 4.5:1 contrast trên nền tối
7. **Width cứng** làm vỡ layout mobile — luôn responsive

---

## 5. Responsive & Mobile (Bắt Buộc)

Tất cả trang, modal, popup, table **PHẢI** tối ưu cho mobile (360px → 768px):

### 5.1 Tables
- Bọc trong `overflow-x-auto`
- Đặt `min-w-[700px]` → `min-w-[960px]` cho bảng nhiều cột
- Header `<th>` và cell quan trọng dùng `whitespace-nowrap`

### 5.2 Grids & Layouts
- Mobile-first: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3/4`
- Không hardcode width pixel trong header/card mà không có responsive override

### 5.3 Modals & Popups
- Backdrop padding: `p-3 sm:p-4 md:p-6`
- Header: `flex-col sm:flex-row items-start sm:items-center justify-between gap-3`
- Action footer: `flex-col-reverse sm:flex-row gap-2 sm:gap-3`, min touch target 40px

### 5.4 Action Bars & Pagination
- Pagination: `flex-col sm:flex-row items-center justify-between gap-3`
- Toolbar/filter: `flex-wrap gap-2.5` tránh overflow
