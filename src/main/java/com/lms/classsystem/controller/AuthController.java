package com.lms.classsystem.controller;

import com.lms.classsystem.config.JwtTokenProvider;
import com.lms.classsystem.dto.AuthResponseDTO;
import com.lms.classsystem.dto.LoginRequestDTO;
import com.lms.classsystem.dto.StudentSaveDTO;
import com.lms.classsystem.dto.StudentResponseDTO;
import com.lms.classsystem.entity.Student;
import com.lms.classsystem.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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
    private PasswordEncoder passwordEncoder;

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
}
