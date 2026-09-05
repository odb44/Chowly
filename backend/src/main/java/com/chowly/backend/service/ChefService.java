package com.chowly.backend.service;

import com.chowly.backend.entity.Chef;
import com.chowly.backend.repository.ChefRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChefService {

    private final ChefRepository chefRepository;

    public ChefService(ChefRepository chefRepository) {
        this.chefRepository = chefRepository;
    }

    public List<Chef> getAllChefs() {
        return chefRepository.findAll();
    }

    public Chef getChefById(Long id) {
        return chefRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chef not found"));
    }

    public Chef createChef(Chef chef) {
        return chefRepository.save(chef);
    }

    public Chef updateChef(Long id, Chef updatedChef) {
        Chef existingChef = getChefById(id);

        existingChef.setName(updatedChef.getName());

        return chefRepository.save(existingChef);
    }

    public void deleteChef(Long id) {
        Chef chef = getChefById(id);
        chefRepository.delete(chef);
    }
}
