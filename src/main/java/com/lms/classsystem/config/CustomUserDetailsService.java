package com.lms.classsystem.config;

import com.lms.classsystem.entity.Instructor;
import com.lms.classsystem.entity.Student;
import com.lms.classsystem.repository.InstructorRepository;
import com.lms.classsystem.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Dual-table authentication service.
 *
 * Resolution order:
 *  1. Look up the email in the Student table  → returns a student UserDetails
 *  2. Fall back to the Instructor table        → returns a teacher UserDetails
 *  3. Neither found                            → throw UsernameNotFoundException
 *
 * This keeps the existing student auth completely intact while adding
 * teacher login without any schema migration.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private InstructorRepository instructorRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        // 1. Try Student table first (preserves all existing behaviour)
        java.util.Optional<Student> studentOpt = studentRepository.findByEmail(email);
        if (studentOpt.isPresent()) {
            return new CustomUserDetails(studentOpt.get());
        }

        // 2. Fall back to Instructor table (new teacher login path)
        Instructor instructor = instructorRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No account found for email: " + email));

        // Instructors without a provisioned password cannot log in
        if (instructor.getPassword() == null || instructor.getPassword().isBlank()) {
            throw new UsernameNotFoundException(
                    "Instructor account not yet provisioned with a password: " + email);
        }

        return new InstructorUserDetails(instructor);
    }
}
