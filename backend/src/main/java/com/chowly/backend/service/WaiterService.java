package com.chowly.backend.service;

import com.chowly.backend.entity.Waiter;
import com.chowly.backend.repository.WaiterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WaiterService {

    private final WaiterRepository waiterRepository;

    public WaiterService(WaiterRepository waiterRepository) {
        this.waiterRepository = waiterRepository;
    }

    public List<Waiter> getAllWaiters() {
        return waiterRepository.findAll();
    }

    public Waiter getWaiterById(Long id) {
        return waiterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Waiter not found"));
    }

    public Waiter createWaiter(Waiter waiter) {
        return waiterRepository.save(waiter);
    }

    public Waiter updateWaiter(Long id, Waiter updatedWaiter) {
        Waiter existingWaiter = getWaiterById(id);

        existingWaiter.setName(updatedWaiter.getName());

        return waiterRepository.save(existingWaiter);
    }

    public void deleteWaiter(Long id) {
        Waiter waiter = getWaiterById(id);
        waiterRepository.delete(waiter);
    }
}
