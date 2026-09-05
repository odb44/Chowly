package com.chowly.backend.repository;

import com.chowly.backend.entity.Waiter;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WaiterRepository extends JpaRepository<Waiter, Long> {
}
