package com.group5.marketplace.vendor.repository;

import com.group5.marketplace.vendor.entity.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {

    Optional<Vendor> findByUserId(Long userId);

    List<Vendor> findByUserIdIn(Collection<Long> userIds);

    List<Vendor> findByIdIn(Collection<Long> ids);

    Optional<Vendor> findBySlug(String slug);

    boolean existsBySlug(String slug);

    long countByStatus(Vendor.VendorStatus status);

    Page<Vendor> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Vendor> findByStatusOrderByCreatedAtDesc(Vendor.VendorStatus status, Pageable pageable);

    @Query("SELECT v FROM Vendor v WHERE v.status = 'ACTIVE' AND (LOWER(v.storeName) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(v.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Vendor> searchByName(@Param("q") String q, Pageable pageable);

    @Query(value = "SELECT TO_CHAR(v.created_at, 'YYYY-MM') AS month, COUNT(v.id) " +
           "FROM vendors v WHERE v.created_at >= :since " +
           "GROUP BY TO_CHAR(v.created_at, 'YYYY-MM') ORDER BY month", nativeQuery = true)
    List<Object[]> countVendorsByMonth(@Param("since") java.time.LocalDateTime since);
}