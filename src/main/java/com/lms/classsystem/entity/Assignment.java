package com.lms.classsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignment")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime deadline;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    // ── Phase 2: Direct Teacher Segregation ────────────────────────────────
    // Explicitly surfaces which Instructor set this assignment.
    // Transitively available via course.instructor, but surfaced here
    // for direct querying without joins (analytics, filtering, grading UI).
    @ManyToOne
    @JoinColumn(name = "instructor_id", nullable = true)
    private Instructor instructor;
}
