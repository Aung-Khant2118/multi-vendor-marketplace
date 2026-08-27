package com.group5.marketplace.notification.repository;

import com.group5.marketplace.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    long countByUserIdAndReadFalse(Long userId);

    @Query("UPDATE Notification n SET n.read = true WHERE n.id = :id AND n.userId = :userId")
    @org.springframework.data.jpa.repository.Modifying
    int markAsRead(@Param("id") Long id, @Param("userId") Long userId);

    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId AND n.read = false")
    @org.springframework.data.jpa.repository.Modifying
    int markAllAsRead(@Param("userId") Long userId);
}
