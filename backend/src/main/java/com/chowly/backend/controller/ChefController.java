package com.chowly.backend.controller;

import com.chowly.backend.dto.ChefDTO;
import com.chowly.backend.entity.Chef;
import com.chowly.backend.mapper.ChefMapper;
import com.chowly.backend.service.ChefService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chefs")
public class ChefController {

    private final ChefService chefService;
    private final ChefMapper chefMapper;

    public ChefController(
            ChefService chefService,
            ChefMapper chefMapper) {
        this.chefService = chefService;
        this.chefMapper = chefMapper;
    }

    @GetMapping
    public ResponseEntity<List<ChefDTO>> getAllChefs() {

        List<ChefDTO> chefs = chefService
                .getAllChefs()
                .stream()
                .map(chefMapper::toDTO)
                .toList();

        return ResponseEntity.ok(chefs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChefDTO> getChefById(
            @PathVariable Long id) {

        Chef chef = chefService.getChefById(id);

        return ResponseEntity.ok(
                chefMapper.toDTO(chef));
    }

    @PostMapping
    public ResponseEntity<ChefDTO> createChef(
            @Valid @RequestBody ChefDTO chefDTO) {

        Chef chef = chefMapper.toEntity(chefDTO);

        Chef createdChef =
                chefService.createChef(chef);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(chefMapper.toDTO(createdChef));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChefDTO> updateChef(
            @PathVariable Long id,
            @Valid @RequestBody ChefDTO chefDTO) {

        Chef updatedChef =
                chefMapper.toEntity(chefDTO);

        Chef savedChef =
                chefService.updateChef(id, updatedChef);

        return ResponseEntity.ok(
                chefMapper.toDTO(savedChef));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChef(
            @PathVariable Long id) {

        chefService.deleteChef(id);

        return ResponseEntity.noContent().build();
    }
}
