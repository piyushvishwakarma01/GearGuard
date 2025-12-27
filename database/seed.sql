-- GearGuard Seed Data
-- Sample data for testing and demonstration

-- ============================================================================
-- USERS
-- ============================================================================
-- Password for all users: 'password123' (bcrypt hash with 10 rounds)
-- Hash: $2a$10$XjZX5K3K3K3K3K3K3K3K3O7J9J9J9J9J9J9J9J9J9J9J9J9J9J9J9
-- Note: In production, use actual bcrypt hashes. This is a placeholder.

INSERT INTO users (id, email, password_hash, full_name, role, phone, is_active) VALUES
('d7a3e4f0-1234-4567-89ab-111111111111', 'manager@gearguard.com', '$2a$10$rKvB5K3ZGY3QJ5X5J9J9JeXC3J9J9J9J9J9J9J9J9J9J9J9J9J9J', 'John Manager', 'Manager', '+1-555-0001', true),
('d7a3e4f0-1234-4567-89ab-222222222222', 'tech1@gearguard.com', '$2a$10$rKvB5K3ZGY3QJ5X5J9J9JeXC3J9J9J9J9J9J9J9J9J9J9J9J9J9J', 'Alice Technician', 'Technician', '+1-555-0002', true),
('d7a3e4f0-1234-4567-89ab-333333333333', 'tech2@gearguard.com', '$2a$10$rKvB5K3ZGY3QJ5X5J9J9JeXC3J9J9J9J9J9J9J9J9J9J9J9J9J9J', 'Bob Technician', 'Technician', '+1-555-0003', true),
('d7a3e4f0-1234-4567-89ab-444444444444', 'tech3@gearguard.com', '$2a$10$rKvB5K3ZGY3QJ5X5J9J9JeXC3J9J9J9J9J9J9J9J9J9J9J9J9J9J', 'Charlie Technician', 'Technician', '+1-555-0004', true),
('d7a3e4f0-1234-4567-89ab-555555555555', 'user1@gearguard.com', '$2a$10$rKvB5K3ZGY3QJ5X5J9J9JeXC3J9J9J9J9J9J9J9J9J9J9J9J9J9J', 'Diana User', 'User', '+1-555-0005', true);

-- ============================================================================
-- DEPARTMENTS
-- ============================================================================

INSERT INTO departments (id, name, description, manager_id) VALUES
('a1a1a1a1-1111-1111-1111-111111111111', 'IT Department', 'Information Technology and Computer Systems', 'd7a3e4f0-1234-4567-89ab-111111111111'),
('a1a1a1a1-2222-2222-2222-222222222222', 'Facilities', 'Building Maintenance and Infrastructure', 'd7a3e4f0-1234-4567-89ab-111111111111'),
('a1a1a1a1-3333-3333-3333-333333333333', 'Production', 'Manufacturing Equipment and Machinery', 'd7a3e4f0-1234-4567-89ab-111111111111');

-- ============================================================================
-- MAINTENANCE TEAMS
-- ============================================================================

INSERT INTO maintenance_teams (id, name, description, team_type, is_active) VALUES
('b1b1b1b1-1111-1111-1111-111111111111', 'IT Support Team', 'Computer hardware and software maintenance', 'IT', true),
('b1b1b1b1-2222-2222-2222-222222222222', 'Mechanical Team', 'Mechanical equipment and machinery', 'Mechanical', true),
('b1b1b1b1-3333-3333-3333-333333333333', 'Electrical Team', 'Electrical systems and components', 'Electrical', true);

-- ============================================================================
-- TEAM MEMBERS
-- ============================================================================

-- IT Support Team
INSERT INTO team_members (team_id, user_id, is_lead) VALUES
('b1b1b1b1-1111-1111-1111-111111111111', 'd7a3e4f0-1234-4567-89ab-222222222222', true),  -- Alice is lead
('b1b1b1b1-1111-1111-1111-111111111111', 'd7a3e4f0-1234-4567-89ab-333333333333', false); -- Bob is member

-- Mechanical Team
INSERT INTO team_members (team_id, user_id, is_lead) VALUES
('b1b1b1b1-2222-2222-2222-222222222222', 'd7a3e4f0-1234-4567-89ab-444444444444', true);  -- Charlie is lead

