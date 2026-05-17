package com.lms.classsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseResponseDTO {
    private Long id;
    private String courseName;
    private double fee;
    private String category;
    private boolean isOnline;
    private Long locationId;
    private Long instructorId;
}
