# GearGuard - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Database Setup

```powershell
# Open PowerShell and create database
psql -U postgres

# In psql:
CREATE DATABASE gearguard_db;
\q

# Load schema and seed data
Get-Content database\schema.sql | psql -U postgres -d gearguard_db
Get-Content database\seed.sql | psql -U postgres -d gearguard_db
```

### Step 2: Backend Setup

```powershell
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env and set:
# DB_PASSWORD=[your postgres password]
# JWT_SECRET=[any random string, e.g., "my-secret-key-123"]
# JWT_REFRESH_SECRET=[another random string]

# Start server
npm run dev
```

Backend will run on **http://localhost:5000**

### Step 3: Frontend Setup

```powershell
# Open NEW terminal
cd frontend

# Install dependencies  
npm install

# Create env file (optional, defaults work)
copy .env.local.example .env.local

# Start frontend
npm run dev
```

Frontend will run on **http://localhost:3000**

---

## 🎯 Test the System

### 1. Login
- Go to http://localhost:3000
- Click "Manager" quick button or enter:
  - Email: `manager@gearguard.com`
  - Password: `password123`

### 2. Explore Features

**Dashboard**
- View system statistics
- Click quick actions

**Equipment**
- Navigate to Equipment page
- Click on any equipment to see details
- Click "Maintenance" smart button to see all related requests with badge count

**Kanban Board** (Main Feature!)
- Go to Requests → Kanban
- **Drag a card** from "New" to "In Progress"
  - System will prompt for technician assignment if needed
- Drag from "In Progress" to "Repaired"
  - System will prompt for duration hours (required!)
- Try invalid transitions (e.g., New → Repaired)
  - System will show error and prevent it ✅

**Teams** (Manager only)
- View maintenance teams
- See team members
- Equipment assigned to teams

---

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can login as Manager
- [ ] Dashboard shows statistics
- [ ] Equipment list loads
- [ ] Smart button shows request count
- [ ] Kanban board displays all columns
- [ ] Can drag cards between columns
- [ ] Workflow validation works (prevents invalid transitions)
- [ ] Overdue requests marked in red
- [ ] Technician avatars appear on cards

---

## 🔧 Common Issues

**Issue: "Cannot connect to database"**
```powershell
# Ensure PostgreSQL is running (Windows Services)
# Or restart it:
net stop postgresql-x64-14
net start postgresql-x64-14
```

**Issue: "Port 5000 already in use"**
```env
# In backend/.env, change to:
PORT=5001

# Update frontend/.env.local:
NEXT_PUBLIC_API_URL=http://localhost:5001
```

**Issue: "Module not found"**
```powershell
# Delete node_modules and reinstall
rm -r node_modules
npm install
```

**Issue: Frontend shows "Network Error"**
- Ensure backend is running
- Check CORS_ORIGIN in backend/.env matches frontend URL
- Clear browser cache and localStorage

---

## 📚 API Endpoints to Test

### View API Docs
http://localhost:5000/api-docs

### Health Check
```bash
curl http://localhost:5000/health
```

### Test Auth
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@gearguard.com",
    "password": "password123"
  }'
