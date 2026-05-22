package com.lms.classsystem.controller;

import com.lms.classsystem.dto.NoticeDTO;
import com.lms.classsystem.service.NoticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notice")
@CrossOrigin
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    // ── Create ────────────────────────────────────────────────────────────────
    @PostMapping("/save")
    public ResponseEntity<NoticeDTO> saveNotice(@RequestBody NoticeDTO dto) {
        return ResponseEntity.ok(noticeService.saveNotice(dto));
    }

    // ── Update ────────────────────────────────────────────────────────────────
    @PutMapping("/update/{id}")
    public ResponseEntity<NoticeDTO> updateNotice(@PathVariable Long id, @RequestBody NoticeDTO dto) {
        return ResponseEntity.ok(noticeService.updateNotice(id, dto));
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Notice deleted."));
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    @GetMapping("/get-all")
    public ResponseEntity<List<NoticeDTO>> getAllNotices() {
        return ResponseEntity.ok(noticeService.getAllNotices());
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<NoticeDTO>> getNoticesByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(noticeService.getNoticesByBatch(batchId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<NoticeDTO>> getNoticesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(noticeService.getNoticesByCourse(courseId));
    }

    /**
     * Student portal endpoint: returns all notices relevant to a student
     * (global + batch-targeted + any of their enrolled courses).
     *
     * Usage: GET /api/v1/notice/relevant?batchId=2&courseIds=1,3,5
     */
    @GetMapping("/relevant")
    public ResponseEntity<List<NoticeDTO>> getRelevantNotices(
            @RequestParam(required = false) Long batchId,
            @RequestParam(required = false) List<Long> courseIds) {
        return ResponseEntity.ok(noticeService.getRelevantNotices(batchId, courseIds));
    }
}
