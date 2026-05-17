package com.lms.classsystem.repository;

import com.lms.classsystem.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    List<Location> findByNameContainingIgnoreCase(String name);
}

