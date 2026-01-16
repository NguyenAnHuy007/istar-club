package com.haui.istar.util;

import com.haui.istar.exception.BadRequestException;
import com.haui.istar.model.User;
import com.haui.istar.model.enums.Area;
import com.haui.istar.model.enums.Department;
import com.haui.istar.model.enums.Position;
import com.haui.istar.model.enums.SubDepartment;
import com.haui.istar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Validator cho các ràng buộc nghiệp vụ của User
 */
@Component
@RequiredArgsConstructor
public class UserValidator {

    private final UserRepository userRepository;

    /**
     * Validate tất cả ràng buộc nghiệp vụ
     */
    public void validateUser(User user, Long excludeUserId) {
        validatePositionLimit(user, excludeUserId);
        validateAreaConstraint(user);
        validateSubDepartment(user);
        validateDepartmentHeadDepartment(user);
    }

    /**
     * Rule 1: Kiểm tra giới hạn số lượng chức vụ
     */
    public void validatePositionLimit(User user, Long excludeUserId) {
        switch (user.getPosition()) {
            case PRESIDENT:
                long presidentCount = excludeUserId != null
                    ? userRepository.countByPositionAndIdNot(Position.PRESIDENT, excludeUserId)
                    : userRepository.countByPosition(Position.PRESIDENT);

                if (presidentCount >= 1) {
                    throw new BadRequestException("Đã có chủ nhiệm, không thể thêm");
                }
                break;

            case VICE_PRESIDENT:
                long vicePresidentCount = excludeUserId != null
                    ? userRepository.countByPositionAndIdNot(Position.VICE_PRESIDENT, excludeUserId)
                    : userRepository.countByPosition(Position.VICE_PRESIDENT);

                if (vicePresidentCount >= 2) {
                    throw new BadRequestException("Đã đủ 2 phó chủ nhiệm");
                }
                break;

            case DEPARTMENT_HEAD:
                if (user.getDepartment() == null) {
                    throw new BadRequestException("Trưởng ban phải được phân vào một ban");
                }

                long headCount = excludeUserId != null
                    ? userRepository.countByPositionAndDepartmentAndIdNot(Position.DEPARTMENT_HEAD, user.getDepartment(), excludeUserId)
                    : userRepository.countByPositionAndDepartment(Position.DEPARTMENT_HEAD, user.getDepartment());

                if (headCount >= 1) {
                    throw new BadRequestException("Ban " + user.getDepartment().getDisplayName() + " đã có trưởng ban");
                }
                break;

            case AREA_MANAGER:
                long areaManagerCount = excludeUserId != null
                    ? userRepository.countByPositionAndIdNot(Position.AREA_MANAGER, excludeUserId)
                    : userRepository.countByPosition(Position.AREA_MANAGER);

                if (areaManagerCount >= 3) {
                    throw new BadRequestException("Đã đủ 3 ban phụ trách khu vực Ninh Bình");
                }
                break;

            case MEMBER:
                // Không có giới hạn cho thành viên
                break;
        }
    }

    /**
     * Rule 2: Kiểm tra ràng buộc khu vực
     */
    public void validateAreaConstraint(User user) {
        // Thành viên ở Ninh Bình không thể là Chủ nhiệm/Phó chủ nhiệm/Trưởng ban
        if (user.getArea() == Area.NINH_BINH) {
            if (user.getPosition() == Position.PRESIDENT
                || user.getPosition() == Position.VICE_PRESIDENT
                || user.getPosition() == Position.DEPARTMENT_HEAD) {
                throw new BadRequestException(
                    "Thành viên ở Ninh Bình không thể là Chủ nhiệm/Phó chủ nhiệm/Trưởng ban"
                );
            }
        }

        // Ban phụ trách khu vực phải thuộc Ninh Bình
        if (user.getPosition() == Position.AREA_MANAGER && user.getArea() != Area.NINH_BINH) {
            throw new BadRequestException("Ban phụ trách khu vực phải thuộc Ninh Bình");
        }
    }

    /**
     * Rule 3: Kiểm tra ban con
     */
    public void validateSubDepartment(User user) {
        if (user.getDepartment() != null && user.getDepartment() == Department.MUSIC) {
            // Thành viên Ban Âm nhạc phải chọn ban con
            if (user.getSubDepartment() == null || user.getSubDepartment() == SubDepartment.NONE) {
                throw new BadRequestException("Thành viên Ban Âm nhạc phải chọn ban con (Hát/Rap/Nhạc cụ)");
            }
        } else {
            // Các ban khác không có ban con - auto correct
            if (user.getSubDepartment() != null && user.getSubDepartment() != SubDepartment.NONE) {
                user.setSubDepartment(SubDepartment.NONE);
            }
        }
    }

    /**
     * Rule 4: Trưởng ban phải có department (đã check trong Rule 1 nhưng giữ lại để rõ ràng)
     */
    public void validateDepartmentHeadDepartment(User user) {
        if (user.getPosition() == Position.DEPARTMENT_HEAD && user.getDepartment() == null) {
            throw new BadRequestException("Trưởng ban phải được phân vào một ban");
        }
    }
}
