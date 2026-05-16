package com.lms.classsystem.service;

import com.lms.classsystem.entity.Course;
import java.util.List;

public interface CourseService {
    Course saveCourse(Course course);
    List<Course> getAllCourses();
}
