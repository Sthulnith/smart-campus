package com.smartcampus.backend.controller;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    
    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {

        // Check for time conflicts
        List<Booking> conflicts = bookingRepository
                .findByResourceIdAndDateAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                        booking.getResourceId(),
                        booking.getDate(),
                        booking.getEndTime(),
                        booking.getStartTime()
                );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Time slot already booked!");
        }

        booking.setStatus("PENDING");
        return bookingRepository.save(booking);
    }
    @PutMapping("/{id}")
public Booking updateBooking(@PathVariable Long id, @RequestBody Booking updated) {
    Booking b = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

    b.setResourceId(updated.getResourceId());
    b.setUserId(updated.getUserId());
    b.setDate(updated.getDate());
    b.setStartTime(updated.getStartTime());
    b.setEndTime(updated.getEndTime());
    b.setPurpose(updated.getPurpose());
    b.setAttendees(updated.getAttendees());

    return bookingRepository.save(b);
}
    //cancel booking
    @PutMapping("/{id}/cancel")
    public Booking cancelBooking(@PathVariable Long id) {

    Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

    if (booking.getStatus().equals("CANCELLED")) {
        throw new RuntimeException("Booking is already cancelled");
    }

    if (booking.getStatus().equals("REJECTED")) {
        throw new RuntimeException("Rejected booking cannot be cancelled");
    }

    booking.setStatus("CANCELLED");
    return bookingRepository.save(booking);
}

}
