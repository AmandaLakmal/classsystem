package com.lms.classsystem.service;

import com.lms.classsystem.dto.StudentSaveDTO;
import com.lms.classsystem.dto.StudentUpdateDTO;
import com.lms.classsystem.entity.Student;

import java.util.List;

public interface StudentService {

    // save student
    Student saveStudent(StudentSaveDTO studentDTO);

    // update student
    Student updateStudent(Long id, StudentUpdateDTO dto);

    // Get all student
    List<Student> getAllStudent();

    // search student using name or ID
    List<Student> searchStudent(String keyword);

    void deleteStudent(Long id);
}
