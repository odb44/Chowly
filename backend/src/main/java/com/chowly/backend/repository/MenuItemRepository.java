package com.chowly.backend.repository;

import com.chowly.backend.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    boolean existsByName(String name);
}
