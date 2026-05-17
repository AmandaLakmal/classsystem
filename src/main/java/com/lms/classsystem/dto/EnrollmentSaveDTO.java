package com.lms.classsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EnrollmentSaveDTO {
    private Long studentId;
    private Long courseId;
    private String lastPaidMonth;
    private boolean hasAccess;
}
