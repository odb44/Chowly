package com.chowly.backend.mapper;

import com.chowly.backend.dto.PaymentDTO;
import com.chowly.backend.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentDTO toDTO(Payment payment) {
        return new PaymentDTO(
                payment.getId(),
                payment.getOrder().getId(),
                payment.getStatus(),
                payment.getAmount(),
                payment.getPaymentDate(),
                payment.getMethod()
        );
    }

    public Payment toEntity(PaymentDTO dto) {
        Payment payment = new Payment();

        payment.setAmount(dto.getAmount());
        payment.setStatus(dto.getStatus());
        payment.setPaymentDate(dto.getPaymentDate());
        payment.setMethod(dto.getMethod());

        return payment;
    }
}
