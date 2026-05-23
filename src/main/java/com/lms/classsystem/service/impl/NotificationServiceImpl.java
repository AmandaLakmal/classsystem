package com.lms.classsystem.service.impl;

import com.lms.classsystem.entity.Instructor;
import com.lms.classsystem.entity.Payment;
import com.lms.classsystem.entity.Student;
import com.lms.classsystem.service.NotificationService;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Notification Engine Implementation.
 *
 * Sends both SMS (Twilio) and Email (Spring Mail) for each trigger.
 *
 * SAFETY: Both channels are guarded with blank-credential checks.
 * The application starts and functions normally even if SMTP / Twilio
 * credentials are not set — it simply logs a warning and skips sending.
 */
@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String smtpUser;

    @Value("${twilio.account.sid:}")
    private String twilioSid;

    @Value("${twilio.auth.token:}")
    private String twilioToken;

    @Value("${twilio.from.number:}")
    private String twilioFrom;

    @Value("${app.name:ZeroState LMS}")
    private String appName;

    // ── Public trigger methods ────────────────────────────────────────────────

    @Override
    public void notifyTeacherNewStudent(Instructor instructor, Student student) {
        if (instructor == null || instructor.getEmail() == null) return;

        String subject = "[" + appName + "] New Student Registered for Your Subject";
        String body = buildHtml(
            "New Student Registration",
            "Hello " + instructor.getName() + ",",
            "A new student has been registered under your subject <strong>" + instructor.getSubject() + "</strong>.<br><br>" +
            "<strong>Student:</strong> " + student.getFirstName() + " " + student.getLastName() + "<br>" +
            "<strong>Reg ID:</strong> " + student.getStudentRegId() + "<br>" +
            "<strong>Email:</strong> " + student.getEmail()
        );

        sendEmail(instructor.getEmail(), subject, body);

        if (instructor.getContactNumber() != null) {
            sendSms(instructor.getContactNumber(),
                "[" + appName + "] New student " + student.getFirstName() + " " + student.getLastName() +
                " registered for " + instructor.getSubject() + ". Reg ID: " + student.getStudentRegId());
        }
    }

    @Override
    public void sendRegistrationConfirmation(Student student) {
        if (student == null || student.getEmail() == null) return;

        String subject = "[" + appName + "] Welcome! Your Registration is Confirmed";
        String body = buildHtml(
            "Registration Confirmed 🎉",
            "Dear " + student.getFirstName() + ",",
            "Congratulations! You are now officially enrolled at <strong>" + appName + "</strong>.<br><br>" +
            "<strong>Your Student ID:</strong> " + student.getStudentRegId() + "<br>" +
            "<strong>Email (Login):</strong> " + student.getEmail() + "<br><br>" +
            "Please keep your login credentials safe. You can access your student portal at any time."
        );

        sendEmail(student.getEmail(), subject, body);

        if (student.getContactNumber() != null) {
            sendSms(student.getContactNumber(),
                "[" + appName + "] Welcome, " + student.getFirstName() + "! Your registration is confirmed. Student ID: " + student.getStudentRegId());
        }
    }

    @Override
    public void sendFeeReminder(Student student, Payment payment) {
        if (student == null || student.getEmail() == null) return;

        String subject = "[" + appName + "] Monthly Fee Due — " + payment.getMonth();
        String body = buildHtml(
            "Fee Payment Reminder",
            "Dear " + student.getFirstName() + ",",
            "This is a reminder that your monthly tuition fee is due.<br><br>" +
            "<strong>Month:</strong> " + payment.getMonth() + "<br>" +
            "<strong>Amount Due:</strong> LKR " + payment.getAmount() + "<br>" +
            "<strong>Due Date:</strong> " + payment.getDueDate() + "<br><br>" +
            "Please make your payment before the due date to avoid late fees."
        );

        sendEmail(student.getEmail(), subject, body);

        if (student.getContactNumber() != null) {
            sendSms(student.getContactNumber(),
                "[" + appName + "] Fee due: LKR " + payment.getAmount() + " for " + payment.getMonth() +
                ". Due: " + payment.getDueDate());
        }
    }

    @Override
    public void sendPaymentReceipt(Student student, Payment payment) {
        if (student == null || student.getEmail() == null) return;

        String subject = "[" + appName + "] Payment Receipt — " + payment.getMonth();
        String body = buildHtml(
            "Payment Received ✅",
            "Dear " + student.getFirstName() + ",",
            "Your payment has been received and confirmed. Thank you!<br><br>" +
            "<strong>Month:</strong> " + payment.getMonth() + "<br>" +
            "<strong>Amount Paid:</strong> LKR " + payment.getAmount() + "<br>" +
            "<strong>Payment Date:</strong> " + payment.getPaidDate() + "<br>" +
            "<strong>Status:</strong> PAID<br><br>" +
            "Please retain this message as your receipt."
        );

        sendEmail(student.getEmail(), subject, body);

        if (student.getContactNumber() != null) {
            sendSms(student.getContactNumber(),
                "[" + appName + "] PAID: LKR " + payment.getAmount() + " for " + payment.getMonth() +
                " received on " + payment.getPaidDate() + ". Thank you!");
        }
    }

    @Override
    public void sendSubjectNotice(Student student, String noticeTitle, String message) {
        if (student == null || student.getEmail() == null) return;

        String subject = "[" + appName + "] Notice: " + noticeTitle;
        String body = buildHtml("Subject Notice", "Dear " + student.getFirstName() + ",", message);

        sendEmail(student.getEmail(), subject, body);

        if (student.getContactNumber() != null) {
            sendSms(student.getContactNumber(), "[" + appName + "] Notice: " + noticeTitle + " — " + message);
        }
    }

    @Override
    public void sendClassAlert(Student student, String message) {
        if (student == null || student.getEmail() == null) return;

        String subject = "[" + appName + "] Class Alert";
        String body = buildHtml("⚠️ Class Alert", "Dear " + student.getFirstName() + ",", message);

        sendEmail(student.getEmail(), subject, body);

        if (student.getContactNumber() != null) {
            sendSms(student.getContactNumber(), "[" + appName + "] CLASS ALERT: " + message);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void sendEmail(String to, String subject, String htmlBody) {
        if (smtpUser == null || smtpUser.isBlank()) {
            log.warn("[NotificationService] SMTP not configured (SMTP_USER is empty). Skipping email to: {}", to);
            return;
        }
        if (mailSender == null) {
            log.warn("[NotificationService] JavaMailSender bean not available. Skipping email to: {}", to);
            return;
        }
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(smtpUser);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mime);
            log.info("[NotificationService] Email sent to: {}", to);
        } catch (Exception e) {
            log.error("[NotificationService] Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private void sendSms(String toNumber, String body) {
        if (twilioSid == null || twilioSid.isBlank() ||
            twilioToken == null || twilioToken.isBlank() ||
            twilioFrom == null || twilioFrom.isBlank()) {
            log.warn("[NotificationService] Twilio not configured. Skipping SMS to: {}", toNumber);
            return;
        }
        // Ensure number starts with + (international format)
        String formattedTo = toNumber.startsWith("+") ? toNumber : "+94" + toNumber.replaceFirst("^0", "");
        try {
            Twilio.init(twilioSid, twilioToken);
            Message.creator(
                new PhoneNumber(formattedTo),
                new PhoneNumber(twilioFrom),
                body
            ).create();
            log.info("[NotificationService] SMS sent to: {}", formattedTo);
        } catch (Exception e) {
            log.error("[NotificationService] Failed to send SMS to {}: {}", formattedTo, e.getMessage());
        }
    }

    /**
     * Builds a consistent, branded HTML email body.
     */
    private String buildHtml(String heading, String greeting, String contentHtml) {
        return "<!DOCTYPE html><html><body style=\"margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif\">" +
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"><tr><td align=\"center\" style=\"padding:40px 16px\">" +
            "<table width=\"580\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)\">" +
            "<tr><td style=\"background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px\">" +
            "<h1 style=\"margin:0;color:#fff;font-size:22px;font-weight:700\">" + appName + "</h1>" +
            "<p style=\"margin:4px 0 0;color:rgba(255,255,255,.75);font-size:13px\">Learning Management System</p>" +
            "</td></tr>" +
            "<tr><td style=\"padding:32px 40px\">" +
            "<h2 style=\"margin:0 0 16px;color:#1e293b;font-size:18px\">" + heading + "</h2>" +
            "<p style=\"color:#475569;font-size:14px;margin:0 0 12px\">" + greeting + "</p>" +
            "<p style=\"color:#475569;font-size:14px;line-height:1.7;margin:0\">" + contentHtml + "</p>" +
            "</td></tr>" +
            "<tr><td style=\"padding:24px 40px;border-top:1px solid #f1f5f9;background:#f8fafc\">" +
            "<p style=\"margin:0;color:#94a3b8;font-size:12px\">This is an automated message from " + appName + ". Please do not reply to this email.</p>" +
            "</td></tr>" +
            "</table></td></tr></table></body></html>";
    }
}
