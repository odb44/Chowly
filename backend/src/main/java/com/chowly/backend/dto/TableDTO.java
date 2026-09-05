package com.chowly.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class TableDTO {

    private Long id;

    @NotNull(message = "Table number is required")
    @Positive(message = "Table number must be greater than zero")
    private Integer number;

    @NotNull(message = "Table capacity is required")
    @Positive(message = "Table capacity must be greater than zero")
    private Integer capacity;

    public TableDTO() {
    }

    public TableDTO(Long id, Integer number, Integer capacity) {
        this.id = id;
        this.number = number;
        this.capacity = capacity;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getNumber() {
        return number;
    }

    public void setNumber(Integer number) {
        this.number = number;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
}
