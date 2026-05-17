package com.lms.classsystem.controller;


import com.lms.classsystem.dto.StudentSaveDTO;
import com.lms.classsystem.dto.StudentUpdateDTO;
import com.lms.classsystem.entity.Student;
import com.lms.classsystem.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student")
@CrossOrigin
public class StudentController {

    @Autowired
    private StudentService studentService;

    //Register student
    @PostMapping("/save")
    public Student saveStudent(@RequestBody StudentSaveDTO student){
        return studentService.saveStudent(student);
    }

    //Update student
    @PutMapping("/update/{id}")
    public Student updateStudent(@PathVariable Long id, @RequestBody StudentUpdateDTO student){
        return studentService.updateStudent(id, student);
    }

    //get all student
    @GetMapping("/get-all")
    public List<Student> getAllStudent(){
        return studentService.getAllStudent();
    }

    // search using name or ID
    @GetMapping("/search")
    public List<Student> searchStudent(@RequestParam String keyword ) {
        return studentService.searchStudent(keyword);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return "student deleted";
    }
}
