package com.lms.classsystem.service;

import com.lms.classsystem.dto.NoticeDTO;
import java.util.List;

public interface NoticeService {
    NoticeDTO saveNotice(NoticeDTO dto);
    NoticeDTO updateNotice(Long id, NoticeDTO dto);
    void deleteNotice(Long id);
    List<NoticeDTO> getAllNotices();
    List<NoticeDTO> getNoticesByBatch(Long batchId);
    List<NoticeDTO> getNoticesByCourse(Long courseId);
    List<NoticeDTO> getRelevantNotices(Long batchId, List<Long> courseIds);
}
