package com.lms.classsystem.controller;

import com.lms.classsystem.dto.LessionSaveDTO;
import com.lms.classsystem.dto.LessionResponseDTO;
import com.lms.classsystem.service.LessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lession")
@CrossOrigin
public class LessionController {

    @Autowired
    private LessionService lessionService;

    @PostMapping("/save")
    public LessionResponseDTO saveLession(@RequestBody LessionSaveDTO dto) {
        return lessionService.saveLession(dto);
    }

    @GetMapping("/get-all")
    public List<LessionResponseDTO> getAllLessions() {
        return lessionService.getAllLessions();
    }

    @PutMapping("/update/{id}")
    public LessionResponseDTO updateLession(@PathVariable Long id, @RequestBody LessionSaveDTO dto) {
        return lessionService.updateLession(id, dto);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteLession(@PathVariable Long id) {
        lessionService.deleteLession(id);
        return "Lession deleted successfully!";
    }

    @GetMapping("/view/{id}")
    public LessionResponseDTO viewLesson(@PathVariable Long id, java.security.Principal principal) {
        return lessionService.viewLesson(id, principal.getName());
    }
}
