package com.chowly.backend.service;

import com.chowly.backend.entity.Bartender;
import com.chowly.backend.entity.Chef;
import com.chowly.backend.entity.MenuItem;
import com.chowly.backend.entity.OrderItem;
import com.chowly.backend.enums.MenuItemType;
import com.chowly.backend.enums.PreparationStatus;
import com.chowly.backend.exception.ResourceNotFoundException;
import com.chowly.backend.repository.BartenderRepository;
import com.chowly.backend.repository.ChefRepository;
import com.chowly.backend.repository.MenuItemRepository;
import com.chowly.backend.repository.OrderItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final ChefRepository chefRepository;
    private final BartenderRepository bartenderRepository;

    public OrderItemService(
            OrderItemRepository orderItemRepository,
            MenuItemRepository menuItemRepository,
            ChefRepository chefRepository,
            BartenderRepository bartenderRepository) {

        this.orderItemRepository = orderItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.chefRepository = chefRepository;
        this.bartenderRepository = bartenderRepository;
    }

    public List<OrderItem> getAllOrderItems() {
        return orderItemRepository.findAll();
    }

    public OrderItem getOrderItemById(Long id) {
        return orderItemRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order item not found with id: " + id));
    }

    @Transactional
    public OrderItem createOrderItem(OrderItem orderItem) {

        if (orderItem.getMenuItem() == null
                || orderItem.getMenuItem().getId() == null) {
            throw new IllegalArgumentException(
                    "A valid menu item is required");
        }

        if (orderItem.getQuantity() == null
                || orderItem.getQuantity() <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero");
        }

        MenuItem menuItem = menuItemRepository
                .findById(orderItem.getMenuItem().getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Menu item not found with id: "
                                        + orderItem.getMenuItem().getId()));

        if (!Boolean.TRUE.equals(menuItem.getAvailability())) {
            throw new IllegalArgumentException(
                    "Menu item is currently unavailable: "
                            + menuItem.getName());
        }

        orderItem.setMenuItem(menuItem);
        orderItem.setUnitPrice(menuItem.getPrice());

        if (orderItem.getPreparationStatus() == null) {
            orderItem.setPreparationStatus(PreparationStatus.PENDING);
        }

        validateStaffAssignment(orderItem, menuItem);

        return orderItemRepository.save(orderItem);
    }

    @Transactional
    public OrderItem updateOrderItem(Long id, OrderItem updatedOrderItem) {

        OrderItem existingOrderItem = getOrderItemById(id);

        if (updatedOrderItem.getQuantity() == null
                || updatedOrderItem.getQuantity() <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero");
        }

        MenuItem menuItem = existingOrderItem.getMenuItem();

        if (menuItem == null) {
            throw new ResourceNotFoundException(
                    "Menu item not found for order item");
        }

        existingOrderItem.setQuantity(updatedOrderItem.getQuantity());

        // Always keep the price from the menu item.
        existingOrderItem.setUnitPrice(menuItem.getPrice());

        if (updatedOrderItem.getPreparationStatus() != null) {
            existingOrderItem.setPreparationStatus(
                    updatedOrderItem.getPreparationStatus());
        }

        existingOrderItem.setChef(updatedOrderItem.getChef());
        existingOrderItem.setBartender(updatedOrderItem.getBartender());

        validateStaffAssignment(existingOrderItem, menuItem);

        return orderItemRepository.save(existingOrderItem);
    }

    @Transactional
    public OrderItem assignChef(Long orderItemId, Long chefId) {

        OrderItem orderItem = getOrderItemById(orderItemId);

        MenuItem menuItem = orderItem.getMenuItem();

        if (menuItem == null) {
            throw new ResourceNotFoundException(
                    "Menu item not found for order item");
        }

        if (menuItem.getType() != MenuItemType.FOOD) {
            throw new IllegalArgumentException(
                    "A chef can only be assigned to food items");
        }

        Chef chef = chefRepository.findById(chefId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Chef not found with id: " + chefId));

        orderItem.setChef(chef);
        orderItem.setBartender(null);

        return orderItemRepository.save(orderItem);
    }

    @Transactional
    public OrderItem assignBartender(Long orderItemId, Long bartenderId) {

        OrderItem orderItem = getOrderItemById(orderItemId);

        MenuItem menuItem = orderItem.getMenuItem();

        if (menuItem == null) {
            throw new ResourceNotFoundException(
                    "Menu item not found for order item");
        }

        if (menuItem.getType() != MenuItemType.DRINK) {
            throw new IllegalArgumentException(
                    "A bartender can only be assigned to drink items");
        }

        Bartender bartender = bartenderRepository.findById(bartenderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Bartender not found with id: "
                                        + bartenderId));

        orderItem.setBartender(bartender);
        orderItem.setChef(null);

        return orderItemRepository.save(orderItem);
    }

    @Transactional
    public OrderItem updatePreparationStatus(
            Long orderItemId,
            PreparationStatus preparationStatus) {

        if (preparationStatus == null) {
            throw new IllegalArgumentException(
                    "Preparation status is required");
        }

        OrderItem orderItem = getOrderItemById(orderItemId);

        orderItem.setPreparationStatus(preparationStatus);

        return orderItemRepository.save(orderItem);
    }

    private void validateStaffAssignment(
            OrderItem orderItem,
            MenuItem menuItem) {

        if (menuItem.getType() == MenuItemType.FOOD) {

            if (orderItem.getBartender() != null) {
                throw new IllegalArgumentException(
                        "A bartender cannot be assigned to a food item");
            }

            if (orderItem.getChef() != null) {
                Chef chef = chefRepository
                        .findById(orderItem.getChef().getId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Chef not found with id: "
                                                + orderItem.getChef().getId()));

                orderItem.setChef(chef);
            }

        } else if (menuItem.getType() == MenuItemType.DRINK) {

            if (orderItem.getChef() != null) {
                throw new IllegalArgumentException(
                        "A chef cannot be assigned to a drink item");
            }

            if (orderItem.getBartender() != null) {
                Bartender bartender = bartenderRepository
                        .findById(orderItem.getBartender().getId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bartender not found with id: "
                                                + orderItem.getBartender().getId()));

                orderItem.setBartender(bartender);
            }
        }
    }

    public void deleteOrderItem(Long id) {
        OrderItem orderItem = getOrderItemById(id);
        orderItemRepository.delete(orderItem);
    }
}
