# iStar Frontend — Kiến Trúc & Logic Giao Diện

Ứng dụng web quản trị và tuyển thành viên cho CLB Nghệ thuật iStar (Next.js 16 App Router, React 19, Tailwind CSS v4).

---

## 1. Công Nghệ & Cấu Trúc Dự Án

- **Framework & UI**: Next.js 16.3.4 (App Router), React 19.2.8, TypeScript 5, Tailwind CSS v4 (`@tailwindcss/postcss`).
- **Icons & Animation**: Lucide React, Framer Motion.
- **HTTP Client**: Axios (`src/services/apiClient.ts`) gắn JWT Bearer Interceptor và bắt lỗi 401 tự động.

### 1.1 Cấu Trúc Thư Mục Rút Gọn

```
istar-frontend/src/
├── app/
│   ├── (auth)/login, register           # Xác thực (inactive modal, session expiry alert)
│   ├── (public)/, apply/                # Landing page & nộp đơn online
│   ├── admin/
│   │   ├── layout.tsx                   # Layout quản trị (ẩn sidebar/topbar khi ?popup=true)
│   │   ├── page.tsx                     # Dashboard tổng quan (biểu đồ 3D SVG)
│   │   ├── applications/page.tsx        # Quản lý hồ sơ đơn ứng tuyển
│   │   ├── interview/                   # Danh sách phỏng vấn & tabs thống kê
│   │   │   ├── create/page.tsx          # Popup tạo đơn offline lễ tân (?popup=true)
│   │   │   └── [id]/page.tsx            # Popup chấm điểm phỏng vấn (?popup=true)
│   │   ├── recruitments/page.tsx        # Quản trị đợt tuyển
│   │   └── users/page.tsx               # Quản lý người dùng, phân quyền & kích hoạt
│   └── globals.css                      # Design tokens, theme colors & .no-spinner
├── components/
│   ├── admin/
│   │   ├── AdminGuard.tsx, AdminOverview.tsx, AdminSidebar.tsx, AdminTopBar.tsx
│   │   ├── common/                      # Bộ UI Kit chuẩn: DataTable, TablePagination, FilterBar,
│   │   │                                # FilterDatePicker, PageHeader, TableActionButtons, TableCheckbox,
│   │   │                                # BulkActionBar, AdminListLayout, boilerplate.example.tsx
│   │   ├── dashboard/charts/            # DepthDonutChart3D, GlowingAreaChart, IsometricBarChart3D, SchoolRankingCard
│   │   ├── interview/                   # InterviewPageContent, InterviewStatsTab, InterviewExcelActions,
│   │   │                                # InterviewPopupContent, CreateApplicationPopupContent,
│   │   │                                # CheckInModal, ClaimInterviewModal, InterviewDetailModal, AreaSelectModal
│   │   ├── applications/, recruitments/, users/ # Modal & Table theo từng domain
│   ├── apply/, auth/, common/           # Form nộp đơn, Auth forms, CustomSelect, Icons
│   └── layout/, providers/              # Navbar, Footer, AuthProvider
├── constants/                           # departments.ts (DEPARTMENTS_LIST, DEPARTMENT_LABELS), schools.ts (SCHOOL_CODE_MAP)
├── context/                             # AuthContext.tsx, ToastContext.tsx
├── hooks/                               # useCommonCodes.ts, useFileUpload.ts, useApplicationEditing.ts
├── services/                            # apiClient.ts, authService.ts, admin*Service.ts, interviewService.ts
├── types/                               # application, user, auth, recruitment, dashboard
└── utils/                               # broadcast.ts (notifyOpener, subscribeToBroadcast), area.ts, format.ts
```

---

## 2. Quy Ước & Cơ Chế Giao Diện Cốt Lõi

### 2.1 Nhập Điểm Phỏng Vấn (0.0 – 10.0 & Không Spinner)
- **Loại bỏ mũi tên tăng giảm (`.no-spinner`)**: Định nghĩa trong `globals.css`, áp dụng cho mọi `input[type="number"]` nhập điểm để tránh click nhầm.
- **Ràng buộc điểm số**: Thuộc tính `min="0" max="10" step="0.1"`. Sự kiện `onChange` khống chế nghiêm ngặt `Math.min(10, Math.max(0, val))`. Textarea nhận xét tự động co giãn (`scrollHeight`) và cho phép kéo dãn dọc (`resize-y`).

### 2.2 Cửa Sổ Popup Độc Lập (`?popup=true`)
Dành riêng cho **Chấm điểm phỏng vấn** (`/admin/interview/[id]`) và **Tạo đơn offline** (`/admin/interview/create`):
- **Layout**: `src/app/admin/layout.tsx` kiểm tra `searchParams.get("popup") === "true"` ➜ ẩn toàn bộ `AdminSidebar` và `AdminTopBar`, hiển thị full-screen nền tối `bg-[#0A0B0E]`. Bọc trong `<Suspense>` chuẩn Next.js 16.
- **Kích hoạt**: `window.open(url, windowName, "width=1200,height=880,resizable=yes,scrollbars=yes")`.
- **Đồng bộ dữ liệu Real-time**: Khi cập nhật thành công trong popup, phát tín hiệu qua cả hai kênh:
  1. `BroadcastChannel("istar_interview_updates").postMessage({ type: "INTERVIEW_UPDATED" })`
  2. `window.opener.postMessage({ type: "INTERVIEW_UPDATED" }, "*")`
  Trang cha lắng nghe để tự động `fetchApplications()` làm mới dữ liệu không cần reload trang.

### 2.3 Form Nộp Đơn Ứng Tuyển Công Khai (`/apply`)
- **Tùy chọn 4 Khóa học gần nhất**: Dropdown chọn khóa gọi API `commonCodeService.getRecentCourses(4)` (chỉ tải 4 khóa gần nhất K21 đến K18) kết hợp `SelectWithOther` hiển thị nhãn ngắn gọn (`K19`, `K18`...) và cho phép nhập khóa tùy biến khi cần.
- **Tối giản nội dung & Căn giữa giao diện**:
  - Loại bỏ các text phụ không cần thiết: *"Chọn cơ sở Trường Đại học Công nghiệp Hà Nội thuận tiện nhất cho bạn tham gia phỏng vấn"* và nhãn *"Mặc định"* trên nút Cơ sở 3 (Ninh Bình).
  - Tối ưu thẻ chọn ban (`DepartmentPicker`): Căn giữa theo trục dọc (`items-center gap-3.5 min-h-[58px]`), loại bỏ độ lệch checkbox, nâng cao tính thẩm mỹ và cân đối mà không thêm text thừa.
