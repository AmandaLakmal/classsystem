package com.lms.classsystem.controller;

import com.lms.classsystem.entity.Instructor;
import com.lms.classsystem.service.InstructorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/instructor")
public class InstructorController {

    @Autowired
    private InstructorService instructorService;

    @PostMapping("/save")
    public Instructor saveInstructor(@RequestBody Instructor instructor){
        return instructorService.saveInstructor(instructor);
    }
    @GetMapping("/get-all")
    public List<Instructor> getAllInstructor(){
        return instructorService.getAllInstructors();
    }
}
