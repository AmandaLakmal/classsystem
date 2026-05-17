package com.lms.classsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LessionResponseDTO {
    private Long id;
    private String title;
    private String videoUrl;
    private Long courseId;
}
