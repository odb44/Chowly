package com.chowly.backend.service;

import com.chowly.backend.entity.MenuItem;
import com.chowly.backend.entity.Order;
import com.chowly.backend.entity.OrderItem;
import com.chowly.backend.entity.OrderStatusHistory;
import com.chowly.backend.entity.Table;
import com.chowly.backend.entity.Waiter;
import com.chowly.backend.enums.OrderStatus;
import com.chowly.backend.enums.PreparationStatus;
import com.chowly.backend.exception.ResourceNotFoundException;
import com.chowly.backend.repository.MenuItemRepository;
import com.chowly.backend.repository.OrderItemRepository;
import com.chowly.backend.repository.OrderRepository;
import com.chowly.backend.repository.OrderStatusHistoryRepository;
import com.chowly.backend.repository.TableRepository;
import com.chowly.backend.repository.WaiterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final TableRepository tableRepository;
    private final WaiterRepository waiterRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            OrderStatusHistoryRepository orderStatusHistoryRepository,
            MenuItemRepository menuItemRepository,
            TableRepository tableRepository,
            WaiterRepository waiterRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.menuItemRepository = menuItemRepository;
        this.tableRepository = tableRepository;
        this.waiterRepository = waiterRepository;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: " + id));
    }

    @Transactional
    public Order createOrder(Order order, List<OrderItem> requestedItems) {

        if (requestedItems == null || requestedItems.isEmpty()) {
            throw new IllegalArgumentException(
                    "Order must contain at least one item");
        }

        if (order.getTable() == null || order.getTable().getId() == null) {
            throw new IllegalArgumentException(
                    "A valid table is required");
        }

        Table table = tableRepository.findById(order.getTable().getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Table not found with id: "
                                        + order.getTable().getId()));

        BigDecimal totalAmount = BigDecimal.ZERO;
        int estimatedWaitTime = 0;

        order.setTable(table);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());

        for (OrderItem requestedItem : requestedItems) {

            if (requestedItem.getMenuItem() == null
                    || requestedItem.getMenuItem().getId() == null) {
                throw new IllegalArgumentException(
                        "Every order item must have a valid menu item");
            }

            if (requestedItem.getQuantity() == null
                    || requestedItem.getQuantity() <= 0) {
                throw new IllegalArgumentException(
                        "Order item quantity must be greater than zero");
            }

            MenuItem menuItem = menuItemRepository
                    .findById(requestedItem.getMenuItem().getId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Menu item not found with id: "
                                            + requestedItem.getMenuItem().getId()));

            if (!Boolean.TRUE.equals(menuItem.getAvailability())) {
                throw new IllegalArgumentException(
                        "Menu item is currently unavailable: "
                                + menuItem.getName());
            }

            BigDecimal itemTotal = menuItem.getPrice()
                    .multiply(BigDecimal.valueOf(requestedItem.getQuantity()));

            totalAmount = totalAmount.add(itemTotal);

            estimatedWaitTime = Math.max(
                    estimatedWaitTime,
                    menuItem.getPreparationTime());

            requestedItem.setMenuItem(menuItem);
            requestedItem.setUnitPrice(menuItem.getPrice());
            requestedItem.setPreparationStatus(
                    PreparationStatus.PENDING);
            requestedItem.setOrder(order);
        }

        order.setEstimatedWaitTime(estimatedWaitTime);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        for (OrderItem requestedItem : requestedItems) {
            requestedItem.setOrder(savedOrder);
            orderItemRepository.save(requestedItem);
        }

        OrderStatusHistory initialHistory =
                new OrderStatusHistory(savedOrder, OrderStatus.PENDING);

        orderStatusHistoryRepository.save(initialHistory);

        return savedOrder;
    }

    public Order createOrder(Order order) {
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderStatus(Long id, OrderStatus status) {

        if (status == null) {
            throw new IllegalArgumentException(
                    "Order status is required");
        }

        Order order = getOrderById(id);

        if (order.getStatus() != status) {
            order.setStatus(status);
            orderRepository.save(order);

            OrderStatusHistory history =
                    new OrderStatusHistory(order, status);

            orderStatusHistoryRepository.save(history);
        }

        return order;
    }

    @Transactional
    public Order assignWaiter(Long orderId, Long waiterId) {

        Order order = getOrderById(orderId);

        Waiter waiter = waiterRepository.findById(waiterId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Waiter not found with id: " + waiterId));

        order.setWaiter(waiter);

        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        Order order = getOrderById(id);
        orderRepository.delete(order);
    }
}
