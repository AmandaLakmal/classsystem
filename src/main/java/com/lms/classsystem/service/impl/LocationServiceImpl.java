package com.lms.classsystem.service.impl;

import com.lms.classsystem.entity.Location;
import com.lms.classsystem.repository.LocationRepository;
import com.lms.classsystem.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationServiceImpl implements LocationService {

    @Autowired
    private LocationRepository locationRepository;

    @Override
    public Location saveLocation(Location location) {
        return locationRepository.save(location);
    }

    @Override
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    @Override
    public List<Location> searchLocationsByName(String name) {
        return locationRepository.findByNameContainingIgnoreCase(name);
    }
}
