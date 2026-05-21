package com.lms.classsystem.repository;

import com.lms.classsystem.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByAssignmentId(Long assignmentId);
    List<Submission> findByStudentId(Long studentId);

    // Used by the retract endpoint to locate the exact record
    java.util.Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
}
