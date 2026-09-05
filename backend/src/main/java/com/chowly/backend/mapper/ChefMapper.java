package com.chowly.backend.mapper;

import com.chowly.backend.dto.ChefDTO;
import com.chowly.backend.entity.Chef;
import org.springframework.stereotype.Component;

@Component
public class ChefMapper {

    public ChefDTO toDTO(Chef chef) {
        return new ChefDTO(
                chef.getId(),
                chef.getName()
        );
    }

    public Chef toEntity(ChefDTO dto) {
        Chef chef = new Chef();

        chef.setName(dto.getName());

        return chef;
    }
}
