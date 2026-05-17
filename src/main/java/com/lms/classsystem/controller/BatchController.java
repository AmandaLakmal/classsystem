package com.lms.classsystem.controller;

import com.lms.classsystem.dto.BatchSaveDTO;
import com.lms.classsystem.dto.BatchResponseDTO;
import com.lms.classsystem.service.BatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/batch")
@CrossOrigin
public class BatchController {

    @Autowired
    private BatchService batchService;

    @PostMapping("/save")
    public BatchResponseDTO saveBatch(@RequestBody BatchSaveDTO dto) {
        return batchService.saveBatch(dto);
    }

    @GetMapping("/get-all")
    public List<BatchResponseDTO> getAllBatches() {
        return batchService.getAllBatches();
    }

    @PutMapping("/update/{id}")
    public BatchResponseDTO updateBatch(@PathVariable Long id, @RequestBody BatchSaveDTO dto) {
        return batchService.updateBatch(id, dto);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteBatch(@PathVariable Long id) {
        batchService.deleteBatch(id);
        return "Batch deleted successfully!";
    }
}
