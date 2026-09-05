package com.chowly.backend.mapper;

import com.chowly.backend.dto.MenuItemDTO;
import com.chowly.backend.entity.MenuItem;
import org.springframework.stereotype.Component;

@Component
public class MenuItemMapper {

    public MenuItemDTO toDTO(MenuItem menuItem) {
        return new MenuItemDTO(
                menuItem.getId(),
                menuItem.getName(),
                menuItem.getType(),
                menuItem.getPrice(),
                menuItem.getAvailability(),
                menuItem.getPreparationTime()
        );
    }

    public MenuItem toEntity(MenuItemDTO dto) {
        MenuItem menuItem = new MenuItem();

        menuItem.setName(dto.getName());
        menuItem.setType(dto.getType());
        menuItem.setPrice(dto.getPrice());
        menuItem.setAvailability(dto.getAvailability());
        menuItem.setPreparationTime(dto.getPreparationTime());

        return menuItem;
    }
}
