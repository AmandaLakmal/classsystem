package com.lms.classsystem.controller;

import com.lms.classsystem.dto.GradeRequestDTO;
import com.lms.classsystem.entity.Submission;
import com.lms.classsystem.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/submission")
@CrossOrigin
public class SubmissionController {

    // Added the repository so we can save the grades to MySQL
    @Autowired
    private SubmissionRepository submissionRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    // ==========================================
    // 1. THE FILE UPLOAD METHOD
    // ==========================================
    @PostMapping("/submit")
    public ResponseEntity<?> submitAssignment(
            @RequestParam("assignmentId") Long assignmentId,
            @RequestParam("studentId") Long studentId,
            @RequestParam("file") MultipartFile file) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Transmission payload cannot be empty.");
        }

        try {
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String originalFileName = file.getOriginalFilename();
            String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;
            
            Path targetPath = Paths.get(uploadDir).resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetPath);

            String fileUrlPath = "/uploads/submissions/" + uniqueFileName;

            // TODO: Call your submissionService here to save the initial upload to MySQL!
            // submissionService.save(assignmentId, studentId, fileUrlPath);

            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Payload securely archived",
                "filePath", fileUrlPath
            ));

        } catch (IOException e) {
            return ResponseEntity.status(500).body("File system write failure: " + e.getMessage());
        }
    }

    // ==========================================
    // 2. THE NEW GRADING & FEEDBACK METHOD
    // ==========================================
    @PutMapping("/grade/{submissionId}")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable Long submissionId, 
            @RequestBody GradeRequestDTO gradeData) {
        
        try {
            // Find the exact submission in the database
            Submission submission = submissionRepository.findById(submissionId)
                    .orElseThrow(() -> new RuntimeException("Submission record not found."));

            // Apply the instructor's evaluation
            submission.setGrade(gradeData.getGrade());
            submission.setFeedback(gradeData.getFeedback());

            // Save it back to MySQL
            submissionRepository.save(submission);

            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Evaluation successfully recorded."
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Grading system error: " + e.getMessage());
        }
    }
}