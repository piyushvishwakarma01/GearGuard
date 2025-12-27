# GearGuard Development Guide

This document provides detailed information about the implementation, architecture, and development workflow.

## Project Context

**Hackathon**: Odoo Community Days (8-hour timeframe)  
**Type**: Standalone web application (not an Odoo module)  
**Goal**: Replicate Odoo's maintenance module functionality  
**Started**: December 27, 2025

## Architecture

### Backend Design

**Framework**: Express.js with TypeScript  
**Pattern**: Modular MVC architecture  
**Database**: SQLite (development), PostgreSQL-ready (production)  
**Authentication**: JWT tokens with bcrypt password hashing

#### Module Structure

Each feature follows this pattern:
```
modules/
  feature/
    feature.routes.ts    # Express routes and controllers
```

Shared logic:
```
config/         # Database and environment configuration
middleware/     # Authentication and error handling
utils/          # Validation schemas
```

#### Key Design Decisions

1. **Database Choice**: SQLite for rapid development without external dependencies. Schema is database-agnostic via Prisma, allowing easy migration to PostgreSQL.

2. **Auto-fill Logic**: When creating a maintenance request, selecting equipment automatically populates category and team from the equipment record.

3. **Workflow Stages**: Fixed stages (New, In Progress, Repaired, Scrap) with sequence numbers and fold flags for kanban display.

4. **Many-to-Many Teams**: Users can belong to multiple teams. Teams can have multiple members.

5. **Soft Relationships**: Team and technician assignments on equipment are optional. Requests can exist without assigned technicians.

### API Design Patterns

**RESTful Endpoints**:
- `GET /api/resource` - List all (with optional query filters)
- `POST /api/resource` - Create new
- `GET /api/resource/:id` - Get single with full relations
- `PATCH /api/resource/:id` - Partial update
- `DELETE /api/resource/:id` - Delete (cascades via Prisma)

**Error Handling**:
- Validation errors: 400 Bad Request
- Authentication failures: 401 Unauthorized
- Permission denied: 403 Forbidden
- Not found: 404 Not Found
- Server errors: 500 Internal Server Error

**Authentication Flow**:
1. User logs in with email/password
2. Server validates credentials against bcrypt hash
3. JWT token issued with userId and role
4. Client sends token in `Authorization: Bearer <token>` header
5. Middleware validates token and attaches userId to request

## Database Schema Details

### User Model
```prisma
- id: Auto-increment primary key
- email: Unique, required
- passwordHash: Bcrypt hash, never exposed in API
- name: Display name
- role: USER or MANAGER (default USER)
- teams: Many-to-many relation
- equipment: Equipment assigned as technician
- maintenanceRequests: Requests assigned as technician
- createdRequests: Requests created by this user
```

### Category Model
```prisma
- id: Auto-increment primary key
- name: Category name (IT Equipment, Machinery, etc.)
- equipment: Equipment in this category
- maintenanceRequests: Requests for this category
```

### Team Model
```prisma
- id: Auto-increment primary key
- name: Team name
- members: Many-to-many relation with User
- equipment: Equipment assigned to this team
- maintenanceRequests: Requests assigned to this team
```

### Equipment Model
```prisma
- id: Auto-increment primary key
- name: Equipment name
- serialNumber: Optional unique identifier
- category: Required foreign key to Category
- department: Optional department name
- team: Optional foreign key to Team
- technician: Optional foreign key to User
- employeeName: Optional employee assignment (alternative to department)
- purchaseDate: Optional purchase date
- warrantyExpiry: Optional warranty end date
- location: Optional physical location
- notes: Optional additional information
- maintenanceRequests: Requests for this equipment
```

### Stage Model
```prisma
- id: Auto-increment primary key
- name: Display name
- code: Unique identifier (new, in_progress, repaired, scrap)
- sequence: Sort order for kanban columns
- fold: Hide column by default in kanban
- maintenanceRequests: Requests in this stage
```

### MaintenanceRequest Model
```prisma
- id: Auto-increment primary key
- name: Request title/subject
- description: Optional detailed description
- requestType: CORRECTIVE or PREVENTIVE
- equipment: Required foreign key to Equipment
- category: Optional FK (auto-filled from equipment)
- team: Optional FK (auto-filled from equipment)
- technician: Optional foreign key to User
- stage: Required foreign key to Stage
- scheduledDate: Optional scheduled date/time
- duration: Optional estimated hours
- priority: VERY_LOW, LOW, NORMAL, HIGH, VERY_HIGH (default NORMAL)
- createdBy: Required foreign key to User
```

