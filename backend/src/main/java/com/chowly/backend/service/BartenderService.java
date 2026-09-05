package com.chowly.backend.service;

import com.chowly.backend.entity.Bartender;
import com.chowly.backend.repository.BartenderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BartenderService {

    private final BartenderRepository bartenderRepository;

    public BartenderService(BartenderRepository bartenderRepository) {
        this.bartenderRepository = bartenderRepository;
    }

    public List<Bartender> getAllBartenders() {
        return bartenderRepository.findAll();
    }

    public Bartender getBartenderById(Long id) {
        return bartenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bartender not found"));
    }

    public Bartender createBartender(Bartender bartender) {
        return bartenderRepository.save(bartender);
    }

    public Bartender updateBartender(Long id, Bartender updatedBartender) {
        Bartender existingBartender = getBartenderById(id);

        existingBartender.setName(updatedBartender.getName());

        return bartenderRepository.save(existingBartender);
    }

    public void deleteBartender(Long id) {
        Bartender bartender = getBartenderById(id);
        bartenderRepository.delete(bartender);
    }
}
