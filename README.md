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
- **Database**: PostgreSQL 14+ (Compatible with Render)
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

Before you begin, ensure you have the following/available:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL Database** (Local or Remote, e.g., Render)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GearGuard
```

### 2. Configure Backend

Navigate to the backend directory:
```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example` or use the template below):
```bash
# Copy example file
cp .env.example .env
```

**Database Configuration**:
You can use a local database OR a remote Render database.
- **Option A (Render)**: Set `DATABASE_URL` to your Render connection string.
  ```env
  DATABASE_URL=postgres://user:password@hostname.render.com/dbname_sslmode=require
  ```
- **Option B (Local)**: Set individual DB params (`DB_HOST`, `DB_USER`, etc.).

### 3. Initialize Database (Schema & Seeds)

We have a script to automatically set up the schema and load dummy data, regardless of where your database is hosted.

**Run this command in the `backend` folder**:
```bash
npm run db:init
```
> This will wipe the existing database schema and re-create it with sample data (5 users, 10 equipment, etc.).

### 4. Configure Frontend

Navigate to the frontend directory:
```bash
cd ../frontend
npm install
```

Create a `.env.local` file pointing to your backend:
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🚀 Running the Application

You need to run both backend and frontend in separate terminals.

### Terminal 1: Backend

```bash
cd backend
npm run dev
```
- API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs
- Health Check: http://localhost:5000/health

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```
- Access App: http://localhost:3000

---

## 🧪 Test Accounts

Use these accounts to log in and test the system:

| Role | Email | Password |
|------|-------|----------|
| **Manager** | `manager@gearguard.com` | `password123` |
| **Technician** | `tech1@gearguard.com` | `password123` |
| **User** | `user1@gearguard.com` | `password123` |

> **Manager** has full access. **Technicians** can only see their team's requests. **Users** can only see their own requests.

---

## 📚 API Documentation

Once the backend is running, access the interactive API documentation at:
**http://localhost:5000/api-docs**

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

### Maintenance Request Workflow
```
New → In Progress → Repaired
                 ↳ Scrap
```
1. **New**: Request created.
2. **In Progress**: Technician assigned (Required).
3. **Repaired**: Work finished, duration logged.
4. **Scrap**: Equipment permanently broken. Marks equipment as **Unusable**.

### Automation (Cron Jobs)
- **Overdue Detection**: Runs hourly. Marks requests past scheduled date as Overdue.
- **Preventive Reminders**: Daily at 8 AM.
- **Warranty Checks**: Daily at 9 AM.

---

## 📂 Project Structure

```
GearGuard/
├── database/            # SQL Schema and Seed files
├── backend/             # Node.js/Express API
│   ├── src/controllers  # Business Logic
│   ├── src/routes       # API Endpoints
│   └── scripts/         # DB Init Scripts
└── frontend/            # Next.js App
    ├── src/pages        # Routes (Login, Dashboard, etc.)
    └── src/components   # React Components
```

---

## 🐛 Troubleshooting

**Database Connection Error?**
- Check your `.env` `DATABASE_URL`.
- Ensure your IP is allowed if using a managed cloud database.
- Ensure local Postgres service is running.

**Frontend "Network Error"?**
- Ensure backend is running on port 5000.
- Check `frontend/.env.local` `NEXT_PUBLIC_API_URL`.

**Login Failed?**
- Run `npm run db:init` in `backend` again to reset passwords/users.

---

## 👤 Author
**Academic Project** - GearGuard Maintenance Management System
