package com.queueless.controller;

import com.queueless.model.*;
import com.queueless.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/database")
@CrossOrigin(origins = "*")
public class DatabaseRestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private StaffCounterRepository counterRepository;

    @Autowired
    private QueueTokenRepository tokenRepository;

    @GetMapping("/live-stats")
    public ResponseEntity<Map<String, Object>> getLiveStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalUsers = userRepository.findByRole("VISITOR").size();
        long totalAdmins = userRepository.findByRole("ADMIN").size();
        long totalStaff = userRepository.findByRole("STAFF").size();
        long totalOrganizations = organizationRepository.count();
        long activeTokens = tokenRepository.findByStatus("QUEUED").size();
        long servingTokens = tokenRepository.findByStatus("IN_SERVICE").size() + tokenRepository.findByStatus("CALLED").size();
        long completedTokens = tokenRepository.findByStatus("COMPLETED").size();

        stats.put("totalUsers", totalUsers);
        stats.put("totalAdmins", totalAdmins);
        stats.put("totalStaff", totalStaff);
        stats.put("totalOrganizations", totalOrganizations);
        stats.put("activeTokens", activeTokens);
        stats.put("servingTokens", servingTokens);
        stats.put("completedTokens", completedTokens);
        stats.put("liquibaseChangesetsExecuted", 2);
        stats.put("databaseEngine", "H2 / PostgreSQL Compatible");
        stats.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/all-tables")
    public ResponseEntity<Map<String, Object>> getAllTables() {
        Map<String, Object> tables = new HashMap<>();
        tables.put("users", userRepository.findAll());
        tables.put("organizations", organizationRepository.findAll());
        tables.put("staffCounters", counterRepository.findAll());
        tables.put("queueTokens", tokenRepository.findAll());
        return ResponseEntity.ok(tables);
    }
}
