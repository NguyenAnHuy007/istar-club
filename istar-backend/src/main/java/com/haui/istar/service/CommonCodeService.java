package com.haui.istar.service;

import com.haui.istar.dto.common.CommonCodeDto;
import com.haui.istar.dto.common.CreateCommonCodeRequest;
import com.haui.istar.dto.common.UpdateCommonCodeRequest;

import java.util.List;

public interface CommonCodeService {

    List<CommonCodeDto> getActiveCodesByCategory(String category);

    List<CommonCodeDto> getAllCodesByCategory(String category);

    CommonCodeDto createCode(CreateCommonCodeRequest request);

    CommonCodeDto updateCode(Long id, UpdateCommonCodeRequest request);

    void deleteCode(Long id);

    void toggleActive(Long id);
}
