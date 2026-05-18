package com.lms.classsystem.config;

import com.lms.classsystem.entity.Student;
import com.lms.classsystem.entity.Role;
import com.lms.classsystem.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "superadmin@zerostatelabs.tech";

        // 1. Check if the default admin already exists
        if (!studentRepository.existsByEmail(adminEmail)) {

            // 2. Create new Admin instance to bypass service-layer batchId validation
            Student admin = new Student();
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setEmail(adminEmail);

            // 3. Securely BCrypt hash the password using the PasswordEncoder bean
            admin.setPassword(passwordEncoder.encode("password123"));

            // 4. Set required placeholder constraints to pass database validations
            admin.setStudentRegId("SYS-999");
            admin.setIsActive(true);

            // 5. Explicitly assign the Role.ADMIN enum value
            admin.setRole(Role.ADMIN);

            // 6. Persist directly via repository
            studentRepository.save(admin);

            System.out.println("====================================================");
            System.out.println("🔥 [SEEDER] Default Super Admin seeded successfully!");
            System.out.println("📧 Email: " + adminEmail);
            System.out.println("🔑 Password: password123");
            System.out.println("====================================================");
        } else {
            System.out.println("ℹ️ [SEEDER] Super Admin already exists in the database. Skipping...");
        }
    }
}