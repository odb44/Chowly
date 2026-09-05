package com.chowly.backend.repository;

import com.chowly.backend.entity.Bartender;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BartenderRepository extends JpaRepository<Bartender, Long> {
}
