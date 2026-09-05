package com.chowly.backend.dto;

import com.chowly.backend.enums.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDTO {

    private Long id;

    @NotNull(message = "Table ID is required")
    @Positive(message = "Table ID must be greater than zero")
    private Long tableId;

    private Integer tableNumber;

    private Long waiterId;

    private String waiterName;

    private OrderStatus status;

    private Integer estimatedWaitTime;

    private BigDecimal totalAmount;

    private LocalDateTime orderDate;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemDTO> items;

    public OrderDTO() {
    }

    public OrderDTO(Long id, Long tableId, Integer tableNumber,
                    Long waiterId, String waiterName,
                    OrderStatus status, Integer estimatedWaitTime,
                    BigDecimal totalAmount, LocalDateTime orderDate,
                    List<OrderItemDTO> items) {
        this.id = id;
        this.tableId = tableId;
        this.tableNumber = tableNumber;
        this.waiterId = waiterId;
        this.waiterName = waiterName;
        this.status = status;
        this.estimatedWaitTime = estimatedWaitTime;
        this.totalAmount = totalAmount;
        this.orderDate = orderDate;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTableId() {
        return tableId;
    }

    public void setTableId(Long tableId) {
        this.tableId = tableId;
    }

    public Integer getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(Integer tableNumber) {
        this.tableNumber = tableNumber;
    }

    public Long getWaiterId() {
        return waiterId;
    }

    public void setWaiterId(Long waiterId) {
        this.waiterId = waiterId;
    }

    public String getWaiterName() {
        return waiterName;
    }

    public void setWaiterName(String waiterName) {
        this.waiterName = waiterName;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public Integer getEstimatedWaitTime() {
        return estimatedWaitTime;
    }

    public void setEstimatedWaitTime(Integer estimatedWaitTime) {
        this.estimatedWaitTime = estimatedWaitTime;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public List<OrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDTO> items) {
        this.items = items;
    }
}
