package com.chowly.backend.service;

import com.chowly.backend.entity.Order;
import com.chowly.backend.entity.Payment;
import com.chowly.backend.enums.OrderStatus;
import com.chowly.backend.enums.PaymentMethod;
import com.chowly.backend.enums.PaymentStatus;
import com.chowly.backend.exception.ResourceNotFoundException;
import com.chowly.backend.repository.OrderRepository;
import com.chowly.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          OrderRepository orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment not found with id: " + id));
    }

    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment not found for order with id: "
                                        + orderId));
    }

    @Transactional
    public Payment createPayment(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: " + orderId));

        if (paymentRepository.findByOrderId(orderId).isPresent()) {
            throw new IllegalArgumentException(
                    "A payment already exists for this order");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setMethod(PaymentMethod.PRETEND);

        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment processPayment(Long paymentId) {

        Payment payment = getPaymentById(paymentId);

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new IllegalArgumentException(
                    "Payment has already been processed");
        }

        Order order = payment.getOrder();

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setMethod(PaymentMethod.PRETEND);

        order.setStatus(OrderStatus.PAID);

        orderRepository.save(order);

        return paymentRepository.save(payment);
    }
}
