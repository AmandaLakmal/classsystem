package com.lms.classsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "instructor")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Instructor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String subject;  // Maths, ET, SFT, BIO

    @Column(unique = true)
    private String email;

    private String contactNumber;

    // ── Phase 2: Teacher Login Fields ──────────────────────────────────────
    // These columns are added non-destructively by JPA ddl-auto=update.
    // Existing instructor rows will have NULL password until provisioned.

    @Column(nullable = true)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private Role role = Role.TEACHER;

    @Column(nullable = true)
    private Boolean isActive = true;

    // ── Phase 3: Profile Photo ─────────────────────────────────────────────
    @Column(nullable = true)
    private String profilePhotoUrl;
}
