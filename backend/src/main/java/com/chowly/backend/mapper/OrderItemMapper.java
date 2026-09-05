package com.chowly.backend.mapper;

import com.chowly.backend.dto.OrderItemDTO;
import com.chowly.backend.entity.MenuItem;
import com.chowly.backend.entity.OrderItem;
import org.springframework.stereotype.Component;

@Component
public class OrderItemMapper {

    public OrderItemDTO toDTO(OrderItem orderItem) {

        Long chefId = null;
        String chefName = null;

        if (orderItem.getChef() != null) {
            chefId = orderItem.getChef().getId();
            chefName = orderItem.getChef().getName();
        }

        Long bartenderId = null;
        String bartenderName = null;

        if (orderItem.getBartender() != null) {
            bartenderId = orderItem.getBartender().getId();
            bartenderName = orderItem.getBartender().getName();
        }

        return new OrderItemDTO(
                orderItem.getId(),
                orderItem.getOrder().getId(),
                orderItem.getMenuItem().getId(),
                orderItem.getMenuItem().getName(),
                orderItem.getQuantity(),
                orderItem.getUnitPrice(),
                orderItem.getPreparationStatus(),
                chefId,
                chefName,
                bartenderId,
                bartenderName
        );
    }

    public OrderItem toEntity(OrderItemDTO dto) {
        OrderItem orderItem = new OrderItem();

        orderItem.setQuantity(dto.getQuantity());
        orderItem.setUnitPrice(dto.getUnitPrice());
        orderItem.setPreparationStatus(dto.getPreparationStatus());

        if (dto.getMenuItemId() != null) {
            orderItem.setMenuItem(
                    new MenuItem(dto.getMenuItemId())
            );
        }

        return orderItem;
    }
}