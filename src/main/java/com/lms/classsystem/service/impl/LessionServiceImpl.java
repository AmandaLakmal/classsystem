package com.lms.classsystem.service.impl;

import com.lms.classsystem.dto.LessionSaveDTO;
import com.lms.classsystem.dto.LessionResponseDTO;
import com.lms.classsystem.entity.Course;
import com.lms.classsystem.entity.Lession;
import com.lms.classsystem.repository.CourseRepository;
import com.lms.classsystem.repository.LessionRepository;
import com.lms.classsystem.repository.EnrollmentRepository;
import com.lms.classsystem.repository.StudentRepository;
import com.lms.classsystem.service.LessionService;
import com.lms.classsystem.entity.Enrollment;
import com.lms.classsystem.entity.Student;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LessionServiceImpl implements LessionService {

    @Autowired
    private LessionRepository lessionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    private LessionResponseDTO mapToDTO(Lession entity) {
        return new LessionResponseDTO(
            entity.getId(),
            entity.getTitle(),
            entity.getVideoUrl(),
            entity.getCourse() != null ? entity.getCourse().getId() : null
        );
    }

    @Override
    public LessionResponseDTO saveLession(LessionSaveDTO dto) {
        Lession lession = new Lession();
        lession.setTitle(dto.getTitle());
        lession.setVideoUrl(dto.getVideoUrl());

        if (dto.getCourseId() != null) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            lession.setCourse(course);
        }

        return mapToDTO(lessionRepository.save(lession));
    }

    @Override
    public List<LessionResponseDTO> getAllLessions() {
        return lessionRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public LessionResponseDTO updateLession(Long id, LessionSaveDTO dto) {
        Lession lession = lessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lession not found"));
                
        lession.setTitle(dto.getTitle());
        lession.setVideoUrl(dto.getVideoUrl());

        if (dto.getCourseId() != null) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            lession.setCourse(course);
        } else {
            lession.setCourse(null);
        }

        return mapToDTO(lessionRepository.save(lession));
    }

    @Override
    public void deleteLession(Long id) {
        lessionRepository.deleteById(id);
    }

    @Override
    public LessionResponseDTO viewLesson(Long id, String userEmail) {
        Lession lession = lessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lession not found"));

        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getRole() == com.lms.classsystem.entity.Role.ADMIN) {
            return mapToDTO(lession);
        }

        if (lession.getCourse() == null) {
            throw new RuntimeException("Lesson does not belong to any course");
        }

        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), lession.getCourse().getId())
                .orElseThrow(() -> new RuntimeException("Access denied. Not enrolled in this course."));

        if (!enrollment.isHasAccess()) {
            throw new RuntimeException("Access denied. Monthly fee not paid");
        }

        return mapToDTO(lession);
    }
}
