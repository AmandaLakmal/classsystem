package com.lms.classsystem.service.impl;

import com.lms.classsystem.dto.BatchSaveDTO;
import com.lms.classsystem.dto.BatchResponseDTO;
import com.lms.classsystem.entity.Batch;
import com.lms.classsystem.entity.Location;
import com.lms.classsystem.repository.BatchRepository;
import com.lms.classsystem.repository.LocationRepository;
import com.lms.classsystem.service.BatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BatchServiceImpl implements BatchService {

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private LocationRepository locationRepository;

    private BatchResponseDTO mapToDTO(Batch entity) {
        return new BatchResponseDTO(
            entity.getId(),
            entity.getYear(),
            entity.getBatchName(),
            entity.getIsActive(),
            entity.getLocation() != null ? entity.getLocation().getId() : null
        );
    }

    @Override
    public BatchResponseDTO saveBatch(BatchSaveDTO dto) {
        Location location = locationRepository.findById(dto.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));
                
        Batch batch = new Batch();
        batch.setYear(dto.getYear());
        batch.setBatchName(dto.getBatchName());
        batch.setIsActive(dto.getIsActive());
        batch.setLocation(location);
        
        return mapToDTO(batchRepository.save(batch));
    }

    @Override
    public List<BatchResponseDTO> getAllBatches() {
        return batchRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public BatchResponseDTO updateBatch(Long id, BatchSaveDTO dto) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found"));
                
        Location location = locationRepository.findById(dto.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));
                
        batch.setYear(dto.getYear());
        batch.setBatchName(dto.getBatchName());
        batch.setIsActive(dto.getIsActive());
        batch.setLocation(location);
        
        return mapToDTO(batchRepository.save(batch));
    }

    @Override
    public void deleteBatch(Long id) {
        batchRepository.deleteById(id);
    }
}
