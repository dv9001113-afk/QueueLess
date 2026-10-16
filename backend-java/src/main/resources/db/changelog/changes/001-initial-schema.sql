--liquibase formatted sql
--changeset queueless_admin:001-initial-schema
--comment: Initial DDL schema for organizations, users, staff, services, and queue tokens

CREATE TABLE organizations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sector VARCHAR(50) NOT NULL, -- UNIVERSITY, PVT_LTD, PSU, TECH_CORP
    badge VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL, -- ADMIN, STAFF, VISITOR
    phone VARCHAR(30),
    organization_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE service_departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    code VARCHAR(20) NOT NULL,
    avg_duration_minutes INT DEFAULT 12,
    is_priority_allowed BOOLEAN DEFAULT TRUE,
    organization_id VARCHAR(50),
    icon VARCHAR(50) DEFAULT 'fa-building',
    CONSTRAINT fk_service_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE staff_counters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    staff_user_id VARCHAR(50),
    service_id BIGINT,
    organization_id VARCHAR(50),
    current_token VARCHAR(30) NULL,
    status VARCHAR(30) DEFAULT 'IDLE', -- IDLE, CALLING, IN_SERVICE
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_counter_staff FOREIGN KEY (staff_user_id) REFERENCES users(id),
    CONSTRAINT fk_counter_service FOREIGN KEY (service_id) REFERENCES service_departments(id),
    CONSTRAINT fk_counter_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE queue_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_number VARCHAR(30) NOT NULL UNIQUE,
    user_id VARCHAR(50),
    user_name VARCHAR(100) NOT NULL,
    user_phone VARCHAR(30) NOT NULL,
    service_id BIGINT NOT NULL,
    counter_id BIGINT NULL,
    organization_id VARCHAR(50) NOT NULL,
    token_type VARCHAR(30) NOT NULL, -- APPOINTMENT, WALK_IN, PRIORITY
    status VARCHAR(30) DEFAULT 'QUEUED', -- QUEUED, CALLED, IN_SERVICE, COMPLETED, NO_SHOW, CANCELLED
    slot_time VARCHAR(30),
    check_in_time VARCHAR(30),
    called_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    missed_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_token_service FOREIGN KEY (service_id) REFERENCES service_departments(id),
    CONSTRAINT fk_token_counter FOREIGN KEY (counter_id) REFERENCES staff_counters(id),
    CONSTRAINT fk_token_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_time VARCHAR(30) NOT NULL,
    event_text TEXT NOT NULL,
    organization_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
