package com.lms.classsystem.service;

import com.lms.classsystem.dto.EnrollmentSaveDTO;
import com.lms.classsystem.dto.EnrollmentResponseDTO;
import java.util.List;

public interface EnrollmentService {
    EnrollmentResponseDTO saveEnrollment(EnrollmentSaveDTO dto);
    List<EnrollmentResponseDTO> getAllEnrollments();
    EnrollmentResponseDTO updateEnrollment(Long id, EnrollmentSaveDTO dto);
    void deleteEnrollment(Long id);
}
