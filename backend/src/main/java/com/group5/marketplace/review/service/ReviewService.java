package com.group5.marketplace.review.service;

import com.group5.marketplace.order.entity.Order;
import com.group5.marketplace.order.entity.OrderItem;
import com.group5.marketplace.order.entity.OrderStatus;
import com.group5.marketplace.order.repository.OrderItemRepository;
import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.product.entity.ProductVariant;
import com.group5.marketplace.product.repository.ProductRepository;
import com.group5.marketplace.product.repository.variant.ProductVariantRepository;
import com.group5.marketplace.review.dto.ProductRatingResponse;
import com.group5.marketplace.review.dto.ReviewRequest;
import com.group5.marketplace.review.dto.ReviewResponse;
import com.group5.marketplace.review.entity.Review;
import com.group5.marketplace.review.repository.ReviewRepository;
import com.group5.marketplace.user.entity.User;
import com.group5.marketplace.user.repository.UserRepository;
import com.group5.marketplace.vendor.entity.Vendor;
import com.group5.marketplace.vendor.repository.VendorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         OrderItemRepository orderItemRepository,
                         ProductVariantRepository productVariantRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository,
                         VendorRepository vendorRepository) {
        this.reviewRepository = reviewRepository;
        this.orderItemRepository = orderItemRepository;
        this.productVariantRepository = productVariantRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
    }

    @Transactional
    public ReviewResponse submitReview(Long userId, ReviewRequest request) {
        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Order item not found"));

        if (!orderItem.getOrder().getUserId().equals(userId)) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "You can only review your own orders");
        }

        Order order = orderItem.getOrder();
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "You can only review delivered orders");
        }

        if (reviewRepository.existsByOrderItemId(request.getOrderItemId())) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "You have already reviewed this item");
        }

        ProductVariant variant = productVariantRepository.findById(orderItem.getVariantId())
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Product variant not found"));
        Long productId = variant.getProduct().getId();

        Review review = Review.builder()
                .orderItemId(request.getOrderItemId())
                .productId(productId)
                .userId(userId)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepository.save(review);

        updateVendorRating(orderItem.getVendorId());

        return toResponse(saved);
    }

    public Page<ReviewResponse> getProductReviews(Long productId, int page, int size) {
        Page<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(
                productId, PageRequest.of(page, size));
        return reviews.map(this::toResponse);
    }

    public ProductRatingResponse getProductRating(Long productId) {
        Double avg = reviewRepository.averageRatingByProductId(productId);
        long count = reviewRepository.countByProductId(productId);
        return new ProductRatingResponse(productId, avg != null ? avg : 0.0, count);
    }

    public boolean hasUserReviewedProduct(Long userId, Long productId) {
        return reviewRepository.existsByProductIdAndUserId(productId, userId);
    }

    private void updateVendorRating(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId).orElse(null);
        if (vendor == null) return;

        var products = productRepository.findByVendorId(vendorId);
        if (products.isEmpty()) return;

        double totalRating = 0;
        int totalCount = 0;
        for (Product p : products) {
            Double avg = reviewRepository.averageRatingByProductId(p.getId());
            long count = reviewRepository.countByProductId(p.getId());
            if (avg != null && count > 0) {
                totalRating += avg * count;
                totalCount += count;
            }
        }

        if (totalCount > 0) {
            BigDecimal rating = BigDecimal.valueOf(totalRating / totalCount)
                    .setScale(1, RoundingMode.HALF_UP);
            vendor.setRating(rating);
        } else {
            vendor.setRating(null);
        }
        vendorRepository.save(vendor);
    }

    private ReviewResponse toResponse(Review review) {
        String productName = null;
        Product product = productRepository.findById(review.getProductId()).orElse(null);
        if (product != null) {
            productName = product.getName();
        }

        String userName = null;
        User user = userRepository.findById(review.getUserId()).orElse(null);
        if (user != null) {
            userName = user.getFirstName() + " " + user.getLastName();
        }

        return new ReviewResponse(
                review.getId(),
                review.getOrderItemId(),
                review.getProductId(),
                productName,
                review.getUserId(),
                userName,
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
