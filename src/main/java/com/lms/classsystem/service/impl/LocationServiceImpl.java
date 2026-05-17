package com.lms.classsystem.service.impl;

import com.lms.classsystem.dto.LocationDTO;
import com.lms.classsystem.entity.Location;
import com.lms.classsystem.repository.LocationRepository;
import com.lms.classsystem.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationServiceImpl implements LocationService {

    @Autowired
    private LocationRepository locationRepository;

    private LocationDTO mapToDTO(Location entity) {
        return new LocationDTO(entity.getId(), entity.getName(), entity.getAddress(), entity.getContactNumber());
    }

    @Override
    public LocationDTO saveLocation(LocationDTO dto) {
        Location location = new Location();
        location.setName(dto.getName());
        location.setAddress(dto.getAddress());
        location.setContactNumber(dto.getContactNumber());
        Location saved = locationRepository.save(location);
        return mapToDTO(saved);
    }

    @Override
    public List<LocationDTO> getAllLocations() {
        return locationRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public LocationDTO updateLocation(Long id, LocationDTO dto) {
        Location location = locationRepository.findById(id).orElseThrow(() -> new RuntimeException("Location not found"));
        location.setName(dto.getName());
        location.setAddress(dto.getAddress());
        location.setContactNumber(dto.getContactNumber());
        Location saved = locationRepository.save(location);
        return mapToDTO(saved);
    }

    @Override
    public void deleteLocation(Long id) {
        locationRepository.deleteById(id);
    }
}
