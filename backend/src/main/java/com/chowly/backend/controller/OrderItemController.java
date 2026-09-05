package com.chowly.backend.controller;

import com.chowly.backend.dto.OrderItemDTO;
import com.chowly.backend.entity.OrderItem;
import com.chowly.backend.enums.PreparationStatus;
import com.chowly.backend.mapper.OrderItemMapper;
import com.chowly.backend.service.OrderItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-items")
public class OrderItemController {

    private final OrderItemService orderItemService;
    private final OrderItemMapper orderItemMapper;

    public OrderItemController(
            OrderItemService orderItemService,
            OrderItemMapper orderItemMapper) {

        this.orderItemService = orderItemService;
        this.orderItemMapper = orderItemMapper;
    }

    @GetMapping
    public ResponseEntity<List<OrderItemDTO>> getAllOrderItems() {

        List<OrderItemDTO> orderItems =
                orderItemService.getAllOrderItems()
                        .stream()
                        .map(orderItemMapper::toDTO)
                        .toList();

        return ResponseEntity.ok(orderItems);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderItemDTO> getOrderItemById(
            @PathVariable Long id) {

        OrderItem orderItem =
                orderItemService.getOrderItemById(id);

        return ResponseEntity.ok(
                orderItemMapper.toDTO(orderItem)
        );
    }

    @PostMapping
    public ResponseEntity<OrderItemDTO> createOrderItem(
            @Valid @RequestBody OrderItemDTO orderItemDTO) {

        OrderItem orderItem =
                orderItemMapper.toEntity(orderItemDTO);

        OrderItem createdOrderItem =
                orderItemService.createOrderItem(orderItem);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(orderItemMapper.toDTO(createdOrderItem));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderItemDTO> updateOrderItem(
            @PathVariable Long id,
            @Valid @RequestBody OrderItemDTO orderItemDTO) {

        OrderItem updatedOrderItem =
                orderItemMapper.toEntity(orderItemDTO);

        OrderItem savedOrderItem =
                orderItemService.updateOrderItem(
                        id,
                        updatedOrderItem
                );

        return ResponseEntity.ok(
                orderItemMapper.toDTO(savedOrderItem)
        );
    }

    @PutMapping("/{id}/chef/{chefId}")
    public ResponseEntity<OrderItemDTO> assignChef(
            @PathVariable Long id,
            @PathVariable Long chefId) {

        OrderItem updatedOrderItem =
                orderItemService.assignChef(id, chefId);

        return ResponseEntity.ok(
                orderItemMapper.toDTO(updatedOrderItem)
        );
    }

    @PutMapping("/{id}/bartender/{bartenderId}")
    public ResponseEntity<OrderItemDTO> assignBartender(
            @PathVariable Long id,
            @PathVariable Long bartenderId) {

        OrderItem updatedOrderItem =
                orderItemService.assignBartender(
                        id,
                        bartenderId
                );

        return ResponseEntity.ok(
                orderItemMapper.toDTO(updatedOrderItem)
        );
    }

    @PutMapping("/{id}/preparation-status")
    public ResponseEntity<OrderItemDTO> updatePreparationStatus(
            @PathVariable Long id,
            @RequestParam PreparationStatus preparationStatus) {

        OrderItem updatedOrderItem =
                orderItemService.updatePreparationStatus(
                        id,
                        preparationStatus
                );

        return ResponseEntity.ok(
                orderItemMapper.toDTO(updatedOrderItem)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrderItem(
            @PathVariable Long id) {

        orderItemService.deleteOrderItem(id);

        return ResponseEntity.noContent().build();
    }
}
