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
        // 1. අලුත්: ඉස්සෙල්ලාම එවපු Email එකෙන් දැනටමත් ළමයෙක් ඉන්නවද බලනවා (ආරක්ෂාවට)
        if (studentRepository.existsByEmail(studentDTO.getEmail())) {
            throw new RuntimeException("Email already exists: " + studentDTO.getEmail());
        }

        // 2. Postman eken ena Batch ID eka use karala Database eken e batch eke details gannwa
        Batch batch = batchRepository.findById(studentDTO.getBatchId())
                .orElseThrow(() -> new RuntimeException("Can't find that batch"));

        // 3. e Batch ekt sambanda location eke name ek saha batch eke year eka gannawa
        String locName = batch.getLocation().getName(); // eg: "Gurumadala - Kalutara"
        String year = batch.getYear(); // eg: "2026"

        // 4. ලොකේෂන් එක අනුව Prefix එක (GURU/ONL) තීරණය කරනවා (ඔයාගේ පරණ ලොජික් එක)
        String prefix;
        if (locName.equalsIgnoreCase("Online")) {
            prefix = "ONL";
        } else {
            // name mul akuru 4 Uppercase krnw (Gurumadala -> GURU)
            prefix = (locName.length() >= 4) ? locName.substring(0, 4).toUpperCase() : locName.toUpperCase();
        }

        // 5. අලුත් ID ලොජික්: මේ බැච් එකේ විතරක් දැනට ඉන්න ළමයි ගණන බලලා 1ක් එකතු කරනවා
        long nextNumber = studentRepository.countByBatchId(batch.getId()) + 1;

        // 6. අවසාන Registration ID එක හදනවා (Format: GURU/2026/001)
        String generatedRegId = String.format("%s/%s/%03d", prefix, year, nextNumber);

        Student student = new Student();
        student.setFirstName(studentDTO.getFirstName());
        student.setLastName(studentDTO.getLastName());
        student.setEmail(studentDTO.getEmail());
        student.setPassword(studentDTO.getPassword());
        student.setContactNumber(studentDTO.getContactNumber());
        student.setAddress(studentDTO.getAddress());
        student.setInstituteName(studentDTO.getInstituteName());

        // 7. දත්ත ටික සෙට් කරලා සේව් කරනවා
        student.setStudentRegId(generatedRegId);
        student.setBatch(batch);
        student.setIsActive(true); // Default සේව් වෙද්දීම Active කරනවා

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
        // ඩේටාබේස් එකේ ඉන්න සේරම ගන්නේ නැතුව Active අය විතරක් ගන්නවා (Soft Delete නිසා)
        return studentRepository.findByIsActiveTrue();
    }

    @Override
    public List<Student> searchStudent(String keyword) {
        // ඔයාගේ පරණ සර්ච් ලොජික් එක
        return studentRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrStudentRegIdContainingIgnoreCase(keyword, keyword, keyword);
    }

    @Override
    public void deleteStudent(Long id) {
        // Soft Delete ලොජික් එක: ළමයාව මකන්නේ නැතුව Inactive කරනවා
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ශිෂ්‍යයා සොයාගත නොහැකි විය!"));

        student.setIsActive(false); // එයාව ඉවත් කළා (Inactive කළා)
        studentRepository.save(student); // UPDATE එකක් විදිහට සේව් වෙනවා
    }
}