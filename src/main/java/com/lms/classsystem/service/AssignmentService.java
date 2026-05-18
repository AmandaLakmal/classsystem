package com.lms.classsystem.service;

import com.lms.classsystem.dto.AssignmentDTO;
import com.lms.classsystem.dto.AssignmentResponseDTO;
import java.util.List;

public interface AssignmentService {
    AssignmentResponseDTO saveAssignment(AssignmentDTO dto);
    AssignmentResponseDTO updateAssignment(Long id, AssignmentDTO dto);
    void deleteAssignment(Long id);
    List<AssignmentResponseDTO> getAllAssignments();
    List<AssignmentResponseDTO> getAssignmentsByCourse(Long courseId);
}
