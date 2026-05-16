package com.lms.classsystem.repository;

import com.lms.classsystem.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // 1. ඊමේල් එකෙන් ශිෂ්‍යයෙක් ඉන්නවද බලන්න (Unique Email Check එකට)
    Optional<Student> findByEmail(String email);

    // 2. firstName, lastName හෝ registerId eken Student wa hoyන්න (ඔයාගේ පරණ කෝඩ් එක)
    List<Student> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrStudentRegIdContainingIgnoreCase(String firstName, String lastName, String regId);

    // 3. දීපු බැච් එකට අදාළව විතරක් ඉන්න ශිෂ්‍යයෝ ගණන ගන්න Query එකක්
    long countByBatchId(Long batchId);

    // 4. දැනට Active ශිෂ්‍යයන් විතරක් ලබාගන්න (Soft Delete කරපු අය නැතුව)
    List<Student> findByIsActiveTrue();

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);
}