-- Electrical Team
INSERT INTO team_members (team_id, user_id, is_lead) VALUES
('b1b1b1b1-3333-3333-3333-333333333333', 'd7a3e4f0-1234-4567-89ab-333333333333', false), -- Bob also in electrical
('b1b1b1b1-3333-3333-3333-333333333333', 'd7a3e4f0-1234-4567-89ab-444444444444', false); -- Charlie also in electrical

-- ============================================================================
-- EQUIPMENT CATEGORIES
-- ============================================================================

INSERT INTO equipment_categories (id, name, description, default_team_id) VALUES
('c1c1c1c1-1111-1111-1111-111111111111', 'Computer Hardware', 'Desktops, laptops, servers', 'b1b1b1b1-1111-1111-1111-111111111111'),
('c1c1c1c1-2222-2222-2222-222222222222', 'Industrial Machinery', 'CNC machines, lathes, mills', 'b1b1b1b1-2222-2222-2222-222222222222'),
('c1c1c1c1-3333-3333-3333-333333333333', 'HVAC Systems', 'Heating, ventilation, air conditioning', 'b1b1b1b1-3333-3333-3333-333333333333'),
('c1c1c1c1-4444-4444-4444-444444444444', 'Vehicles', 'Forklifts, trucks, company vehicles', 'b1b1b1b1-2222-2222-2222-222222222222');

-- ============================================================================
-- EQUIPMENT
-- ============================================================================

INSERT INTO equipment (
    id, equipment_name, serial_number, category_id, department_id,
    purchase_date, warranty_expiry_date, purchase_cost,
    physical_location, assigned_employee_id, default_maintenance_team_id,
    is_usable, notes
) VALUES
-- IT Equipment
('e1e1e1e1-1111-1111-1111-111111111111', 
 'Dell Workstation WS-01', 'DELL-WS-2023-001', 
 'c1c1c1c1-1111-1111-1111-111111111111', 'a1a1a1a1-1111-1111-1111-111111111111',
 '2023-01-15', '2026-01-15', 1500.00,
 'Office Building A, Room 101', 'd7a3e4f0-1234-4567-89ab-555555555555', 'b1b1b1b1-1111-1111-1111-111111111111',
 true, 'Primary workstation for user Diana'),

('e1e1e1e1-2222-2222-2222-222222222222',
 'HP Laptop LT-02', 'HP-LT-2023-002',
 'c1c1c1c1-1111-1111-1111-111111111111', 'a1a1a1a1-1111-1111-1111-111111111111',
 '2023-03-20', '2026-03-20', 1200.00,
 'Office Building A, Room 105', 'd7a3e4f0-1234-4567-89ab-222222222222', 'b1b1b1b1-1111-1111-1111-111111111111',
 true, 'Technician laptop'),

('e1e1e1e1-3333-3333-3333-333333333333',
 'Network Server SRV-01', 'DELL-SRV-2022-001',
 'c1c1c1c1-1111-1111-1111-111111111111', 'a1a1a1a1-1111-1111-1111-111111111111',
 '2022-06-10', '2025-06-10', 5000.00,
 'Server Room, Rack 3', NULL, 'b1b1b1b1-1111-1111-1111-111111111111',
 true, 'Main application server'),

-- Production Equipment
('e1e1e1e1-4444-4444-4444-444444444444',
 'CNC Machine CM-01', 'HAAS-CNC-2021-001',
 'c1c1c1c1-2222-2222-2222-222222222222', 'a1a1a1a1-3333-3333-3333-333333333333',
 '2021-05-15', '2024-05-15', 45000.00,
 'Production Floor, Bay 3', NULL, 'b1b1b1b1-2222-2222-2222-222222222222',
 true, 'Primary CNC for precision parts'),

('e1e1e1e1-5555-5555-5555-555555555555',
 'Lathe Machine LT-01', 'MAZAK-LT-2020-001',
 'c1c1c1c1-2222-2222-2222-222222222222', 'a1a1a1a1-3333-3333-3333-333333333333',
 '2020-03-10', '2023-03-10', 32000.00,
 'Production Floor, Bay 5', NULL, 'b1b1b1b1-2222-2222-2222-222222222222',
 false, 'Out of warranty, needs frequent repairs'),

-- Facilities Equipment
('e1e1e1e1-6666-6666-6666-666666666666',
 'HVAC Unit Building A', 'CARRIER-HVAC-2019-001',
 'c1c1c1c1-3333-3333-3333-333333333333', 'a1a1a1a1-2222-2222-2222-222222222222',
 '2019-08-20', '2024-08-20', 15000.00,
 'Building A Roof', NULL, 'b1b1b1b1-3333-3333-3333-333333333333',
 true, 'Main building HVAC system'),

