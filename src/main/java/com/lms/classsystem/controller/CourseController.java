package com.lms.classsystem.controller;

import com.lms.classsystem.dto.CourseSaveDTO;
import com.lms.classsystem.dto.CourseResponseDTO;
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
    public CourseResponseDTO saveCourse(@RequestBody CourseSaveDTO dto) {
        return courseService.saveCourse(dto);
    }

    @GetMapping("/get-all")
    public List<CourseResponseDTO> getAllCourses() {
        return courseService.getAllCourses();
    }

    @PutMapping("/update/{id}")
    public CourseResponseDTO updateCourse(@PathVariable Long id, @RequestBody CourseSaveDTO dto) {
        return courseService.updateCourse(id, dto);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return "Course deleted successfully!";
    }
}