- **Lịch chọn Ngày sinh chuẩn UI Kit**: Tích hợp `FilterDatePicker` chuẩn dark glass thay cho native date input, hỗ trợ chọn nhanh Tháng và Năm trực tiếp trên thanh điều hướng (quá khứ 70 năm) giúp việc chọn ngày sinh sinh viên nhanh chóng chỉ với 1-2 click.
- **Icon tiêu đề phân định rõ ngữ nghĩa**: Từng phần được trang bị icon tương ứng thay vì dùng chung: `User` (Thông tin cá nhân), `GraduationCap` (Thông tin học tập), `Compass` (Nguyện vọng tham gia), `HelpCircle` (Câu hỏi tìm hiểu), `MapPin` (Địa điểm / Cơ sở phỏng vấn).
- **Lựa chọn Cơ sở phỏng vấn**: Tích hợp 2 thẻ lựa chọn trực quan: `Cơ sở Ninh Bình` và `Cơ sở Hà Nội`.
- **Đơn giản hóa form nộp đơn công khai**:
  - Không yêu cầu tải ảnh thẻ/chân dung tại trang `/apply` công khai nhằm tối giản thao tác cho ứng viên sinh viên. Ảnh chân dung sẽ được chụp/tải lên tại bước Check-in trực tiếp tại bàn lễ tân hoặc khi tạo đơn offline.
  - File component `AvatarUploader.tsx` vẫn được lưu trữ nguyên vẹn trong codebase phục vụ tái sử dụng khi cần.
- **Liên kết danh mục động**: Tự động bind đợt tuyển active (`publicRecruitmentService.getActiveRecruitment()`), danh sách trường/khoa HaUI từ backend API.

### 2.4 Quản Lý Cơ Sở Phỏng Vấn & Bộ Lọc Không Gian Tuyển Chọn (`Area`)
- **Chuẩn hóa nhãn cơ sở (`Area`)**: Nhãn cơ sở được hiển thị thống nhất trên toàn hệ thống thành `"Cơ sở 3 (Ninh Bình)"` (mặc định) và `"Cơ sở 1 (Hà Nội)"`, loại bỏ toàn bộ subtext giải thích rườm rà và mô tả ban dài dòng.
- **Modal chọn cơ sở phỏng vấn (`AreaSelectModal`)**: Khi người dùng thuộc bất kỳ vai trò nào (`ADMIN`, `RECEPTIONIST`, `INTERVIEWER`, `REVIEWER`) truy cập `/admin/interview`, nếu chưa chọn cơ sở trong phiên làm việc (`sessionStorage`), hệ thống tự động hiển thị popover chọn cơ sở.
- **Lọc tự động toàn diện & Re-fetch tức thì**: Mọi truy vấn danh sách ứng viên (`searchApplications`) và dữ liệu thống kê (`fetchStatsApplications`) tại `/admin/interview` tự động gắn `area: selectedArea`. Khi người dùng đổi cơ sở qua `handleSelectArea`, giao diện lập tức truyền tham số override để nạp dữ liệu mới ngay lập tức mà không gặp độ trễ state.
- **Chuyển đổi linh hoạt & Chuẩn kích thước UI**: Nút chuyển đổi cơ sở gắn trên `PageHeader` của `/admin/interview` được chuẩn hóa kích thước `h-10 rounded-lg text-xs font-medium` đồng bộ hoàn hảo với các nút thao tác lân cận.
- **Đồng bộ trên toàn bộ giao diện quản trị**:
  - `CreateApplicationPopupContent` & `CreateApplicationModal`: Khởi tạo sẵn cơ sở từ phiên làm việc hoặc mặc định `NINH_BINH`, bổ sung hệ thống icon ngữ nghĩa (`User`, `GraduationCap`, `MapPin`, `Compass`, `HelpCircle`) chuẩn như form public `/apply`.
  - `ApplicationDetailModal`, `InterviewDetailModal`, `InterviewPopupContent`: Hiển thị badge cơ sở ở chế độ xem và hỗ trợ chỉnh sửa cơ sở ở chế độ edit.
  - Bảng danh sách đơn (`/admin/applications`): Bổ sung cột "Cơ sở" và bộ lọc cơ sở trên `FilterBar` ("Hà Nội" / "Ninh Bình"). Nút "Tải file excel" phản ánh chính xác các tiêu chí lọc đang được chọn trên màn hình.

### 2.5 Trình Soạn Thảo Rich Text & Quản Trị Đợt Tuyển
- **Trình soạn thảo Rich Text (`RichTextEditor.tsx`)**: Thành phần soạn thảo WYSIWYG Linear-style tích hợp trong `RecruitmentModal.tsx` để viết mô tả thể lệ đợt tuyển (`description`), hỗ trợ Heading (H2, H3), Bold, Italic, Underline, Bullet/Numbered List, Blockquote, Hyperlink và chế độ xem/chỉnh sửa trực tiếp mã HTML nguồn.
- **Hiển thị thông tin đợt tuyển tại `/apply`**: Khi có đợt tuyển đang mở, trang nộp đơn công khai tự động hiển thị thẻ giới thiệu nổi bật phía trên form với nội dung HTML rich-text được định kiểu an toàn bằng `prose prose-invert`.
- **Chuẩn hóa toàn diện Date Picker**: Triệt tiêu hoàn toàn các thẻ `<input type="date">` mặc định của trình duyệt trên toàn bộ dự án. Tất cả biểu mẫu tạo/sửa đợt tuyển, tạo/sửa ứng viên, và bộ lọc quản trị đều dùng chung component `FilterDatePicker` chuẩn Dark Glass.

### 2.6 Thao Tác Excel & Nâng Cấp Tab Thống Kê Phỏng Vấn
- **Menu Thao tác Excel tại `/admin/interview`**: Cung cấp dropdown menu dành riêng cho `ADMIN` với 3 chức năng: "Tải template" (tải file mẫu `.xlsx` có kèm sheet hướng dẫn), "Tải file excel" (xuất toàn bộ ứng viên kèm điểm số, cơ sở, cột $\ge$ 150px và trạng thái tiếng Việt), "Up file excel" (hỗ trợ kéo thả/chọn file nhập ứng viên tự động).
- **Tab Thống Kê Phỏng Vấn 3D (STATS)**: Tích hợp trực tiếp hai biểu đồ 3D SVG tương tác cao `DepthDonutChart3D` (cơ cấu trạng thái phỏng vấn) và `IsometricBarChart3D` (phân bổ số lượng ứng viên theo 4 ban).
- **Chuẩn hóa nhãn trường/khoa**: Toàn bộ bảng phân tích và thẻ xếp hạng trong tab STATS sử dụng `formatSchoolName` để ánh xạ các mã viết tắt (như `CNTT_TT`, `CK`, `DL`...) sang tên tiếng Việt đầy đủ.

### 2.7 Chuẩn Hóa Nút Thao Tác, Badge Trạng Thái & Modal Chi Tiết Đơn
- **Nút Thao Tác Subtle Glass Thống Nhất**:
  - Các nút hành động trên bảng (`InterviewPageContent`, `ApplicationTable`, `TableActionButtons`) được đồng bộ chuẩn kích thước `h-8 px-2.5 text-xs font-medium rounded-lg border` với hiệu ứng nền kính mờ dịu mắt, độ tương phản cao, loại bỏ sự cọc cạch giữa các kiểu nút solid đậm và outline mờ.
