package com.chowly.backend.dto;

import com.chowly.backend.enums.PreparationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class OrderItemDTO {

    private Long id;

    private Long orderId;

    @NotNull(message = "Menu item ID is required")
    @Positive(message = "Menu item ID must be greater than zero")
    private Long menuItemId;

    private String menuItemName;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private Integer quantity;

    private BigDecimal unitPrice;

    private PreparationStatus preparationStatus;

    private Long chefId;

    private String chefName;

    private Long bartenderId;

    private String bartenderName;

    public OrderItemDTO() {
    }

    public OrderItemDTO(Long id, Long orderId, Long menuItemId,
                        String menuItemName, Integer quantity,
                        BigDecimal unitPrice,
                        PreparationStatus preparationStatus,
                        Long chefId, String chefName,
                        Long bartenderId, String bartenderName) {
        this.id = id;
        this.orderId = orderId;
        this.menuItemId = menuItemId;
        this.menuItemName = menuItemName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.preparationStatus = preparationStatus;
        this.chefId = chefId;
        this.chefName = chefName;
        this.bartenderId = bartenderId;
        this.bartenderName = bartenderName;
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

    public Long getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(Long menuItemId) {
        this.menuItemId = menuItemId;
    }

    public String getMenuItemName() {
        return menuItemName;
    }

    public void setMenuItemName(String menuItemName) {
        this.menuItemName = menuItemName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public PreparationStatus getPreparationStatus() {
        return preparationStatus;
    }

    public void setPreparationStatus(PreparationStatus preparationStatus) {
        this.preparationStatus = preparationStatus;
    }

    public Long getChefId() {
        return chefId;
    }

    public void setChefId(Long chefId) {
        this.chefId = chefId;
    }

    public String getChefName() {
        return chefName;
    }

    public void setChefName(String chefName) {
        this.chefName = chefName;
    }

    public Long getBartenderId() {
        return bartenderId;
    }

    public void setBartenderId(Long bartenderId) {
        this.bartenderId = bartenderId;
    }

    public String getBartenderName() {
        return bartenderName;
    }

    public void setBartenderName(String bartenderName) {
        this.bartenderName = bartenderName;
    }
}
