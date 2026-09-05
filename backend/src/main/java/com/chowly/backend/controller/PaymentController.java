package com.chowly.backend.controller;

import com.chowly.backend.dto.PaymentDTO;
import com.chowly.backend.entity.Payment;
import com.chowly.backend.mapper.PaymentMapper;
import com.chowly.backend.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

    public PaymentController(
            PaymentService paymentService,
            PaymentMapper paymentMapper) {

        this.paymentService = paymentService;
        this.paymentMapper = paymentMapper;
    }

    @GetMapping
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {

        List<PaymentDTO> payments =
                paymentService.getAllPayments()
                        .stream()
                        .map(paymentMapper::toDTO)
                        .toList();

        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentDTO> getPaymentById(
            @PathVariable Long id) {

        Payment payment =
                paymentService.getPaymentById(id);

        return ResponseEntity.ok(
                paymentMapper.toDTO(payment)
        );
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentDTO> getPaymentByOrderId(
            @PathVariable Long orderId) {

        Payment payment =
                paymentService.getPaymentByOrderId(orderId);

        return ResponseEntity.ok(
                paymentMapper.toDTO(payment)
        );
    }

    @PostMapping
    public ResponseEntity<PaymentDTO> createPayment(
            @RequestBody PaymentDTO paymentDTO) {

        Payment payment =
                paymentService.createPayment(
                        paymentDTO.getOrderId()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(paymentMapper.toDTO(payment));
    }

    @PostMapping("/order/{orderId}")
    public ResponseEntity<PaymentDTO> createPaymentByOrder(
            @PathVariable Long orderId) {

        Payment payment =
                paymentService.createPayment(orderId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(paymentMapper.toDTO(payment));
    }

    @PutMapping("/{id}/process")
    public ResponseEntity<PaymentDTO> processPayment(
            @PathVariable Long id) {

        Payment payment =
                paymentService.processPayment(id);

        return ResponseEntity.ok(
                paymentMapper.toDTO(payment)
        );
    }
}
