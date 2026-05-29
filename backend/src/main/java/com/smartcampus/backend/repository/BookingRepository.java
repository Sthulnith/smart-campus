package com.smartcampus.backend.repository;
import com.smartcampus.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Find overlapping bookings(IMPORTANT)
    List<Booking> findByResourceIdAndDateAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
            Long resourceId,
            LocalDate date,
            LocalTime endTime,
            LocalTime startTime
    );

    // Fetch bookings by user email (username)
    List<Booking> findByUserEmail(String email);
}