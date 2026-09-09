package com.group5.marketplace.order.repository;

import com.group5.marketplace.order.entity.Order;
import com.group5.marketplace.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Query(value = "SELECT o.status, COUNT(o.id) FROM orders o GROUP BY o.status", nativeQuery = true)
    List<Object[]> countByStatusGroup();

    @Query(value = "SELECT TO_CHAR(o.created_at, 'YYYY-MM-DD') AS day, COUNT(o.id) " +
           "FROM orders o WHERE o.created_at >= :since " +
           "GROUP BY TO_CHAR(o.created_at, 'YYYY-MM-DD') ORDER BY day", nativeQuery = true)
    List<Object[]> countOrdersByDay(@Param("since") java.time.LocalDateTime since);

    @Query(value = "SELECT o.status, COUNT(DISTINCT o.id) FROM orders o " +
           "JOIN order_items oi ON oi.order_id = o.id WHERE oi.vendor_id = :vendorId GROUP BY o.status", nativeQuery = true)
    List<Object[]> countByStatusGroupForVendor(@Param("vendorId") Long vendorId);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :id")
    Order findByIdWithItems(@Param("id") Long id);
}