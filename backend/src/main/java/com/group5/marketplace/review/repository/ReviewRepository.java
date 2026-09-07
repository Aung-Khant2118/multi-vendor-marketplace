package com.group5.marketplace.review.repository;

import com.group5.marketplace.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    boolean existsByOrderItemId(Long orderItemId);

    boolean existsByProductIdAndUserId(Long productId, Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.productId = :productId")
    Double averageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.productId = :productId")
    long countByProductId(@Param("productId") Long productId);

    @Query("SELECT r.productId, AVG(r.rating), COUNT(r) FROM Review r WHERE r.productId IN :productIds GROUP BY r.productId")
    List<Object[]> aggregateByProductIds(@Param("productIds") Set<Long> productIds);

    @Query("SELECT DISTINCT r.productId FROM Review r WHERE r.userId = :userId AND r.rating >= :minRating")
    List<Long> findProductIdsByUserIdWithMinRating(@Param("userId") Long userId, @Param("minRating") int minRating);

    @Query("SELECT r.productId, AVG(r.rating) AS avgRating, COUNT(r) AS reviewCount FROM Review r " +
           "GROUP BY r.productId HAVING COUNT(r) >= :minReviews ORDER BY avgRating DESC")
    List<Object[]> findTopRatedProductIds(@Param("minReviews") long minReviews, org.springframework.data.domain.Pageable pageable);
}
