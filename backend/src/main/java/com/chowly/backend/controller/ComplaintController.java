package com.chowly.backend.controller;

import com.chowly.backend.dto.ComplaintDTO;
import com.chowly.backend.entity.Complaint;
import com.chowly.backend.mapper.ComplaintMapper;
import com.chowly.backend.service.ComplaintRatingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintRatingService complaintRatingService;
    private final ComplaintMapper complaintMapper;

    public ComplaintController(
            ComplaintRatingService complaintRatingService,
            ComplaintMapper complaintMapper) {

        this.complaintRatingService = complaintRatingService;
        this.complaintMapper = complaintMapper;
    }

    @GetMapping
    public ResponseEntity<List<ComplaintDTO>> getAllComplaints() {

        List<ComplaintDTO> complaints =
                complaintRatingService.getAllComplaints()
                        .stream()
                        .map(complaintMapper::toDTO)
                        .toList();

        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintDTO> getComplaintById(
            @PathVariable Long id) {

        Complaint complaint =
                complaintRatingService.getComplaintById(id);

        return ResponseEntity.ok(
                complaintMapper.toDTO(complaint)
        );
    }

    @PostMapping
    public ResponseEntity<ComplaintDTO> createComplaint(
            @Valid @RequestBody ComplaintDTO complaintDTO) {

        Complaint complaint =
                complaintRatingService.createComplaint(
                        complaintDTO.getOrderId(),
                        complaintDTO.getComment()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(complaintMapper.toDTO(complaint));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ComplaintDTO> resolveComplaint(
            @PathVariable Long id,
            @RequestBody ComplaintDTO complaintDTO) {

        Complaint complaint =
                complaintRatingService.resolveComplaint(
                        id,
                        complaintDTO.getResolution()
                );

        return ResponseEntity.ok(
                complaintMapper.toDTO(complaint)
        );
    }
}
