# GearGuard - Quick Navigation Guide

## 📱 How to Access All Features

### After Logging In

You'll see a **sidebar on the left** with these sections:

#### 🏠 Dashboard
- Overview with stats cards
- Quick actions based on your role

#### 🛠️ Equipment
- Click "Equipment" → View all equipment list
- Click any row → See equipment detail with **SMART BUTTON**
- Smart button shows badge with # of open requests

#### 📋 Requests  
**Click "Requests" to expand submenu:**
- **All Requests** → List view with filters
- **Kanban Board** → Drag & drop workflow (Technician/Manager)
- **Calendar** → Preventive maintenance schedule (Technician/Manager)
- **Create Request** → New maintenance request form

#### 👥 Teams (Manager only)
- View all maintenance teams
- See team members and status

---

## 🔍 Where to Find Things

### The Submenu Won't Show?
The submenu for "Requests" **only appears when you click on /requests**. After clicking "Requests" in the sidebar, you'll see:
- All Requests
- Kanban Board
- Calendar  
- Create Request

### Smart Button Location
1. Go to **Equipment** (sidebar)
2. Click on any equipment row
3. Look for the blue "Maintenance" button
4. It will show a red badge with the count of open requests

### Calendar View
1. Click **Requests** in sidebar
2. Submenu appears
3. Click **Calendar**
4. You'll see FullCalendar with preventive maintenance

---

## 🎯 Quick Actions

**Create a Request**:
- Dashboard → "+ Create Request" button
- OR Sidebar → Requests → Create Request

**View Kanban**:
- Sidebar → Requests → Kanban Board
- OR Requests page → "Kanban View" button

**Check Equipment**:
- Dashboard → "View Equipment" button
- OR Sidebar → Equipment

---

## 👤 Role-Based Access

### User
- ✅ Dashboard
- ✅ Equipment (view only)
- ✅ Requests → All Requests, Create Request
- ❌ Kanban, Calendar, Teams

### Technician
- ✅ Everything User has
- ✅ Kanban Board
- ✅ Calendar
- ❌ Teams

### Manager
- ✅ Everything
- ✅ Teams management
- ✅ Create equipment

---

## 🐛 Troubleshooting

**I don't see the submenu!**
→ Make sure you're ON the /requests page first

**Calendar page is blank!**
→ Make sure backend is running
→ Check browser console for errors

**Can't access Teams page!**
→ You need Manager role

---

Your sidebar should look like this:

```
┌─────────────────┐
│  G  GearGuard   │  ← Logo
├─────────────────┤
│ 🏠 Dashboard    │
│ 🛠️ Equipment    │
│ 📋 Requests     │  ← Click here!
│   ├ All Requests    │  ← Then you see these
│   ├ Kanban Board    │
│   ├ Calendar        │
│   └ Create Request  │
│ 👥 Teams        │  (Manager only)
├─────────────────┤
│ 👤 Your Name    │  ← Profile
│    Your Role    │
└─────────────────┘
```

Click "Requests" to see the submenu expand!
