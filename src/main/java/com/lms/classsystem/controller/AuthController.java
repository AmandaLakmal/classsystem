package com.lms.classsystem.controller;

import com.lms.classsystem.config.JwtTokenProvider;
import com.lms.classsystem.dto.AuthResponseDTO;
import com.lms.classsystem.dto.LoginRequestDTO;
import com.lms.classsystem.dto.StudentSaveDTO;
import com.lms.classsystem.dto.StudentResponseDTO;
import com.lms.classsystem.entity.Instructor;
import com.lms.classsystem.entity.Student;
import com.lms.classsystem.repository.InstructorRepository;
import com.lms.classsystem.repository.StudentRepository;
import com.lms.classsystem.service.FileStorageService;
import com.lms.classsystem.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private StudentService studentService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private InstructorRepository instructorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/login")
    public AuthResponseDTO authenticateUser(@RequestBody LoginRequestDTO loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        
        // Extract role
        String role = authentication.getAuthorities().iterator().next().getAuthority();

        return new AuthResponseDTO(jwt, role);
    }

    @PostMapping("/register")
    public StudentResponseDTO registerUser(@RequestBody StudentSaveDTO studentDTO) {
        studentDTO.setPassword(passwordEncoder.encode(studentDTO.getPassword()));
        Student savedStudent = studentService.saveStudent(studentDTO);
        return new StudentResponseDTO(
                savedStudent.getId(),
                savedStudent.getStudentRegId(),
                savedStudent.getFirstName(),
                savedStudent.getLastName(),
                savedStudent.getEmail(),
                savedStudent.getContactNumber(),
                savedStudent.getAddress(),
                savedStudent.getInstituteName(),
                savedStudent.getIsActive(),
                savedStudent.getBatch() != null ? savedStudent.getBatch().getId() : null
        );
    }

    /**
     * Upload or replace the authenticated user's profile photo.
     * Works for both Student and Instructor accounts.
     *
     * POST /api/v1/auth/upload-photo
     * Content-Type: multipart/form-data
     * Body: file = <image>
     */
    @PostMapping(value = "/upload-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            String photoUrl = fileStorageService.storeProfilePhoto(file);

            // Try Student table first
            var studentOpt = studentRepository.findByEmail(email);
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                student.setProfilePhotoUrl(photoUrl);
                studentRepository.save(student);
                return ResponseEntity.ok(Map.of("profilePhotoUrl", photoUrl));
            }

            // Fallback to Instructor table
            var instructorOpt = instructorRepository.findByEmail(email);
            if (instructorOpt.isPresent()) {
                Instructor instructor = instructorOpt.get();
                instructor.setProfilePhotoUrl(photoUrl);
                instructorRepository.save(instructor);
                return ResponseEntity.ok(Map.of("profilePhotoUrl", photoUrl));
            }

            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Change the authenticated user's password after verifying the old one.
     *
     * POST /api/v1/auth/change-password
     * Body: { "oldPassword": "...", "newPassword": "..." }
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String email = authentication.getName();
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        if (oldPassword == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Old and new passwords are required (min 6 chars)."));
        }

        // Try Student first
        var studentOpt = studentRepository.findByEmail(email);
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            if (!passwordEncoder.matches(oldPassword, student.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Old password is incorrect."));
            }
            student.setPassword(passwordEncoder.encode(newPassword));
            studentRepository.save(student);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        }

        // Fallback to Instructor
        var instructorOpt = instructorRepository.findByEmail(email);
        if (instructorOpt.isPresent()) {
            Instructor instructor = instructorOpt.get();
            if (instructor.getPassword() == null || !passwordEncoder.matches(oldPassword, instructor.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Old password is incorrect."));
            }
            instructor.setPassword(passwordEncoder.encode(newPassword));
            instructorRepository.save(instructor);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        }

        return ResponseEntity.status(404).body(Map.of("error", "User not found."));
    }

    /**
     * Get the authenticated user's profile data (name + photo URL).
     * Used by the Topbar to display the current user's avatar.
     *
     * GET /api/v1/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(Authentication authentication) {
        String email = authentication.getName();

        var studentOpt = studentRepository.findByEmail(email);
        if (studentOpt.isPresent()) {
            Student s = studentOpt.get();
            return ResponseEntity.ok(Map.of(
                "name", s.getFirstName() + " " + s.getLastName(),
                "email", s.getEmail(),
                "role", s.getRole().name(),
                "profilePhotoUrl", s.getProfilePhotoUrl() != null ? s.getProfilePhotoUrl() : "",
                "studentRegId", s.getStudentRegId() != null ? s.getStudentRegId() : ""
            ));
        }

        var instructorOpt = instructorRepository.findByEmail(email);
        if (instructorOpt.isPresent()) {
            Instructor i = instructorOpt.get();
            return ResponseEntity.ok(Map.of(
                "name", i.getName(),
                "email", i.getEmail(),
                "role", i.getRole() != null ? i.getRole().name() : "TEACHER",
                "profilePhotoUrl", i.getProfilePhotoUrl() != null ? i.getProfilePhotoUrl() : ""
            ));
        }

        return ResponseEntity.status(404).body(Map.of("error", "User not found."));
    }
}
