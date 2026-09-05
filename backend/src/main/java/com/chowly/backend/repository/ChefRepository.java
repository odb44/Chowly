package com.chowly.backend.repository;

import com.chowly.backend.entity.Chef;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChefRepository extends JpaRepository<Chef, Long> {
}
