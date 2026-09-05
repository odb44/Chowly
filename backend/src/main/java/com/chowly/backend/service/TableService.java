package com.chowly.backend.service;

import com.chowly.backend.entity.Table;
import com.chowly.backend.exception.ResourceNotFoundException;
import com.chowly.backend.repository.TableRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TableService {

    private final TableRepository tableRepository;

    public TableService(TableRepository tableRepository) {
        this.tableRepository = tableRepository;
    }

    public List<Table> getAllTables() {
        return tableRepository.findAll();
    }

    public Table getTableById(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Table not found with id: " + id));
    }

    public Table createTable(Table table) {
        return tableRepository.save(table);
    }

    public Table updateTable(Long id, Table updatedTable) {
        Table existingTable = getTableById(id);

        existingTable.setNumber(updatedTable.getNumber());
        existingTable.setCapacity(updatedTable.getCapacity());

        return tableRepository.save(existingTable);
    }

    public void deleteTable(Long id) {
        Table table = getTableById(id);
        tableRepository.delete(table);
    }
}
