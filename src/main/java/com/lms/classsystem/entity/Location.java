package com.lms.classsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "location")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;    //Class name ("Sisula","Online","Sakya")

    String address; //Class Location("Mathugama")

    private String contactNumber; //Maintainer contact number(පන්ති බාර නිලධාරියා)
}
