package com.haui.istar.service;

import com.haui.istar.dto.application.ApplicationDepartmentDto;
import com.haui.istar.dto.application.ApplicationFormDto;
import com.haui.istar.dto.application.CompleteMultiInterviewRequest;
import com.haui.istar.dto.application.StartInterviewRequest;

import java.util.List;

public interface InterviewService {
    List<ApplicationDepartmentDto> getQueue(Long interviewerId);
    ApplicationDepartmentDto startInterview(Long applicationDepartmentId, Long interviewerId);
    ApplicationDepartmentDto completeInterview(Long applicationDepartmentId, Long interviewerId, Double score, String notes);

    ApplicationFormDto startMultiInterview(Long applicationId, StartInterviewRequest request, Long interviewerId);
    ApplicationFormDto completeMultiInterview(Long applicationId, CompleteMultiInterviewRequest request, Long interviewerId);
}

