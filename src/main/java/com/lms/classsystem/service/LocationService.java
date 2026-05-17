package com.lms.classsystem.service;

import com.lms.classsystem.dto.LocationDTO;
import java.util.List;

public interface LocationService {
    LocationDTO saveLocation(LocationDTO dto);
    List<LocationDTO> getAllLocations();
    LocationDTO updateLocation(Long id, LocationDTO dto);
    void deleteLocation(Long id);
}