- **Badge Trạng Thái Bo Tròn (Pill Badges)**:
  - Tất cả badge trạng thái (`UserTable`, `ApplicationTable`) được chuẩn hóa sang cấu trúc bo tròn hoàn toàn `rounded-full` kết hợp chấm tròn phát sáng (`w-1.5 h-1.5 rounded-full`) chỉ thị màu sắc ngữ nghĩa.
- **Nâng cấp Modal Chi Tiết Ứng Viên (`ApplicationDetailModal.tsx`, `InterviewPopupContent.tsx`, `InterviewDetailModal.tsx`)**:
  - **Tối ưu Avatar & Trình Xem Ảnh Phóng To (Lightbox Modal - `ImageViewerModal.tsx`)**:
    - Avatar ứng viên tăng kích thước lên 96px (`w-24 h-24`), bố cục căn giữa đối xứng cân đối.
    - Rê chuột hiển thị lớp phủ mờ kèm icon xem `Eye`. Click vào avatar mở trực tiếp Lightbox toàn màn hình.
    - Lightbox tích hợp bộ điều khiển thu phóng (Zoom In `+`, Zoom Out `-`, Reset), tải ảnh gốc về máy (`Download`), và phân quyền thao tác RBAC chuẩn mực: chỉ `ADMIN` và `RECEPTIONIST` mới có quyền Đổi ảnh đại diện hoặc Xóa ảnh (`DELETE /api/admin/applications/{id}/avatar`); các vai trò khác (`INTERVIEWER`, `REVIEWER`) chỉ có quyền xem, zoom và tải ảnh.
  - **Thu gọn Dropdown Trạng thái & Loại Bỏ Mã DB Thô**:
    - Kích thước gọn gàng vừa vặn `w-36 sm:w-40`, có khoảng cách thoáng với tên ứng viên.
    - Loại bỏ 100% các chú thích mã enum database thừa (như `(SUBMITTED)`, `(CHECKED_IN)`...), chỉ hiển thị nhãn tiếng Việt thuần túy ("Đã nộp đơn", "Đã check-in", "Đang phỏng vấn", "Đã phỏng vấn", "Trúng tuyển", "Đã từ chối", "Vắng mặt").
  - **Nút Đóng Rõ Ràng**:
    - Thêm chữ `"Đóng"` trực quan bên cạnh icon `X` trên thanh tiêu đề modal để người dùng nhận diện ngay tức thì.
  - **Hiển Thị Mốc Thời Gian Thực Tế**:
    - Hiển thị mốc thời gian Check-in (`checkedInAt`) và Hoàn tất phỏng vấn (`interviewedAt`) định dạng `HH:mm DD/MM/YYYY`.
  - **Dropdown Trường & Khóa Động**: Thay thế text input tự do bằng `SelectWithOther` kết nối danh mục trường/khoa và khóa học trực tiếp từ cơ sở dữ liệu (`commonCodeService`).
  - **Thêm Ban Ứng Tuyển Chuẩn Dark Glass**: Thay thế `<select>` mặc định bằng nút popover dark glass và menu tùy chọn thanh lịch.
  - **Tối Giản Giao Diện Cho Lễ Tân (`RECEPTIONIST`) Tại Popup/Modal Phỏng Vấn**:
    - Khi Lễ tân mở xem ứng viên: Ẩn hoàn toàn Phần 2 (Khối thẻ Trạng thái & Điểm danh) và Phần 3 (Chấm điểm Phỏng vấn theo Ban).
    - Các nút thao tác nghiệp vụ của Lễ tân (**Check-in**, **Vắng mặt**, **Hoàn tác về Đã nộp đơn**) được tinh gọn đưa lên thanh công cụ tiêu đề (Header Actions) ngay cạnh nút "Sửa thông tin" và "Đóng".
    - Lễ tân chỉ được phép sửa thông tin ứng viên khi trạng thái là `SUBMITTED`, `CHECKED_IN`, hoặc `NO_SHOW`.
    - Tiêu đề modal hiển thị trực tiếp danh sách badge các ban ứng tuyển nguyện vọng.
  - **Tối Ưu Thao Tác Bảng Quản Lý Người Dùng (`/admin/users`)**:
    - Loại bỏ nút chữ "Chỉnh sửa" trên cột thao tác, thay thế bằng cặp icon buttons tinh tế: **Vô hiệu hóa** (khi user active) / **Kích hoạt** (khi user inactive) và **Xóa tài khoản** (`Trash2`), click vào dòng vẫn mở modal xem/sửa chi tiết.
  - **Sửa Lỗi Click Checkbox Danh Sách Quản Trị**:
    - Khắc phục triệt để lỗi không nhận click trên `TableCheckbox`: bổ sung `onChange` prop tại `DataTable.tsx` (header & row) và xử lý sự kiện stopPropagation có điều kiện tại `TableCheckbox.tsx`.
  - **Triệt Tiêu Hoàn Toàn Icon `Sparkles`**:
    - Thay thế 100% biểu tượng `Sparkles` trên toàn dự án bằng các icon chuẩn ngữ cảnh: `CalendarRange` (Chiến dịch & Đợt tuyển), `HelpCircle` (Động lực & Câu hỏi tìm hiểu), `Award`/`Save` (Chấm điểm & Lưu kết quả phỏng vấn), `UserPlus`/`UserCheck` (Tạo đơn & Check-in), `TrendingUp` (Số liệu trung bình), `LayoutDashboard` (Analytics Center).

### 2.14 Tối Ưu Tải Dữ Liệu Phỏng Vấn & Tái Cấu Trúc Popup Chi Tiết
- **Khắc Phục Lỗi Tải Danh Sách Phỏng Vấn & Chống Race Condition (`InterviewPageContent.tsx`)**:
  - Triệt tiêu hoàn toàn race condition gây lẫn lộn dữ liệu giữa Hà Nội và Ninh Bình khi tải trang.
  - Bổ sung cờ `isAreaInitialized` và cơ chế guard `if (!targetArea) return;` trong cả `fetchApplications` và `fetchStatsApplications`, bảo đảm không bao giờ thực hiện request không có `area` (trả về toàn bộ cơ sở).
  - Tích hợp bộ đếm định danh request (`statsReqIdRef` và `appReqIdRef`) nhằm loại bỏ triệt để các phản hồi API cũ/chậm hơn không được phép ghi đè lên dữ liệu mới của cơ sở vừa chọn.
