package com.group5.marketplace.product.repository;

import com.group5.marketplace.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"images", "category"})
    Optional<Product> findBySlug(String slug);

    @EntityGraph(attributePaths = {"images", "category"})
    List<Product> findByVendorId(Long vendorId);

    @EntityGraph(attributePaths = {"images", "category"})
    @Query("SELECT p FROM Product p WHERE " +
           "(:q IS NULL OR :q = '' OR " +
           "LOWER(p.name) LIKE '%' || LOWER(COALESCE(:q, '')) || '%' OR " +
           "LOWER(p.description) LIKE '%' || LOWER(COALESCE(:q, '')) || '%') " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:priceMin IS NULL OR p.price >= :priceMin) " +
           "AND (:priceMax IS NULL OR p.price <= :priceMax) " +
           "AND (:vendorId IS NULL OR p.vendorId = :vendorId)")
    Page<Product> search(
            @Param("q") String q,
            @Param("categoryId") Long categoryId,
            @Param("priceMin") BigDecimal priceMin,
            @Param("priceMax") BigDecimal priceMax,
            @Param("vendorId") Long vendorId,
            Pageable pageable);
}
