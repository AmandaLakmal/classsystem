package com.lms.classsystem.repository;

import com.lms.classsystem.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Long> {

    /**
     * Lookup a teacher by email — used by CustomUserDetailsService
     * for the dual-table authentication fallback.
     */
    Optional<Instructor> findByEmail(String email);
}
