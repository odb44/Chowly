package com.chowly.backend.controller;

import com.chowly.backend.dto.WaiterDTO;
import com.chowly.backend.entity.Waiter;
import com.chowly.backend.mapper.WaiterMapper;
import com.chowly.backend.service.WaiterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waiters")
public class WaiterController {

    private final WaiterService waiterService;
    private final WaiterMapper waiterMapper;

    public WaiterController(
            WaiterService waiterService,
            WaiterMapper waiterMapper) {
        this.waiterService = waiterService;
        this.waiterMapper = waiterMapper;
    }

    @GetMapping
    public ResponseEntity<List<WaiterDTO>> getAllWaiters() {

        List<WaiterDTO> waiters = waiterService
                .getAllWaiters()
                .stream()
                .map(waiterMapper::toDTO)
                .toList();

        return ResponseEntity.ok(waiters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WaiterDTO> getWaiterById(
            @PathVariable Long id) {

        Waiter waiter = waiterService.getWaiterById(id);

        return ResponseEntity.ok(
                waiterMapper.toDTO(waiter));
    }

    @PostMapping
    public ResponseEntity<WaiterDTO> createWaiter(
            @Valid @RequestBody WaiterDTO waiterDTO) {

        Waiter waiter = waiterMapper.toEntity(waiterDTO);

        Waiter createdWaiter =
                waiterService.createWaiter(waiter);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(waiterMapper.toDTO(createdWaiter));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WaiterDTO> updateWaiter(
            @PathVariable Long id,
            @Valid @RequestBody WaiterDTO waiterDTO) {

        Waiter updatedWaiter =
                waiterMapper.toEntity(waiterDTO);

        Waiter savedWaiter =
                waiterService.updateWaiter(id, updatedWaiter);

        return ResponseEntity.ok(
                waiterMapper.toDTO(savedWaiter));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWaiter(
            @PathVariable Long id) {

        waiterService.deleteWaiter(id);

        return ResponseEntity.noContent().build();
    }
}
