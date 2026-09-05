package com.chowly.backend.dto;

import com.chowly.backend.enums.PaymentMethod;
import com.chowly.backend.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentDTO {

    private Long id;

    @NotNull(message = "Order ID is required")
    @Positive(message = "Order ID must be greater than zero")
    private Long orderId;

    private PaymentStatus status;

    private BigDecimal amount;

    private LocalDateTime paymentDate;

    private PaymentMethod method;

    public PaymentDTO() {
    }

    public PaymentDTO(Long id, Long orderId, PaymentStatus status,
                      BigDecimal amount, LocalDateTime paymentDate,
                      PaymentMethod method) {
        this.id = id;
        this.orderId = orderId;
        this.status = status;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.method = method;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }
}