- **Chuẩn Hóa Tiêu Đề Popup/Modal & Loại Bỏ Trùng Lặp Thông Tin (`InterviewPopupContent.tsx`, `InterviewDetailModal.tsx`)**:
  - Tiêu đề (Header) tinh giản tuyệt đối: chỉ giữ lại **Ảnh đại diện** (hỗ trợ click phóng to Lightbox), **Họ và tên**, **Trạng thái đơn** (badge/dropdown), **Số đơn** (`Đơn #{id}`), **Ngày nộp** (`Nộp: DD/MM/YYYY`) cùng cụm **nút thao tác nghiệp vụ**.
  - Đẩy toàn bộ thông tin chi tiết trước đây bị lặp ở header xuống Phần 1 bên dưới ("1. Thông tin cá nhân & Đơn ứng tuyển"): Email, Số điện thoại, Cơ sở phỏng vấn, Trường, Lớp/Khóa, Đợt tuyển dụng (`recruitmentName`), Link Facebook, Ban ứng tuyển nguyện vọng (Department badges) và Mốc thời gian thực tế (Check-in, Hoàn thành PV).
- **Ẩn Thẻ "Thao tác Trạng thái & Điểm danh" Khi Không Có Nút Khả Dụng**:
  - Kiểm tra trạng thái đơn: Khi hồ sơ ở các trạng thái `INTERVIEWING`, `INTERVIEWED`, `APPROVED`, hoặc `REJECTED` (không có nút thao tác phù hợp), khối Section 2 được ẩn hoàn toàn, loại bỏ vùng chứa rỗng gây bất hợp lý.
  - Khi hồ sơ ở trạng thái `SUBMITTED`, `CHECKED_IN`, hoặc `NO_SHOW`, khối thẻ hiển thị rõ ràng kèm văn bản hướng dẫn và đồng bộ các nút thao tác nhanh trực tiếp lên Header cho cả `ADMIN` lẫn `RECEPTIONIST`.

### 2.15 Tái Cấu Trúc DRY, Shared Utilities, Custom Hooks & Phân Rã God Components
- **Single Source of Truth cho Danh mục Hằng Số**:
  - `src/constants/departments.ts`: Định nghĩa tập trung `DEPARTMENTS_LIST` (mảng 4 ban chuẩn), `DEPARTMENT_LABELS` (map mã sang tên tiếng Việt), và helper `getDepartmentName()`. Triệt tiêu hoàn toàn 5+ khai báo lặp tại các bảng và modal.
  - `src/constants/schools.ts`: Hợp nhất `HAUI_SCHOOLS` và `SCHOOL_CODE_MAP` làm nguồn chân lý duy nhất cho danh mục các trường/khoa HaUI.
  - `src/types/application.ts`: Cung cấp hàm tiện ích `getApplicationStatusConfig(status)` xử lý fallback an toàn, loại bỏ các block fallback 6 dòng bị lặp ở khắp các modal.
- **Hạ Tầng Shared Utilities (`src/utils/`)**:
  - `src/utils/broadcast.ts`: Đóng gói logic phát tín hiệu đa tab/cửa sổ (`notifyOpener`) và lắng nghe sự kiện (`subscribeToBroadcast`) qua `BroadcastChannel` và `postMessage`.
  - `src/utils/area.ts`: Tập trung các thao tác đọc/ghi `sessionStorage` cơ sở phỏng vấn (`getStoredArea`, `setStoredArea`, `removeStoredArea`, `formatAreaName`).
  - `src/utils/format.ts`: Tiện ích ánh xạ tên trường `formatSchoolName`, định dạng ngày `formatDateVN`, thời gian `formatDateTimeVN`, và chuẩn hóa điểm `clampInterviewScore`.
- **Custom Hooks Tái Sử Dụng (`src/hooks/`)**:
  - `useCommonCodes(limit)`: Tải động các khóa sinh viên gần nhất (kèm fallback an toàn K21-K16) và danh sách trường, giải phóng mã nguồn lặp tại 4 modal/popup.
  - `useFileUpload()`: Đóng gói toàn bộ logic kéo thả, chọn file ảnh đại diện, kiểm tra dung lượng (tối đa 5MB), định dạng, tạo và giải phóng `URL.createObjectURL`.
  - `useApplicationEditing()`: Quản lý trạng thái form chỉnh sửa ứng viên, RBAC phân quyền sửa theo vai trò (`isCandidateEditableByRole`), và các hàm handler nghiệp vụ.
- **Phân Rã God Component `InterviewPageContent.tsx`**:
  - Giảm kích thước từ **1,934 dòng** xuống **~1,560 dòng**.
  - Tách toàn bộ Tab 2 (Thống kê 3D, phổ điểm, phân bổ ban, xếp hạng trường) thành `InterviewStatsTab.tsx`.
  - Tách toàn bộ Dropdown Thao tác Excel (Template, Xuất danh sách lọc, Nhập file) kèm input ẩn và kiểm soát click-outside thành `InterviewExcelActions.tsx`.

### 2.16 Chuẩn Hóa Bộ Lọc Khóa Học Động (Course Dynamic Filtering)
- **Tải Động & Đầy Đủ Tất Cả Các Khóa Học**:
  - `useCommonCodes(courseLimit?)`: Khi `courseLimit` không truyền hoặc $\le 0$ (mặc định), tự động gọi `commonCodeService.getAllCourses()` tải toàn bộ danh sách khóa học (từ `K21` đến `K12`...) thay vì chỉ giới hạn 6 khóa gần nhất. Mở rộng danh sách fallback dự phòng đầy đủ từ K21 đến K12.
- **Màn Hình Phỏng Vấn (`/admin/interview`)**:
  - Loại bỏ hoàn toàn mảng tĩnh `["K16", "K17", "K18", "K19", "K20"]` bị cố định trước đây.
  - Tự động nạp động danh mục khóa từ máy chủ và hợp nhất với mọi khóa xuất hiện thực tế trong danh sách ứng viên của chiến dịch (`allActiveApplications`), sắp xếp giảm dần theo số khóa (`K21`, `K20`, `K19`...).
- **Màn Hình Đơn Ứng Tuyển (`/admin/applications`)**:
  - Bổ sung bộ chọn lọc Khóa học (`FilterSelect` `criteria.course`) vào thanh công cụ `FilterBar`.
  - Tích hợp đếm bộ lọc kích hoạt (`activeFilterCount`) và tự động nạp động danh mục khóa tương tự màn hình phỏng vấn, hỗ trợ lọc kết hợp với Cơ sở, Đợt tuyển, Ban, Trạng thái và Khoảng ngày nộp đơn.

---

## 3. Ma Trận Phân Quyền Thao Tác (RBAC Action Matrix)

