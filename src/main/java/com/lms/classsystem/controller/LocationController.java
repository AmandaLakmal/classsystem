package com.lms.classsystem.controller;

import com.lms.classsystem.dto.LocationDTO;
import com.lms.classsystem.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/location")
@CrossOrigin
public class LocationController {

    @Autowired
    private LocationService locationService;

    @PostMapping("/save")
    public LocationDTO saveLocation(@RequestBody LocationDTO dto) {
        return locationService.saveLocation(dto);
    }

    @GetMapping("/get-all")
    public List<LocationDTO> getAllLocations() {
        return locationService.getAllLocations();
    }

    @PutMapping("/update/{id}")
    public LocationDTO updateLocation(@PathVariable Long id, @RequestBody LocationDTO dto) {
        return locationService.updateLocation(id, dto);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
        return "Location deleted successfully!";
    }
}
