package com.haui.istar.service;

import com.haui.istar.dto.application.ApplicationDepartmentDto;

import java.util.List;

public interface InterviewService {
    List<ApplicationDepartmentDto> getQueue(Long interviewerId);
    ApplicationDepartmentDto startInterview(Long applicationDepartmentId, Long interviewerId);
    ApplicationDepartmentDto completeInterview(Long applicationDepartmentId, Long interviewerId, Double score, String notes);
}
