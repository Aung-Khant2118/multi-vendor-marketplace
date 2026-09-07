package com.group5.marketplace.product.repository.variant;

import com.group5.marketplace.product.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductId(Long productId);

    List<ProductVariant> findByIdIn(Set<Long> ids);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM ProductVariant v WHERE v.id = :id")
    Optional<ProductVariant> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT COALESCE(SUM(v.stock), 0) FROM ProductVariant v WHERE v.product.vendorId = :vendorId")
    long sumStockByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT COUNT(v) FROM ProductVariant v WHERE v.product.vendorId = :vendorId")
    long countByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT v.product.id FROM ProductVariant v WHERE v.id IN :variantIds")
    List<Long> findProductIdsByVariantIds(@Param("variantIds") Set<Long> variantIds);
}

