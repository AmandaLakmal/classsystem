package com.lms.classsystem.service;

import com.lms.classsystem.entity.Instructor;
import com.lms.classsystem.entity.Payment;
import com.lms.classsystem.entity.Student;

/**
 * Notification Engine — sends SMS and Email notifications for key system events.
 * Implementations must gracefully handle missing credentials (no crash on empty keys).
 */
public interface NotificationService {

    /**
     * Notifies a teacher that a new student has registered for their subject.
     * Trigger: When a student is saved/registered.
     */
    void notifyTeacherNewStudent(Instructor instructor, Student student);

    /**
     * Sends a registration confirmation (welcome) to the newly registered student.
     * Trigger: Immediately after a student record is created.
     */
    void sendRegistrationConfirmation(Student student);

    /**
     * Reminds a student that their monthly fee is due soon.
     * Trigger: When a payment is created with PENDING status.
     */
    void sendFeeReminder(Student student, Payment payment);

    /**
     * Sends a receipt to the student after their fee is marked as PAID.
     * Trigger: When payment status is updated to PAID.
     */
    void sendPaymentReceipt(Student student, Payment payment);

    /**
     * Sends a general subject notice/announcement to a student.
     * Trigger: Manually from a notice endpoint.
     */
    void sendSubjectNotice(Student student, String noticeTitle, String message);

    /**
     * Alerts a student about a class postponement or holiday.
     * Trigger: When a class-cancelled notice is created.
     */
    void sendClassAlert(Student student, String message);
}
