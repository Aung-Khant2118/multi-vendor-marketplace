package com.group5.marketplace.common;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends transactional emails (verification, password reset).
 *
 * When SMTP is configured via `spring.mail.host`, the mail is actually sent.
 * Otherwise the message is logged to the console so local development can read
 * the generated links without requiring real SMTP credentials.
 */
@Service
public class MailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String fromAddress;

    public MailService(ObjectProvider<JavaMailSender> mailSenderProvider,
                       @Value("${app.mail.from:no-reply@marketplace.local}") String fromAddress) {
        this.mailSenderProvider = mailSenderProvider;
        this.fromAddress = fromAddress;
    }

    public void sendVerificationEmail(String to, String firstName, String verificationLink) {
        String subject = "Verify your email - Marketplace";
        String body = "Hi " + firstName + ",\n\n"
                + "Please verify your email address by clicking the link below:\n"
                + verificationLink + "\n\n"
                + "The link expires in 24 hours. If you did not create an account, you can ignore this email.";
        send(to, subject, body);
    }

    public void sendPasswordResetEmail(String to, String firstName, String resetLink) {
        String subject = "Reset your password - Marketplace";
        String body = "Hi " + firstName + ",\n\n"
                + "We received a request to reset your password. Click the link below to choose a new one:\n"
                + resetLink + "\n\n"
                + "The link expires in 1 hour. If you did not request a password reset, you can ignore this email.";
        send(to, subject, body);
    }

    private void send(String to, String subject, String body) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            System.out.println("[MailService] SMTP not configured - logging message for " + to
                    + "\n  Subject: " + subject
                    + "\n  Body:\n" + body);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}