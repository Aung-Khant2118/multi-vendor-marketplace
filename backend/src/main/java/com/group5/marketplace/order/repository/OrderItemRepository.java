package com.group5.marketplace.order.repository;

import com.group5.marketplace.order.entity.Order;
import com.group5.marketplace.order.entity.OrderItem;
import com.group5.marketplace.order.entity.OrderItemStatus;
import com.group5.marketplace.product.entity.ProductVariant;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @EntityGraph(attributePaths = {"order"})
    List<OrderItem> findByOrder(Order order);

    @EntityGraph(attributePaths = {"order"})
    List<OrderItem> findByOrderIdIn(Collection<Long> orderIds);

    @EntityGraph(attributePaths = {"order"})
    List<OrderItem> findByVendorIdOrderByCreatedAtDesc(Long vendorId);

    @Query("SELECT COALESCE(SUM(oi.subtotal), 0) FROM OrderItem oi WHERE oi.vendorId = :vendorId")
    BigDecimal sumRevenueByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT COUNT(DISTINCT oi.order.id) FROM OrderItem oi WHERE oi.vendorId = :vendorId")
    long countDistinctOrdersByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.vendorId = :vendorId AND oi.status = :status")
    long countByVendorIdAndStatus(@Param("vendorId") Long vendorId, @Param("status") OrderItemStatus status);

    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.vendorId = :vendorId")
    long countByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT oi.variantId, COALESCE(SUM(oi.subtotal), 0) AS revenue, COALESCE(SUM(oi.quantity), 0) AS sales FROM OrderItem oi WHERE oi.vendorId = :vendorId GROUP BY oi.variantId ORDER BY revenue DESC")
    List<Object[]> findTopProductsByRevenue(@Param("vendorId") Long vendorId, org.springframework.data.domain.Pageable pageable);

    @Query(value = "SELECT TO_CHAR(oi.created_at, 'YYYY-MM') AS month, COALESCE(SUM(oi.subtotal), 0) " +
           "FROM order_items oi WHERE oi.vendor_id = :vendorId AND oi.created_at >= :since " +
           "GROUP BY TO_CHAR(oi.created_at, 'YYYY-MM') ORDER BY month", nativeQuery = true)
    List<Object[]> sumRevenueByVendorIdAndMonth(@Param("vendorId") Long vendorId, @Param("since") java.time.LocalDateTime since);

    @Query(value = "SELECT TO_CHAR(oi.created_at, 'YYYY-MM') AS month, COUNT(DISTINCT oi.order_id) " +
           "FROM order_items oi WHERE oi.vendor_id = :vendorId AND oi.created_at >= :since " +
           "GROUP BY TO_CHAR(oi.created_at, 'YYYY-MM') ORDER BY month", nativeQuery = true)
    List<Object[]> countOrdersByVendorIdAndMonth(@Param("vendorId") Long vendorId, @Param("since") java.time.LocalDateTime since);

    @Query("SELECT oi.status, COUNT(oi) FROM OrderItem oi WHERE oi.vendorId = :vendorId GROUP BY oi.status")
    List<Object[]> countByVendorIdAndStatusGroup(@Param("vendorId") Long vendorId);

    @Query("SELECT DISTINCT oi.variantId FROM OrderItem oi WHERE oi.order.id IN " +
           "(SELECT DISTINCT oi2.order.id FROM OrderItem oi2 WHERE oi2.variantId IN :variantIds) " +
           "AND oi.variantId NOT IN :variantIds")
    List<Long> findVariantIdsBoughtTogether(@Param("variantIds") List<Long> variantIds);

    @Query("SELECT oi.variantId, COUNT(oi) AS cnt FROM OrderItem oi " +
           "WHERE oi.createdAt >= :since " +
           "GROUP BY oi.variantId ORDER BY cnt DESC")
    List<Object[]> findTrendingVariantIds(@Param("since") java.time.LocalDateTime since, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT DISTINCT oi.variantId FROM OrderItem oi WHERE oi.order.id IN " +
           "(SELECT DISTINCT oi2.order.id FROM OrderItem oi2 WHERE oi2.variantId IN :variantIds) " +
           "AND oi.variantId NOT IN :variantIds")
    List<Long> findSimilarPurchasedVariantIds(@Param("variantIds") List<Long> variantIds);

    @Query("SELECT DISTINCT v.product.id FROM OrderItem oi " +
           "JOIN ProductVariant v ON oi.variantId = v.id " +
           "WHERE oi.order.id IN (SELECT o.id FROM Order o WHERE o.userId = :userId)")
    List<Long> findProductIdsByUserId(@Param("userId") Long userId);
}