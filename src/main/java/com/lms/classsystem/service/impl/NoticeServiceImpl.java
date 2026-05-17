package com.lms.classsystem.service.impl;

import com.lms.classsystem.dto.NoticeDTO;
import com.lms.classsystem.entity.Batch;
import com.lms.classsystem.entity.Notice;
import com.lms.classsystem.repository.BatchRepository;
import com.lms.classsystem.repository.NoticeRepository;
import com.lms.classsystem.service.NoticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoticeServiceImpl implements NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Override
    public NoticeDTO saveNotice(NoticeDTO dto) {
        Notice notice = new Notice();
        notice.setTitle(dto.getTitle());
        notice.setContent(dto.getContent());
        notice.setCreatedAt(LocalDateTime.now());
        
        if (dto.getBatchId() != null) {
            Batch batch = batchRepository.findById(dto.getBatchId())
                    .orElseThrow(() -> new RuntimeException("Batch not found"));
            notice.setBatch(batch);
        }

        Notice saved = noticeRepository.save(notice);
        return new NoticeDTO(saved.getId(), saved.getTitle(), saved.getContent(), saved.getCreatedAt(), saved.getBatch() != null ? saved.getBatch().getId() : null);
    }

    @Override
    public List<NoticeDTO> getNoticesByBatch(Long batchId) {
        return noticeRepository.findByBatchId(batchId).stream().map(saved -> 
            new NoticeDTO(saved.getId(), saved.getTitle(), saved.getContent(), saved.getCreatedAt(), saved.getBatch() != null ? saved.getBatch().getId() : null)
        ).collect(Collectors.toList());
    }
}
