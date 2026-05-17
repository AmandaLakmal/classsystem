package com.lms.classsystem.service.impl;

import com.lms.classsystem.dto.CourseSaveDTO;
import com.lms.classsystem.dto.CourseResponseDTO;
import com.lms.classsystem.entity.Course;
import com.lms.classsystem.entity.Instructor;
import com.lms.classsystem.entity.Location;
import com.lms.classsystem.repository.CourseRepository;
import com.lms.classsystem.repository.InstructorRepository;
import com.lms.classsystem.repository.LocationRepository;
import com.lms.classsystem.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private InstructorRepository instructorRepository;

    private CourseResponseDTO mapToDTO(Course entity) {
        return new CourseResponseDTO(
            entity.getId(),
            entity.getCourseName(),
            entity.getFee(),
            entity.getCategory(),
            entity.isOnline(),
            entity.getLocation() != null ? entity.getLocation().getId() : null,
            entity.getInstructor() != null ? entity.getInstructor().getId() : null
        );
    }

    @Override
    public CourseResponseDTO saveCourse(CourseSaveDTO dto) {
        Course course = new Course();
        course.setCourseName(dto.getCourseName());
        course.setFee(dto.getFee());
        course.setCategory(dto.getCategory());
        course.setOnline(dto.isOnline());

        if (dto.getLocationId() != null) {
            Location location = locationRepository.findById(dto.getLocationId())
                    .orElseThrow(() -> new RuntimeException("Location not found"));
            course.setLocation(location);
        }

        if (dto.getInstructorId() != null) {
            Instructor instructor = instructorRepository.findById(dto.getInstructorId())
                    .orElseThrow(() -> new RuntimeException("Instructor not found"));
            course.setInstructor(instructor);
        }

        return mapToDTO(courseRepository.save(course));
    }

    @Override
    public List<CourseResponseDTO> getAllCourses() {
        return courseRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public CourseResponseDTO updateCourse(Long id, CourseSaveDTO dto) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
                
        course.setCourseName(dto.getCourseName());
        course.setFee(dto.getFee());
        course.setCategory(dto.getCategory());
        course.setOnline(dto.isOnline());

        if (dto.getLocationId() != null) {
            Location location = locationRepository.findById(dto.getLocationId())
                    .orElseThrow(() -> new RuntimeException("Location not found"));
            course.setLocation(location);
        } else {
            course.setLocation(null);
        }

        if (dto.getInstructorId() != null) {
            Instructor instructor = instructorRepository.findById(dto.getInstructorId())
                    .orElseThrow(() -> new RuntimeException("Instructor not found"));
            course.setInstructor(instructor);
        } else {
            course.setInstructor(null);
        }

        return mapToDTO(courseRepository.save(course));
    }

    @Override
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}
