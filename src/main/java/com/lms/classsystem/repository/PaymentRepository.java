package com.lms.classsystem.repository;

import com.lms.classsystem.entity.Payment;
import com.lms.classsystem.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByStudent_Id(Long studentId);

    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findByStudent_IdAndMonth(Long studentId, String month);

    List<Payment> findByStudent_IdOrderByDueDateDesc(Long studentId);

    List<Payment> findAllByOrderByDueDateDesc();
}
