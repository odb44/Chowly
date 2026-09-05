package com.chowly.backend.controller;

import com.chowly.backend.dto.BartenderDTO;
import com.chowly.backend.entity.Bartender;
import com.chowly.backend.mapper.BartenderMapper;
import com.chowly.backend.service.BartenderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bartenders")
public class BartenderController {

    private final BartenderService bartenderService;
    private final BartenderMapper bartenderMapper;

    public BartenderController(
            BartenderService bartenderService,
            BartenderMapper bartenderMapper) {
        this.bartenderService = bartenderService;
        this.bartenderMapper = bartenderMapper;
    }

    @GetMapping
    public ResponseEntity<List<BartenderDTO>> getAllBartenders() {

        List<BartenderDTO> bartenders = bartenderService
                .getAllBartenders()
                .stream()
                .map(bartenderMapper::toDTO)
                .toList();

        return ResponseEntity.ok(bartenders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BartenderDTO> getBartenderById(
            @PathVariable Long id) {

        Bartender bartender =
                bartenderService.getBartenderById(id);

        return ResponseEntity.ok(
                bartenderMapper.toDTO(bartender));
    }

    @PostMapping
    public ResponseEntity<BartenderDTO> createBartender(
            @Valid @RequestBody BartenderDTO bartenderDTO) {

        Bartender bartender =
                bartenderMapper.toEntity(bartenderDTO);

        Bartender createdBartender =
                bartenderService.createBartender(bartender);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bartenderMapper.toDTO(createdBartender));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BartenderDTO> updateBartender(
            @PathVariable Long id,
            @Valid @RequestBody BartenderDTO bartenderDTO) {

        Bartender updatedBartender =
                bartenderMapper.toEntity(bartenderDTO);

        Bartender savedBartender =
                bartenderService.updateBartender(
                        id, updatedBartender);

        return ResponseEntity.ok(
                bartenderMapper.toDTO(savedBartender));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBartender(
            @PathVariable Long id) {

        bartenderService.deleteBartender(id);

        return ResponseEntity.noContent().build();
    }
}
