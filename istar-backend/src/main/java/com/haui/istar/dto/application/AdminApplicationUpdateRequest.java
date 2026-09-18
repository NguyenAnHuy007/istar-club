package com.haui.istar.dto.application;

import com.haui.istar.model.enums.ApplicationStatus;
import com.haui.istar.model.enums.Area;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminApplicationUpdateRequest {

    @Email(message = "Email không hợp lệ")
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

    @Pattern(regexp = "^$|^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ (VD: 0912345678)")
    private String phoneNumber;

    @Valid
    private List<ApplicationDepartmentRequest> departments;

    @Size(max = 100, message = "Trường/khoa không được vượt quá 100 ký tự")
    private String school;

    @Size(max = 100, message = "Lớp chuyên ngành không được vượt quá 100 ký tự")
    private String majorClass;

    @Size(max = 20, message = "Khóa học không được vượt quá 20 ký tự")
    private String course;

    @Size(max = 1000, message = "Câu trả lời kênh biết đến iStar tối đa 1000 ký tự")
    private String knowIStar;

    @Size(max = 1000, message = "Lý do ứng tuyển tối đa 1000 ký tự")
    private String reasonIStarer;

    @Size(max = 255, message = "Link Facebook tối đa 255 ký tự")
    @Pattern(regexp = "^$|^(https?://).*", message = "Link Facebook phải bắt đầu bằng http:// hoặc https://")
    private String facebookUrl;

    @Size(max = 500, message = "Đường dẫn ảnh đại diện tối đa 500 ký tự")
    private String avatarUrl;

    private Area area;
    private ApplicationStatus status;
}
