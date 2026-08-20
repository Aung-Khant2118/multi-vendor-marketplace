package com.group5.marketplace.wishlist.mapper;

import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.wishlist.dto.WishlistItemResponse;
import com.group5.marketplace.wishlist.dto.WishlistResponse;
import com.group5.marketplace.wishlist.entity.Wishlist;
import com.group5.marketplace.wishlist.entity.WishlistItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class WishlistMapper {

    public WishlistResponse toResponse(Wishlist wishlist, List<WishlistItem> items) {
        WishlistResponse r = new WishlistResponse();
        r.setId(wishlist.getId());
        r.setName(wishlist.getName());
        r.setCreatedAt(wishlist.getCreatedAt());
        r.setUpdatedAt(wishlist.getUpdatedAt());

        List<WishlistItemResponse> itemResponses = new ArrayList<>();
        for (WishlistItem item : items) {
            itemResponses.add(toItemResponse(item));
        }
        r.setItems(itemResponses);
        return r;
    }

    public WishlistItemResponse toItemResponse(WishlistItem item) {
        WishlistItemResponse r = new WishlistItemResponse();
        r.setId(item.getId());
        r.setAddedAt(item.getAddedAt());
        Product p = item.getProduct();
        if (p != null) {
            r.setProductId(p.getId());
            r.setProductName(p.getName());
            r.setProductSlug(p.getSlug());
            r.setPrice(p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO);
            if (p.getImages() != null && !p.getImages().isEmpty()) {
                r.setImageUrl(p.getImages().get(0).getUrl());
            }
        }
        return r;
    }
}
