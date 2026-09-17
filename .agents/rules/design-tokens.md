---
trigger: model_decision
description: Design tokens, color palette, typography, and atmospheric background system for iStar Club frontend (Next.js 16, Tailwind CSS v4)
globs: istar-frontend/**/*.{ts,tsx,css}
---

# Design Tokens & Visual System — iStar Club

Định nghĩa hệ thống token thiết kế chính thức (màu sắc, typography, nền không gian) cho **iStar Club** frontend.

> **Xem thêm**: [component-guidelines.md](file:///d:/Study/Project/iStar/istar-club/.agents/rules/component-guidelines.md) cho spec component, animation và quy tắc anti-patterns. [FRONTEND.md](file:///d:/Study/Project/iStar/istar-club/istar-frontend/FRONTEND.md) cho kiến trúc tổng thể.

---

## 1. Bộ Màu Chính (Color Palette)

Toàn bộ màu sắc định nghĩa là CSS variables trong `globals.css`, áp dụng xuyên suốt Tailwind CSS v4:

| Token | Giá Trị | Ngữ Nghĩa Sử Dụng |
|:---|:---|:---|
| `--background-deep` | `#020203` | Lớp nền sâu nhất, footer, scrollbar track |
| `--background-base` | `#050506` | Nền body mặc định (không bao giờ dùng `#000000` thuần) |
| `--background-elevated` | `#0a0a0c` | Bề mặt nổi: dropdown, modal, dialog |
| `--foreground` | `#EDEDEF` | Văn bản chính — off-white mềm mại tránh chói mắt |
| `--foreground-muted` | `#8A8F98` | Văn bản phụ, mô tả, caption, metadata |
| `--foreground-subtle` | `rgba(255, 255, 255, 0.60)` | Nhãn inactive, placeholder |
| `--accent` | `#255798` | Màu chủ đạo iStar (nút, trạng thái active, indicator) |
| `--accent-bright` | `#316ebf` | Hover state cho accent elements |
| `--accent-glow` | `rgba(37, 87, 152, 0.35)` | Ambient glow, button glow, focus shadow |
| `--border-default` | `rgba(255, 255, 255, 0.06)` | Đường viền container siêu mỏng |
| `--border-hover` | `rgba(255, 255, 255, 0.12)` | Border sáng lên khi hover |
| `--border-accent` | `rgba(37, 87, 152, 0.40)` | Border active/focused |

**Quy tắc cứng**: Tuyệt đối **không** dùng `#000000` cho nền, `#FFFFFF` cho text dài. Không tự ý đưa màu sắc ngẫu nhiên (neon green, tím, xanh lạ) — tất cả accent phải dùng `#255798` và các tông sắc của nó.

---

## 2. Typography

- **Font chính**: `Inter` qua `next/font/google` (`--font-inter`), bao gồm subset Latin & Vietnamese.
- **Phân cấp kích thước**:
  - **Hero/Display**: `text-5xl` → `text-7xl`, `font-bold`/`font-semibold`, `tracking-tight`
  - **Section Title (H2)**: `text-3xl` → `text-4xl`, `font-semibold`, `tracking-tight`
  - **Card Header (H3)**: `text-xl` → `text-2xl`, `font-semibold`
  - **Body**: `text-sm` → `text-base`, `leading-relaxed`, màu `--foreground`/`--foreground-muted`
  - **Meta/Tag**: `text-xs`, `font-mono`/`font-medium`, `tracking-wider`, uppercase
- **Gradient text**:
  - `.gradient-text` — trắng đến off-white bán trong suốt (headline chính)
  - `.gradient-text-accent` — shimmer `#255798` → `#4d8ee8` có animation

---

## 3. Hệ Thống Nền Không Gian (Atmospheric Background)

Tuyệt đối không dùng nền flat solid. Bố cục root thiết lập độ sâu qua 4 lớp:

1. **Base Radial Gradient**: `bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,#050506_50%,#020203_100%)]`
2. **Noise Texture**: `.noise-overlay` — SVG fractal noise ở `opacity: 0.018` chống color banding
3. **Grid Overlay**: `.grid-overlay` — lưới 64px tại `opacity: 0.02`
4. **Ambient Light Blobs**: 4 blobs gradient mờ (`blur-[120px]` → `blur-[150px]`) với keyframes `float-1`, `float-2`, `float-3`, `pulse-glow`

> Khi xây dựng modal, dashboard, sub-page độc lập: giữ nguyên cảm giác không gian nhưng **không chồng thêm** blur nặng gây lag.