| Vai trò | Phạm vi hiển thị tại `/admin/interview` | Nút Thao Tác Từng Dòng | Thao Tác Hàng Loạt (Bulk) |
|---|---|---|---|
| **Quản trị viên (`ADMIN`)** | Toàn bộ ứng viên mọi đợt tuyển (mặc định đợt active) | - `SUBMITTED`/`NO_SHOW`: **Check-in** (modal chụp ảnh)<br>- `CHECKED_IN`/`INTERVIEWING`: **Phỏng vấn** (mở popup)<br>- `INTERVIEWED`: **Duyệt đơn** & **Từ chối đơn** (icon + text) | - Báo vắng mặt (chỉ `SUBMITTED`, `CHECKED_IN`)<br>- Duyệt hàng loạt (chỉ `INTERVIEWED`)<br>- Từ chối hàng loạt (chỉ `INTERVIEWED`) |
| **Lễ tân (`RECEPTIONIST`)** | Toàn bộ ứng viên đợt active | - Header: **Tạo đơn mới (Offline)** (mở popup)<br>- `SUBMITTED`: **Check-in** & **Vắng mặt**<br>- `CHECKED_IN`: **Vắng mặt**<br>- `NO_SHOW`: **Check-in lại**<br>- Click dòng: Mở popup giao diện rút gọn (các nút nghiệp vụ đưa lên Header, ẩn khối điểm & chấm điểm; chỉ sửa khi `SUBMITTED`/`CHECKED_IN`/`NO_SHOW`) | - Báo vắng mặt (chỉ `SUBMITTED`, `CHECKED_IN`)<br>*(Bỏ Check-in hàng loạt vì cần chụp ảnh)* |
| **Xét duyệt viên (`REVIEWER`)** | Toàn bộ ứng viên mọi đợt tuyển (ưu tiên đợt active) | - Truy cập `/admin/applications` và menu Đơn ứng tuyển trên sidebar<br>- Xem chi tiết ứng viên, theo dõi điểm số phỏng vấn của các ban<br>- Thao tác duyệt (`APPROVED`) / từ chối (`REJECTED`) ứng viên | Hỗ trợ duyệt / từ chối đơn trúng tuyển |
| **Phỏng vấn viên (`INTERVIEWER`)** | Ứng viên `CHECKED_IN` / `INTERVIEWING` thuộc đợt active mà ban mình **chưa chấm điểm** (`deptNotInterviewedOnly`) | - **Phỏng vấn** / **Tiếp tục PV** (mở popup chấm điểm)<br>- Nếu đang bị ban khác PV: Dòng bị mờ (`opacity-40`), `cursor-not-allowed`, hiển thị tên ban đang PV để tránh tranh chấp | Không có quyền thao tác hàng loạt |

---

### 3.1 Khả Năng Tiếp Cận & Chuẩn Hóa UI/UX (Accessibility & Rewrites)
- **Tối Ưu Thẻ Chọn Ban Ứng Tuyển (`DepartmentPicker.tsx`)**:
  - Chuyển đổi từ `<div>` sang `<button type="button" role="checkbox" aria-checked=... tabIndex={0}>` hỗ trợ hoàn chỉnh tương tác qua bàn phím (`Enter`, `Space`) và trình đọc màn hình (Screen Readers).
- **Tiêu Đề Cột Sắp Xếp Trợ Năng (`ApplicationTable.tsx`)**:
  - Tiêu đề cột có tính năng sort được bọc bằng `<button>` kèm `aria-sort` (`ascending`, `descending`, `none`) tuân thủ nghiêm ngặt WAI-ARIA.
- **Rewrite Proxy Đường Dẫn Tĩnh (`next.config.ts`)**:
  - Khai báo cấu hình `rewrites()` định tuyến `/uploads/:path*` tới `process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"` giúp hiển thị ảnh thẻ avatar ứng viên liền mạch, triệt tiêu sự phụ thuộc CORS trên frontend.

---

## 4. Bộ UI Kit Danh Sách Chuẩn Hóa (Data Table UI Kit)

Tất cả bảng danh sách (`/admin/users`, `/admin/applications`, `/admin/recruitments`, `/admin/interview`) dùng chung bộ kit tại `src/components/admin/common/`:

### 4.1 Bảng Thành Phần UI Kit
| Thành Phần | File | Đặc Điểm Kỹ Thuật |
|---|---|---|
| **Layout** | `AdminListLayout.tsx` | Khung container `max-w-[1720px] w-full mx-auto`, loại bỏ animation `translateY` nặng nề đảm bảo 60 FPS |
| **Header** | `PageHeader.tsx` | Overline badge, tiêu đề gradient, thống kê phụ, nút chính (`#255798`) và nút phụ kính mờ |
| **Bảng dữ liệu** | `DataTable.tsx` | Generic `<T,>`, dynamic `Column<T>`, sorting indicator `#4d8ee8`, selection highlight, skeleton shimmer |
| **Phân trang** | `TablePagination.tsx` | Dải bản ghi, rows-per-page (10/20/30/50/100), smart pages `...`, responsive mobile stack |
| **Thanh lọc** | `FilterBar.tsx` | Chuẩn chiều cao `h-10` (40px), `border-white/10`, focus ring `#255798`, `relative z-30` |
| **Lịch chọn ngày** | `FilterDatePicker.tsx` | Popover dark glass (`z-50 shadow-2xl`), định dạng `DD/MM/YYYY`, ISO `YYYY-MM-DD`, custom dropdown menu Tháng & Năm (auto-scroll) |
| **Nút thao tác** | `TableActionButtons.tsx`| Kích thước chuẩn `h-8`, Linear-style (`active:scale-[0.98]`), `TableActionGroup` chặn `stopPropagation()` |
| **Checkbox** | `TableCheckbox.tsx` | Tri-state (Checked, Indeterminate, Unchecked) với glow xanh thương hiệu `#255798` |
| **Thao tác loạt** | `BulkActionBar.tsx` | Floating toolbar nổi bật khi chọn $\ge 1$ dòng |
| **Boilerplate** | `boilerplate.example.tsx`| File code mẫu hoàn chỉnh lắp ráp trọn bộ UI Kit |

### 4.2 Quy Chuẩn Layout & Tối Ưu Màn Hình
- **Độ phân giải lớn (1080p - 2K)**: Container mở rộng `max-w-[1720px]` (bỏ khoảng thừa 2 bên). Bảng đặt `min-w-[960px]` bọc trong `overflow-x-auto` chống vỡ chữ và không cuộn ngang thừa.
- **Tương tác dòng bảng (`onRowClick`)**: Bảng đợt tuyển (`/admin/recruitments`), đơn ứng tuyển (`/admin/applications`), người dùng (`/admin/users`) đều hỗ trợ click vào cả dòng để mở modal xem/sửa chi tiết. Nút `EditButton` riêng lẻ trên cột thao tác của đợt tuyển được loại bỏ để thống nhất UX toàn hệ thống.
- **Cột Cơ sở phỏng vấn**: Hiển thị badge cơ sở (`Cơ sở Ninh Bình` màu ngọc lục bảo emerald, `Cơ sở Hà Nội` màu xanh dương blue) tại cả `/admin/applications` và `/admin/interview`.
- **Tên ban thu gọn**: Ban Truyền thông hiển thị dạng viết tắt **"Ban TT&TCSK"** trên badge và dropdown để tiết kiệm không gian.
- **Sắp xếp điểm số**: Click-to-sort trực tiếp vào header cột "Nguyện vọng Ban & Điểm" (`NONE` ➜ `DESC` ➜ `ASC` ➜ `NONE`). Khi lọc tất cả ban, lấy điểm cao nhất/thấp nhất làm mốc so sánh.
- **Z-Index an toàn**: `FilterBar` đặt `relative z-30`, khi mở dropdown/datepicker nâng lên `relative z-50` kèm `z-50 shadow-2xl` để không bao giờ bị table backdrop-blur đè lên.

