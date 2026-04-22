package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public List<Booking> getBookingsByUsername(String username) {
        // In this project, email is used as the username for authentication
        return bookingRepository.findByUserEmail(username);
    }

    public Booking saveBooking(Booking booking) {
        return bookingRepository.save(booking);
    }
}
