-- ============================================================================
-- QueueLess — Relational Database Schema (MySQL & Oracle Compatible)
-- ACID Transactions & Audit Trail for Appointments & Virtual Queues
-- ============================================================================

-- 1. Services Catalog
CREATE TABLE IF NOT EXISTS services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    avg_duration_minutes INT DEFAULT 15,
    is_priority_allowed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Service Counters
CREATE TABLE IF NOT EXISTS service_counters (
    counter_id INT AUTO_INCREMENT PRIMARY KEY,
    counter_name VARCHAR(50) NOT NULL,
    staff_name VARCHAR(100),
    service_id INT,
    current_token_id INT NULL,
    status ENUM('IDLE', 'CALLING', 'IN_SERVICE') DEFAULT 'IDLE',
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (service_id) REFERENCES services(service_id)
);

-- 3. Queue Tokens (Appointments, Walk-ins, Priority)
CREATE TABLE IF NOT EXISTS queue_tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    token_number VARCHAR(20) NOT NULL UNIQUE,
    user_name VARCHAR(100) NOT NULL,
    user_phone VARCHAR(20) NOT NULL,
    service_id INT NOT NULL,
    counter_id INT NULL,
    token_type ENUM('APPOINTMENT', 'WALK_IN', 'PRIORITY') NOT NULL,
    status ENUM('BOOKED', 'QUEUED', 'CALLED', 'IN_SERVICE', 'COMPLETED', 'NO_SHOW', 'CANCELLED') DEFAULT 'QUEUED',
    slot_time DATETIME NULL,
    check_in_time DATETIME NULL,
    called_at DATETIME NULL,
    completed_at DATETIME NULL,
    missed_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(service_id),
    FOREIGN KEY (counter_id) REFERENCES service_counters(counter_id)
);

-- 4. Queue Audit Trail (For Analytics & State Event Tracking)
CREATE TABLE IF NOT EXISTS queue_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    token_id INT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (token_id) REFERENCES queue_tokens(token_id)
);

-- Initial Seed Data
INSERT INTO services (name, avg_duration_minutes, is_priority_allowed) VALUES
('General Consultation', 12, TRUE),
('Document Verification', 8, TRUE),
('Billing & Payments', 5, FALSE),
('Express Renewal / Inquiry', 6, TRUE);

INSERT INTO service_counters (counter_name, staff_name, service_id, status) VALUES
('Counter 1', 'Dr. Sarah Mehta', 1, 'IN_SERVICE'),
('Counter 2', 'Mr. Rajesh Sharma', 2, 'IN_SERVICE'),
('Counter 3', 'Ms. Anita Verma', 3, 'IDLE'),
('Counter 4', 'Officer K. Patel', 4, 'IDLE');
