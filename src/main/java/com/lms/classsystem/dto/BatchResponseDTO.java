package com.lms.classsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatchResponseDTO {
    private Long id;
    private String year;
    private String batchName;
    private Boolean isActive;
    private Long locationId;
}
