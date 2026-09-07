package com.group5.marketplace.wishlist.repository;

import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.wishlist.entity.Wishlist;
import com.group5.marketplace.wishlist.entity.WishlistItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    @EntityGraph(attributePaths = {"product", "product.images"})
    List<WishlistItem> findByWishlist(Wishlist wishlist);

    Optional<WishlistItem> findByWishlistAndProduct(Wishlist wishlist, Product product);

    @Query("SELECT wi.product.id FROM WishlistItem wi WHERE wi.wishlist.userId = :userId")
    List<Long> findProductIdsByUserId(@Param("userId") Long userId);
}
