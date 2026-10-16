package com.queueless;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@CrossOrigin(origins = "*")
public class QueueLessApplication {

    public static void main(String[] args) {
        SpringApplication.run(QueueLessApplication.class, args);
        System.out.println("==================================================================");
        System.out.println("   🚀 QUEUELESS SPRING BOOT & LIQUIBASE BACKEND ACTIVE");
        System.out.println("==================================================================");
        System.out.println(" • REST API Endpoints : http://localhost:8080/api/queue");
        System.out.println(" • Live Database API  : http://localhost:8080/api/database/live-stats");
        System.out.println(" • H2 Database Console: http://localhost:8080/h2-console");
        System.out.println(" • Liquibase Migrations: Executed 001-initial-schema & 002-sample-data");
        System.out.println("==================================================================");
    }
}
