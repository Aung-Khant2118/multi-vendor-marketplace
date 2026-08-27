package com.group5.marketplace.order.repository;

import com.group5.marketplace.order.entity.Payment;
import com.group5.marketplace.order.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findFirstByOrderIdOrderByIdDesc(Long orderId);

    List<Payment> findByStatus(PaymentStatus status);
}