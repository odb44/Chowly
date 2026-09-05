package com.chowly.backend.mapper;

import com.chowly.backend.dto.RatingDTO;
import com.chowly.backend.entity.Rating;
import org.springframework.stereotype.Component;

@Component
public class RatingMapper {

    public RatingDTO toDTO(Rating rating) {
        return new RatingDTO(
                rating.getId(),
                rating.getOrder().getId(),
                rating.getScore(),
                rating.getComment(),
                rating.getRatingDate()
        );
    }

    public Rating toEntity(RatingDTO dto) {
        Rating rating = new Rating();

        rating.setScore(dto.getScore());
        rating.setComment(dto.getComment());
        rating.setRatingDate(dto.getRatingDate());

        return rating;
    }
}
