package com.smartcampus.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseFixConfig {

    @Bean
    public CommandLineRunner fixRoleConstraint(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                System.out.println("Fixing database role constraint...");
                // Drop the constraint if it exists. 
                // In some cases Hibernate names it differently, but the logs specifically mentioned "app_users_role_check"
                jdbcTemplate.execute("ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_role_check");
                
                // Add it back with ROLE_TECHNICIAN
                jdbcTemplate.execute("ALTER TABLE app_users ADD CONSTRAINT app_users_role_check " +
                        "CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN', 'ROLE_STUDENT', 'ROLE_STAFF', 'ROLE_TECHNICIAN'))");
                
                System.out.println("Successfully updated app_users_role_check constraint.");
            } catch (Exception e) {
                System.err.println("Note: Could not update constraint automatically (might already be fixed or named differently): " + e.getMessage());
            }
        };
    }
}
