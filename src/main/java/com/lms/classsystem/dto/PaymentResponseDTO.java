package com.lms.classsystem.dto;

import com.lms.classsystem.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponseDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentRegId;
    private Long courseId;
    private String courseName;
    private BigDecimal amount;
    private String month;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private PaymentStatus status;
    private String notes;
}
