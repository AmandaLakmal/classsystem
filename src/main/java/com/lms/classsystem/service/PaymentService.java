package com.lms.classsystem.service;

import com.lms.classsystem.dto.PaymentResponseDTO;
import com.lms.classsystem.dto.PaymentSaveDTO;
import com.lms.classsystem.entity.Payment;
import com.lms.classsystem.entity.PaymentStatus;

import java.util.List;

public interface PaymentService {
    PaymentResponseDTO createPayment(PaymentSaveDTO dto);
    List<PaymentResponseDTO> getAllPayments();
    List<PaymentResponseDTO> getPaymentsByStudent(Long studentId);
    PaymentResponseDTO updateStatus(Long paymentId, PaymentStatus status);
    void deletePayment(Long paymentId);
}
