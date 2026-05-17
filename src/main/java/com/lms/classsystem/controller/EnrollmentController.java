package com.lms.classsystem.controller;

import com.lms.classsystem.dto.EnrollmentSaveDTO;
import com.lms.classsystem.dto.EnrollmentResponseDTO;
import com.lms.classsystem.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enrollment")
@CrossOrigin
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @PostMapping("/save")
    public EnrollmentResponseDTO saveEnrollment(@RequestBody EnrollmentSaveDTO dto) {
        return enrollmentService.saveEnrollment(dto);
    }

    @GetMapping("/get-all")
    public List<EnrollmentResponseDTO> getAllEnrollments() {
        return enrollmentService.getAllEnrollments();
    }

    @PutMapping("/update/{id}")
    public EnrollmentResponseDTO updateEnrollment(@PathVariable Long id, @RequestBody EnrollmentSaveDTO dto) {
        return enrollmentService.updateEnrollment(id, dto);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteEnrollment(@PathVariable Long id) {
        enrollmentService.deleteEnrollment(id);
        return "Enrollment deleted successfully!";
    }
}
