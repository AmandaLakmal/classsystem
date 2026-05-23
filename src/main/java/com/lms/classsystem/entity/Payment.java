package com.lms.classsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Tracks monthly tuition fee payments linked to a Student and Course.
 * Created automatically (PENDING) when a student registers for a course.
 */
@Entity
@Table(name = "payment")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The student responsible for this fee. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    /** The course/subject this fee is associated with (nullable for general fees). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = true)
    private Course course;

    /** Fee amount in the local currency. */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    /** The billing month, stored as "YYYY-MM" (e.g. "2026-06"). */
    @Column(nullable = false, length = 7)
    private String month;

    /** Date the payment is due. */
    @Column(nullable = false)
    private LocalDate dueDate;

    /** Date the payment was actually received. Null if not yet paid. */
    @Column(nullable = true)
    private LocalDate paidDate;

    /** Current payment status. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    /** Optional notes (e.g. reference number, waiver reason). */
    @Column(nullable = true, length = 500)
    private String notes;
}
