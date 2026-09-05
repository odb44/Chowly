package com.chowly.backend.controller;

import com.chowly.backend.entity.OrderStatusHistory;
import com.chowly.backend.repository.OrderStatusHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-status-history")
public class OrderStatusHistoryController {

    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    public OrderStatusHistoryController(
            OrderStatusHistoryRepository orderStatusHistoryRepository) {

        this.orderStatusHistoryRepository =
                orderStatusHistoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<OrderStatusHistory>> getAllHistory() {

        return ResponseEntity.ok(
                orderStatusHistoryRepository.findAll()
        );
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderStatusHistory>> getHistoryByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderStatusHistoryRepository
                        .findByOrderIdOrderByChangedAtAsc(orderId)
        );
    }
}