## Implementation Timeline

### Phase 1: Backend Foundation (Completed)
- ✅ Environment setup (Node.js, npm, Git verification)
- ✅ Project initialization (npm, TypeScript, Prisma)
- ✅ Database schema creation (7 models)
- ✅ Initial migration applied
- ✅ Demo data seeded (3 users, 4 categories, 3 teams, 4 stages, 5 equipment, 5 requests)
- ✅ Authentication API (register, login, get current user)
- ✅ Equipment CRUD API with filtering
- ✅ Teams CRUD API with member management
- ✅ Maintenance requests CRUD API with auto-fill
- ✅ Common endpoints (categories, stages, users list)
- ✅ Server running on port 3001

### Phase 2: Frontend Development (Next)
- [ ] React + Vite + TypeScript setup
- [ ] Tailwind CSS + shadcn/ui installation
- [ ] Authentication context and protected routes
- [ ] Login page
- [ ] Equipment list and form pages
- [ ] Teams list and form pages
- [ ] Maintenance requests list and form pages
- [ ] Kanban board with @dnd-kit
- [ ] Calendar view with FullCalendar
- [ ] Responsive layout

### Phase 3: Integration & Deployment (Planned)
- [ ] Frontend API integration
- [ ] End-to-end testing
- [ ] Docker Compose for full stack
- [ ] PostgreSQL migration
- [ ] Production build optimization
- [ ] Demo preparation

## Development Workflow

### Starting Development

```bash
# Backend
cd backend
npm run dev          # Starts server with hot reload on port 3001

# Database management
npm run db:studio    # Opens Prisma Studio (database GUI)
npm run db:seed      # Re-seed database (clears existing data)
```

### Testing API Endpoints

Use REST client (Postman, Thunder Client, or curl):

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@gearguard.com","password":"password123"}'

# Get equipment (authenticated)
curl http://localhost:3001/api/equipment \
  -H "Authorization: Bearer <token>"

# Create maintenance request
curl -X POST http://localhost:3001/api/maintenance \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test request",
    "requestType": "CORRECTIVE",
    "equipmentId": 1,
    "stageId": 1
  }'
```

### Database Changes

When modifying the schema:

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npm run db:migrate

# 3. Update seed data if needed (edit prisma/seed.ts)
npm run db:seed
```

## Code Standards

### TypeScript
- Strict mode enabled
- No implicit any
- Proper type definitions for all functions
- Use interfaces for complex objects

### API Responses
- Consistent JSON structure
- Include related data via Prisma includes
- Never expose passwordHash
- Return appropriate HTTP status codes

### Error Handling
- Use AppError class for operational errors
- Catch and forward errors to error middleware
- Log unexpected errors to console
- Return user-friendly error messages

### Security
- All sensitive routes require authentication
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- CORS enabled for frontend origin
- Helmet.js for security headers

## Troubleshooting

### Common Issues

**Database locked**:
- Close Prisma Studio
- Restart dev server
- SQLite doesn't handle concurrent writes well

**Authentication fails**:
- Check JWT_SECRET in .env
- Verify token format: `Bearer <token>`
- Check token expiration

**Migration fails**:
- Delete dev.db and migrations folder
- Run `npm run db:migrate` again
- Re-seed data

**Port already in use**:
- Change PORT in .env
- Kill process using port 3001:
  ```powershell
  netstat -ano | findstr :3001
  taskkill /PID <pid> /F
  ```

## Next Steps

### Immediate (Frontend Setup)
1. Initialize Vite React TypeScript project in `frontend/`
2. Install dependencies (Tailwind, shadcn/ui, React Router)
3. Create authentication context
4. Build login page
5. Test API integration

### Short-term (Core Features)
1. Equipment management UI
2. Teams management UI
3. Maintenance requests UI with auto-fill
4. Basic responsive layout

### Medium-term (Advanced Features)
1. Kanban board with drag-drop
2. Calendar view
3. Statistics dashboard
4. Filtering and search

### Long-term (Polish)
1. Loading states and error handling
2. Toast notifications
3. Form validation feedback
4. Mobile optimization
5. Docker deployment
6. Production PostgreSQL setup

## Resources

**Documentation**:
- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com)
- [JWT.io](https://jwt.io)
- [Zod Validation](https://zod.dev)

**Frontend Planning**:
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [@dnd-kit](https://dndkit.com)
- [FullCalendar](https://fullcalendar.io)

## Contact

For questions or issues during hackathon development, refer to this guide or inspect the codebase directly. All code includes comments and follows consistent patterns.
