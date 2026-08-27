package com.group5.marketplace.audit.service;

import com.group5.marketplace.audit.entity.AuditLog;
import com.group5.marketplace.audit.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public AuditLog log(Long actorId, String actorEmail, String action,
                        String entityType, Long entityId, String details, String ipAddress) {
        AuditLog entry = AuditLog.builder()
                .actorId(actorId)
                .actorEmail(actorEmail)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .build();
        return auditLogRepository.save(entry);
    }

    public Page<AuditLog> getAll(int page, int size) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    public Page<AuditLog> getByAction(String action, int page, int size) {
        return auditLogRepository.findByActionOrderByCreatedAtDesc(action, PageRequest.of(page, size));
    }

    public Page<AuditLog> getByEntityType(String entityType, int page, int size) {
        return auditLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType, PageRequest.of(page, size));
    }
}
