package com.lms.classsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NoticeDTO {
    private Long id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private Long batchId;
    private Long courseId;   // new — optional subject targeting
    private String courseName; // read-only, for display
}
