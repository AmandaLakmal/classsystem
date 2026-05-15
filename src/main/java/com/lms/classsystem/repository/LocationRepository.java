package com.lms.classsystem.repository;

import com.lms.classsystem.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    // JpaRepository හරහා Save, Delete, Find වගේ වැඩ ඔක්කොම ඉබේම ලැබෙනවා.
}
