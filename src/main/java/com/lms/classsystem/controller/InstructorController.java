package com.lms.classsystem.controller;

import com.lms.classsystem.dto.InstructorDTO;
import com.lms.classsystem.service.InstructorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/instructor")
@CrossOrigin
public class InstructorController {

    @Autowired
    private InstructorService instructorService;

    @PostMapping("/save")
    public InstructorDTO saveInstructor(@RequestBody InstructorDTO dto) {
        return instructorService.saveInstructor(dto);
    }

    @GetMapping("/get-all")
    public List<InstructorDTO> getAllInstructors() {
        return instructorService.getAllInstructors();
    }

    @PutMapping("/update/{id}")
    public InstructorDTO updateInstructor(@PathVariable Long id, @RequestBody InstructorDTO dto) {
        return instructorService.updateInstructor(id, dto);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteInstructor(@PathVariable Long id) {
        instructorService.deleteInstructor(id);
        return "Instructor deleted successfully!";
    }
}