('e1e1e1e1-7777-7777-7777-777777777777',
 'Forklift FL-01', 'TOYOTA-FL-2022-001',
 'c1c1c1c1-4444-4444-4444-444444444444', 'a1a1a1a1-3333-3333-3333-333333333333',
 '2022-11-15', '2025-11-15', 28000.00,
 'Warehouse Loading Dock', NULL, 'b1b1b1b1-2222-2222-2222-222222222222',
 true, 'Electric forklift, 5000 lb capacity'),

('e1e1e1e1-8888-8888-8888-888888888888',
 'Company Van VN-01', 'FORD-VAN-2021-001',
 'c1c1c1c1-4444-4444-4444-444444444444', 'a1a1a1a1-2222-2222-2222-222222222222',
 '2021-07-20', '2024-07-20', 35000.00,
 'Parking Lot B', 'd7a3e4f0-1234-4567-89ab-111111111111', 'b1b1b1b1-2222-2222-2222-222222222222',
 true, 'Manager company vehicle'),

('e1e1e1e1-9999-9999-9999-999999999999',
 'Desktop PC PC-09', 'LENOVO-PC-2018-009',
 'c1c1c1c1-1111-1111-1111-111111111111', 'a1a1a1a1-1111-1111-1111-111111111111',
 '2018-04-10', '2021-04-10', 800.00,
 'Office Building B, Room 201', NULL, 'b1b1b1b1-1111-1111-1111-111111111111',
 true, 'Old desktop, scheduled for replacement'),

('e1e1e1e1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'Air Compressor AC-01', 'INGERSOLL-AC-2017-001',
 'c1c1c1c1-2222-2222-2222-222222222222', 'a1a1a1a1-3333-3333-3333-333333333333',
 '2017-02-15', '2020-02-15', 8500.00,
 'Maintenance Shop', NULL, 'b1b1b1b1-2222-2222-2222-222222222222',
 true, 'Pneumatic tools power source');

-- ============================================================================
-- MAINTENANCE REQUESTS
-- ============================================================================

INSERT INTO maintenance_requests (
    id, subject, description, request_type,
    equipment_id, equipment_category_id, maintenance_team_id,
    created_by_user_id, assigned_technician_id,
    scheduled_date, status, priority, duration_hours, completion_notes
) VALUES

-- NEW STATUS (Corrective)
('r1r1r1r1-1111-1111-1111-111111111111',
 'Workstation not booting', 
 'Dell workstation displays no video output on startup. Power LED is on but no POST beep.',
 'Corrective',
 'e1e1e1e1-1111-1111-1111-111111111111', 'c1c1c1c1-1111-1111-1111-111111111111', 'b1b1b1b1-1111-1111-1111-111111111111',
 'd7a3e4f0-1234-4567-89ab-555555555555', NULL,
 CURRENT_TIMESTAMP + INTERVAL '2 days', 'New', 'High', NULL, NULL),

('r1r1r1r1-2222-2222-2222-222222222222',
 'CNC Machine abnormal noise',
 'Strange grinding noise from spindle motor during operation. Vibration detected.',
 'Corrective',
 'e1e1e1e1-4444-4444-4444-444444444444', 'c1c1c1c1-2222-2222-2222-222222222222', 'b1b1b1b1-2222-2222-2222-222222222222',
 'd7a3e4f0-1234-4567-89ab-111111111111', NULL,
 CURRENT_TIMESTAMP + INTERVAL '1 day', 'New', 'Critical', NULL, NULL),

('r1r1r1r1-3333-3333-3333-333333333333',
 'HVAC temperature inconsistency',
 'Building A HVAC not maintaining set temperature. Fluctuates between 65-80°F.',
 'Corrective',
 'e1e1e1e1-6666-6666-6666-666666666666', 'c1c1c1c1-3333-3333-3333-333333333333', 'b1b1b1b1-3333-3333-3333-333333333333',
 'd7a3e4f0-1234-4567-89ab-555555555555', NULL,
 CURRENT_TIMESTAMP + INTERVAL '3 days', 'New', 'Medium', NULL, NULL),

