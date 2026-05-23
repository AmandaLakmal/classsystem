package com.lms.classsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentSaveDTO {
    private Long studentId;
    private Long courseId;           // nullable
    private BigDecimal amount;
    private String month;            // "YYYY-MM"
    private LocalDate dueDate;
    private String notes;
}
