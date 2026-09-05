package com.chowly.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public class RatingDTO {

    private Long id;

    @NotNull(message = "Order ID is required")
    @Positive(message = "Order ID must be greater than zero")
    private Long orderId;

    @NotNull(message = "Rating score is required")
    @Min(value = 1, message = "Rating score must be at least 1")
    @Max(value = 5, message = "Rating score must not exceed 5")
    private Integer score;

    private String comment;

    private LocalDateTime ratingDate;

    public RatingDTO() {
    }

    public RatingDTO(Long id, Long orderId, Integer score,
                     String comment, LocalDateTime ratingDate) {
        this.id = id;
        this.orderId = orderId;
        this.score = score;
        this.comment = comment;
        this.ratingDate = ratingDate;
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

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getRatingDate() {
        return ratingDate;
    }

    public void setRatingDate(LocalDateTime ratingDate) {
        this.ratingDate = ratingDate;
    }
}
