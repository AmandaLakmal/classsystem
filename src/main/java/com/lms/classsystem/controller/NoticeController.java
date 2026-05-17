package com.lms.classsystem.controller;

import com.lms.classsystem.dto.NoticeDTO;
import com.lms.classsystem.service.NoticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notice")
@CrossOrigin
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    @PostMapping("/save")
    public NoticeDTO saveNotice(@RequestBody NoticeDTO dto) {
        return noticeService.saveNotice(dto);
    }

    @GetMapping("/batch/{batchId}")
    public List<NoticeDTO> getNoticesByBatch(@PathVariable Long batchId) {
        return noticeService.getNoticesByBatch(batchId);
    }
}
