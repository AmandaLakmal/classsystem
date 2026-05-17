package com.lms.classsystem.service;

import com.lms.classsystem.dto.InstructorDTO;
import java.util.List;

public interface InstructorService {
    InstructorDTO saveInstructor(InstructorDTO dto);
    List<InstructorDTO> getAllInstructors();
    InstructorDTO updateInstructor(Long id, InstructorDTO dto);
    void deleteInstructor(Long id);
}
