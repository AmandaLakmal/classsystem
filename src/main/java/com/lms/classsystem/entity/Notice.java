package com.lms.classsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notice")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Notice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Target by Batch (existing — preserved)
    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;

    // Target by Subject/Course (new — nullable, additive)
    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
}
