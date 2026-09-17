package com.haui.istar.util;

import com.haui.istar.exception.BadRequestException;
import com.haui.istar.model.User;
import com.haui.istar.model.UserDepartment;
import com.haui.istar.model.enums.Area;
import com.haui.istar.model.enums.Position;
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
        if (user == null) {
            return;
        }
        validatePositionLimit(user, excludeUserId);
        validateAreaConstraint(user);

        if (user.getUserDepartments() != null) {
            for (UserDepartment ud : user.getUserDepartments()) {
                if (ud != null) {
                    validateDepartmentHeadLimit(ud, excludeUserId);
                    validateAreaConstraintForDepartment(user, ud);
                }
            }
        }
    }

    public void validatePositionLimit(User user, Long excludeUserId) {
        if (user.getPosition() == null) {
            return;
        }
        switch (user.getPosition()) {
            case PRESIDENT:
                long presidentCount = excludeUserId != null
                    ? userRepository.countByPositionExcludingForUpdate(Position.PRESIDENT, excludeUserId)
                    : userRepository.countByPositionForUpdate(Position.PRESIDENT);

                if (presidentCount >= 1) {
                    throw new BadRequestException("Đã có chủ nhiệm, không thể thêm");
                }
                break;

            case VICE_PRESIDENT:
                long vicePresidentCount = excludeUserId != null
                    ? userRepository.countByPositionExcludingForUpdate(Position.VICE_PRESIDENT, excludeUserId)
                    : userRepository.countByPositionForUpdate(Position.VICE_PRESIDENT);

                if (vicePresidentCount >= 2) {
                    throw new BadRequestException("Đã đủ 2 phó chủ nhiệm");
                }
                break;

            case AREA_MANAGER:
                long areaManagerCount = excludeUserId != null
                    ? userRepository.countByPositionExcludingForUpdate(Position.AREA_MANAGER, excludeUserId)
                    : userRepository.countByPositionForUpdate(Position.AREA_MANAGER);

                if (areaManagerCount >= 3) {
                    throw new BadRequestException("Đã đủ 3 ban phụ trách khu vực Ninh Bình");
                }
                break;

            default:
                break;
        }
    }

    public void validateDepartmentHeadLimit(UserDepartment ud, Long excludeUserId) {
        if (ud == null || ud.getPosition() == null || ud.getDepartment() == null) {
            return;
        }
        if (ud.getPosition() == Position.DEPARTMENT_HEAD) {
            long headCount = excludeUserId != null
                ? userRepository.countByPositionAndDepartmentExcludingForUpdate(Position.DEPARTMENT_HEAD, ud.getDepartment(), excludeUserId)
                : userRepository.countByPositionAndDepartmentForUpdate(Position.DEPARTMENT_HEAD, ud.getDepartment());

            if (headCount >= 1) {
                throw new BadRequestException("Ban " + ud.getDepartment().getDisplayName() + " đã có trưởng ban!");
            }
        }
    }

    public void validateAreaConstraint(User user) {
        if (user.getArea() == null || user.getPosition() == null) {
            return;
        }
        if (user.getArea() == Area.NINH_BINH) {
            if (user.getPosition() == Position.PRESIDENT || user.getPosition() == Position.VICE_PRESIDENT) {
                throw new BadRequestException("Thành viên ở Ninh Bình không thể là Chủ nhiệm/Phó chủ nhiệm");
            }
        }

        if (user.getPosition() == Position.AREA_MANAGER && user.getArea() != Area.NINH_BINH) {
            throw new BadRequestException("Ban phụ trách khu vực phải thuộc Ninh Bình");
        }
    }

    public void validateAreaConstraintForDepartment(User user, UserDepartment ud) {
        if (user.getArea() == Area.NINH_BINH && ud != null && ud.getPosition() == Position.DEPARTMENT_HEAD) {
            throw new BadRequestException("Thành viên ở Ninh Bình không thể là Trưởng ban");
        }
    }


}
