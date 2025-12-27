# Troubleshooting Request Creation Issues

## Check List

### 1. Is the Backend Running?
```powershell
# Check if backend server is running on port 5000
curl http://localhost:5000/api-docs
# Should return Swagger UI HTML
```

### 2. Check Frontend API URL
**File:** `frontend/.env.local`

Should contain:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Check Browser Console for Errors

**Open DevTools (F12) → Console tab**

Look for:
- "Sending payload:" log (shows what's being sent)
- "Error creating request:" log (shows the error)
- Any CORS errors (red text mentioning "CORS" or "Access-Control-Allow-Origin")

### 4. Check Network Request

**Open DevTools (F12) → Network tab**

1. Try creating a request
2. Look for a request to `/api/requests` (should be red if failed)
3. Click on it
4. Check **Headers** tab:
   - Request URL should be `http://localhost:5000/api/requests`
   - Request Method should be `POST`
5. Check **Payload** tab:
   - Should show your request data as JSON
6. Check **Response** tab:
   - Shows the error message from backend

### 5. Common Issues & Solutions

#### Issue: "Network Error" or "Failed to fetch"
**Cause:** Backend not running or wrong URL

**Solution:**
```powershell
# Start backend
cd backend
npm run dev
```

#### Issue: "CORS policy: No 'Access-Control-Allow-Origin'"
**Cause:** CORS configuration issue

**Solution:** Check `backend/.env`:
```env
CORS_ORIGIN=http://localhost:3000
```

Restart backend after changing.

#### Issue: "Validation failed: equipment_id"
**Cause:** Equipment ID not being sent correctly

**Debug Steps:**
1. Open Console (F12)
2. Look for "Sending payload:" log
3. Check if `equipment_id` is present and is a valid UUID
4. If it says `equipment_id: ""`, the equipment dropdown isn't working

#### Issue: Request body is empty on backend
**Cause:** Frontend not sending data correctly

**Debug:** Check Network tab → Payload should show:
```json
{
  "subject": "Test",
  "request_type": "Corrective",
  "equipment_id": "uuid-here",
  "priority": "Medium"
}
```

If payload is empty, there's an issue with the form submission.

### 6. Manual Test with curl

Test backend directly:
```powershell
# Get an equipment ID first
curl http://localhost:5000/api/equipment -H "Authorization: Bearer YOUR_TOKEN"

# Create request (replace TOKEN and EQUIPMENT_ID)
curl -X POST http://localhost:5000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "subject": "Test Request",
    "request_type": "Corrective",
    "equipment_id": "e1e1e1e1-1111-1111-1111-111111111111",
    "priority": "Medium"
  }'
```

### 7. Check Database Connection

Backend logs should show:
```
✅ Database connected successfully
🚀 Server running on port 5000
```

If not, check `backend/.env` database credentials.

---

## Quick Fix Checklist

- [ ] Backend is running (`npm run dev` in backend folder)
- [ ] Frontend is running (`npm run dev` in frontend folder)  
- [ ] `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:5000`
- [ ] `backend/.env` has `CORS_ORIGIN=http://localhost:3000`
- [ ] You're logged in (token exists in localStorage)
- [ ] Equipment list loads (dropdown has items)
- [ ] Console shows "Sending payload:" log
- [ ] Network tab shows the POST request

---

## Still Not Working?

Take a screenshot of:
1. Browser console (showing "Sending payload:" and error)
2. Network tab (showing the failed request details)
3. Backend terminal (showing any error logs)

And share them so I can see exactly what's failing!
