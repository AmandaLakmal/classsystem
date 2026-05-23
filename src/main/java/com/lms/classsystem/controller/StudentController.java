package com.lms.classsystem.controller;


import com.lms.classsystem.dto.StudentSaveDTO;
import com.lms.classsystem.dto.StudentUpdateDTO;
import com.lms.classsystem.entity.Student;
import com.lms.classsystem.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student")
@CrossOrigin
public class StudentController {

    @Autowired
    private StudentService studentService;

    /** Register student — ADMIN/SUPERADMIN only. */
    @PostMapping("/save")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public Student saveStudent(@RequestBody StudentSaveDTO student){
        return studentService.saveStudent(student);
    }

    /** Update student — ADMIN/SUPERADMIN only. */
    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public Student updateStudent(@PathVariable Long id, @RequestBody StudentUpdateDTO student){
        return studentService.updateStudent(id, student);
    }

    /** Get all active students — any authenticated role may read. */
    @GetMapping("/get-all")
    public List<Student> getAllStudent(){
        return studentService.getAllStudent();
    }

    /** Search students by name or reg ID — any authenticated role may read. */
    @GetMapping("/search")
    public List<Student> searchStudent(@RequestParam String keyword ) {
        return studentService.searchStudent(keyword);
    }

    /** Soft-delete student — ADMIN/SUPERADMIN only. */
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public String deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return "student deleted";
    }
}
