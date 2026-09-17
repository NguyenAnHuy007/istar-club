package com.haui.istar.dto.application;

import java.time.LocalDate;
import java.util.List;

import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Area;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationFormRequest {
    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    private String email;

    @Size(max = 50, message = "Tên không được vượt quá 50 ký tự")
    private String firstName;

    @Size(max = 50, message = "Họ đệm không được vượt quá 50 ký tự")
    private String lastName;

    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    private LocalDate birthday;

    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)")
    private String phoneNumber;

    private Long recruitmentId;

    @NotEmpty(message = "Phải chọn ít nhất một ban")
    @Valid
    private List<ApplicationDepartmentRequest> departments;

    @Size(max = 100, message = "Trường/khoa không được vượt quá 100 ký tự")
    private String school;

    @Size(max = 100, message = "Lớp chuyên ngành không được vượt quá 100 ký tự")
    private String majorClass;

    @Size(max = 20, message = "Khóa học không được vượt quá 20 ký tự")
    private String course;

    @NotBlank(message = "Vui lòng cho biết bạn biết đến iStar qua đâu")
    @Size(max = 1000, message = "Câu trả lời kênh biết đến iStar tối đa 1000 ký tự")
    private String knowIStar;

    @NotBlank(message = "Vui lòng cho biết lý do muốn ứng tuyển iStar")
    @Size(max = 1000, message = "Lý do ứng tuyển tối đa 1000 ký tự")
    private String reasonIStarer;

    @Size(max = 255, message = "Link Facebook tối đa 255 ký tự")
    @Pattern(regexp = "^$|^(https?://).*", message = "Link Facebook phải bắt đầu bằng http:// hoặc https://")
    private String facebookUrl;

    @Size(max = 500, message = "Đường dẫn ảnh đại diện tối đa 500 ký tự")
    private String avatarUrl;

    private Area area;

    /** Trạng thái khởi tạo đơn. Khi tạo đơn offline tại bàn lễ tân, truyền CHECKED_IN.
     *  Nếu không truyền, mặc định là SUBMITTED. */
    private ApplicationStatus status;
}
