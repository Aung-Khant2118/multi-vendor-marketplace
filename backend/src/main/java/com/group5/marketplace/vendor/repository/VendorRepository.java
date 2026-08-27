package com.group5.marketplace.vendor.repository;

import com.group5.marketplace.vendor.entity.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {

    Optional<Vendor> findByUserId(Long userId);

    Optional<Vendor> findBySlug(String slug);

    boolean existsBySlug(String slug);

    long countByStatus(Vendor.VendorStatus status);

    Page<Vendor> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Vendor> findByStatusOrderByCreatedAtDesc(Vendor.VendorStatus status, Pageable pageable);
}