package com.lms.classsystem.service.impl;

import com.lms.classsystem.dto.PaymentResponseDTO;
import com.lms.classsystem.dto.PaymentSaveDTO;
import com.lms.classsystem.entity.*;
import com.lms.classsystem.repository.CourseRepository;
import com.lms.classsystem.repository.PaymentRepository;
import com.lms.classsystem.repository.StudentRepository;
import com.lms.classsystem.service.NotificationService;
import com.lms.classsystem.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public PaymentResponseDTO createPayment(PaymentSaveDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found: " + dto.getStudentId()));

        Course course = null;
        if (dto.getCourseId() != null) {
            course = courseRepository.findById(dto.getCourseId()).orElse(null);
        }

        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setCourse(course);
        payment.setAmount(dto.getAmount());
        payment.setMonth(dto.getMonth());
        payment.setDueDate(dto.getDueDate());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setNotes(dto.getNotes());

        Payment saved = paymentRepository.save(payment);

        // Auto-trigger fee reminder notification
        try {
            notificationService.sendFeeReminder(student, saved);
        } catch (Exception e) {
            // Notification failures must never block the business operation
        }

        return toDTO(saved);
    }

    @Override
    public List<PaymentResponseDTO> getAllPayments() {
        return paymentRepository.findAllByOrderByDueDateDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponseDTO> getPaymentsByStudent(Long studentId) {
        return paymentRepository.findByStudent_IdOrderByDueDateDesc(studentId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public PaymentResponseDTO updateStatus(Long paymentId, PaymentStatus status) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        payment.setStatus(status);

        if (status == PaymentStatus.PAID) {
            payment.setPaidDate(LocalDate.now());
            // Auto-trigger receipt notification
            try {
                notificationService.sendPaymentReceipt(payment.getStudent(), payment);
            } catch (Exception e) {
                // Notification failures must never block the business operation
            }
        }

        return toDTO(paymentRepository.save(payment));
    }

    @Override
    public void deletePayment(Long paymentId) {
        paymentRepository.deleteById(paymentId);
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private PaymentResponseDTO toDTO(Payment p) {
        return new PaymentResponseDTO(
                p.getId(),
                p.getStudent().getId(),
                p.getStudent().getFirstName() + " " + p.getStudent().getLastName(),
                p.getStudent().getStudentRegId(),
                p.getCourse() != null ? p.getCourse().getId() : null,
                p.getCourse() != null ? p.getCourse().getCourseName() : null,
                p.getAmount(),
                p.getMonth(),
                p.getDueDate(),
                p.getPaidDate(),
                p.getStatus(),
                p.getNotes()
        );
    }
}
