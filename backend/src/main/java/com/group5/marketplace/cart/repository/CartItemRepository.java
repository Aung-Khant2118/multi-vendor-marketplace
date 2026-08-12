package com.group5.marketplace.cart.repository;

import com.group5.marketplace.cart.entity.Cart;
import com.group5.marketplace.cart.entity.CartItem;
import com.group5.marketplace.product.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCart(Cart cart);

    Optional<CartItem> findByCartAndVariant(Cart cart, ProductVariant variant);

    void deleteByCart(Cart cart);
}