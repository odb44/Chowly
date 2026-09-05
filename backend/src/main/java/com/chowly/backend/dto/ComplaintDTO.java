package com.chowly.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public class ComplaintDTO {

    private Long id;

    @NotNull(message = "Order ID is required")
    @Positive(message = "Order ID must be greater than zero")
    private Long orderId;

    @NotBlank(message = "Complaint comment is required")
    private String comment;

    private LocalDateTime complaintDate;

    private String resolution;

    public ComplaintDTO() {
    }

    public ComplaintDTO(Long id, Long orderId, String comment,
                        LocalDateTime complaintDate, String resolution) {
        this.id = id;
        this.orderId = orderId;
        this.comment = comment;
        this.complaintDate = complaintDate;
        this.resolution = resolution;
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

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getComplaintDate() {
        return complaintDate;
    }

    public void setComplaintDate(LocalDateTime complaintDate) {
        this.complaintDate = complaintDate;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }
}
