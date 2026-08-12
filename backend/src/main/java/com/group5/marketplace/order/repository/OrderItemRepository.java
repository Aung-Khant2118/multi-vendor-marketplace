package com.group5.marketplace.order.repository;

import com.group5.marketplace.order.entity.Order;
import com.group5.marketplace.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);

    List<OrderItem> findByVendorIdOrderByCreatedAtDesc(Long vendorId);
}