-- IN PROGRESS (Corrective)
('r1r1r1r1-4444-4444-4444-444444444444',
 'Laptop battery not charging',
 'HP laptop battery shows plugged in but not charging. Battery health at 45%.',
 'Corrective',
 'e1e1e1e1-2222-2222-2222-222222222222', 'c1c1c1c1-1111-1111-1111-111111111111', 'b1b1b1b1-1111-1111-1111-111111111111',
 'd7a3e4f0-1234-4567-89ab-222222222222', 'd7a3e4f0-1234-4567-89ab-222222222222',
 CURRENT_TIMESTAMP, 'In Progress', 'Medium', NULL, NULL),

('r1r1r1r1-5555-5555-5555-555555555555',
 'Forklift hydraulic leak',
 'Small hydraulic fluid leak observed near lift cylinder. Performance degraded.',
 'Corrective',
 'e1e1e1e1-7777-7777-7777-777777777777', 'c1c1c1c1-4444-4444-4444-444444444444', 'b1b1b1b1-2222-2222-2222-222222222222',
 'd7a3e4f0-1234-4567-89ab-333333333333', 'd7a3e4f0-1234-4567-89ab-444444444444',
 CURRENT_TIMESTAMP - INTERVAL '1 day', 'In Progress', 'High', NULL, NULL),

-- REPAIRED (Corrective)
('r1r1r1r1-6666-6666-6666-666666666666',
 'Network server slow performance',
 'Server response time degraded. CPU usage at 95% constantly.',
 'Corrective',
 'e1e1e1e1-3333-3333-3333-333333333333', 'c1c1c1c1-1111-1111-1111-111111111111', 'b1b1b1b1-1111-1111-1111-111111111111',
 'd7a3e4f0-1234-4567-89ab-111111111111', 'd7a3e4f0-1234-4567-89ab-222222222222',
 CURRENT_TIMESTAMP - INTERVAL '5 days', 'Repaired', 'Critical', 3.5, 
 'Identified rogue process consuming resources. Terminated process, updated firewall rules, and optimized database queries. Server performance restored to normal.'),

('r1r1r1r1-7777-7777-7777-777777777777',
 'Desktop PC won''t connect to network',
 'Ethernet connection failing intermittently. Cable and port tested.',
 'Corrective',
 'e1e1e1e1-9999-9999-9999-999999999999', 'c1c1c1c1-1111-1111-1111-111111111111', 'b1b1b1b1-1111-1111-1111-111111111111',
 'd7a3e4f0-1234-4567-89ab-555555555555', 'd7a3e4f0-1234-4567-89ab-333333333333',
 CURRENT_TIMESTAMP - INTERVAL '7 days', 'Repaired', 'Medium', 1.0,
 'Replaced network interface card. Connection stable after replacement.'),

-- PREVENTIVE MAINTENANCE (Scheduled)
('r1r1r1r1-8888-8888-8888-888888888888',
 'Quarterly CNC calibration',
 'Routine calibration and accuracy check for CNC machine.',
 'Preventive',
 'e1e1e1e1-4444-4444-4444-444444444444', 'c1c1c1c1-2222-2222-2222-222222222222', 'b1b1b1b1-2222-2222-2222-222222222222',
 'd7a3e4f0-1234-4567-89ab-111111111111', 'd7a3e4f0-1234-4567-89ab-444444444444',
 CURRENT_TIMESTAMP + INTERVAL '15 days', 'New', 'Medium', NULL, NULL),

('r1r1r1r1-9999-9999-9999-999999999999',
 'HVAC filter replacement',
 'Scheduled quarterly filter replacement and system check.',
 'Preventive',
 'e1e1e1e1-6666-6666-6666-666666666666', 'c1c1c1c1-3333-3333-3333-333333333333', 'b1b1b1b1-3333-3333-3333-333333333333',
 'd7a3e4f0-1234-4567-89ab-111111111111', 'd7a3e4f0-1234-4567-89ab-333333333333',
 CURRENT_TIMESTAMP + INTERVAL '10 days', 'New', 'Low', NULL, NULL),

('r1r1r1r1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'Company van oil change',
 'Scheduled 5000-mile oil change and inspection.',
 'Preventive',
 'e1e1e1e1-8888-8888-8888-888888888888', 'c1c1c1c1-4444-4444-4444-444444444444', 'b1b1b1b1-2222-2222-2222-222222222222',
 'd7a3e4f0-1234-4567-89ab-111111111111', NULL,
 CURRENT_TIMESTAMP + INTERVAL '7 days', 'New', 'Low', NULL, NULL),

