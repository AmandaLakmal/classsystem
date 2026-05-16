package com.lms.classsystem.service.impl;

import com.lms.classsystem.entity.Batch;
import com.lms.classsystem.repository.BatchRepository;
import com.lms.classsystem.service.BatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BatchServiceImpl implements BatchService {

    @Autowired
    private BatchRepository batchRepository;

    @Override
    public Batch saveBatch(Batch batch) {
        return batchRepository.save(batch);
    }

    @Override
    public List<Batch> getAllBatche() {
        return batchRepository.findAll();
    }
}
