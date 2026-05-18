package com.lms.classsystem.service.impl;

import com.lms.classsystem.dto.AssignmentDTO;
import com.lms.classsystem.dto.AssignmentResponseDTO;
import com.lms.classsystem.entity.Assignment;
import com.lms.classsystem.entity.Course;
import com.lms.classsystem.repository.AssignmentRepository;
import com.lms.classsystem.repository.CourseRepository;
import com.lms.classsystem.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssignmentServiceImpl implements AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    private AssignmentResponseDTO mapToDTO(Assignment a) {
        return new AssignmentResponseDTO(
            a.getId(),
            a.getTitle(),
            a.getDescription(),
            a.getDeadline(),
            a.getCourse() != null ? a.getCourse().getId() : null
        );
    }

    @Override
    public AssignmentResponseDTO saveAssignment(AssignmentDTO dto) {
        Assignment assignment = new Assignment();
        assignment.setTitle(dto.getTitle());
        assignment.setDescription(dto.getDescription());
        assignment.setDeadline(dto.getDeadline());

        if (dto.getCourseId() != null) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            assignment.setCourse(course);
        }

        return mapToDTO(assignmentRepository.save(assignment));
    }

    @Override
    public AssignmentResponseDTO updateAssignment(Long id, AssignmentDTO dto) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
                
        assignment.setTitle(dto.getTitle());
        assignment.setDescription(dto.getDescription());
        assignment.setDeadline(dto.getDeadline());

        if (dto.getCourseId() != null) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            assignment.setCourse(course);
        } else {
            assignment.setCourse(null);
        }

        return mapToDTO(assignmentRepository.save(assignment));
    }

    @Override
    public void deleteAssignment(Long id) {
        assignmentRepository.deleteById(id);
    }

    @Override
    public List<AssignmentResponseDTO> getAllAssignments() {
        return assignmentRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<AssignmentResponseDTO> getAssignmentsByCourse(Long courseId) {
        return assignmentRepository.findByCourseId(courseId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }
}
