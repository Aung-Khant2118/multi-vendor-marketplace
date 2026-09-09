package com.group5.marketplace.order.dto;

import jakarta.validation.constraints.NotBlank;

public class CancelOrderRequest {

    @NotBlank(message = "Cancellation reason is required")
    private String reason;

    private String customNote;

    public CancelOrderRequest() {}

    public CancelOrderRequest(String reason, String customNote) {
        this.reason = reason;
        this.customNote = customNote;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getCustomNote() { return customNote; }
    public void setCustomNote(String customNote) { this.customNote = customNote; }
}
