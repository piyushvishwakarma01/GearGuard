-- GearGuard Seed Data

INSERT INTO users (id, email, password_hash, full_name, role, phone, is_active) VALUES
('d7a3e4f0-1234-4567-89ab-111111111111', 'manager@gearguard.com', '$2a$10$rKvB5K3ZGY3QJ5X5J9J9JeXC3J9J9J9J9J9J9J9J9J9J9J9J9J9J', 'John Manager', 'Manager', '+1-555-0001', true),
('d7a3e4f0-1234-4567-89ab-222222222222', 'tech1@gearguard.com', '$2a$10$rKvB5K3ZGY3QJ5X5J9J9JeXC3J9J9J9J9J9J9J9J9J9J9J9J9J9J', 'Alice Technician', 'Technician', '+1-555-0002', true),
('d7a3e4f0-1234-4567-89ab-333333333333', 'tech2@gearguard.com', '$2a$10$rKvB5K3ZGY3QJ5X5J9J9JeXC3J9J9J9J9J9J9J9J9J9J9J9J9J9J', 'Bob Technician', 'Technician', '+1-555-0003', true),
('d7a3e4f0-1234-4567-89ab-444444444444', 'tech3@gearguard.com', '$2a$10$rKvB5K3ZGY3QJ5X5J9J9JeXC3J9J9J9J9J9J9J9J9J9J9J9J9J9J', 'Charlie Technician', 'Technician', '+1-555-0004', true),
('d7a3e4f0-1234-4567-89ab-555555555555', 'user1@gearguard.com', '$2a$10$rKvB5K3ZGY3QJ5X5J9J9JeXC3J9J9J9J9J9J9J9J9J9J9J9J9J9J', 'Diana User', 'User', '+1-555-0005', true);

INSERT INTO departments (id, name, description, manager_id) VALUES
('a1a1a1a1-1111-1111-1111-111111111111', 'IT Department', 'Information Technology', 'd7a3e4f0-1234-4567-89ab-111111111111'),
('a1a1a1a1-2222-2222-2222-222222222222', 'Facilities', 'Building Maintenance', 'd7a3e4f0-1234-4567-89ab-111111111111'),
('a1a1a1a1-3333-3333-3333-333333333333', 'Production', 'Manufacturing', 'd7a3e4f0-1234-4567-89ab-111111111111');

INSERT INTO maintenance_teams (id, name, description, team_type, is_active) VALUES
('b1b1b1b1-1111-1111-1111-111111111111', 'IT Support Team', 'Computer support', 'IT', true),
('b1b1b1b1-2222-2222-2222-222222222222', 'Mechanical Team', 'Mechanical support', 'Mechanical', true),
('b1b1b1b1-3333-3333-3333-333333333333', 'Electrical Team', 'Electrical support', 'Electrical', true);

INSERT INTO team_members (team_id, user_id, is_lead) VALUES
('b1b1b1b1-1111-1111-1111-111111111111', 'd7a3e4f0-1234-4567-89ab-222222222222', true),
('b1b1b1b1-1111-1111-1111-111111111111', 'd7a3e4f0-1234-4567-89ab-333333333333', false),
('b1b1b1b1-2222-2222-2222-222222222222', 'd7a3e4f0-1234-4567-89ab-444444444444', true),
('b1b1b1b1-3333-3333-3333-333333333333', 'd7a3e4f0-1234-4567-89ab-333333333333', false),
('b1b1b1b1-3333-3333-3333-333333333333', 'd7a3e4f0-1234-4567-89ab-444444444444', false);

INSERT INTO equipment_categories (id, name, description, default_team_id) VALUES
('c1c1c1c1-1111-1111-1111-111111111111', 'Computer Hardware', 'PCs and Laptops', 'b1b1b1b1-1111-1111-1111-111111111111'),
('c1c1c1c1-2222-2222-2222-222222222222', 'Industrial Machinery', 'Heavy Machines', 'b1b1b1b1-2222-2222-2222-222222222222'),
('c1c1c1c1-3333-3333-3333-333333333333', 'HVAC Systems', 'Cooling/Heating', 'b1b1b1b1-3333-3333-3333-333333333333'),
('c1c1c1c1-4444-4444-4444-444444444444', 'Vehicles', 'Trucks/Vans', 'b1b1b1b1-2222-2222-2222-222222222222');

