package com.lms.classsystem.controller;

import com.lms.classsystem.dto.GradeRequestDTO;
import com.lms.classsystem.entity.Assignment;
import com.lms.classsystem.entity.Student;
import com.lms.classsystem.entity.Submission;
import com.lms.classsystem.repository.AssignmentRepository;
import com.lms.classsystem.repository.StudentRepository;
import com.lms.classsystem.repository.SubmissionRepository;
import com.lms.classsystem.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/submission")
@CrossOrigin
public class SubmissionController {

    @Autowired private SubmissionRepository  submissionRepository;
    @Autowired private StudentRepository     studentRepository;
    @Autowired private AssignmentRepository  assignmentRepository;
    @Autowired private FileStorageService    fileStorageService;

    // =========================================================================
    // 1. SUBMIT ASSIGNMENT (file upload delegated to FileStorageService)
    // =========================================================================
    @PostMapping("/submit")
    public ResponseEntity<?> submitAssignment(
            @RequestParam("assignmentId") Long assignmentId,
            @RequestParam("studentId")    Long studentId,
            @RequestParam("file")         MultipartFile file) {

        try {
            // Delegate storage, sanitization & validation to service
            String fileUrlPath = fileStorageService.storeSubmissionFile(file);

            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student ID not found in registry"));

            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new RuntimeException("Assignment ID not found in registry"));

            Submission submission = new Submission();
            submission.setStudent(student);
            submission.setAssignment(assignment);
            submission.setFileUrl(fileUrlPath);
            submissionRepository.save(submission);

            return ResponseEntity.ok(Map.of(
                    "status",   "SUCCESS",
                    "message",  "File uploaded and submission recorded.",
                    "filePath", fileUrlPath
            ));

        } catch (IllegalArgumentException e) {
            // Type validation failure — bad request, not server error
            return ResponseEntity.badRequest().body(Map.of("status", "REJECTED", "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    // =========================================================================
    // 2. GRADE & FEEDBACK
    // =========================================================================
    @PutMapping("/grade/{submissionId}")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody  GradeRequestDTO gradeData) {

        try {
            Submission submission = submissionRepository.findById(submissionId)
                    .orElseThrow(() -> new RuntimeException("Submission record not found."));

            submission.setGrade(gradeData.getGrade());
            submission.setFeedback(gradeData.getFeedback());
            submissionRepository.save(submission);

            return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Evaluation recorded."));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    // =========================================================================
    // 3. GET ALL SUBMISSIONS
    // =========================================================================
    @GetMapping("/get-all")
    public ResponseEntity<?> getAllSubmissions() {
        try {
            return ResponseEntity.ok(submissionRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    // =========================================================================
    // 4. GET SUBMISSIONS BY ASSIGNMENT
    // =========================================================================
    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<?> getSubmissionsByAssignment(@PathVariable Long assignmentId) {
        try {
            return ResponseEntity.ok(submissionRepository.findByAssignmentId(assignmentId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    // =========================================================================
    // 5. RETRACT SUBMISSION (file delete delegated to FileStorageService)
    // =========================================================================
    @DeleteMapping("/remove/{assignmentId}/{studentId}")
    public ResponseEntity<?> retractSubmission(
            @PathVariable Long assignmentId,
            @PathVariable Long studentId) {

        try {
            Submission submission = submissionRepository
                    .findByAssignmentIdAndStudentId(assignmentId, studentId)
                    .orElse(null);

            if (submission == null) {
                return ResponseEntity.status(404).body(Map.of(
                        "status",  "NOT_FOUND",
                        "message", "No submission found for this assignment/student pair."));
            }

            // Delete physical file via service
            fileStorageService.deleteSubmissionFile(submission.getFileUrl());

            // Delete DB record
            submissionRepository.delete(submission);

            return ResponseEntity.ok(Map.of(
                    "status",  "SUCCESS",
                    "message", "Submission retracted. Student may now re-submit."));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }
}