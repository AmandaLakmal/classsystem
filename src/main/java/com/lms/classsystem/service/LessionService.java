package com.lms.classsystem.service;

import com.lms.classsystem.dto.LessionSaveDTO;
import com.lms.classsystem.dto.LessionResponseDTO;
import java.util.List;

public interface LessionService {
    LessionResponseDTO saveLession(LessionSaveDTO dto);
    List<LessionResponseDTO> getAllLessions();
    LessionResponseDTO updateLession(Long id, LessionSaveDTO dto);
    void deleteLession(Long id);
    LessionResponseDTO viewLesson(Long id, String userEmail);
}
