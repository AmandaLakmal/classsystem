package com.lms.classsystem.controller;

import com.lms.classsystem.dto.AssignmentDTO;
import com.lms.classsystem.dto.AssignmentResponseDTO;
import com.lms.classsystem.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assignment")
@CrossOrigin
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @PostMapping("/save")
    public AssignmentResponseDTO saveAssignment(@RequestBody AssignmentDTO dto) {
        return assignmentService.saveAssignment(dto);
    }

    @PutMapping("/update/{id}")
    public AssignmentResponseDTO updateAssignment(@PathVariable Long id, @RequestBody AssignmentDTO dto) {
        return assignmentService.updateAssignment(id, dto);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return "Assignment deleted successfully";
    }

    @GetMapping("/get-all")
    public List<AssignmentResponseDTO> getAllAssignments() {
        return assignmentService.getAllAssignments();
    }

    @GetMapping("/course/{courseId}")
    public List<AssignmentResponseDTO> getAssignmentsByCourse(@PathVariable Long courseId) {
        return assignmentService.getAssignmentsByCourse(courseId);
    }
}
