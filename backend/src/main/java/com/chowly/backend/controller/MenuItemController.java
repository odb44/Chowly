package com.chowly.backend.controller;

import com.chowly.backend.dto.MenuItemDTO;
import com.chowly.backend.entity.MenuItem;
import com.chowly.backend.mapper.MenuItemMapper;
import com.chowly.backend.service.MenuItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {

    private final MenuItemService menuItemService;
    private final MenuItemMapper menuItemMapper;

    public MenuItemController(
            MenuItemService menuItemService,
            MenuItemMapper menuItemMapper) {
        this.menuItemService = menuItemService;
        this.menuItemMapper = menuItemMapper;
    }

    @GetMapping
    public ResponseEntity<List<MenuItemDTO>> getAllMenuItems() {

        List<MenuItemDTO> menuItems = menuItemService
                .getAllMenuItems()
                .stream()
                .map(menuItemMapper::toDTO)
                .toList();

        return ResponseEntity.ok(menuItems);
    }

    @GetMapping("/available")
    public ResponseEntity<List<MenuItemDTO>> getAvailableMenuItems() {

        List<MenuItemDTO> menuItems = menuItemService
                .getAvailableMenuItems()
                .stream()
                .map(menuItemMapper::toDTO)
                .toList();

        return ResponseEntity.ok(menuItems);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItemDTO> getMenuItemById(
            @PathVariable Long id) {

        MenuItem menuItem = menuItemService.getMenuItemById(id);

        return ResponseEntity.ok(
                menuItemMapper.toDTO(menuItem));
    }

    @PostMapping
    public ResponseEntity<MenuItemDTO> createMenuItem(
            @Valid @RequestBody MenuItemDTO menuItemDTO) {

        MenuItem menuItem = menuItemMapper.toEntity(menuItemDTO);

        MenuItem createdMenuItem =
                menuItemService.createMenuItem(menuItem);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(menuItemMapper.toDTO(createdMenuItem));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItemDTO> updateMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemDTO menuItemDTO) {

        MenuItem updatedMenuItem =
                menuItemMapper.toEntity(menuItemDTO);

        MenuItem savedMenuItem =
                menuItemService.updateMenuItem(id, updatedMenuItem);

        return ResponseEntity.ok(
                menuItemMapper.toDTO(savedMenuItem));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(
            @PathVariable Long id) {

        menuItemService.deleteMenuItem(id);

        return ResponseEntity.noContent().build();
    }
}
