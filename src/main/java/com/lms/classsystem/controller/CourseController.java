package com.lms.classsystem.controller;

import com.lms.classsystem.entity.Course;
import com.lms.classsystem.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course")
@CrossOrigin
public class CourseController {
    @Autowired
    private CourseService courseService;

    @PostMapping("/save")
    public Course saveCourse(@RequestBody Course course){
        return courseService.saveCourse(course);
    }

    @GetMapping("/get-all")
    public List<Course> getAllCourses(){
        return courseService.getAllCourses();
    }
}
