package com.chowly.backend.mapper;

import com.chowly.backend.dto.ComplaintDTO;
import com.chowly.backend.entity.Complaint;
import org.springframework.stereotype.Component;

@Component
public class ComplaintMapper {

    public ComplaintDTO toDTO(Complaint complaint) {
        return new ComplaintDTO(
                complaint.getId(),
                complaint.getOrder().getId(),
                complaint.getComment(),
                complaint.getComplaintDate(),
                complaint.getResolution()
        );
    }

    public Complaint toEntity(ComplaintDTO dto) {
        Complaint complaint = new Complaint();

        complaint.setComment(dto.getComment());
        complaint.setComplaintDate(dto.getComplaintDate());
        complaint.setResolution(dto.getResolution());

        return complaint;
    }
}
