package com.lms.classsystem.service;

import com.lms.classsystem.entity.Instructor;
import java.util.List;

public interface InstructorService {
    Instructor saveInstructor(Instructor instructor);
    List<Instructor> getAllInstructors();
}
