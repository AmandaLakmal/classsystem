package com.lms.classsystem.service;

import com.lms.classsystem.dto.CourseSaveDTO;
import com.lms.classsystem.dto.CourseResponseDTO;
import java.util.List;

public interface CourseService {
    CourseResponseDTO saveCourse(CourseSaveDTO dto);
    List<CourseResponseDTO> getAllCourses();
    CourseResponseDTO updateCourse(Long id, CourseSaveDTO dto);
    void deleteCourse(Long id);
}
