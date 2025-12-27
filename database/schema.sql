-- GearGuard Database Schema
-- PostgreSQL 14+

-- Drop existing tables if any (for clean setup)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS request_status_history CASCADE;
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS equipment_categories CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS maintenance_teams CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('User', 'Technician', 'Manager')),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

-- ============================================================================
-- ORGANIZATIONAL STRUCTURE
-- ============================================================================

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_departments_name ON departments(name);

CREATE TABLE maintenance_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    team_type VARCHAR(100), -- e.g., 'Mechanical', 'Electrical', 'IT'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_teams_name ON maintenance_teams(name);
CREATE INDEX idx_teams_type ON maintenance_teams(team_type);

-- Junction table for many-to-many relationship between users and teams
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES maintenance_teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_lead BOOLEAN DEFAULT false,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- ============================================================================
-- EQUIPMENT MANAGEMENT
-- ============================================================================

CREATE TABLE equipment_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    default_team_id UUID REFERENCES maintenance_teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equipment_categories_name ON equipment_categories(name);

CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255) UNIQUE NOT NULL,
    category_id UUID REFERENCES equipment_categories(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    
    -- Purchase & Warranty
    purchase_date DATE,
    warranty_expiry_date DATE,
    purchase_cost DECIMAL(12, 2),
    
    -- Location & Ownership
    physical_location VARCHAR(255),
    assigned_employee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Maintenance
    default_maintenance_team_id UUID NOT NULL REFERENCES maintenance_teams(id) ON DELETE RESTRICT,
    
    -- Status
    is_usable BOOLEAN DEFAULT true,
    is_scrapped BOOLEAN DEFAULT false,
    scrap_date DATE,
    scrap_reason TEXT,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_equipment_serial ON equipment(serial_number);
CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_equipment_department ON equipment(department_id);
CREATE INDEX idx_equipment_employee ON equipment(assigned_employee_id);
CREATE INDEX idx_equipment_team ON equipment(default_maintenance_team_id);
CREATE INDEX idx_equipment_usable ON equipment(is_usable) WHERE deleted_at IS NULL;

-- ============================================================================
-- MAINTENANCE REQUESTS
-- ============================================================================

CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Request Details
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('Corrective', 'Preventive')),
    
    -- Relationships
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
    equipment_category_id UUID REFERENCES equipment_categories(id) ON DELETE SET NULL,
    maintenance_team_id UUID NOT NULL REFERENCES maintenance_teams(id) ON DELETE RESTRICT,
    
    -- Assignment
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Scheduling
    scheduled_date TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_hours DECIMAL(6, 2) CHECK (duration_hours IS NULL OR duration_hours > 0),
    
    -- Status & Priority
    status VARCHAR(50) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Repaired', 'Scrap')),
    priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    is_overdue BOOLEAN DEFAULT false,
    
    -- Completion Notes
    completion_notes TEXT,
    parts_used TEXT,
    cost DECIMAL(12, 2),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_requests_equipment ON maintenance_requests(equipment_id);
CREATE INDEX idx_requests_team ON maintenance_requests(maintenance_team_id);
CREATE INDEX idx_requests_assigned ON maintenance_requests(assigned_technician_id);
CREATE INDEX idx_requests_status ON maintenance_requests(status);
CREATE INDEX idx_requests_type ON maintenance_requests(request_type);
CREATE INDEX idx_requests_scheduled ON maintenance_requests(scheduled_date);
CREATE INDEX idx_requests_overdue ON maintenance_requests(is_overdue) WHERE is_overdue = true;
CREATE INDEX idx_requests_created_by ON maintenance_requests(created_by_user_id);

-- ============================================================================
-- AUDIT & HISTORY
-- ============================================================================