---

## 5. Xác Thực, Phiên Làm Việc & Kích Hoạt Tài Khoản

### 5.1 Quản Lý Phiên (Session Expiry)
- `authService.ts`: Giải mã token JWT client-side, kiểm tra timestamp `exp`.
- `AuthContext.tsx`: Đặt `setTimeout` tự động đăng xuất khi hết hạn token, chuyển hướng về `/login?expired=true&redirect=...`.
- `apiClient.ts`: Bắt lỗi HTTP 401 trên các request bảo vệ, dọn dẹp localStorage và chuyển hướng về `/login?expired=true`.
- `LoginForm.tsx`: Nhận diện `expired=true`, hiển thị banner cảnh báo hổ phách (Amber Glass) và giữ nguyên tham số `redirect`.

### 5.2 Luồng Tài Khoản Chờ Kích Hoạt
- **Đăng ký (`/register`)**: Đăng ký thành công hiển thị thông báo chờ kích hoạt, chuyển hướng sang `/login?pending_activation=true`.
- **Đăng nhập (`/login`)**: Nếu tài khoản chưa active (backend trả 403 `ACCOUNT_INACTIVE`) ➜ kích hoạt `InactiveAccountModal` (Dark glass popover, icon cảnh báo hổ phách, hướng dẫn liên hệ Admin và link trực tiếp Fanpage iStar).
- **Quản trị người dùng (`/admin/users`)**: Hiển thị badge vàng hổ phách `"Chưa kích hoạt"` kèm icon `Clock` để Admin dễ dàng nhận diện và kích hoạt.

---

## 6. Dashboard Tổng Quan (`/admin`) & Biểu Đồ 3D

Kết nối thời gian thực qua API `GET /api/admin/dashboard/stats`:
- **4 Thẻ Chỉ Số**: Tổng đơn, Đang xử lý, Trúng tuyển (click mở `/admin/applications?status=APPROVED`), Đơn nộp hôm nay. Đồng bộ chiều cao `h-full flex flex-col justify-between`.
- **Bộ 4 Biểu Đồ 3D SVG**:
  1. `IsometricBarChart3D`: Hình khối lăng trụ 3D thể hiện tương quan 4 ban, giới hạn an toàn `maxBarHeight = 110px` không đè text.
  2. `DepthDonutChart3D`: Vòng 3D phân bổ trạng thái kèm lưới 8 ô đối xứng hoàn hảo (bổ sung ô Tổng hồ sơ 100%).
  3. `GlowingAreaChart`: Đường cong spline neon 7 ngày gần nhất kèm trung bình đơn/ngày.
  4. `SchoolRankingCard`: Xếp hạng Top trường HaUI kèm thẻ khóa học K18, K19... đồng bộ.
- **Dự phòng sự cố**: Bộ đệm `DEFAULT_STATS` hiển thị cảnh báo nhã nhặn khi API ngắt kết nối mà không làm sập layout.

---

## 7. Quản Trị Trang Chủ (`/admin/homepage`) & Tối Ưu Header/Hero

### 7.1 Cải Tiến Giao Diện Header & Hero
- **Header căn giữa tuyệt đối (`Navbar.tsx`)**: Đặt container trong trạng thái `relative`, cụm liên kết điều hướng desktop (Trang chủ, Giới thiệu, Các ban, Thành tích, Tuyển quân) được định vị `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2` căn chính giữa tuyệt đối theo tâm màn hình, không bị lệch khi logo hoặc tên tài khoản thay đổi độ dài.
- **Đồng bộ chiều cao cụm nút Header**: Toàn bộ các phần tử góc phải (`AdminTopBar` shortcut, tag username, nút Đăng xuất, nút Đăng nhập) được cố định chiều cao `h-9` (36px).
- **Đồng bộ kích thước nút CTA Hero (`HeroSection.tsx`)**: Hai nút "Ứng tuyển ngay" và "Tìm hiểu thêm" được thiết lập cùng độ rộng `w-full sm:w-44` để tạo sự cân xứng thị giác hoàn hảo.
- **Sửa lỗi clipping dọc chữ tiêu đề gradient**: Bổ sung `padding-top: 0.05em; padding-bottom: 0.1em;` cho `.gradient-text` trong `globals.css` và kết hợp `leading-[1.2] pb-2 pt-1` tại các thẻ `h2` trong `DepartmentsSection` và `AchievementsSection`.

### 7.2 Quản Lý Nội Dung Trang Chủ Động (`/admin/homepage`)
Trang quản trị tập trung Dark Glass với 4 tab trực quan dành riêng cho `ADMIN`:
1. **Tab Hero Section**: Chỉnh sửa văn bản giới thiệu phụ và tải lên/thay đổi ảnh tập thể CLB.
2. **Tab About Section**: Tùy biến 3 đoạn văn giới thiệu tổng quan và cập nhật 3 ảnh bento grid hoạt động.
3. **Tab Departments Section**:
   - Cho phép sửa tiêu đề ("Bốn ban — Một iStar") và phụ đề.
   - Quản lý danh sách các ban linh hoạt: **cho phép từ 2 đến 6 ban** (thêm/xóa/sửa).
   - Tùy biến biểu tượng (kho 12 Lucide icons nghệ thuật) và bảng màu thương hiệu (6 bộ preset gradient màu sắc kèm glow).
4. **Tab Achievements Section**:
   - Cho phép sửa tiêu đề ("Những dấu ấn rực rỡ") và phụ đề.
   - Thêm, sửa, xóa các mốc thành tích (Năm, Tiêu đề giải thưởng, Mô tả chi tiết, Ảnh minh chứng thành tích).
- **Khả năng dự phòng cao (High Resilience)**: Trang chủ công khai (`src/app/(public)/page.tsx`) nạp cấu hình SSR qua API `GET /api/public/homepage` với `next: { revalidate: 60 }`. Nếu backend chưa chạy hoặc xảy ra sự cố mạng, các section tự động fallback về bộ dữ liệu mặc định nguyên bản, đảm bảo 100% thời gian hoạt động.

