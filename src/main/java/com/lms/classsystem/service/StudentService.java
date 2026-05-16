package com.lms.classsystem.service;

import com.lms.classsystem.entity.Student;

import java.util.List;

public interface StudentService {

    // save student
    Student saveStudent(Student student);

    // Get all student
    List<Student> getAllStudent();

    // search student using name or ID
    List<Student> searchStudent(String keyword);
}
