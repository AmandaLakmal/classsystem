package com.lms.classsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentResponseDTO {
    private Long id;
    private String studentRegId;
    private String firstName;
    private String lastName;
    private String email;
    private String contactNumber;
    private String address;
    private String instituteName;
    private Boolean isActive;
    private Long batchId;
}
