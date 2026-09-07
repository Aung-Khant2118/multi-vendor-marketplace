package com.group5.marketplace.recommendation.service;

import com.group5.marketplace.order.entity.Order;
import com.group5.marketplace.order.repository.OrderItemRepository;
import com.group5.marketplace.order.repository.OrderRepository;
import com.group5.marketplace.product.dto.ProductResponse;
import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.product.entity.ProductVariant;
import com.group5.marketplace.product.mapper.ProductMapper;
import com.group5.marketplace.product.repository.ProductRepository;
import com.group5.marketplace.product.repository.variant.ProductVariantRepository;
import com.group5.marketplace.review.repository.ReviewRepository;
import com.group5.marketplace.wishlist.entity.Wishlist;
import com.group5.marketplace.wishlist.repository.WishlistItemRepository;
import com.group5.marketplace.wishlist.repository.WishlistRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;
    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductMapper productMapper;

    public RecommendationService(OrderRepository orderRepository,
                                  OrderItemRepository orderItemRepository,
                                  ReviewRepository reviewRepository,
                                  WishlistRepository wishlistRepository,
                                  WishlistItemRepository wishlistItemRepository,
                                  ProductRepository productRepository,
                                  ProductVariantRepository variantRepository,
                                  ProductMapper productMapper) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.reviewRepository = reviewRepository;
        this.wishlistRepository = wishlistRepository;
        this.wishlistItemRepository = wishlistItemRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.productMapper = productMapper;
    }

    public List<ProductResponse> getRecommendations(Long userId, String tab, int limit) {
        List<ProductResponse> results;
        switch (tab != null ? tab : "for_you") {
            case "trending":
                results = getTrending(limit);
                break;
            case "top_rated":
                results = getTopRated(limit);
                break;
            case "new_arrivals":
                results = getNewArrivals(limit);
                break;
            case "for_you":
            default:
                results = getForYou(userId, limit);
                break;
        }
        return results;
    }

    private List<ProductResponse> getForYou(Long userId, int limit) {
        if (userId == null) {
            return getTrending(limit);
        }

        Set<Long> userProductIds = getUserInteractedProductIds(userId);

        if (userProductIds.isEmpty()) {
            return getTrending(limit);
        }

        List<Long> userCategoryIds = getUserPreferredCategoryIds(userProductIds);

        Set<Long> excludeIds = new HashSet<>(userProductIds);

        List<Product> recommended = new ArrayList<>();
        if (!userCategoryIds.isEmpty()) {
            recommended = productRepository.findByCategoryIdsAndExcludeIds(
                    userCategoryIds, excludeIds, PageRequest.of(0, limit));
        }

        if (recommended.size() < limit) {
            List<Product> trending = productRepository.findExcludingIds(
                    excludeIds, PageRequest.of(0, limit - recommended.size()));
            recommended.addAll(trending);
        }

        Map<Long, String> vendorNames = productMapper.resolveVendorNames(recommended);
        return recommended.stream()
                .map(p -> productMapper.toResponse(p, vendorNames))
                .collect(Collectors.toList());
    }

    private List<ProductResponse> getTrending(int limit) {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<Object[]> trendingData = orderItemRepository.findTrendingVariantIds(since, PageRequest.of(0, limit * 2));

        List<Long> variantIds = trendingData.stream()
                .map(row -> (Long) row[0])
                .collect(Collectors.toList());

        if (variantIds.isEmpty()) {
            return getNewArrivals(limit);
        }

        List<Long> productIds = variantRepository.findProductIdsByVariantIds(new LinkedHashSet<>(variantIds));

        List<Product> products = productRepository.findByIdInWithImages(productIds);

        Map<Long, Long> salesRank = new HashMap<>();
        for (int i = 0; i < trendingData.size(); i++) {
            salesRank.put((Long) trendingData.get(i)[0], (long) i);
        }

        products.sort(Comparator.comparingLong(p -> {
            Long rank = salesRank.get(p.getId());
            return rank != null ? rank : Long.MAX_VALUE;
        }));

        List<Product> result = products.stream().limit(limit).collect(Collectors.toList());
        Map<Long, String> vendorNames = productMapper.resolveVendorNames(result);
        return result.stream()
                .map(p -> productMapper.toResponse(p, vendorNames))
                .collect(Collectors.toList());
    }

    private List<ProductResponse> getTopRated(int limit) {
        List<Product> products = productRepository.findTopRated(PageRequest.of(0, limit));

        if (products.isEmpty()) {
            return getNewArrivals(limit);
        }

        Map<Long, String> vendorNames = productMapper.resolveVendorNames(products);
        return products.stream()
                .map(p -> productMapper.toResponse(p, vendorNames))
                .collect(Collectors.toList());
    }

    private List<ProductResponse> getNewArrivals(int limit) {
        List<Product> products = productRepository.findNewArrivals(PageRequest.of(0, limit));

        Map<Long, String> vendorNames = productMapper.resolveVendorNames(products);
        return products.stream()
                .map(p -> productMapper.toResponse(p, vendorNames))
                .collect(Collectors.toList());
    }

    private Set<Long> getUserInteractedProductIds(Long userId) {
        Set<Long> productIds = new HashSet<>();

        List<Long> orderProductIds = orderItemRepository.findProductIdsByUserId(userId);
        productIds.addAll(orderProductIds);

        List<Long> highRatedProductIds = reviewRepository.findProductIdsByUserIdWithMinRating(userId, 3);
        productIds.addAll(highRatedProductIds);

        List<Long> wishlistedProductIds = wishlistItemRepository.findProductIdsByUserId(userId);
        productIds.addAll(wishlistedProductIds);

        return productIds;
    }

    private List<Long> getUserPreferredCategoryIds(Set<Long> productIds) {
        if (productIds.isEmpty()) {
            return List.of();
        }
        List<Product> products = productRepository.findByIdInWithImages(new ArrayList<>(productIds));
        return products.stream()
                .filter(p -> p.getCategory() != null)
                .map(p -> p.getCategory().getId())
                .distinct()
                .collect(Collectors.toList());
    }
}