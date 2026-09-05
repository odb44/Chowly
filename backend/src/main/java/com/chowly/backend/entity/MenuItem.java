package com.chowly.backend.entity;

import com.chowly.backend.enums.MenuItemType;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@jakarta.persistence.Table(name = "menu_item")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MenuItemType type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Boolean availability = true;

    @Column(name = "preparation_time", nullable = false)
    private Integer preparationTime;

    public MenuItem() {
    }

    public MenuItem(String name, MenuItemType type, BigDecimal price,
                    Boolean availability, Integer preparationTime) {
        this.name = name;
        this.type = type;
        this.price = price;
        this.availability = availability;
        this.preparationTime = preparationTime;
    }

    public MenuItem(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
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
