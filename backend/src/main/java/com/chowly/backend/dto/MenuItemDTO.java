package com.chowly.backend.dto;

import com.chowly.backend.enums.MenuItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public class MenuItemDTO {

    private Long id;

    @NotBlank(message = "Menu item name is required")
    private String name;

    @NotNull(message = "Menu item type is required")
    private MenuItemType type;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price cannot be negative")
    private BigDecimal price;

    @NotNull(message = "Availability is required")
    private Boolean availability;

    @NotNull(message = "Preparation time is required")
    @Positive(message = "Preparation time must be greater than zero")
    private Integer preparationTime;

    public MenuItemDTO() {
    }

    public MenuItemDTO(Long id, String name, MenuItemType type,
                       BigDecimal price, Boolean availability,
                       Integer preparationTime) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.price = price;
        this.availability = availability;
        this.preparationTime = preparationTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public MenuItemType getType() {
        return type;
    }

    public void setType(MenuItemType type) {
        this.type = type;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Boolean getAvailability() {
        return availability;
    }

    public void setAvailability(Boolean availability) {
        this.availability = availability;
    }

    public Integer getPreparationTime() {
        return preparationTime;
    }

    public void setPreparationTime(Integer preparationTime) {
        this.preparationTime = preparationTime;
    }
}
