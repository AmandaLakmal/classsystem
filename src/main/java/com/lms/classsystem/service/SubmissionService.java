package com.lms.classsystem.service;

import com.lms.classsystem.dto.SubmissionDTO;
import com.lms.classsystem.dto.SubmissionResponseDTO;
import java.util.List;

public interface SubmissionService {
    SubmissionResponseDTO submitAssignment(SubmissionDTO dto, String studentEmail);
    List<SubmissionResponseDTO> getAllSubmissions();
    List<SubmissionResponseDTO> getSubmissionsByAssignment(Long assignmentId);
    List<SubmissionResponseDTO> getSubmissionsByStudent(String studentEmail);
}
