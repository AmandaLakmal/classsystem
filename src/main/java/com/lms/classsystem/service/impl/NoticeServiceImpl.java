package com.lms.classsystem.service.impl;

import com.lms.classsystem.dto.NoticeDTO;
import com.lms.classsystem.entity.Batch;
import com.lms.classsystem.entity.Course;
import com.lms.classsystem.entity.Notice;
import com.lms.classsystem.repository.BatchRepository;
import com.lms.classsystem.repository.CourseRepository;
import com.lms.classsystem.repository.NoticeRepository;
import com.lms.classsystem.service.NoticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoticeServiceImpl implements NoticeService {

    @Autowired private NoticeRepository noticeRepository;
    @Autowired private BatchRepository  batchRepository;
    @Autowired private CourseRepository courseRepository;

    // ── Mapper ────────────────────────────────────────────────────────────────
    private NoticeDTO toDTO(Notice n) {
        return new NoticeDTO(
            n.getId(),
            n.getTitle(),
            n.getContent(),
            n.getCreatedAt(),
            n.getBatch()  != null ? n.getBatch().getId()    : null,
            n.getCourse() != null ? n.getCourse().getId()   : null,
            n.getCourse() != null ? n.getCourse().getCourseName() : null
        );
    }

    private void applyDTO(Notice notice, NoticeDTO dto) {
        notice.setTitle(dto.getTitle());
        notice.setContent(dto.getContent());

        if (dto.getBatchId() != null) {
            Batch batch = batchRepository.findById(dto.getBatchId())
                    .orElseThrow(() -> new RuntimeException("Batch not found: " + dto.getBatchId()));
            notice.setBatch(batch);
        } else {
            notice.setBatch(null);
        }

        if (dto.getCourseId() != null) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found: " + dto.getCourseId()));
            notice.setCourse(course);
        } else {
            notice.setCourse(null);
        }
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    @Override
    public NoticeDTO saveNotice(NoticeDTO dto) {
        Notice notice = new Notice();
        notice.setCreatedAt(LocalDateTime.now());
        applyDTO(notice, dto);
        return toDTO(noticeRepository.save(notice));
    }

    @Override
    public NoticeDTO updateNotice(Long id, NoticeDTO dto) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found: " + id));
        applyDTO(notice, dto);
        return toDTO(noticeRepository.save(notice));
    }

    @Override
    public void deleteNotice(Long id) {
        noticeRepository.deleteById(id);
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    @Override
    public List<NoticeDTO> getAllNotices() {
        return noticeRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<NoticeDTO> getNoticesByBatch(Long batchId) {
        return noticeRepository.findByBatchId(batchId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<NoticeDTO> getNoticesByCourse(Long courseId) {
        return noticeRepository.findByCourseId(courseId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<NoticeDTO> getRelevantNotices(Long batchId, List<Long> courseIds) {
        // Guard: if courseIds is empty pass a dummy ID so the IN clause doesn't crash
        List<Long> safeIds = (courseIds == null || courseIds.isEmpty())
                ? List.of(-1L)
                : courseIds;
        return noticeRepository.findRelevantForStudent(batchId, safeIds)
                               .stream().map(this::toDTO).collect(Collectors.toList());
    }
}