### 7.3 Tối Ưu Mobile & Hệ Thống Animation 3D Hiện Đại
- **Khắc phục lỗi hiển thị Mobile**:
  - **HeroSection Scroll Indicator**: Chuyển từ định vị `absolute bottom-8` (dễ bị tràn hoặc che khuất bởi photo frame trên mobile) sang layout dòng tự nhiên (`flow layout`, `mt-6 md:mt-10`), loại bỏ triệt để lỗi đè content trên mọi kích thước màn hình.
  - **Khung ảnh Photo Frame & Corner Accents**: Thu nhỏ góc trang trí `w-10 h-10 md:w-16 md:h-16`, căn chỉnh padding dọc `pt-20 pb-6 md:pt-24 md:pb-16` giúp nội dung thoáng đãng trên màn hình nhỏ.
  - **Bento Grid & Thống Kê (`AboutSection`)**: Typography responsive đa cấp `text-2xl sm:text-3xl md:text-4xl lg:text-5xl`. Lưới thống kê thu gọn khoảng cách `gap-3 md:gap-4`, padding ô `py-5 px-3 md:py-6 md:px-4`.
  - **Thẻ Các Ban (`DepartmentsSection`)**: Padding linh hoạt `p-5 md:p-6 lg:p-8`, xử lý tự nhiên trên màn hình cảm ứng.
  - **Chân trang (`Footer`)**: Thu nhỏ khoảng cách `gap-6 md:gap-8`, bổ sung `break-words` cho địa chỉ chống tràn layout.
  - **Thành tích nổi bật (`AchievementsSection`)**: **Giữ nguyên 100% kích thước và tỷ lệ hiển thị** theo đúng yêu cầu nghiệp vụ.
- **Hệ thống Animation 3D Hiện Đại & Siêu Nhẹ (60 FPS)**:
  - **Nguyên tắc kỹ thuật**: 100% chuyển động chỉ can thiệp vào `transform` (GPU compositing) và `opacity`, không kích hoạt reflow/repaint của browser; bọc `useInView({ once: true })` chạy duy nhất 1 lần khi cuộn tới.
  - **Hero Section**: Headline xoay góc 3D perspective (`rotateX(15deg) ➜ 0deg`, `y: 30 ➜ 0`, `scale: 0.97 ➜ 1`). Khung ảnh tập thể lật đa chiều từ mặt phẳng sâu (`perspective(1200px) rotateX(8deg) ➜ 0deg`, `scale: 0.95 ➜ 1`). Scroll indicator hiệu ứng thở ("breathe" `scale: [1, 1.1, 1]`, `opacity: [0.4, 0.8, 0.4]`).
  - **About Section**: Tiêu đề xoay vào từ trục Y (`rotateY(-5deg) ➜ 0deg`). Ảnh bento lật nhẹ vào vị trí (`rotateX(4deg) ➜ 0deg`, `scale: 0.9 ➜ 1`). Thẻ thống kê bay từ trục Z (`translateZ(-30px) ➜ 0`).
  - **Departments Section**: Thẻ các ban xoay xen kẽ so le 3D từ hai phía (`rotateY(-8deg / +8deg) ➜ 0deg`, `scale: 0.92 ➜ 1`). Hiệu ứng hover card nghiêng 3D chân thực (`transform: perspective(600px) rotateX(2deg) translateY(-4px)`).
  - **Global CSS**: Bổ sung class tiện ích `.perspective-container` (`perspective: 1200px`) và keyframe `@keyframes breathe` trong `globals.css`.

### 7.4 Hệ Thống Thông Báo Top Floating Popup (Zero Layout Shift)
- **Kiến trúc Toast Toàn Cục (`ToastContext.tsx` & `ToastProvider`)**:
  - Tích hợp tại gốc ứng dụng (`RootLayout` trong `src/app/layout.tsx`).
  - Container cố định tuyệt đối: `fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none w-full max-w-lg px-4`.
  - Độc lập 100% khỏi dòng chảy tài liệu (DOM flow) ➜ **triệt tiêu hoàn toàn hiện tượng xô lệch/giật bố cục trang (Cumulative Layout Shift = 0)**.
  - Dark Glass đa cấp độ:
    - Success: `bg-[#0b1612]/95 border-emerald-500/30 text-emerald-300 shadow-[0_8px_30px_rgba(16,185,129,0.2)]`
    - Error: `bg-[#180c0e]/95 border-rose-500/30 text-rose-300 shadow-[0_8px_30px_rgba(244,63,94,0.2)]`
    - Warning: `bg-[#181207]/95 border-amber-500/30 text-amber-300 shadow-[0_8px_30px_rgba(245,158,11,0.2)]`
    - Info: `bg-[#080d18]/95 border-[#255798]/40 text-[#EDEDEF] shadow-[0_8px_30px_rgba(37,87,152,0.25)]`
  - Tự động đóng sau 4 giây (auto-dismiss), hỗ trợ nút `X` đóng nhanh.
- **Rà soát & Đồng bộ trên toàn bộ dự án**:
  - `AdminListLayout.tsx`: Chuyển prop `toast` từ in-flow banner sang top floating popup với timer 4s.
  - `/admin/homepage`: Loại bỏ khối banner `feedback` đẩy trượt các tab, thay thế hoàn toàn bằng `useToast()`.
  - `InterviewPageContent.tsx` & `InterviewExcelActions.tsx`: Triệt tiêu hoàn toàn hộp thoại `alert(...)` nguyên thủy của trình duyệt, thay thế bằng `toast.warning(...)`, `toast.success(...)`, `toast.error(...)`.
  - `InterviewPopupContent.tsx` & `InterviewDetailModal.tsx`: Chuyển `actionMessage` sang dạng top floating toast ghim trên đầu, giữ nguyên vẹn vị trí của form chấm điểm.
  - `RecruitmentModal.tsx`, `UserDetailModal.tsx`, `CreateApplicationModal.tsx`, `/apply`, `/login`: Loại bỏ các khối thông báo lỗi in-flow gây nhảy form, chuyển sang top popup notification.

### 7.5 Tái Cấu Trúc Bố Cục HeroSection (Two-Column Split & Atmospheric Background Glow)
- **Bố cục 2 Cột Ngang Hàng Trên Desktop (`lg:grid-cols-12`)**:
  - **Cột Trái (`lg:col-span-5 xl:col-span-5`)**: Canh lề trái hiện đại, tag badge phát sáng dot xanh, headline lớn đa tầng font-bold `gradient-text`, subtitle thoáng đãng, 2 nút CTA đồng chiều rộng `w-full sm:w-44`, dải tag thông số ấn tượng (4 Ban chuyên môn • 80+ Thành viên • 10+ Năm phát triển).
  - **Cột Phải (`lg:col-span-7 xl:col-span-7`)**:
    - **Diện tích hiển thị ảnh lớn vượt bậc**: Chiều cao `lg:h-[480px] xl:h-[540px]`, tăng gấp đôi kích thước hiển thị so với bố cục cũ.
    - **Lớp nền khí quyển phát sáng (`Atmospheric Background Glow`)**: Sử dụng lớp ảnh phản chiếu mờ ảo (`blur-3xl opacity-30 scale-110 -z-10`) phía sau khung ảnh, lan tỏa màu sắc thực của bức ảnh tập thể ra không gian nền.
    - **Khung kính 3D & Huy hiệu nổi**: 4 góc bo công nghệ viền xanh `#255798`, huy hiệu kính nổi góc dưới *"iStar Club • HaUI"* và châm ngôn *"Tỏa sáng theo cách của bạn"*.
