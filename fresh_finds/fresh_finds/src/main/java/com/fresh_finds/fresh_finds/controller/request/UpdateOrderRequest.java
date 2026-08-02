package com.fresh_finds.fresh_finds.controller.request;

import jakarta.validation.constraints.Pattern;

public class UpdateOrderRequest {
    
    @Pattern(regexp = "^(PENDING|CONFIRMED|PROCESSING|SHIPPED|DELIVERED|CANCELLED)$", 
             message = "Status must be one of: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED")
    private String status;
    
    @Pattern(regexp = "^(PENDING|PAID|FAILED|REFUNDED)$", 
             message = "Payment status must be one of: PENDING, PAID, FAILED, REFUNDED")
    private String paymentStatus;
    
    private String notes;

    public UpdateOrderRequest() {
    }

    public UpdateOrderRequest(String status, String paymentStatus, String notes) {
        this.status = status;
        this.paymentStatus = paymentStatus;
        this.notes = notes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

