package com.lms.classsystem.repository;

import com.lms.classsystem.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {

    List<Notice> findByBatchId(Long batchId);

    List<Notice> findByCourseId(Long courseId);

    /**
     * Fetch notices relevant to a student:
     *  - global notices  (no batch, no course)
     *  - batch-targeted  (matches their batch)
     *  - course-targeted (matches any of their enrolled courses)
     */
    @Query("SELECT n FROM Notice n WHERE " +
           "(n.batch IS NULL AND n.course IS NULL) OR " +
           "(n.batch.id = :batchId) OR " +
           "(n.course.id IN :courseIds)")
    List<Notice> findRelevantForStudent(Long batchId, java.util.Collection<Long> courseIds);

    /** Global notices only (no batch, no course target) */
    List<Notice> findByBatchIsNullAndCourseIsNull();
}
