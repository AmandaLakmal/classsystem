package com.lms.classsystem.service.impl;

import com.lms.classsystem.dto.EnrollmentSaveDTO;
import com.lms.classsystem.dto.EnrollmentResponseDTO;
import com.lms.classsystem.entity.Course;
import com.lms.classsystem.entity.Enrollment;
import com.lms.classsystem.entity.Student;
import com.lms.classsystem.repository.CourseRepository;
import com.lms.classsystem.repository.EnrollmentRepository;
import com.lms.classsystem.repository.StudentRepository;
import com.lms.classsystem.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnrollmentServiceImpl implements EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    private EnrollmentResponseDTO mapToDTO(Enrollment entity) {
        return new EnrollmentResponseDTO(
            entity.getId(),
            entity.getStudent() != null ? entity.getStudent().getId() : null,
            entity.getCourse() != null ? entity.getCourse().getId() : null,
            entity.getLastPaidMonth(),
            entity.isHasAccess()
        );
    }

    @Override
    public EnrollmentResponseDTO saveEnrollment(EnrollmentSaveDTO dto) {
        Enrollment enrollment = new Enrollment();
        enrollment.setLastPaidMonth(dto.getLastPaidMonth());
        enrollment.setHasAccess(dto.isHasAccess());

        if (dto.getStudentId() != null) {
            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            enrollment.setStudent(student);
        }

        if (dto.getCourseId() != null) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            enrollment.setCourse(course);
        }

        return mapToDTO(enrollmentRepository.save(enrollment));
    }

    @Override
    public List<EnrollmentResponseDTO> getAllEnrollments() {
        return enrollmentRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public EnrollmentResponseDTO updateEnrollment(Long id, EnrollmentSaveDTO dto) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
                
        enrollment.setLastPaidMonth(dto.getLastPaidMonth());
        enrollment.setHasAccess(dto.isHasAccess());

        if (dto.getStudentId() != null) {
            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            enrollment.setStudent(student);
        }

        if (dto.getCourseId() != null) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            enrollment.setCourse(course);
        }

        return mapToDTO(enrollmentRepository.save(enrollment));
    }

    @Override
    public void deleteEnrollment(Long id) {
        enrollmentRepository.deleteById(id);
    }

    @Scheduled(cron = "0 0 0 1 * ?")
    public void disableUnpaidEnrollments() {
        String currentMonth = YearMonth.now().toString(); // returns format like "2026-05"
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        boolean updated = false;
        for (Enrollment e : enrollments) {
            if (e.isHasAccess() && (e.getLastPaidMonth() == null || !currentMonth.equals(e.getLastPaidMonth()))) {
                e.setHasAccess(false);
                enrollmentRepository.save(e);
                updated = true;
            }
        }
        if (updated) {
            System.out.println("Scheduler executed: Disabled access for unpaid enrollments for " + currentMonth);
        }
    }
}
