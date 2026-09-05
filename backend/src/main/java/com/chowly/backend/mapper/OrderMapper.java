package com.chowly.backend.mapper;

import com.chowly.backend.dto.OrderDTO;
import com.chowly.backend.dto.OrderItemDTO;
import com.chowly.backend.entity.Order;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class OrderMapper {

    private final OrderItemMapper orderItemMapper;

    public OrderMapper(OrderItemMapper orderItemMapper) {
        this.orderItemMapper = orderItemMapper;
    }

    public OrderDTO toDTO(Order order, List<com.chowly.backend.entity.OrderItem> orderItems) {

        Long tableId = null;
        Integer tableNumber = null;

        if (order.getTable() != null) {
            tableId = order.getTable().getId();
            tableNumber = order.getTable().getNumber();
        }

        Long waiterId = null;
        String waiterName = null;

        if (order.getWaiter() != null) {
            waiterId = order.getWaiter().getId();
            waiterName = order.getWaiter().getName();
        }

        List<OrderItemDTO> items = orderItems == null
                ? Collections.emptyList()
                : orderItems.stream()
                .map(orderItemMapper::toDTO)
                .toList();

        return new OrderDTO(
                order.getId(),
                tableId,
                tableNumber,
                waiterId,
                waiterName,
                order.getStatus(),
                order.getEstimatedWaitTime(),
                order.getTotalAmount(),
                order.getOrderDate(),
                items
        );
    }
}
