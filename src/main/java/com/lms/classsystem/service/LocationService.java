package com.lms.classsystem.service;

import com.lms.classsystem.entity.Location;

import java.util.List;

public interface LocationService {
    Location saveLocation(Location location);
    List<Location> getAllLocations();
    List<Location> searchLocationsByName(String name);
}