- **Responsive Mobile & Tablet**: Xếp chồng mượt mà, ảnh hiển thị full width với chiều cao tối ưu `h-[280px] sm:h-[380px]`, nút cuộn mũi tên thở (`breathe`) nằm gọn gàng bên dưới.

### 7.6 Chuẩn Hóa Dropdown, Giới Hạn 10MB & Bộ Công Cụ Chỉnh Sửa Ảnh Toàn Diện (`ImageEditorModal`)
- **Chuẩn hóa Dropdown Quản trị Trang chủ (`CustomIconSelect` & `CustomColorPresetSelect`)**:
  - Triệt tiêu hoàn toàn các thẻ `<select>` thô sơ của trình duyệt trong tab "Các ban" tại `/admin/homepage`.
  - Thay thế bằng Custom Select chuẩn Dark Glass: danh sách trực quan với 12 icon nghệ thuật và 6 pill gradient màu sắc thương hiệu, hỗ trợ click-outside và phím Escape.
- **Kiểm duyệt Dung lượng 10MB & Định dạng File**:
  - Client-side validation chặn ngay các file vượt quá 10MB với cảnh báo nổi (`toast.warning(...)`).
  - Xác thực MIME type và đuôi tệp chỉ cho phép định dạng ảnh hợp lệ (JPG, JPEG, PNG, WEBP, GIF).
- **Bộ Công Cụ Chỉnh Sửa Ảnh Chuyên Nghiệp (`ImageEditorModal.tsx`)**:
  - Xây dựng trên nền tảng `react-image-crop` kết hợp xử lý HTML5 Canvas, tương thích React 19 và Next.js 16.
  - **Khắc phục triệt để lỗi crop & canvas drawing**:
    - Đồng bộ `convertToPixelCrop` ngay khi load ảnh và khi đổi preset tỷ lệ, giải quyết lỗi người dùng bấm Hoàn tất khi chưa di chuyển khung crop dẫn đến crop bị bỏ qua.
    - Fallback tự động tính toán pixel crop từ tỷ lệ % nếu `completedCrop` chưa kịp kích hoạt.
    - Chuẩn hóa định dạng xuất mặc định sang JPEG (`image/jpeg`, `.jpg`) và sanitize tên file (loại bỏ ký tự đặc biệt, dấu tiếng Việt) để tương thích tuyệt đối với backend regex.
  - **Tỷ lệ cắt ảnh (Aspect Ratio Presets)**: Tự do (Free), 1:1 (Ảnh thẻ / Avatar), 16:9 (Hero banner), 4:3 (Ảnh giới thiệu lớn), 3:4 (Thành tích nổi bật).
  - **Biến đổi hình học (Transforms)**: Xoay góc 90° (`-90°` / `+90°`), Lật ngang (Flip H), Lật dọc (Flip V).
  - **Thu phóng & Đổi kích thước (Resize)**: Thanh trượt từ 20% đến 100% kèm hiển thị độ phân giải pixel xuất ra thực tế theo thời gian thực.
  - **Nén & Tối ưu dung lượng (Compression)**: Điều chỉnh chất lượng chất lượng (10% - 100%), chọn định dạng xuất (WebP, JPEG, PNG), tính toán dung lượng xuất ước tính và % dung lượng tiết kiệm được so với ảnh gốc.
  - Cảnh báo và ngăn chặn xuất tệp nếu kích thước ước tính vượt ngưỡng 10MB.
- **Tích Hợp Đồng Bộ & Xử Lý Ảnh Theo Ngữ Cảnh Nghiệp Vụ**:
  - **Tự động xử lý ảnh chân dung 3:4 dọc (`processCheckinPhoto` trong `imageProcessing.ts`)**:
    - **Áp dụng đồng bộ cho cả Tạo đơn Offline (`CreateApplicationPopupContent.tsx`) và Check-in (`CheckInModal.tsx`)**: Tự động center-crop về tỉ lệ 3:4 dọc, resize về kích thước chuẩn 1500×2000px, nén chất lượng xấp xỉ 1MB định dạng JPG (`image/jpeg`).
    - Hoàn toàn tự động, loại bỏ modal chỉnh sửa thủ công để tối ưu tốc độ tác nghiệp của lễ tân.
    - Cung cấp preview tỉ lệ 3:4 cùng nút xóa ảnh và thông báo toast xác nhận chuẩn hóa thành công.
  - **Chuẩn hóa Bố cục & Padding Quản lý Trang chủ (`/admin/homepage`)**:
    - Chuẩn hóa container về `max-w-[1720px] w-full mx-auto pb-12 space-y-6`, đồng bộ tuyệt đối với `AdminListLayout` của tất cả các trang quản trị còn lại (`/admin/applications`, `/admin/interview`, `/admin/users`...).
    - Loại bỏ lớp padding ngang/dọc trùng lặp (`px-4 sm:px-6 lg:px-8 py-8`) do `<main>` trong `AdminLayout` đã có sẵn padding tiêu chuẩn.
  - **Khắc phục triệt để lỗi Upload ảnh Quản lý Trang chủ & Tối ưu Bộ nhớ (Zero Orphan Storage)**:
    - **Cơ chế Tải lên trì hoãn (Deferred Upload on Save)**: Khi người dùng chọn và cắt ảnh trong `ImageEditorModal`, hệ thống **không upload ngay lên server** mà sinh URL xem trước cục bộ (`URL.createObjectURL(processedFile)`). File được đưa vào danh sách chờ (`pendingFiles`). Chỉ khi người dùng nhấn nút *"Lưu thay đổi"* (`handleSave`), các file đang chờ mới được upload đồng loạt lên server và thay thế URL trước khi lưu vào DB. Nếu hủy hoặc rời trang, **0 byte file rác** nào được ghi lên đĩa cứng máy chủ.
    - **Memoize `ToastContext` & Ổn định `loadConfig`**: Bọc giá trị context của `ToastProvider` bằng `useMemo` và loại bỏ `toast` khỏi dependency của `loadConfig` trong `page.tsx`, triệt tiêu hoàn toàn race condition re-render vòng lặp khiến `loadConfig()` gọi lại API ghi đè xóa sạch URL ảnh vừa chọn.
    - **Chỉ báo Trạng thái Xem trước (Pending Badges)**: Bổ sung nhãn *"Chờ lưu"* cạnh nút tải ảnh và dot chỉ báo trên nút Lưu khi có ảnh mới đang chờ lưu trữ, đồng thời tự động thu hồi Object URL (`URL.revokeObjectURL`) khi thay đổi hoặc unmount.
    - **Key-based Image Remounting & Opacity Fallback**: Toàn bộ thẻ `<img>` preview được gán `key={imageUrl}` đảm bảo React tạo mới phần tử sạch sẽ khi đổi ảnh, thay thế `display: none` bằng `opacity: 0.3` giúp giao diện không bị giật hay dính khoảng đen vĩnh viễn.

