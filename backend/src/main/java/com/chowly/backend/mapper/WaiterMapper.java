package com.chowly.backend.mapper;

import com.chowly.backend.dto.WaiterDTO;
import com.chowly.backend.entity.Waiter;
import org.springframework.stereotype.Component;

@Component
public class WaiterMapper {

    public WaiterDTO toDTO(Waiter waiter) {
        return new WaiterDTO(
                waiter.getId(),
                waiter.getName()
        );
    }

    public Waiter toEntity(WaiterDTO dto) {
        Waiter waiter = new Waiter();

        waiter.setName(dto.getName());

        return waiter;
    }
}
