package com.chowly.backend.mapper;

import com.chowly.backend.dto.BartenderDTO;
import com.chowly.backend.entity.Bartender;
import org.springframework.stereotype.Component;

@Component
public class BartenderMapper {

    public BartenderDTO toDTO(Bartender bartender) {
        return new BartenderDTO(
                bartender.getId(),
                bartender.getName()
        );
    }

    public Bartender toEntity(BartenderDTO dto) {
        Bartender bartender = new Bartender();

        bartender.setName(dto.getName());

        return bartender;
    }
}
