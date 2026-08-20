package com.group5.marketplace.wishlist.service;

import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.product.repository.ProductRepository;
import com.group5.marketplace.wishlist.dto.WishlistResponse;
import com.group5.marketplace.wishlist.entity.Wishlist;
import com.group5.marketplace.wishlist.entity.WishlistItem;
import com.group5.marketplace.wishlist.mapper.WishlistMapper;
import com.group5.marketplace.wishlist.repository.WishlistItemRepository;
import com.group5.marketplace.wishlist.repository.WishlistRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final WishlistMapper wishlistMapper;

    public WishlistService(WishlistRepository wishlistRepository, WishlistItemRepository wishlistItemRepository,
                           ProductRepository productRepository, WishlistMapper wishlistMapper) {
        this.wishlistRepository = wishlistRepository;
        this.wishlistItemRepository = wishlistItemRepository;
        this.productRepository = productRepository;
        this.wishlistMapper = wishlistMapper;
    }

    @Transactional
    public WishlistResponse getWishlist(Long userId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        return toResponse(wishlist);
    }

    @Transactional
    public WishlistResponse addItem(Long userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        Wishlist wishlist = getOrCreateWishlist(userId);
        wishlistItemRepository.findByWishlistAndProduct(wishlist, product).ifPresent(item -> {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product is already in the wishlist");
        });

        wishlistItemRepository.save(new WishlistItem(wishlist, product));
        return toResponse(wishlist);
    }

    @Transactional
    public WishlistResponse removeItem(Long userId, Long itemId) {
        WishlistItem item = wishlistItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wishlist item not found"));
        if (!item.getWishlist().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Wishlist item does not belong to the user");
        }

        Wishlist wishlist = item.getWishlist();
        wishlistItemRepository.delete(item);
        return toResponse(wishlist);
    }

    private Wishlist getOrCreateWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).orElseGet(() -> {
            Wishlist wishlist = new Wishlist(userId, "My Wishlist");
            return wishlistRepository.save(wishlist);
        });
    }

    private WishlistResponse toResponse(Wishlist wishlist) {
        List<WishlistItem> items = wishlistItemRepository.findByWishlist(wishlist);
        return wishlistMapper.toResponse(wishlist, items);
    }
}
