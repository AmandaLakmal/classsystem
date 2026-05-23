package com.lms.classsystem.controller;

import com.lms.classsystem.dto.PaymentResponseDTO;
import com.lms.classsystem.dto.PaymentSaveDTO;
import com.lms.classsystem.entity.PaymentStatus;
import com.lms.classsystem.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payment")
@CrossOrigin
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    /** Create a new payment record (Admin only). */
    @PostMapping("/save")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public PaymentResponseDTO createPayment(@RequestBody PaymentSaveDTO dto) {
        return paymentService.createPayment(dto);
    }

    /** Get all payments — for the billing dashboard. */
    @GetMapping("/get-all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public List<PaymentResponseDTO> getAllPayments() {
        return paymentService.getAllPayments();
    }

    /** Get all payments for a specific student. */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public List<PaymentResponseDTO> getPaymentsByStudent(@PathVariable Long studentId) {
        return paymentService.getPaymentsByStudent(studentId);
    }

    /** Update the payment status (e.g. mark as PAID). Triggers receipt notification. */
    @PutMapping("/update-status/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public PaymentResponseDTO updateStatus(
            @PathVariable Long id,
            @RequestParam PaymentStatus status) {
        return paymentService.updateStatus(id, status);
    }

    /** Delete a payment record (Admin only). */
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public String deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return "Payment deleted";
    }
}
