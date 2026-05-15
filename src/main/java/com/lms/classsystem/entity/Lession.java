package com.lms.classsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lession")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Lession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String videoUrl;
    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
}