```

---

## 🎓 Academic Requirements Checklist

### ✅ Core Domain Model
- [x] Equipment (Assets)
- [x] Maintenance Teams
- [x] Maintenance Requests

### ✅ Equipment Module
- [x] Central registry
- [x] Warranty tracking
- [x] Location & ownership
- [x] Department grouping
- [x] Default team assignment
- [x] Smart button with badge count
- [x] Search and filters

### ✅ Team Module
- [x] Multiple teams (IT, Mechanical, Electrical)
- [x] Team member assignment
- [x] Access control enforcement
- [x] Only team members can work on team requests

### ✅ Request Module
- [x] Corrective & Preventive types
- [x] Auto-fill logic (team from equipment)
- [x] Status workflow (New → In Progress → Repaired/Scrap)
- [x] Technician assignment required
- [x] Duration tracking
- [x] Any user can create
- [x] Team-based access control

### ✅ Kanban Board
- [x] Visual columns (New, In Progress, Repaired, Scrap)
- [x] Drag & drop functionality
- [x] Backend status update
- [x] Workflow validation
- [x] Technician avatars
- [x] Overdue indicators (red)
- [x] Team filtering

### ✅ Calendar View
- [x] Preventive request scheduling
- [x] Calendar integration (FullCalendar)
- [x] Click date to create request
- [x] Backend sync

### ✅ Automation
- [x] Overdue detection (cron job)
- [x] Scrapping marks equipment unusable
- [x] Audit trail logging
- [x] Preventive maintenance reminders
- [x] Warranty expiration checks

### ✅ Technical Requirements
- [x] JWT authentication with refresh
- [x] Role-based access control (User, Technician, Manager)
- [x] PostgreSQL with foreign keys
- [x] RESTful API
- [x] Swagger documentation
- [x] Transaction safety
- [x] Backend business rule enforcement
- [x] Clean ERP-style UI

### ✅ Deliverables
- [x] Database schema (PostgreSQL SQL)
- [x] Backend folder structure
- [x] Models, controllers, routes
- [x] Auth & RBAC middleware
- [x] Cron jobs
- [x] Frontend components
- [x] Kanban implementation
- [x] Calendar integration
- [x] API documentation (Swagger)
- [x] Seed data
- [x] Setup instructions

---

## 📁 Project Structure Overview

```
GearGuard/
├── database/
│   ├── schema.sql          ✅ Complete schema with triggers
│   └── seed.sql            ✅ Sample data (5 users, 10 equipment, 15 requests)
│
├── backend/                ✅ Express + PostgreSQL
│   ├── src/
│   │   ├── config/         ✅ DB, Swagger
│   │   ├── middleware/     ✅ Auth, RBAC, validation, errors
│   │   ├── controllers/    ✅ Auth, Equipment, Teams, Requests
│   │   ├── routes/         ✅ All API routes with Swagger docs
│   │   └── jobs/           ✅ Cron jobs (overdue, reminders, warranty)
│   └── server.js           ✅ Entry point
│
├── frontend/               ✅ Next.js + Tailwind
│   ├── src/
│   │   ├── pages/          ✅ Login, Dashboard, Kanban
│   │   ├── components/     ✅ Layout, Kanban columns & cards
│   │   ├── lib/            ✅ API client with auto-refresh
│   │   └── store/          ✅ Zustand auth store
│   └── package.json
│
└── README.md               ✅ Complete documentation
```

---

## 🎯 Key Features Demonstration

### 1. Smart Button
1. Login as Manager
2. Go to Equipment
3. Click any equipment (e.g., "Dell Workstation WS-01")
4. See "Maintenance" button with badge showing open request count
5. Click button to see all maintenance requests for that equipment

### 2. Workflow Enforcement
1. Go to Kanban board
2. Try dragging "New" request directly to "Repaired"
3. **System blocks it!** Shows error message
4. Correct path: New → In Progress (assign technician first) → Repaired/Scrap (enter duration)

### 3. Auto-fill Logic
1. Create new maintenance request
2. Select equipment from dropdown
3. **Maintenance team auto-fills** based on equipment's default team
4. Equipment category also auto-populated

### 4. Scrap Equipment Logic
1. Move a request to "Scrap" column
2. Enter duration and reason
3. Check equipment details
4. **Equipment automatically marked as unusable** ✅

### 5. Cron Jobs (Background)
- Runs every hour: Checks for overdue requests
- Runs daily 8 AM: Sends preventive maintenance reminders
- Runs daily 9 AM: Checks warranty expirations
- Check terminal logs to see cron job execution

---

##🏆 Success!

You now have a **production-grade maintenance management system** with:
- ✅ Complete backend API
- ✅ Modern React frontend
- ✅ Drag-and-drop Kanban
- ✅ Calendar scheduling
- ✅ Role-based security
- ✅ Automated workflows
- ✅ ERP-style features

**Access Points:**
- Frontend: http://localhost:3000
- API: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

**Test Accounts:**
- Manager: manager@gearguard.com / password123
- Technician: tech1@gearguard.com / password123
- User: user1@gearguard.com / password123

---

Need help? Check:
1. README.md for detailed documentation
2. /api-docs for API reference
3. Browser console for frontend errors
4. Terminal for backend logs
