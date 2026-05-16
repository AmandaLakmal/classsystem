package com.lms.classsystem.service.impl;

import com.lms.classsystem.entity.Batch;
import com.lms.classsystem.entity.Student;
import com.lms.classsystem.repository.BatchRepository;
import com.lms.classsystem.repository.StudentRepository;
import com.lms.classsystem.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private BatchRepository batchRepository; // Batch සහ Location විස්තර ගන්න මේක අනිවාර්යයි

    @Override
    public Student saveStudent(Student student) {
        // 1. Postman එකෙන් එවන Batch ID එක පාවිච්චි කරලා Database එකෙන් ඒ බැච් එකේ විස්තර ගන්නවා
        Batch batch = batchRepository.findById(student.getBatch().getId())
                .orElseThrow(() -> new RuntimeException("Can't find that batch"));

        // 2. ඒ බැච් එකට සම්බන්ධ ලොකේෂන් එකේ නම සහ බැච් එකේ අවුරුද්ද ගන්නවා
        String locName = batch.getLocation().getName(); // උදා: "Gurumadala"
        String year = batch.getYear(); // උදා: "2026"

        // 3. ලොකේෂන් එක අනුව Prefix එක (GURU/ONL) තීරණය කරනවා
        String prefix;
        if (locName.equalsIgnoreCase("Online")) {
            prefix = "ONL";
        } else {
            // නමේ මුල් අකුරු 4 Uppercase කරනවා (Gurumadala -> GURU)
            prefix = (locName.length() >= 4) ? locName.substring(0, 4).toUpperCase() : locName.toUpperCase();
        }

        // 4. දැනට Database එකේ ඉන්න මුළු ළමයින් ගණන අරන් ඊළඟ අංකය (+1) තීරණය කරනවා
        long nextNumber = studentRepository.count() + 1;

        // 5. අවසාන Registration ID එක හදනවා (Format: GURU/2026/001)
        String generatedRegId = String.format("%s/%s/%03d", prefix, year, nextNumber);

        // 6. හැදුණු ID එක ශිෂ්‍යයාට සෙට් කරලා, මුළු බැච් එකම ශිෂ්‍යයාගේ Object එකට සම්බන්ධ කරනවා
        student.setStudentRegId(generatedRegId);
        student.setBatch(batch);

        return studentRepository.save(student);
    }

    @Override
    public List<Student> getAllStudent() {
        return studentRepository.findAll();
    }

    @Override
    public List<Student> searchStudent(String keyword) {
        return studentRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrStudentRegIdContainingIgnoreCase(keyword, keyword, keyword);
    }
}