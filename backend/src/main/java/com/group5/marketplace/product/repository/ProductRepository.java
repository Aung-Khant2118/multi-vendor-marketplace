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
import java.util.Set;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"images", "category"})
    Optional<Product> findBySlug(String slug);

    @EntityGraph(attributePaths = {"images", "category"})
    List<Product> findByVendorId(Long vendorId);

    long countByVendorId(Long vendorId);

    @EntityGraph(attributePaths = {"images", "category"})
    Optional<Product> findWithImagesById(Long id);

    @EntityGraph(attributePaths = {"images", "category", "variants", "variants.attributes"})
    @Query("SELECT p FROM Product p " +
           "WHERE (:q IS NULL OR :q = '' OR " +
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

    @Query(value = "SELECT p.id FROM products p " +
           "WHERE (:q IS NULL OR :q = '' OR " +
           "p.search_vector @@ plainto_tsquery('english', :q) OR " +
           "p.name ILIKE '%' || :q || '%' OR " +
           "p.description ILIKE '%' || :q || '%') " +
           "AND (:categoryId::bigint IS NULL OR p.category_id = :categoryId) " +
           "AND (:priceMin::numeric IS NULL OR p.price >= :priceMin) " +
           "AND (:priceMax::numeric IS NULL OR p.price <= :priceMax) " +
           "AND (:vendorId::bigint IS NULL OR p.vendor_id = :vendorId) " +
            "ORDER BY " +
            "CASE WHEN :sort = 'price_asc' THEN p.price END ASC NULLS LAST, " +
            "CASE WHEN :sort = 'price_desc' THEN p.price END DESC NULLS LAST, " +
            "CASE WHEN :sort = 'name' THEN p.name END ASC NULLS LAST, " +
            "CASE WHEN :sort = 'newest' THEN p.created_at END DESC NULLS LAST, " +
            "CASE WHEN :sort = 'oldest' THEN p.created_at END ASC NULLS LAST, " +
            "CASE WHEN :sort = 'rating' THEN p.average_rating END DESC NULLS LAST, " +
            "CASE WHEN (:sort = 'relevance' OR :sort IS NULL OR :sort = '') THEN " +
            "  ts_rank(p.search_vector, plainto_tsquery('english', COALESCE(:q, ''))) END DESC NULLS LAST, " +
            "p.created_at DESC",
           countQuery = "SELECT COUNT(*) FROM products p " +
           "WHERE (:q IS NULL OR :q = '' OR " +
           "p.search_vector @@ plainto_tsquery('english', :q) OR " +
           "p.name ILIKE '%' || :q || '%' OR " +
           "p.description ILIKE '%' || :q || '%') " +
           "AND (:categoryId::bigint IS NULL OR p.category_id = :categoryId) " +
           "AND (:priceMin::numeric IS NULL OR p.price >= :priceMin) " +
           "AND (:priceMax::numeric IS NULL OR p.price <= :priceMax) " +
           "AND (:vendorId::bigint IS NULL OR p.vendor_id = :vendorId)",
           nativeQuery = true)
    Page<Long> searchFullTextIds(
            @Param("q") String q,
            @Param("categoryId") Long categoryId,
            @Param("priceMin") BigDecimal priceMin,
            @Param("priceMax") BigDecimal priceMax,
            @Param("vendorId") Long vendorId,
            @Param("sort") String sort,
            Pageable pageable);

    @Query(value = "SELECT p.* FROM products p " +
           "WHERE p.name ILIKE '%' || :q || '%' " +
           "ORDER BY " +
           "CASE WHEN p.search_vector IS NOT NULL THEN " +
           "  ts_rank(p.search_vector, plainto_tsquery('english', :q)) END DESC NULLS LAST, " +
           "p.name ASC " +
           "LIMIT :limit",
           nativeQuery = true)
    List<Product> autocomplete(@Param("q") String q, @Param("limit") int limit);

    @EntityGraph(attributePaths = {"images", "category"})
    List<Product> findByIdIn(Set<Long> ids);

    @Query("SELECT p.id FROM Product p WHERE p.vendorId = :vendorId")
    List<Long> findIdsByVendorId(@Param("vendorId") Long vendorId);

    @EntityGraph(attributePaths = {"images", "category"})
    @Query("SELECT p FROM Product p")
    List<Product> findAllWithImages();

    @EntityGraph(attributePaths = {"images", "category"})
    @Query("SELECT p FROM Product p WHERE p.id IN :ids")
    List<Product> findByIdInWithImages(@Param("ids") List<Long> ids);

    @EntityGraph(attributePaths = {"images", "category", "variants", "variants.attributes"})
    @Query("SELECT p FROM Product p WHERE p.id IN :ids")
    List<Product> findByIdInWithAll(@Param("ids") List<Long> ids);

    @EntityGraph(attributePaths = {"images", "category"})
    @Query("SELECT p FROM Product p WHERE p.category.id IN :categoryIds ORDER BY p.createdAt DESC")
    List<Product> findByCategoryIdsOrderByCreatedAtDesc(@Param("categoryIds") List<Long> categoryIds);

    @EntityGraph(attributePaths = {"images", "category"})
    @Query("SELECT p FROM Product p WHERE p.category.id IN :categoryIds AND p.id NOT IN :excludeIds ORDER BY p.createdAt DESC")
    List<Product> findByCategoryIdsAndExcludeIds(@Param("categoryIds") List<Long> categoryIds,
                                                  @Param("excludeIds") Set<Long> excludeIds,
                                                  org.springframework.data.domain.Pageable pageable);

    @EntityGraph(attributePaths = {"images", "category"})
    @Query("SELECT p FROM Product p WHERE p.id NOT IN :excludeIds ORDER BY p.createdAt DESC")
    List<Product> findExcludingIds(@Param("excludeIds") Set<Long> excludeIds,
                                    org.springframework.data.domain.Pageable pageable);

    @EntityGraph(attributePaths = {"images", "category"})
    @Query("SELECT p FROM Product p WHERE p.averageRating IS NOT NULL " +
           "ORDER BY p.averageRating DESC, p.reviewCount DESC")
    List<Product> findTopRated(Pageable pageable);

    @EntityGraph(attributePaths = {"images", "category"})
    @Query("SELECT p FROM Product p ORDER BY p.createdAt DESC")
    List<Product> findNewArrivals(Pageable pageable);
}
