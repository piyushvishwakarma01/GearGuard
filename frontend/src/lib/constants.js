export const ROLES = {
    USER: 'User',
    TECHNICIAN: 'Technician',
    MANAGER: 'Manager',
};

export const REQUEST_STATUS = {
    NEW: 'New',
    IN_PROGRESS: 'In Progress',
    REPAIRED: 'Repaired',
    SCRAP: 'Scrap',
};

export const REQUEST_TYPE = {
    CORRECTIVE: 'Corrective',
    PREVENTIVE: 'Preventive',
};

export const PRIORITY = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
};

export const KANBAN_COLUMNS = [
    { id: 'New', title: 'New', color: 'bg-blue-50 border-blue-200' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'Repaired', title: 'Repaired', color: 'bg-green-50 border-green-200' },
    { id: 'Scrap', title: 'Scrap', color: 'bg-red-50 border-red-200' },
];

export const STATUS_COLORS = {
    New: 'blue',
    'In Progress': 'yellow',
    Repaired: 'green',
    Scrap: 'red',
};

export const PRIORITY_COLORS = {
    Low: 'gray',
    Medium: 'blue',
    High: 'orange',
    Critical: 'red',
};
