package com.lms.classsystem.repository;

import com.lms.classsystem.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // 1. email eken student kenek innwd balanawa (Unique Email Check ekt)
    Optional<Student> findByEmail(String email);

    // 2. firstName, lastName ho registerId eken Student wa hoynn
    List<Student> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrStudentRegIdContainingIgnoreCase(String firstName, String lastName, String regId);

    // 3. deepu batch eke adalawa inna students la witharak ganna
    long countByBatchId(Long batchId);

    // 4.  Active students witharak ganna (Soft Delete karapu aya nethuwa )
    List<Student> findByIsActiveTrue();

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);
}