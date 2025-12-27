# GearGuard

A standalone maintenance management system for tracking equipment, teams, and maintenance requests. Built for the Odoo hackathon.

## Overview

GearGuard helps organizations manage their assets and maintenance workflows. Track equipment across departments, assign maintenance teams, and handle both corrective and preventive maintenance requests through an intuitive kanban board interface.

## Tech Stack

**Backend:**
- Node.js 22 + Express
- TypeScript 5.3
- Prisma ORM (SQLite for development)
- JWT authentication

**Frontend:**
- React 18 + TypeScript
- Vite 5
- Tailwind CSS + shadcn/ui
- @dnd-kit (drag & drop)
- FullCalendar

## Current Status

✅ **Completed:**
- Backend API with authentication
- Database schema (7 tables)
- CRUD endpoints for Equipment, Teams, Maintenance Requests
- Auto-fill logic (equipment selection populates category/team)
- Seed data with demo accounts

🚧 **In Progress:**
- Frontend React application

⏳ **Planned:**
- Kanban board with drag-drop
- Calendar view for scheduled maintenance
- Docker deployment

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Backend Setup

```bash
# Install dependencies
cd backend
npm install

# Setup database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

Backend runs on `http://localhost:3001`

### Test Credentials

```
Manager: manager@gearguard.com / password123
User 1:  alice@gearguard.com / password123
User 2:  bob@gearguard.com / password123
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user

### Equipment
- `GET /api/equipment` - List all equipment
- `POST /api/equipment` - Create equipment
- `GET /api/equipment/:id` - Get equipment details
- `PATCH /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment

### Teams
- `GET /api/teams` - List all teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `PATCH /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Maintenance Requests
- `GET /api/maintenance` - List all requests
- `POST /api/maintenance` - Create request
- `GET /api/maintenance/:id` - Get request details
- `PATCH /api/maintenance/:id` - Update request
- `PATCH /api/maintenance/:id/stage` - Update request stage (for kanban)
- `DELETE /api/maintenance/:id` - Delete request
- `GET /api/maintenance/stats/overview` - Get statistics

### Common
- `GET /api/categories` - List equipment categories
- `GET /api/stages` - List workflow stages
- `GET /api/users` - List users (authenticated)

## Database Schema

**User** - Authentication and user management
- Email, password hash, name, role (USER/MANAGER)

**Category** - Equipment categorization
- IT Equipment, Machinery, Vehicles, Office Equipment

**Team** - Maintenance teams
- Name, team members (many-to-many with User)

**Equipment** - Assets to maintain
- Name, serial number, category, department, team, technician, purchase/warranty dates, location

**Stage** - Workflow stages for kanban
- New, In Progress, Repaired, Scrap

**MaintenanceRequest** - Maintenance work orders
- Name, description, type (corrective/preventive), equipment, team, technician, stage, scheduled date, priority

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Demo data seeder
│   └── migrations/            # Database migrations
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma client
│   │   └── env.ts             # Environment config
│   ├── middleware/
│   │   ├── auth.middleware.ts # JWT authentication
│   │   └── error.middleware.ts# Error handling
│   ├── modules/
│   │   ├── auth/              # Authentication routes
│   │   ├── equipment/         # Equipment CRUD
│   │   ├── teams/             # Teams CRUD
│   │   ├── maintenance/       # Maintenance requests CRUD
│   │   └── common/            # Shared routes (categories, stages, users)
│   ├── utils/
│   │   └── validators.ts      # Zod schemas
│   └── server.ts              # Express app
└── package.json

frontend/                       # React app (in progress)
```

## Development

### Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create migration
npm run db:migrate

# Seed demo data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
```

## Features

### Core Functionality
- **Equipment Management**: Track assets with serial numbers, warranties, locations
- **Team Assignment**: Organize technicians into specialized maintenance teams
- **Maintenance Requests**: Create corrective (breakdown) or preventive (scheduled) maintenance
- **Auto-fill Logic**: Selecting equipment automatically populates category and team
- **Role-based Access**: Manager and User roles with appropriate permissions

### Planned Features
- **Kanban Board**: Visual workflow with drag-drop stage updates
- **Calendar View**: Timeline of scheduled maintenance
- **Priority Levels**: Very Low to Very High request prioritization
- **Overdue Tracking**: Highlight requests past scheduled date
- **Statistics Dashboard**: Request counts by stage, priority, and status

## License

MIT

## Contributing

This project was created for an Odoo hackathon. Contributions and feedback welcome. 
○ Scheduled Date: When should the work happen? 
○ Duration: How long did the repair take? 
3. The Functional Workflow
Participants must implement the following business logic to make the module "alive." 
Flow 1: The Breakdown 
1. Request: Any user can create a request. 
2. Auto-Fill Logic: When the user selects an Equipment (e.g., "Printer 01"): 
○ The system should automatically fetch the Equipment category and 
Maintenance Team from the equipment record and fill them into the request. 
3. Request state: The request starts in the New stage. 
4. Assignment: A manager or technician assigns themselves to the ticket. 
5. Execution: The stage moves to In Progress. 
6. Completion: The technician records the Hours Spent (Duration) and moves the stage 
to Repaired. 
Flow 2: The Routine Checkup 
1. Scheduling: A manager creates a request with the type Preventive. 
2. Date Setting: The user sets a Scheduled Date (e.g., Next Monday). 
3. Visibility: This request must appear on the Calendar View on the specific date so the 
technician knows they have a job to do. 
4. User Interface & Views Requirements
To provide a good User Experience (UX), the following views are required: 
1. The Maintenance Kanban Board 
The primary workspace for technicians. 
● Group By: Stages (New | In Progress | Repaired | Scrap). 
● Drag & Drop: Users must be able to drag a card from "New" to "In Progress." 
● Visual Indicators: 
○ Technician: Show the avatar of the assigned user. 
○ Status Color: Display a red strip or text if the request is Overdue. 
2. The Calendar View 
● Display all Preventive maintenance requests. 
● Allow users to click a date to schedule a new maintenance request. 
3. The Pivot/Graph Report (Optional/Advanced) 
● A report showing the Number of Requests per Team or per Equipment Category. 
5. Required Automation & Smart Features
These features distinguish a basic form from a smart "Odoo-like" module. 
● Smart Buttons: 
○ On the Equipment Form, add a button labeled "Maintenance". 
○ Function: Clicking this button opens a list of all requests related only to that 
specific machine. 
○ Badge: The button should display the count of open requests. 
● Scrap Logic: 
○ If a request is moved to the Scrap stage, the system should logically indicate that 
the equipment is no longer usable (e.g., log a note or set a flag). 
Mockup link - https://link.excalidraw.com/l/65VNwvy7c4X/5y5Qt87q1Qp