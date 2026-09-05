package com.chowly.backend.mapper;

import com.chowly.backend.dto.TableDTO;
import com.chowly.backend.entity.Table;
import org.springframework.stereotype.Component;

@Component
public class TableMapper {

    public TableDTO toDTO(Table table) {
        return new TableDTO(
                table.getId(),
                table.getNumber(),
                table.getCapacity()
        );
    }

    public Table toEntity(TableDTO dto) {
        Table table = new Table();

        table.setNumber(dto.getNumber());
        table.setCapacity(dto.getCapacity());

        return table;
    }
}
