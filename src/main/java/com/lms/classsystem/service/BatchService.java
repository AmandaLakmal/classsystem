package com.lms.classsystem.service;

import com.lms.classsystem.dto.BatchSaveDTO;
import com.lms.classsystem.dto.BatchResponseDTO;
import java.util.List;

public interface BatchService {
    BatchResponseDTO saveBatch(BatchSaveDTO dto);
    List<BatchResponseDTO> getAllBatches();
    BatchResponseDTO updateBatch(Long id, BatchSaveDTO dto);
    void deleteBatch(Long id);
}
