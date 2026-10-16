--liquibase formatted sql
--changeset queueless_admin:002-sample-data
--comment: Seed data with 2 organizations, 2 end-users, counter staff, and 12-15 queue requests

-- 1. Insert 2 Target Organizations (University and Pvt Ltd Corporate)
INSERT INTO organizations (id, name, sector, badge, description) VALUES
('org-univ', 'Apex National University', 'UNIVERSITY', 'Admissions & Academic Secretariat', 'Premier higher education institute managing admissions, degrees, transcripts, and fee clearances.'),
('org-corp', 'Nexora Solutions Pvt Ltd', 'PVT_LTD', 'Corporate Head Office & HR', 'Enterprise technology firm managing talent interviews, employee onboarding, vendor invoices, and executive briefings.');

-- 2. Insert Users (2 Citizens + 2 Org Admins + 3 Staff Operators)
-- 2 End Users (Citizens/Applicants)
INSERT INTO users (id, name, email, password, role, phone, organization_id) VALUES
('usr-user-1', 'Aarav Sharma', 'user@gmail.com', 'user123', 'VISITOR', '+91 98765 43210', 'org-univ'),
('usr-user-2', 'Sunita Patel', 'sunita.patel@gmail.com', 'user123', 'VISITOR', '+91 98112 34567', 'org-univ');

-- 2 Organization Admins
INSERT INTO users (id, name, email, password, role, phone, organization_id) VALUES
('usr-admin-univ', 'Dr. Alok Nath', 'admin@univ.edu', 'admin123', 'ADMIN', '+91 98100 11223', 'org-univ'),
('usr-admin-corp', 'Rohan Singhania', 'admin@pvtcorp.com', 'admin123', 'ADMIN', '+91 98200 22334', 'org-corp');

-- 3 Counter Staff Desk Operators
INSERT INTO users (id, name, email, password, role, phone, organization_id) VALUES
('usr-staff-1', 'Dr. Sarah Mehta', 'staff1@queueless.com', 'staff123', 'STAFF', '+91 98500 55667', 'org-univ'),
('usr-staff-2', 'Mr. Rajesh Sharma', 'staff2@queueless.com', 'staff123', 'STAFF', '+91 98600 66778', 'org-univ'),
('usr-staff-3', 'Ms. Anita Verma', 'staff3@queueless.com', 'staff123', 'STAFF', '+91 98700 77889', 'org-univ');

-- 3. Insert Service Departments
INSERT INTO service_departments (id, name, code, avg_duration_minutes, is_priority_allowed, organization_id, icon) VALUES
(1, 'Admissions & Course Enrollment', 'ADM', 12, TRUE, 'org-univ', 'fa-graduation-cap'),
(2, 'Official Degree & Transcript Cell', 'TRN', 10, TRUE, 'org-univ', 'fa-certificate'),
(3, 'Semester Fee & Scholarship Counter', 'FEE', 6, FALSE, 'org-univ', 'fa-credit-card'),
(4, 'Candidate Technical Interviews', 'INT', 25, TRUE, 'org-corp', 'fa-user-tie'),
(5, 'Employee Onboarding & Badging', 'ONB', 15, TRUE, 'org-corp', 'fa-id-card');

-- 4. Insert Staff Counters
INSERT INTO staff_counters (id, name, staff_user_id, service_id, organization_id, current_token, status, is_active) VALUES
(1, 'Counter 1 (Admissions Desk)', 'usr-staff-1', 1, 'org-univ', 'A-101', 'IN_SERVICE', TRUE),
(2, 'Counter 2 (Transcripts Verification)', 'usr-staff-2', 2, 'org-univ', 'W-201', 'IN_SERVICE', TRUE),
(3, 'Counter 3 (Fee Clearance)', 'usr-staff-3', 3, 'org-univ', NULL, 'IDLE', TRUE),
(4, 'Corporate Desk A (HR Interviews)', 'usr-admin-corp', 4, 'org-corp', 'A-105', 'CALLING', TRUE);

