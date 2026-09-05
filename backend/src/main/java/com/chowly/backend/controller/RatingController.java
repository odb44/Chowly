package com.chowly.backend.controller;

import com.chowly.backend.dto.RatingDTO;
import com.chowly.backend.entity.Rating;
import com.chowly.backend.mapper.RatingMapper;
import com.chowly.backend.service.ComplaintRatingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final ComplaintRatingService complaintRatingService;
    private final RatingMapper ratingMapper;

    public RatingController(
            ComplaintRatingService complaintRatingService,
            RatingMapper ratingMapper) {

        this.complaintRatingService = complaintRatingService;
        this.ratingMapper = ratingMapper;
    }

    @GetMapping
    public ResponseEntity<List<RatingDTO>> getAllRatings() {

        List<RatingDTO> ratings =
                complaintRatingService.getAllRatings()
                        .stream()
                        .map(ratingMapper::toDTO)
                        .toList();

        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RatingDTO> getRatingById(
            @PathVariable Long id) {

        Rating rating =
                complaintRatingService.getRatingById(id);

        return ResponseEntity.ok(
                ratingMapper.toDTO(rating)
        );
    }

    @PostMapping
    public ResponseEntity<RatingDTO> createRating(
            @Valid @RequestBody RatingDTO ratingDTO) {

        Rating rating =
                complaintRatingService.createRating(
                        ratingDTO.getOrderId(),
                        ratingDTO.getScore(),
                        ratingDTO.getComment()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ratingMapper.toDTO(rating));
    }
}
