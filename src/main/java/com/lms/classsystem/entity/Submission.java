package com.lms.classsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "submission")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Submission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    private String fileUrl;

    private LocalDateTime submittedAt = LocalDateTime.now();

    private boolean isLate;

    // --- PHASE 2: GRADING ENGINE FIELDS ---
    
    @Column(name = "grade")
    private Double grade;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;
}