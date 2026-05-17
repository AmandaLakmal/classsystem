package com.lms.classsystem.service.impl;

import com.lms.classsystem.dto.InstructorDTO;
import com.lms.classsystem.entity.Instructor;
import com.lms.classsystem.repository.InstructorRepository;
import com.lms.classsystem.service.InstructorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InstructorServiceImpl implements InstructorService {

    @Autowired
    private InstructorRepository instructorRepository;

    private InstructorDTO mapToDTO(Instructor entity) {
        return new InstructorDTO(entity.getId(), entity.getName(), entity.getSubject(), entity.getEmail(), entity.getContactNumber());
    }

    @Override
    public InstructorDTO saveInstructor(InstructorDTO dto) {
        Instructor instructor = new Instructor();
        instructor.setName(dto.getName());
        instructor.setSubject(dto.getSubject());
        instructor.setEmail(dto.getEmail());
        instructor.setContactNumber(dto.getContactNumber());
        return mapToDTO(instructorRepository.save(instructor));
    }

    @Override
    public List<InstructorDTO> getAllInstructors() {
        return instructorRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public InstructorDTO updateInstructor(Long id, InstructorDTO dto) {
        Instructor instructor = instructorRepository.findById(id).orElseThrow(() -> new RuntimeException("Instructor not found"));
        instructor.setName(dto.getName());
        instructor.setSubject(dto.getSubject());
        instructor.setEmail(dto.getEmail());
        instructor.setContactNumber(dto.getContactNumber());
        return mapToDTO(instructorRepository.save(instructor));
    }

    @Override
    public void deleteInstructor(Long id) {
        instructorRepository.deleteById(id);
    }
}
