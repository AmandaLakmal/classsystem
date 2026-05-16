package com.lms.classsystem.repository;

import com.lms.classsystem.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByIsActiveTrue();
}
