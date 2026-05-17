package com.lms.classsystem.service.impl;

import com.lms.classsystem.dto.StudentSaveDTO;
import com.lms.classsystem.dto.StudentUpdateDTO;
import com.lms.classsystem.entity.Batch;
import com.lms.classsystem.entity.Student;
import com.lms.classsystem.repository.BatchRepository;
import com.lms.classsystem.repository.StudentRepository;
import com.lms.classsystem.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Override
    public Student saveStudent(StudentSaveDTO studentDTO) {
        // 1. issella ewapu email eken lamek danatamath innawada balanawa (security)
        if (studentRepository.existsByEmail(studentDTO.getEmail())) {
            throw new RuntimeException("Email already exists: " + studentDTO.getEmail());
        }

        // 2. Postman eken ena Batch ID eka use karala Database eken e batch eke details gannwa
        Batch batch = batchRepository.findById(studentDTO.getBatchId())
                .orElseThrow(() -> new RuntimeException("Can't find that batch"));

        // 3. e Batch ekt sambanda location eke name ek saha batch eke year eka gannawa
        String locName = batch.getLocation().getName(); // eg: "Gurumadala - Kalutara"
        String year = batch.getYear(); // eg: "2026"

        // 4. location eka anuwa Prefix ek (GURU/ONL) thirnaya karanawa (Old logic eka)
        String prefix;
        if (locName.equalsIgnoreCase("Online")) {
            prefix = "ONL";
        } else {
            // name mul akuru 4 Uppercase krnw (Gurumadala -> GURU)
            prefix = (locName.length() >= 4) ? locName.substring(0, 4).toUpperCase() : locName.toUpperCase();
        }

        // 5. ID logic: me batch eke inna lamai gana witharak balala agata ekak ekathu karanawa
        long nextNumber = studentRepository.countByBatchId(batch.getId()) + 1;

        // 6. awasana Registration ID eka hadanawa (Format: GURU/2026/001)
        String generatedRegId = String.format("%s/%s/%03d", prefix, year, nextNumber);

        Student student = new Student();
        student.setFirstName(studentDTO.getFirstName());
        student.setLastName(studentDTO.getLastName());
        student.setEmail(studentDTO.getEmail());
        student.setPassword(studentDTO.getPassword());
        student.setContactNumber(studentDTO.getContactNumber());
        student.setAddress(studentDTO.getAddress());
        student.setInstituteName(studentDTO.getInstituteName());

        // 7. Data tika save karnawa
        student.setStudentRegId(generatedRegId);
        student.setBatch(batch);
        student.setIsActive(true); // Default save deddima  Active thiyanwa

        return studentRepository.save(student);
    }

    @Override
    public Student updateStudent(Long id, StudentUpdateDTO dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (studentRepository.existsByEmailAndIdNot(dto.getEmail(), id)) {
            throw new RuntimeException("Email already exists: " + dto.getEmail());
        }

        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setEmail(dto.getEmail());
        student.setContactNumber(dto.getContactNumber());
        student.setAddress(dto.getAddress());
        student.setInstituteName(dto.getInstituteName());

        if (dto.getBatchId() != null && !student.getBatch().getId().equals(dto.getBatchId())) {
            Batch newBatch = batchRepository.findById(dto.getBatchId())
                    .orElseThrow(() -> new RuntimeException("Can't find that batch"));

            String locName = newBatch.getLocation().getName();
            String year = newBatch.getYear();

            String prefix;
            if (locName.equalsIgnoreCase("Online")) {
                prefix = "ONL";
            } else {
                prefix = (locName.length() >= 4) ? locName.substring(0, 4).toUpperCase() : locName.toUpperCase();
            }

            long nextNumber = studentRepository.countByBatchId(newBatch.getId()) + 1;
            String generatedRegId = String.format("%s/%s/%03d", prefix, year, nextNumber);

            student.setStudentRegId(generatedRegId);
            student.setBatch(newBatch);
        }

        return studentRepository.save(student);
    }

    @Override
    public List<Student> getAllStudent() {
        // Database eke inna serama ganne nethuwa Active aya witharak gannawa (Soft Delete nisa)
        return studentRepository.findByIsActiveTrue();
    }

    @Override
    public List<Student> searchStudent(String keyword) {
        // Old search logic
        return studentRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrStudentRegIdContainingIgnoreCase(keyword, keyword, keyword);
    }

    @Override
    public void deleteStudent(Long id) {
        // Soft Delete logic: student wa makanne nethuwa  Inactive karanawa
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Can't Find student"));

        student.setIsActive(false); // eyawa inactive karnawa
        studentRepository.save(student); // UPDATE ekak widiyt save karnawa
    }
}