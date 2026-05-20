package com.lms.classsystem.controller;

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

    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostMapping("/submit")
    public ResponseEntity<?> submitAssignment(
            @RequestParam("assignmentId") Long assignmentId,
            @RequestParam("studentId") Long studentId,
            @RequestParam("file") MultipartFile file) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Transmission payload cannot be empty.");
        }

        try {
            // 1. Ensure the destination directory exists on your computer
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 2. Generate a totally unique filename to avoid collisions
            String originalFileName = file.getOriginalFilename();
            String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;
            
            // 3. Save the file to disk
            Path targetPath = Paths.get(uploadDir).resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetPath);

            // 4. Calculate a web-accessible URL path for your DB entry
            String fileUrlPath = "/uploads/submissions/" + uniqueFileName;

            // TODO: Call your submissionService here to save to MySQL!
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
}