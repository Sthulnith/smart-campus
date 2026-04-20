package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.AppUser;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.repository.AppUserRepository;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private AppUserRepository userRepository;

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    /**
     * Get bookings for the currently logged-in user.
     * Replaces /bookings/user/{id}
     */
    @GetMapping("/user")
    public List<Booking> getUserBookings(Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Not authenticated");
        }
        String email = authentication.getName();
        return bookingService.getBookingsByUsername(email);
    }

    @PostMapping
    public Booking createBooking(@RequestBody Booking booking, Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Not authenticated");
        }
        
        String email = authentication.getName();
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        booking.setUser(user);

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
        b.setDate(updated.getDate());
        b.setStartTime(updated.getStartTime());
        b.setEndTime(updated.getEndTime());
        b.setPurpose(updated.getPurpose());
        b.setAttendees(updated.getAttendees());

        return bookingRepository.save(b);
    }

    @PutMapping("/{id}/approve")
    public Booking approveBooking(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getStatus().equals("PENDING")) {
            throw new RuntimeException("Only pending bookings can be approved");
        }

        booking.setStatus("APPROVED");
        return bookingRepository.save(booking);
    }

    @PutMapping("/{id}/cancel")
    public Booking cancelBooking(@PathVariable Long id, Authentication authentication) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (authentication == null) {
            throw new RuntimeException("Not authenticated");
        }

        String email = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !booking.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Not authorized to cancel this booking");
        }

        if (booking.getStatus().equals("CANCELLED")) {
            throw new RuntimeException("Booking is already cancelled");
        }

        if (booking.getStatus().equals("REJECTED")) {
            throw new RuntimeException("Rejected booking cannot be cancelled");
        }

        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }

    @PutMapping("/{id}/reject")
    public Booking rejectBooking(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getStatus().equals("PENDING")) {
            throw new RuntimeException("Only pending bookings can be rejected");
        }

        booking.setStatus("REJECTED");
        return bookingRepository.save(booking);
    }
}