INSERT INTO equipment (id, equipment_name, serial_number, category_id, department_id, purchase_date, warranty_expiry_date, purchase_cost, physical_location, assigned_employee_id, default_maintenance_team_id, is_usable, notes) VALUES
('e1e1e1e1-1111-1111-1111-111111111111', 'Dell Workstation WS-01', 'DELL-WS-2023-001', 'c1c1c1c1-1111-1111-1111-111111111111', 'a1a1a1a1-1111-1111-1111-111111111111', '2023-01-15', '2026-01-15', 1500.00, 'Room 101', 'd7a3e4f0-1234-4567-89ab-555555555555', 'b1b1b1b1-1111-1111-1111-111111111111', true, 'Primary workstation'),
('e1e1e1e1-2222-2222-2222-222222222222', 'HP Laptop LT-02', 'HP-LT-2023-002', 'c1c1c1c1-1111-1111-1111-111111111111', 'a1a1a1a1-1111-1111-1111-111111111111', '2023-03-20', '2026-03-20', 1200.00, 'Room 105', 'd7a3e4f0-1234-4567-89ab-222222222222', 'b1b1b1b1-1111-1111-1111-111111111111', true, 'Tech laptop'),
('e1e1e1e1-3333-3333-3333-333333333333', 'Network Server SRV-01', 'DELL-SRV-2022-001', 'c1c1c1c1-1111-1111-1111-111111111111', 'a1a1a1a1-1111-1111-1111-111111111111', '2022-06-10', '2025-06-10', 5000.00, 'Server Room', NULL, 'b1b1b1b1-1111-1111-1111-111111111111', true, 'App server'),
('e1e1e1e1-4444-4444-4444-444444444444', 'CNC Machine CM-01', 'HAAS-CNC-2021-001', 'c1c1c1c1-2222-2222-2222-222222222222', 'a1a1a1a1-3333-3333-3333-333333333333', '2021-05-15', '2024-05-15', 45000.00, 'Bay 3', NULL, 'b1b1b1b1-2222-2222-2222-222222222222', true, 'Main CNC'),
('e1e1e1e1-5555-5555-5555-555555555555', 'Lathe Machine LT-01', 'MAZAK-LT-2020-001', 'c1c1c1c1-2222-2222-2222-222222222222', 'a1a1a1a1-3333-3333-3333-333333333333', '2020-03-10', '2023-03-10', 32000.00, 'Bay 5', NULL, 'b1b1b1b1-2222-2222-2222-222222222222', false, 'Scrapped soon'),
('e1e1e1e1-6666-6666-6666-666666666666', 'HVAC Unit Building A', 'CARRIER-HVAC-2019-001', 'c1c1c1c1-3333-3333-3333-333333333333', 'a1a1a1a1-2222-2222-2222-222222222222', '2019-08-20', '2024-08-20', 15000.00, 'Building A Roof', NULL, 'b1b1b1b1-3333-3333-3333-333333333333', true, 'Main building HVAC');

INSERT INTO maintenance_requests (id, subject, description, request_type, equipment_id, equipment_category_id, maintenance_team_id, created_by_user_id, assigned_technician_id, scheduled_date, status, priority, duration_hours, completion_notes) VALUES
('b1b1b1b1-1111-1111-1111-111111111111', 'Workstation not booting', 'No video output', 'Corrective', 'e1e1e1e1-1111-1111-1111-111111111111', 'c1c1c1c1-1111-1111-1111-111111111111', 'b1b1b1b1-1111-1111-1111-111111111111', 'd7a3e4f0-1234-4567-89ab-555555555555', NULL, CURRENT_TIMESTAMP + INTERVAL '2 days', 'New', 'High', NULL, NULL),
('b1b1b1b1-2222-2222-2222-222222222222', 'CNC Machine noise', 'Grinding noise', 'Corrective', 'e1e1e1e1-4444-4444-4444-444444444444', 'c1c1c1c1-2222-2222-2222-222222222222', 'b1b1b1b1-2222-2222-2222-222222222222', 'd7a3e4f0-1234-4567-89ab-111111111111', NULL, CURRENT_TIMESTAMP + INTERVAL '1 day', 'New', 'Critical', NULL, NULL),
('b1b1b1b1-3333-3333-3333-333333333333', 'HVAC inconsistency', 'Temp fluctuations', 'Corrective', 'e1e1e1e1-6666-6666-6666-666666666666', 'c1c1c1c1-3333-3333-3333-333333333333', 'b1b1b1b1-3333-3333-3333-333333333333', 'd7a3e4f0-1234-4567-89ab-555555555555', NULL, CURRENT_TIMESTAMP + INTERVAL '3 days', 'New', 'Medium', NULL, NULL);
