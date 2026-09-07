package com.group5.marketplace;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class MarketplaceApplication {

	public static void main(String[] args) {
		SpringApplication.run(MarketplaceApplication.class, args);
	}

	@Bean
	CommandLineRunner populateProductRatings(
			com.group5.marketplace.product.repository.ProductRepository productRepository,
			com.group5.marketplace.review.repository.ReviewRepository reviewRepository) {
		return args -> {
			java.util.List<com.group5.marketplace.product.entity.Product> products = productRepository.findAll();
			for (com.group5.marketplace.product.entity.Product product : products) {
				Double avg = reviewRepository.averageRatingByProductId(product.getId());
				long count = reviewRepository.countByProductId(product.getId());
				if (avg != null || count > 0) {
					product.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : null);
					product.setReviewCount((int) count);
					productRepository.save(product);
				}
			}
		};
	}

}
