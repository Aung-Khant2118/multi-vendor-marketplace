package com.group5.marketplace.product.service.impl;

import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.product.entity.ProductImage;
import com.group5.marketplace.product.repository.ProductImageRepository;
import com.group5.marketplace.product.repository.ProductRepository;
import com.group5.marketplace.storage.supabase.SupabaseStorageClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;

@Service
public class ProductImageService {

    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;
    private final SupabaseStorageClient storageClient;

    public ProductImageService(ProductRepository productRepository, ProductImageRepository imageRepository, SupabaseStorageClient storageClient) {
        this.productRepository = productRepository;
        this.imageRepository = imageRepository;
        this.storageClient = storageClient;
    }

    public ProductImage uploadImage(Long productId, MultipartFile file, Long vendorId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (p.getVendorId() == null || !p.getVendorId().equals(vendorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");
        }

        try {
            String url = storageClient.uploadFile(productId, file);
            ProductImage img = ProductImage.builder()
                    .product(p)
                    .url(url)
                    .uploaderId(vendorId)
                    .build();
            return imageRepository.save(img);
        } catch (IOException | InterruptedException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload image");
        }
    }

    public void deleteImage(Long productId, Long imageId, Long vendorId) {
        ProductImage img = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found"));

        Product p = img.getProduct();
        if (p == null || !p.getId().equals(productId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product/Image mismatch");
        }

        if (p.getVendorId() == null || !p.getVendorId().equals(vendorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");
        }

        try {
            storageClient.deleteFile(img.getUrl());
        } catch (IOException | InterruptedException e) {
            // log and continue with metadata deletion
        }

        imageRepository.delete(img);
    }
}
