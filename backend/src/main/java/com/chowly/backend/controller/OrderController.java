package com.chowly.backend.controller;

import com.chowly.backend.dto.OrderDTO;
import com.chowly.backend.entity.Order;
import com.chowly.backend.entity.OrderItem;
import com.chowly.backend.entity.Table;
import com.chowly.backend.enums.OrderStatus;
import com.chowly.backend.mapper.OrderItemMapper;
import com.chowly.backend.mapper.OrderMapper;
import com.chowly.backend.repository.OrderItemRepository;
import com.chowly.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final OrderItemRepository orderItemRepository;

    public OrderController(
            OrderService orderService,
            OrderMapper orderMapper,
            OrderItemMapper orderItemMapper,
            OrderItemRepository orderItemRepository) {

        this.orderService = orderService;
        this.orderMapper = orderMapper;
        this.orderItemMapper = orderItemMapper;
        this.orderItemRepository = orderItemRepository;
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {

        List<OrderDTO> orders = orderService.getAllOrders()
                .stream()
                .map(order -> orderMapper.toDTO(
                        order,
                        orderItemRepository.findByOrderId(order.getId())
                ))
                .toList();

        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(
            @PathVariable Long id) {

        Order order = orderService.getOrderById(id);

        List<OrderItem> orderItems =
                orderItemRepository.findByOrderId(id);

        return ResponseEntity.ok(
                orderMapper.toDTO(order, orderItems)
        );
    }

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(
            @Valid @RequestBody OrderDTO orderDTO) {

        Order order = new Order();

        Table table = new Table(orderDTO.getTableId());
        order.setTable(table);

        List<OrderItem> orderItems = orderDTO.getItems()
                .stream()
                .map(orderItemMapper::toEntity)
                .toList();

        Order createdOrder =
                orderService.createOrder(order, orderItems);

        List<OrderItem> savedItems =
                orderItemRepository.findByOrderId(
                        createdOrder.getId()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(orderMapper.toDTO(
                        createdOrder,
                        savedItems
                ));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {

        Order updatedOrder =
                orderService.updateOrderStatus(id, status);

        List<OrderItem> orderItems =
                orderItemRepository.findByOrderId(id);

        return ResponseEntity.ok(
                orderMapper.toDTO(
                        updatedOrder,
                        orderItems
                )
        );
    }

    @PutMapping("/{orderId}/waiter/{waiterId}")
    public ResponseEntity<OrderDTO> assignWaiter(
            @PathVariable Long orderId,
            @PathVariable Long waiterId) {

        Order updatedOrder =
                orderService.assignWaiter(orderId, waiterId);

        List<OrderItem> orderItems =
                orderItemRepository.findByOrderId(orderId);

        return ResponseEntity.ok(
                orderMapper.toDTO(
                        updatedOrder,
                        orderItems
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(
            @PathVariable Long id) {

        orderService.deleteOrder(id);

        return ResponseEntity.noContent().build();
    }
}
