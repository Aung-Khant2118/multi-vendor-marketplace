package com.group5.marketplace.product.repository.variant;

import com.group5.marketplace.product.entity.VariantAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VariantAttributeRepository extends JpaRepository<VariantAttribute, Long> {

    List<VariantAttribute> findByVariantId(Long variantId);

    void deleteByVariantId(Long variantId);

    void deleteByVariantIdIn(List<Long> variantIds);
}
