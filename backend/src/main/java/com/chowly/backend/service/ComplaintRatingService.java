package com.chowly.backend.service;

import com.chowly.backend.entity.Complaint;
import com.chowly.backend.entity.Order;
import com.chowly.backend.entity.Rating;
import com.chowly.backend.exception.ResourceNotFoundException;
import com.chowly.backend.repository.ComplaintRepository;
import com.chowly.backend.repository.OrderRepository;
import com.chowly.backend.repository.RatingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplaintRatingService {

    private final ComplaintRepository complaintRepository;
    private final RatingRepository ratingRepository;
    private final OrderRepository orderRepository;

    public ComplaintRatingService(
            ComplaintRepository complaintRepository,
            RatingRepository ratingRepository,
            OrderRepository orderRepository) {

        this.complaintRepository = complaintRepository;
        this.ratingRepository = ratingRepository;
        this.orderRepository = orderRepository;
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public Complaint getComplaintById(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Complaint not found with id: " + id));
    }

    @Transactional
    public Complaint createComplaint(Long orderId, String comment) {

        if (orderId == null) {
            throw new IllegalArgumentException(
                    "Order ID is required");
        }

        if (comment == null || comment.isBlank()) {
            throw new IllegalArgumentException(
                    "Complaint comment is required");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: " + orderId));

        Complaint complaint = new Complaint();
        complaint.setOrder(order);
        complaint.setComment(comment);
        complaint.setComplaintDate(LocalDateTime.now());

        return complaintRepository.save(complaint);
    }

    @Transactional
    public Complaint resolveComplaint(Long id, String resolution) {

        if (resolution == null || resolution.isBlank()) {
            throw new IllegalArgumentException(
                    "Complaint resolution is required");
        }

        Complaint complaint = getComplaintById(id);

        complaint.setResolution(resolution);

        return complaintRepository.save(complaint);
    }

    public List<Rating> getAllRatings() {
        return ratingRepository.findAll();
    }

    public Rating getRatingById(Long id) {
        return ratingRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Rating not found with id: " + id));
    }

    @Transactional
    public Rating createRating(
            Long orderId,
            Integer score,
            String comment) {

        if (orderId == null) {
            throw new IllegalArgumentException(
                    "Order ID is required");
        }

        if (score == null || score < 1 || score > 5) {
            throw new IllegalArgumentException(
                    "Rating score must be between 1 and 5");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: " + orderId));

        Rating rating = new Rating();
        rating.setOrder(order);
        rating.setScore(score);
        rating.setComment(comment);
        rating.setRatingDate(LocalDateTime.now());

        return ratingRepository.save(rating);
    }
}
