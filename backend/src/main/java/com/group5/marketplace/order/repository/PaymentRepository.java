package com.group5.marketplace.order.repository;

import com.group5.marketplace.order.entity.Payment;
import com.group5.marketplace.order.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findFirstByOrderIdOrderByIdDesc(Long orderId);

    List<Payment> findByStatus(PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") PaymentStatus status);

    @Query("SELECT p FROM Payment p WHERE p.orderId IN :orderIds ORDER BY p.orderId, p.id DESC")
    List<Payment> findLatestByOrderIds(@Param("orderIds") Set<Long> orderIds);

    @Query(value = "SELECT TO_CHAR(p.created_at, 'YYYY-MM') AS month, COALESCE(SUM(p.amount), 0) " +
           "FROM payments p WHERE p.status = :status AND p.created_at >= :since " +
           "GROUP BY TO_CHAR(p.created_at, 'YYYY-MM') ORDER BY month", nativeQuery = true)
    List<Object[]> sumAmountByStatusAndMonth(@Param("status") String status, @Param("since") java.time.LocalDateTime since);
}