CREATE TABLE request_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_status_history_request ON request_status_history(request_id);
CREATE INDEX idx_status_history_changed_at ON request_status_history(changed_at);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL, -- 'equipment', 'request', 'user', etc.
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE'
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    changes JSONB, -- Store old and new values
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON maintenance_teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_categories_updated_at BEFORE UPDATE ON equipment_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGER FOR STATUS HISTORY LOGGING
-- ============================================================================

CREATE OR REPLACE FUNCTION log_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO request_status_history (request_id, old_status, new_status, changed_by_user_id)
        VALUES (NEW.id, OLD.status, NEW.status, NEW.assigned_technician_id);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_log_request_status_change
    AFTER UPDATE ON maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION log_request_status_change();

-- ============================================================================
-- TRIGGER FOR EQUIPMENT SCRAP MARKING
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_equipment_scrapped()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND NEW.status = 'Scrap' AND OLD.status != 'Scrap') THEN
        UPDATE equipment
        SET is_usable = false,
            is_scrapped = true,
            scrap_date = CURRENT_DATE,
            scrap_reason = 'Marked during maintenance request: ' || NEW.subject
        WHERE id = NEW.equipment_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_mark_equipment_scrapped
    AFTER UPDATE ON maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION mark_equipment_scrapped();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for equipment with open request count
CREATE VIEW equipment_with_open_requests AS
SELECT 
    e.*,
    COUNT(mr.id) FILTER (WHERE mr.status NOT IN ('Repaired', 'Scrap')) as open_request_count
FROM equipment e
LEFT JOIN maintenance_requests mr ON e.id = mr.equipment_id
WHERE e.deleted_at IS NULL
GROUP BY e.id;

-- View for requests with full details
CREATE VIEW requests_detailed AS
SELECT 
    mr.*,
    e.equipment_name,
    e.serial_number,
    e.physical_location,
    ec.name as category_name,
    mt.name as team_name,
    u_created.full_name as created_by_name,
    u_assigned.full_name as assigned_technician_name,
    d.name as department_name
FROM maintenance_requests mr
JOIN equipment e ON mr.equipment_id = e.id
LEFT JOIN equipment_categories ec ON mr.equipment_category_id = ec.id
JOIN maintenance_teams mt ON mr.maintenance_team_id = mt.id
JOIN users u_created ON mr.created_by_user_id = u_created.id
LEFT JOIN users u_assigned ON mr.assigned_technician_id = u_assigned.id
LEFT JOIN departments d ON e.department_id = d.id
WHERE mr.deleted_at IS NULL;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'System users with role-based access (User, Technician, Manager)';
COMMENT ON TABLE departments IS 'Organizational departments';
COMMENT ON TABLE maintenance_teams IS 'Teams responsible for maintenance work';
COMMENT ON TABLE team_members IS 'Junction table for users assigned to teams';
COMMENT ON TABLE equipment IS 'Asset registry with warranty and ownership tracking';
COMMENT ON TABLE equipment_categories IS 'Equipment classification with default team assignment';
COMMENT ON TABLE maintenance_requests IS 'Maintenance work orders with workflow management';
COMMENT ON TABLE request_status_history IS 'Audit trail for status changes';
COMMENT ON TABLE audit_logs IS 'System-wide audit trail';

COMMENT ON COLUMN equipment.is_usable IS 'False when equipment is scrapped or out of service';
COMMENT ON COLUMN maintenance_requests.is_overdue IS 'Set by cron job when scheduled_date is past and not completed';
COMMENT ON COLUMN maintenance_requests.duration_hours IS 'Actual time spent on repair';

-- ============================================================================
-- GRANT PERMISSIONS (for application user)
-- ============================================================================

-- Create application user (run separately if needed)
-- CREATE USER gearguard_app WITH PASSWORD 'secure_password_here';
-- GRANT CONNECT ON DATABASE gearguard_db TO gearguard_app;
-- GRANT USAGE ON SCHEMA public TO gearguard_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gearguard_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gearguard_app;

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================

-- Verify installation
SELECT 'Schema created successfully! Tables:' as message;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
