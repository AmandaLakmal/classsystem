package com.lms.classsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String studentRegId;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;   //login wenna use karana email eka

    @Column(nullable = false)
    private String password;

    private String contactNumber;

    private String address;

    private String instituteName; // student ena education center eke name eka

    private Boolean isActive = true; // aluthen save wena hamoma active widiyata save wenawa

    @Enumerated(EnumType.STRING)
    private Role role = Role.STUDENT;

    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;

    // ── Phase 3: Expanded Profile Fields ──────────────────────────────────────
    // Non-destructive — JPA ddl-auto=update adds these columns to the existing table.
    @Column(nullable = true)
    private String emergencyContact;

    @Column(nullable = true)
    private String profilePhotoUrl;
}
