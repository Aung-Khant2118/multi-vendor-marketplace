package com.group5.marketplace.order.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Configurable checkout pricing rules.
 *
 * Defaults (flat-rate shipping, free shipping above a threshold, percentage tax)
 * can be overridden with:
 *   app.checkout.shipping-flat-rate=5.00
 *   app.checkout.free-shipping-threshold=50.00
 *   app.checkout.tax-rate=0.08
 */
@Component
@ConfigurationProperties(prefix = "app.checkout")
public class CheckoutProperties {

    private BigDecimal shippingFlatRate = new BigDecimal("5.00");

    private BigDecimal freeShippingThreshold = new BigDecimal("50.00");

    private BigDecimal taxRate = new BigDecimal("0.08");

    public BigDecimal getShippingFlatRate() { return shippingFlatRate; }
    public void setShippingFlatRate(BigDecimal shippingFlatRate) { this.shippingFlatRate = shippingFlatRate; }
    public BigDecimal getFreeShippingThreshold() { return freeShippingThreshold; }
    public void setFreeShippingThreshold(BigDecimal freeShippingThreshold) { this.freeShippingThreshold = freeShippingThreshold; }
    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }
}