-- 5. Insert 14 Sample Queue Requests / Tokens (10 to 15 list with mixed states)
INSERT INTO queue_tokens (id, token_number, user_id, user_name, user_phone, service_id, counter_id, organization_id, token_type, status, slot_time, check_in_time, called_at, completed_at, missed_count) VALUES
-- Active in service
(101, 'A-101', 'usr-user-1', 'Aarav Sharma', '+91 98765 43210', 1, 1, 'org-univ', 'APPOINTMENT', 'IN_SERVICE', '10:30 AM', '10:25 AM', CURRENT_TIMESTAMP, NULL, 0),
(201, 'W-201', 'usr-user-2', 'Sunita Patel', '+91 98112 34567', 2, 2, 'org-univ', 'WALK_IN', 'IN_SERVICE', '10:35 AM', '10:32 AM', CURRENT_TIMESTAMP, NULL, 0),
-- Priority override waiting
(301, 'P-301', 'usr-user-1', 'Col. S. K. Bakshi (Retd.)', '+91 98222 33445', 1, NULL, 'org-univ', 'PRIORITY', 'QUEUED', '10:45 AM', '10:40 AM', NULL, NULL, 0),
-- Appointments waiting in queue
(102, 'A-102', 'usr-user-1', 'Priya Deshmukh', '+91 98333 44556', 1, NULL, 'org-univ', 'APPOINTMENT', 'QUEUED', '10:50 AM', '10:42 AM', NULL, NULL, 0),
(103, 'A-103', 'usr-user-2', 'Vikram Malhotra', '+91 98444 55667', 2, NULL, 'org-univ', 'APPOINTMENT', 'QUEUED', '11:00 AM', '10:45 AM', NULL, NULL, 0),
(104, 'A-104', 'usr-user-1', 'Ananya Gupta', '+91 98555 66778', 3, NULL, 'org-univ', 'APPOINTMENT', 'QUEUED', '11:15 AM', '10:48 AM', NULL, NULL, 0),
-- Walk-ins waiting in queue
(202, 'W-202', 'usr-user-2', 'Mohammad Rehan', '+91 98666 77889', 1, NULL, 'org-univ', 'WALK_IN', 'QUEUED', '11:05 AM', '10:50 AM', NULL, NULL, 0),
(203, 'W-203', 'usr-user-1', 'Kavita Joshi', '+91 98777 88990', 2, NULL, 'org-univ', 'WALK_IN', 'QUEUED', '11:10 AM', '10:52 AM', NULL, NULL, 0),
(204, 'W-204', 'usr-user-2', 'Harshvardhan Singh', '+91 98888 99001', 3, NULL, 'org-univ', 'WALK_IN', 'QUEUED', '11:20 AM', '10:55 AM', NULL, NULL, 0),
-- Corporate Organization Tokens
(105, 'A-105', 'usr-user-1', 'Devansh Mukherjee', '+91 98999 00112', 4, 4, 'org-corp', 'APPOINTMENT', 'CALLED', '11:30 AM', '11:00 AM', CURRENT_TIMESTAMP, NULL, 0),
(106, 'A-106', 'usr-user-2', 'Tanvi Mathur', '+91 98000 11223', 5, NULL, 'org-corp', 'APPOINTMENT', 'QUEUED', '11:45 AM', '11:10 AM', NULL, NULL, 0),
-- Completed tokens (Historical SLA audit)
(100, 'A-100', 'usr-user-1', 'Ritu Srivastava', '+91 97111 22334', 1, 1, 'org-univ', 'APPOINTMENT', 'COMPLETED', '10:15 AM', '10:05 AM', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
(200, 'W-200', 'usr-user-2', 'Gaurav Kulkarni', '+91 97222 33445', 2, 2, 'org-univ', 'WALK_IN', 'COMPLETED', '10:20 AM', '10:10 AM', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
-- Missed/Penalized 1st chance token
(107, 'A-107', 'usr-user-1', 'Meenakshi Sundaram', '+91 97333 44556', 1, NULL, 'org-univ', 'APPOINTMENT', 'QUEUED', '10:40 AM', '10:35 AM', NULL, NULL, 1);

-- 6. Insert Initial Audit Logs
INSERT INTO audit_logs (event_time, event_text, organization_id) VALUES
('10:05 AM', 'Token A-100 checked in for Admissions & Course Enrollment', 'org-univ'),
('10:15 AM', 'Counter 1 called Token A-100 (Dr. Sarah Mehta)', 'org-univ'),
('10:25 AM', 'Token A-101 issued to Aarav Sharma (Appointment)', 'org-univ'),
('10:30 AM', 'Counter 1 called Token A-101. Status changed to IN_SERVICE', 'org-univ'),
('10:32 AM', 'Token W-201 checked in for Official Degree & Transcript Cell', 'org-univ'),
('10:35 AM', 'Counter 2 called Token W-201. Status changed to IN_SERVICE', 'org-univ'),
('10:40 AM', 'Priority Token P-301 checked in by Col. S. K. Bakshi. Slotted to front of line.', 'org-univ');
