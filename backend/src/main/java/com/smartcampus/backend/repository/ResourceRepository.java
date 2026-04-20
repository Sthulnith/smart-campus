package com.smartcampus.backend.repository;
import com.smartcampus.backend.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
}