package com.lms.classsystem.repository;

import com.lms.classsystem.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    // JpaRepository hava inbuild save, get method

    // firstName eken hari lastName eken hari registerId  eken hari Student wa hoyanna (case insensitive)
    List<Student>findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrStudentRegIdContainingIgnoreCase(String firstName, String lastName, String regId);

    // anthimta save karpu student wa aran aluth ID ekak hadanna
    Student findTopByOrderByIdDesc();
}
