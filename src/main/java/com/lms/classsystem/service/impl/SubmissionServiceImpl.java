package com.lms.classsystem.service.impl;

import com.lms.classsystem.dto.SubmissionDTO;
import com.lms.classsystem.dto.SubmissionResponseDTO;
import com.lms.classsystem.entity.Assignment;
import com.lms.classsystem.entity.Student;
import com.lms.classsystem.entity.Submission;
import com.lms.classsystem.repository.AssignmentRepository;
import com.lms.classsystem.repository.StudentRepository;
import com.lms.classsystem.repository.SubmissionRepository;
import com.lms.classsystem.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubmissionServiceImpl implements SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    private SubmissionResponseDTO mapToDTO(Submission s) {
        return new SubmissionResponseDTO(
            s.getId(),
            s.getAssignment() != null ? s.getAssignment().getId() : null,
            s.getAssignment() != null ? s.getAssignment().getTitle() : null,
            s.getStudent() != null ? s.getStudent().getId() : null,
            s.getStudent() != null ? s.getStudent().getFirstName() + " " + s.getStudent().getLastName() : null,
            s.getFileUrl(),
            s.getSubmittedAt(),
            s.isLate()
        );
    }

    @Override
    public SubmissionResponseDTO submitAssignment(SubmissionDTO dto, String studentEmail) {
        Assignment assignment = assignmentRepository.findById(dto.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
                
        Student student = studentRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Submission submission = new Submission();
        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setFileUrl(dto.getFileUrl());
        submission.setSubmittedAt(LocalDateTime.now());
        
        if (assignment.getDeadline() != null && submission.getSubmittedAt().isAfter(assignment.getDeadline())) {
            submission.setLate(true);
        } else {
            submission.setLate(false);
        }

        return mapToDTO(submissionRepository.save(submission));
    }

    @Override
    public List<SubmissionResponseDTO> getAllSubmissions() {
        return submissionRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<SubmissionResponseDTO> getSubmissionsByAssignment(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<SubmissionResponseDTO> getSubmissionsByStudent(String studentEmail) {
        Student student = studentRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return submissionRepository.findByStudentId(student.getId()).stream().map(this::mapToDTO).collect(Collectors.toList());
    }
}
