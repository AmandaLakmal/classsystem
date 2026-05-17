package com.lms.classsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EnrollmentResponseDTO {
    private Long id;
    private Long studentId;
    private Long courseId;
    private String lastPaidMonth;
    private boolean hasAccess;
}
