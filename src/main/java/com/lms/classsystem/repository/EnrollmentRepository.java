package com.lms.classsystem.repository;

import com.lms.classsystem.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment,Long> {
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
}
