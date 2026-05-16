package com.lms.classsystem.controller;

import com.lms.classsystem.entity.Batch;
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
    public Batch saveBatch(@RequestBody Batch batch){
        return batchService.saveBatch(batch);
    }

    @GetMapping("/get-all")
    public List<Batch> getAllBatches(){
        return batchService.getAllBatche();
    }
}
