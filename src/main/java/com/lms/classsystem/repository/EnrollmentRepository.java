package com.lms.classsystem.repository;

import com.lms.classsystem.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);

    /** Get all enrollments for a student — used for subject filter and notice targeting */
    List<Enrollment> findByStudentId(Long studentId);

    /** Get all enrollments for a course — used for analytics */
    List<Enrollment> findByCourseId(Long courseId);
}
