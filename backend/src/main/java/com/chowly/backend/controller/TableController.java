package com.chowly.backend.controller;

import com.chowly.backend.dto.TableDTO;
import com.chowly.backend.entity.Table;
import com.chowly.backend.mapper.TableMapper;
import com.chowly.backend.service.TableService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
public class TableController {

    private final TableService tableService;
    private final TableMapper tableMapper;

    public TableController(
            TableService tableService,
            TableMapper tableMapper) {
        this.tableService = tableService;
        this.tableMapper = tableMapper;
    }

    @GetMapping
    public ResponseEntity<List<TableDTO>> getAllTables() {

        List<TableDTO> tables = tableService
                .getAllTables()
                .stream()
                .map(tableMapper::toDTO)
                .toList();

        return ResponseEntity.ok(tables);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TableDTO> getTableById(
            @PathVariable Long id) {

        Table table = tableService.getTableById(id);

        return ResponseEntity.ok(
                tableMapper.toDTO(table));
    }

    @PostMapping
    public ResponseEntity<TableDTO> createTable(
            @Valid @RequestBody TableDTO tableDTO) {

        Table table = tableMapper.toEntity(tableDTO);

        Table createdTable =
                tableService.createTable(table);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(tableMapper.toDTO(createdTable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TableDTO> updateTable(
            @PathVariable Long id,
            @Valid @RequestBody TableDTO tableDTO) {

        Table updatedTable =
                tableMapper.toEntity(tableDTO);

        Table savedTable =
                tableService.updateTable(id, updatedTable);

        return ResponseEntity.ok(
                tableMapper.toDTO(savedTable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(
            @PathVariable Long id) {

        tableService.deleteTable(id);

        return ResponseEntity.noContent().build();
    }
}