-- OVERDUE REQUEST (for testing automation)
('r1r1r1r1-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 'Air compressor maintenance',
 'Annual maintenance check - pressure relief valve test, oil change.',
 'Preventive',
 'e1e1e1e1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c1c1c1c1-2222-2222-2222-222222222222', 'b1b1b1b1-2222-2222-2222-222222222222',
 'd7a3e4f0-1234-4567-89ab-111111111111', NULL,
 CURRENT_TIMESTAMP - INTERVAL '5 days', 'New', 'High', NULL, NULL),

-- COMPLETED PREVENTIVE
('r1r1r1r1-cccc-cccc-cccc-cccccccccccc',
 'Forklift safety inspection',
 'Monthly safety inspection checklist completion.',
 'Preventive',
 'e1e1e1e1-7777-7777-7777-777777777777', 'c1c1c1c1-4444-4444-4444-444444444444', 'b1b1b1b1-2222-2222-2222-222222222222',
 'd7a3e4f0-1234-4567-89ab-333333333333', 'd7a3e4f0-1234-4567-89ab-444444444444',
 CURRENT_TIMESTAMP - INTERVAL '20 days', 'Repaired', 'Low', 0.75,
 'Completed safety checklist. All items passed. Tire pressure adjusted. Brake function normal.'),

-- SCRAP STATUS (equipment should be marked unusable by trigger)
('r1r1r1r1-dddd-dddd-dddd-dddddddddddd',
 'Lathe machine motor failure',
 'Main spindle motor burned out. Replacement cost exceeds equipment value.',
 'Corrective',
 'e1e1e1e1-5555-5555-5555-555555555555', 'c1c1c1c1-2222-2222-2222-222222222222', 'b1b1b1b1-2222-2222-2222-222222222222',
 'd7a3e4f0-1234-4567-89ab-333333333333', 'd7a3e4f0-1234-4567-89ab-444444444444',
 CURRENT_TIMESTAMP - INTERVAL '10 days', 'Scrap', 'Critical', 2.0,
 'Motor replacement cost $15,000 exceeds 50% of equipment value. Recommend scrapping and purchasing new lathe. Equipment taken out of service.'),

-- MORE NEW REQUESTS (for Kanban testing)
('r1r1r1r1-eeee-eeee-eeee-eeeeeeeeeeee',
 'Update server security patches',
 'Monthly security update for network server.',
 'Preventive',
 'e1e1e1e1-3333-3333-3333-333333333333', 'c1c1c1c1-1111-1111-1111-111111111111', 'b1b1b1b1-1111-1111-1111-111111111111',
 'd7a3e4f0-1234-4567-89ab-222222222222', NULL,
 CURRENT_TIMESTAMP + INTERVAL '5 days', 'New', 'Medium', NULL, NULL);

-- ============================================================================
-- VERIFY SEED DATA
-- ============================================================================

SELECT 'Seed data inserted successfully!' as message;

SELECT 'Users:' as category, COUNT(*) as count FROM users
UNION ALL
SELECT 'Departments:', COUNT(*) FROM departments
UNION ALL
SELECT 'Teams:', COUNT(*) FROM maintenance_teams
UNION ALL
SELECT 'Team Members:', COUNT(*) FROM team_members
UNION ALL
SELECT 'Equipment Categories:', COUNT(*) FROM equipment_categories
UNION ALL
SELECT 'Equipment:', COUNT(*) FROM equipment
UNION ALL
SELECT 'Maintenance Requests:', COUNT(*) FROM maintenance_requests;

-- Show status distribution
SELECT 
    'Request Status Distribution:' as info,
    status,
    COUNT(*) as count
FROM maintenance_requests
GROUP BY status
ORDER BY 
    CASE status
        WHEN 'New' THEN 1
        WHEN 'In Progress' THEN 2
        WHEN 'Repaired' THEN 3
        WHEN 'Scrap' THEN 4
    END;

-- Show team membership
SELECT 
    'Team Membership:' as info,
    mt.name as team_name,
    u.full_name as member_name,
    CASE WHEN tm.is_lead THEN 'Lead' ELSE 'Member' END as role
FROM team_members tm
JOIN maintenance_teams mt ON tm.team_id = mt.id
JOIN users u ON tm.user_id = u.id
ORDER BY mt.name, tm.is_lead DESC;
