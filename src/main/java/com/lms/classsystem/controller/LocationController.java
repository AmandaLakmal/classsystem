package com.lms.classsystem.controller;

import com.lms.classsystem.entity.Location;
import com.lms.classsystem.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/location")
@CrossOrigin // important for connect with front end
public class LocationController {

    @Autowired
    private LocationService locationService;

    @PostMapping("/save")   //save location(online, Gurumadala)
    // URL: POST http://localhost:8080/api/v1/location/save
    public Location saveLocation(@RequestBody Location location){
        return locationService.saveLocation(location);
    }

    @GetMapping("/get-all") //getAlldata
    //URL: GET http://localhost:8080/api/v1/location/get-all
    public List<Location> getAllLocations(){
        return locationService.getAllLocations();
    }

    // URL: GET http://localhost:8080/api/v1/location/search?name=Sisula
    @GetMapping("/search") //Education center eka name eka anuwa search kirima
    public List<Location> searchLocations(@RequestParam String name){
        return locationService.searchLocationsByName(name);
    }
}
