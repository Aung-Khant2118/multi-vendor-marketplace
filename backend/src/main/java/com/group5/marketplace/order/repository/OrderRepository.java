package com.group5.marketplace.order.repository;

import com.group5.marketplace.order.entity.Order;
import com.group5.marketplace.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query(value = "SELECT TO_CHAR(o.created_at, 'YYYY-MM') AS month, COUNT(o.id) " +
           "FROM orders o WHERE o.created_at >= :since " +
           "GROUP BY TO_CHAR(o.created_at, 'YYYY-MM') ORDER BY month", nativeQuery = true)
    List<Object[]> countOrdersByMonth(@Param("since") java.time.LocalDateTime since);

    @Query(value = "SELECT TO_CHAR(o.created_at, 'YYYY-MM') AS month, COALESCE(SUM(o.total), 0) " +
           "FROM orders o WHERE o.created_at >= :since " +
           "GROUP BY TO_CHAR(o.created_at, 'YYYY-MM') ORDER BY month", nativeQuery = true)
    List<Object[]> sumRevenueByMonth(@Param("since") java.time.LocalDateTime since);

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countByStatusGroup();

    @Query(value = "SELECT TO_CHAR(o.created_at, 'YYYY-MM-DD') AS day, COUNT(o.id) " +
           "FROM orders o WHERE o.created_at >= :since " +
           "GROUP BY TO_CHAR(o.created_at, 'YYYY-MM-DD') ORDER BY day", nativeQuery = true)
    List<Object[]> countOrdersByDay(@Param("since") java.time.LocalDateTime since);

    @Query("SELECT o.status, COUNT(DISTINCT o) FROM Order o " +
           "JOIN o.items oi WHERE oi.vendorId = :vendorId GROUP BY o.status")
    List<Object[]> countByStatusGroupForVendor(@Param("vendorId") Long vendorId);
}