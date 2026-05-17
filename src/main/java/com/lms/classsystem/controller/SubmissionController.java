package com.lms.classsystem.controller;

import com.lms.classsystem.dto.SubmissionDTO;
import com.lms.classsystem.dto.SubmissionResponseDTO;
import com.lms.classsystem.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/submission")
@CrossOrigin
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @PostMapping("/submit")
    public SubmissionResponseDTO submitAssignment(@RequestBody SubmissionDTO dto, Principal principal) {
        return submissionService.submitAssignment(dto, principal.getName());
    }

    @GetMapping("/get-all")
    public List<SubmissionResponseDTO> getAllSubmissions() {
        return submissionService.getAllSubmissions();
    }

    @GetMapping("/assignment/{assignmentId}")
    public List<SubmissionResponseDTO> getSubmissionsByAssignment(@PathVariable Long assignmentId) {
        return submissionService.getSubmissionsByAssignment(assignmentId);
    }

    @GetMapping("/my-submissions")
    public List<SubmissionResponseDTO> getMySubmissions(Principal principal) {
        return submissionService.getSubmissionsByStudent(principal.getName());
    }
}
