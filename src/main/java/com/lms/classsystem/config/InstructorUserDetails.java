package com.lms.classsystem.config;

import com.lms.classsystem.entity.Instructor;
import com.lms.classsystem.entity.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * UserDetails adapter for Instructor entities.
 * Mirrors CustomUserDetails but wraps an Instructor instead of a Student.
 */
public class InstructorUserDetails implements UserDetails {

    private final Instructor instructor;

    public InstructorUserDetails(Instructor instructor) {
        this.instructor = instructor;
    }

    public Instructor getInstructor() {
        return instructor;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Role role = instructor.getRole() != null ? instructor.getRole() : Role.TEACHER;
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return instructor.getPassword();
    }

    @Override
    public String getUsername() {
        return instructor.getEmail();
    }

    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() {
        return instructor.getIsActive() != null ? instructor.getIsActive() : true;
    }
}
