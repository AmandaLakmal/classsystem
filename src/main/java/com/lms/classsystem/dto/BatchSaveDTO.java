package com.lms.classsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatchSaveDTO {
    private String year;
    private String batchName;
    private Boolean isActive = true;
    private Long locationId;
}
