package com.lms.classsystem.repository;

import com.lms.classsystem.entity.Lession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LessionRepository extends JpaRepository<Lession, Long> {
}
