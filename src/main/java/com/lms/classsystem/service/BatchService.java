package com.lms.classsystem.service;

import com.lms.classsystem.entity.Batch;

import java.util.List;

public interface BatchService {
    Batch saveBatch(Batch batch);
    List<Batch> getAllBatche();
}
