package com.chowly.backend.service;

import com.chowly.backend.entity.MenuItem;
import com.chowly.backend.repository.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;

    public MenuItemService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    public List<MenuItem> getAvailableMenuItems() {
        return menuItemRepository.findAll()
                .stream()
                .filter(MenuItem::getAvailability)
                .toList();
    }

    public MenuItem getMenuItemById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
    }

    public MenuItem createMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }

    public MenuItem updateMenuItem(Long id, MenuItem updatedMenuItem) {
        MenuItem existingMenuItem = getMenuItemById(id);

        existingMenuItem.setName(updatedMenuItem.getName());
        existingMenuItem.setType(updatedMenuItem.getType());
        existingMenuItem.setPrice(updatedMenuItem.getPrice());
        existingMenuItem.setAvailability(updatedMenuItem.getAvailability());
        existingMenuItem.setPreparationTime(updatedMenuItem.getPreparationTime());

        return menuItemRepository.save(existingMenuItem);
    }

    public void deleteMenuItem(Long id) {
        MenuItem menuItem = getMenuItemById(id);
        menuItemRepository.delete(menuItem);
    }
}
