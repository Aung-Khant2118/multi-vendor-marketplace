package com.group5.marketplace.product.service.impl;

import com.group5.marketplace.product.dto.ProductVariantRequest;
import com.group5.marketplace.product.dto.ProductVariantResponse;
import com.group5.marketplace.product.dto.VariantAttributeDto;
import com.group5.marketplace.product.entity.Product;
import com.group5.marketplace.product.entity.ProductVariant;
import com.group5.marketplace.product.entity.VariantAttribute;
import com.group5.marketplace.product.mapper.ProductVariantMapper;
import com.group5.marketplace.product.repository.ProductRepository;
import com.group5.marketplace.product.repository.variant.ProductVariantRepository;
import com.group5.marketplace.product.repository.variant.VariantAttributeRepository;
import com.group5.marketplace.product.service.ProductVariantService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final VariantAttributeRepository attributeRepository;
    private final ProductRepository productRepository;
    private final ProductVariantMapper mapper;

    public ProductVariantServiceImpl(ProductVariantRepository variantRepository,
                                     VariantAttributeRepository attributeRepository,
                                     ProductRepository productRepository,
                                     ProductVariantMapper mapper) {
        this.variantRepository = variantRepository;
        this.attributeRepository = attributeRepository;
        this.productRepository = productRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public ProductVariantResponse create(ProductVariantRequest request, Long vendorId) {
        Product p = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product not found"));

        if (p.getVendorId() == null || !p.getVendorId().equals(vendorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");
        }

        ProductVariant v = mapper.toEntity(request);
        v.setProduct(p);
        ProductVariant saved = variantRepository.save(v);
        return mapper.toResponse(saved);
    }

    @Override
    public List<ProductVariantResponse> getByProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return variantRepository.findByProductId(productId).stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public ProductVariantResponse getById(Long id) {
        ProductVariant v = variantRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        return mapper.toResponse(v);
    }

    @Override
    @Transactional
    public ProductVariantResponse update(Long id, ProductVariantRequest request, Long vendorId) {
        ProductVariant v = variantRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        Product p = v.getProduct();
        if (p.getVendorId() == null || !p.getVendorId().equals(vendorId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");

        if (request.getSku() != null) v.setSku(request.getSku());
        if (request.getPrice() != null) v.setPrice(request.getPrice());
        if (request.getStock() != null) v.setStock(request.getStock());
        if (request.getActive() != null) v.setActive(request.getActive());

        if (request.getAttributes() != null) {
            v.getAttributes().clear();
            for (VariantAttributeDto dto : request.getAttributes()) {
                VariantAttribute attr = new VariantAttribute(v, dto.getName(), dto.getValue());
                v.addAttribute(attr);
            }
        }

        ProductVariant saved = variantRepository.save(v);
        return mapper.toResponse(saved);
    }

    @Override
    public void updateStock(Long id, Integer stockDelta, Long vendorId) {
        ProductVariant v = variantRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        Product p = v.getProduct();
        if (p.getVendorId() == null || !p.getVendorId().equals(vendorId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");

        int newStock = (v.getStock() == null ? 0 : v.getStock()) + (stockDelta == null ? 0 : stockDelta);
        if (newStock < 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock cannot be negative");
        v.setStock(newStock);
        variantRepository.save(v);
    }

    @Override
    @Transactional
    public void delete(Long id, Long vendorId) {
        ProductVariant v = variantRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        Product p = v.getProduct();
        if (p.getVendorId() == null || !p.getVendorId().equals(vendorId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");
        variantRepository.delete(v);
    }

    @Override
    public long countByVendorId(Long vendorId) {
        return variantRepository.countByVendorId(vendorId);
    }

    @Override
    public long sumStockByVendorId(Long vendorId) {
        return variantRepository.sumStockByVendorId(vendorId);
    }
}
