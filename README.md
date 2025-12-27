# GearGuard - Maintenance Management System

A complete, production-grade maintenance management system similar to Odoo modules, built with modern web technologies.

## 🚀 Features

### Core Modules
- **Equipment Management**: Complete asset registry with warranty tracking, ownership, and location management
- **Maintenance Teams**: Team-based access control with role management
- **Maintenance Requests**: Full workflow management (New → In Progress → Repaired/Scrap)
- **Kanban Board**: Drag-and-drop interface for request management
- **Calendar View**: Preventive maintenance scheduling
- **Smart Buttons**: Quick access to related maintenance requests from equipment details
- **Automation**: Cron jobs for overdue detection and reminders

### Technical Features
- JWT-based authentication with automatic token refresh
- Role-based access control (User, Technician, Manager)
- PostgreSQL with strict referential integrity
- RESTful API with Swagger documentation
- Audit trail for all operations
- Transaction safety for critical workflows

---

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (jsonwebtoken, bcryptjs)
- **Validation**: express-validator
- **Cron Jobs**: node-cron
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Calendar**: FullCalendar
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Notifications**: react-hot-toast

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn**
- **Git**

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GearGuard
```

### 2. Database Setup

Create the PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE gearguard_db;

# Exit psql
\q
```

Run the schema and seed data:

```bash
# Windows (PowerShell)
Get-Content database\schema.sql | psql -U postgres -d gearguard_db
Get-Content database\seed.sql | psql -U postgres -d gearguard_db

# macOS/Linux
psql -U postgres -d gearguard_db < database/schema.sql
psql -U postgres -d gearguard_db < database/seed.sql
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env    # Windows
# OR
cp .env.example .env     # macOS/Linux

# Edit .env file and set your database password
# DB_PASSWORD=your_postgres_password
# JWT_SECRET=your_secret_key (generate a random string)
# JWT_REFRESH_SECRET=your_refresh_secret (generate another random string)
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
copy .env.local.example .env.local    # Windows
# OR
cp .env.local.example .env.local     # macOS/Linux

# The default API URL (http://localhost:5000) should work
```

---

## 🚀 Running the Application

You need to run both backend and frontend in separate terminals.

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

- API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs
- Health Check: http://localhost:5000/health

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

---

##  Test Accounts

Use these accounts to test the system:

| Role | Email | Password |
|------|-------|----------|
| Manager | manager@gearguard.com | password123 |
| Technician | tech1@gearguard.com | password123 |
| Technician | tech2@gearguard.com | password123 |
| User | user1@gearguard.com | password123 |

> **Note**: Passwords are hashed in the database. The seed file includes placeholder hashes. For production, ensure proper bcrypt hashing is implemented.

---

## 📚 API Documentation

Once the backend is running, access the interactive API documentation at:

**http://localhost:5000/api-docs**

### Main API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

#### Equipment
- `GET /api/equipment` - List all equipment (with filters)
- `GET /api/equipment/:id` - Get equipment details
- `GET /api/equipment/:id/maintenance-requests` - **Smart Button** - Get all requests for equipment
- `POST /api/equipment` - Create equipment (Manager only)
- `PUT /api/equipment/:id` - Update equipment (Manager only)

#### Maintenance Teams
- `GET /api/teams` - List all teams
- `GET /api/teams/:id` - Get team with members
- `POST /api/teams` - Create team (Manager only)
- `POST /api/teams/:id/members` - Add member (Manager only)

#### Maintenance Requests
- `GET /api/requests` - List all requests (filtered by team)
- `GET /api/requests/kanban` - Get requests for Kanban board
- `GET /api/requests/calendar` - Get preventive requests for calendar
- `POST /api/requests` - Create request (any user)
- `PATCH /api/requests/:id/status` - Update status (workflow enforced)
- `PATCH /api/requests/:id/assign` - Assign technician

---

## 🔐 Role-Based Access Control

### User
- Can create maintenance requests
- Can view their own requests

### Technician
- All User permissions
- Can view team's requests
- Can update requests for their team
- Can change request status
- Can assign themselves to requests

### Manager
- All Technician permissions
- Can create/edit equipment
- Can create/manage teams
- Can add/remove team members
- Can view all requests across teams
- Can delete requests

---

## 🔄 Business Logic & Workflows

### Equipment Management
- Every equipment must have a default maintenance team
- Equipment can be marked as scrapped
- Smart button shows badge count of open maintenance requests

### Maintenance Request Workflow

```
New → In Progress → Repaired
                 ↳ Scrap
```

