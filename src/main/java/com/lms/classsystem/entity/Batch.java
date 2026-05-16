package com.lms.classsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "batch")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Batch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String year;  //Year of A/L ex:- 2026, 2027
    private String batchName; //Theory, Physical

    private Boolean isActive = true;

    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;   //location name ex:- GURU,ONL
}

