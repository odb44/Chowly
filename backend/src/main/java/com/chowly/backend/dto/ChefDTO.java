package com.chowly.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class ChefDTO {

    private Long id;

    @NotBlank(message = "Chef name is required")
    private String name;

    public ChefDTO() {
    }

    public ChefDTO(Long id, String name) {
        this.id = id;
        this.name = name;
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
}