**Business Rules:**
1. Request starts in "New" status
2. To move to "In Progress": Must have assigned technician
3. To move to "Repaired" or "Scrap": Must record duration hours
4. When moved to "Scrap": Equipment is automatically marked as unusable
5. Only team members can update team's requests
6. Status changes are logged in audit trail

### Auto-fill Logic
When creating a request and selecting equipment:
- Equipment category → auto-populated
- Maintenance team → inherited from equipment's default team
- ✅ Implemented via backend API

### Automation (Cron Jobs)

#### Overdue Detection (Every hour)
- Checks requests where `scheduled_date < NOW()`
- Marks as overdue if not Repaired/Scrapped
- Logs in audit trail

#### Preventive Maintenance Reminders (Daily at 8 AM)
- Finds preventive requests scheduled in next 7 days
- Sends notifications (can integrate email)
- Logs reminder sent

#### Warranty Expiration Check (Daily at 9 AM)
- Finds equipment with warranties expiring in 30 days
- Notifies managers
- Logs warning

---

## 📁 Project Structure

```
GearGuard/
├── database/
│   ├── schema.sql           # PostgreSQL schema
│   └── seed.sql             # Sample data
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Swagger config
│   │   ├── middleware/      # Auth, RBAC, validation
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   └── jobs/            # Cron jobs
│   ├── server.js            # Entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/           # Next.js pages
    │   ├── components/      # React components
    │   ├── lib/             # API client, utils
    │   ├── store/           # Zustand stores
    │   └── styles/          # Global CSS
    ├── next.config.js
    └── package.json
```

---

## 🧪 Testing the System

### 1. Login as Manager
```
Email: manager@gearguard.com
Password: password123
```

### 2. Explore Equipment
- Navigate to Equipment page
- Click on an equipment item
- Click the "Maintenance" smart button to see all related requests

### 3. Test Kanban Board
- Navigate to Requests → Kanban
- Drag a ``"New" request to "In Progress"
- System will validate:
  - ✅ Is technician assigned?
  - ✅ Is user a team member?

### 4. Test Calendar
- Navigate to Requests → Calendar
- View preventive maintenance schedule
- Click a date to create a new preventive request

### 5. Test Workflow Enforcement
Try to move a request from "New" to "Repaired":
- ❌ Should fail! Must go through "In Progress" first

### 6. Test Team Access Control
- Login as Technician (tech1@gearguard.com)
- Try to edit a request from a team you're not in
- ❌ Should fail with 403 Forbidden

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running
```bash
# Windows: Start PostgreSQL service in Services app
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change port in `.env`
```env
PORT=5001
```

### Unauthorized Errors
**Solution**: Clear browser localStorage and login again
```javascript
// In browser console
localStorage.clear();
```

### CORS Errors
**Solution**: Check `CORS_ORIGIN` in backend `.env` matches frontend URL

---

## 📦 Production Deployment

### Backend

1. **Environment Variables**: Set production values
```env
NODE_ENV=production
DB_HOST=production-db-host
JWT_SECRET=strong-random-secret
```

2. **Build**: No build needed for Node.js, but ensure dependencies are installed
```bash
npm install --production
```

3. **Run**:
```bash
npm start
```

### Frontend

1. **Build**:
```bash
npm run build
```

2. **Run**:
```bash
npm start
```

3. **Deploy**: Can deploy to Vercel, Netlify, or any Node.js hosting

### Database
- Use managed PostgreSQL (AWS RDS, Heroku Postgres, etc.)
- Run migrations in production
- Set up regular backups

---

## 🎨 Screenshots & Demo

### Kanban Board
- Drag-and-drop cards between New, In Progress, Repaired, Scrap
- Visual indicators for overdue requests (red border)
- Technician avatars on cards

### Calendar View
- Monthly/Weekly/Daily views
- Preventive maintenance scheduling
- Click event to view/edit
- Color-coded by team

### Equipment Management
- Smart button with badge count
- Detailed equipment info
- Warranty status indicators

---

## 🤝 Contributing

This is an academic/portfolio project. For improvements:

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

---

## 📝 License

MIT License - Feel free to use this project for learning and portfolio purposes.

---

## 👤 Author

**Academic Project** - GearGuard Maintenance Management System

---

## 🙏 Acknowledgments

- Inspired by Odoo ERP modules
- Built with modern best practices
- Production-grade architecture

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review API documentation at `/api-docs`
3. Check browser console for frontend errors
4. Check backend logs for API errors---

**Enjoy using GearGuard! 🛠️**
