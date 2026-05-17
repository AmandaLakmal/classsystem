package com.lms.classsystem.service;

import com.lms.classsystem.dto.NoticeDTO;
import java.util.List;

public interface NoticeService {
    NoticeDTO saveNotice(NoticeDTO dto);
    List<NoticeDTO> getNoticesByBatch(Long batchId);
}
