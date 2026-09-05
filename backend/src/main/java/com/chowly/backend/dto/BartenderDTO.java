package com.chowly.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class BartenderDTO {

    private Long id;

    @NotBlank(message = "Bartender name is required")
    private String name;

    public BartenderDTO() {
    }

    public BartenderDTO(Long id, String name) {
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
