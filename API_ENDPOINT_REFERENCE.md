# 🔌 API Endpoint Reference - Status Update Flow

## Complete Auto-Update Flow Example

### Scenario: Admin updates order status from PENDING → CONFIRMED → PREPARING

---

## 1️⃣ GET USER'S ORDERS (Initial Fetch)

**Endpoint:** `GET /api/orders/user`

**Headers:**
```
Authorization: Bearer <user_token>
```

**Response (Initial State):**
```json
[
  {
    "id": "clyu8ax3w0001pxyz",
    "userId": "clyu8ax3w0000pxyz",
    "items": "[{\"name\":\"Margherita\",\"size\":\"medium\",\"quantity\":1,\"price\":299}]",
    "total": 299,
    "payment": "COD",
    "status": "PENDING",
    "confirmedAt": null,
    "preparingAt": null,
    "bakingAt": null,
    "outForDeliveryAt": null,
    "deliveredAt": null,
    "cancelledAt": null,
    "address": "123 Main Street",
    "phone": "9876543210",
    "createdAt": "2026-02-14T10:30:00.000Z",
    "updatedAt": "2026-02-14T10:30:00.000Z",
    "user": {
      "id": "clyu8ax3w0000pxyz",
      "name": "John Doe",
      "email": "user@pizzahub.com"
    }
  }
]
```

**What User Sees:**
- Status Badge: **PENDING** (Yellow)
- Timeline: Only "Order Placed" visible
- Timestamps: Only `createdAt` shown

---

## 2️⃣ ADMIN UPDATES STATUS (Backend Updates)

**Endpoint:** `PUT /api/admin/orders/:id/status`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Backend Processing:**
```typescript
// Validates status
validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'BAKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

// Sets timestamp
updateData = {
  status: "CONFIRMED",
  confirmedAt: new Date(),  // ← Sets current time
  updatedAt: new Date()
}

// Updates database
await prisma.order.update({
  where: { id: "clyu8ax3w0001pxyz" },
  data: updateData
})
```

**Response (After Admin Update):**
```json
{
  "id": "clyu8ax3w0001pxyz",
  "status": "CONFIRMED",
  "confirmedAt": "2026-02-14T10:31:15.000Z",  // ← New timestamp
  "preparingAt": null,
  "bakingAt": null,
  "outForDeliveryAt": null,
  "deliveredAt": null,
  "cancelledAt": null,
  "updatedAt": "2026-02-14T10:31:15.000Z",
  ...
}
```

---

## 3️⃣ USER AUTOMATICALLY SEES UPDATE (5-Second Poll)

**Frontend Polling Code:**
```typescript
// Runs every 5 seconds
const interval = setInterval(() => {
  fetchOrders();  // Calls GET /api/orders/user
}, 5000);
```

**User's Frontend Calls:**
```
GET /api/orders/user
Authorization: Bearer <user_token>
```

**Updated Response (After Poll):**
```json
[
  {
    "id": "clyu8ax3w0001pxyz",
    "status": "CONFIRMED",                          // ← Status updated!
    "confirmedAt": "2026-02-14T10:31:15.000Z",    // ← Timestamp added!
    "preparingAt": null,
    "bakingAt": null,
    "outForDeliveryAt": null,
    "deliveredAt": null,
    "cancelledAt": null,
    "updatedAt": "2026-02-14T10:31:15.000Z"
  }
]
```

**What User Sees (Auto-Updated):**
- Status Badge: **CONFIRMED** (Now Blue)
- Timeline: "Order Placed" ✅ + "Confirmed" ✅
- Timestamps: Confirmed at 10:31:15 shown

---

## 4️⃣ ADMIN UPDATES AGAIN: CONFIRMED → PREPARING

**Admin Request:**
```json
{
  "status": "PREPARING"
}
```

**Backend Updates:**
```typescript
updateData = {
  status: "PREPARING",
  preparingAt: new Date(),  // ← NEW timestamp
  updatedAt: new Date()
}
```

**Database State:**
```json
{
  "status": "PREPARING",
  "confirmedAt": "2026-02-14T10:31:15.000Z",
  "preparingAt": "2026-02-14T10:32:45.000Z",  // ← NEW
  "updatedAt": "2026-02-14T10:32:45.000Z"
}
```

**User's Next Poll (5 sec later):**
- Status: **PREPARING** (Purple)
- Timeline shows all 3: Placed ✅ → Confirmed ✅ → Preparing 👨‍🍳
- Timestamps updated automatically

---

## 5️⃣ Complete Status Progression

**Admin Updates Flow:**
```
PENDING (10:30)
    ↓ [Admin Click]
CONFIRMED (10:31:15 - confirmedAt set)
    ↓ [Admin Click]
PREPARING (10:32:45 - preparingAt set)
    ↓ [Admin Click]
BAKING (10:35:20 - bakingAt set)
    ↓ [Admin Click]
OUT_FOR_DELIVERY (10:40:00 - outForDeliveryAt set)
    ↓ [Admin Click]
DELIVERED (10:50:30 - deliveredAt set)
```

**User's Timeline** (Auto-Updates Every 5 Seconds):
```
⏰ Order Placed at 10:30 ✅
✅ Confirmed at 10:31:15 ✅
👨‍🍳 Preparing at 10:32:45 ✅
🔥 Baking at 10:35:20 ✅
🚗 Out for Delivery at 10:40:00 ✅
📦 Delivered at 10:50:30 ✅
```

---

## 🧪 Manual Testing with CURL

### Get Admin Token
```bash
curl -X POST http://localhost:4000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pizzahub.com","password":"adminpass"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get User Token
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@pizzahub.com","password":"userpass123"}'
```

### Get All User Orders
```bash
curl http://localhost:4000/api/orders/user \
  -H "Authorization: Bearer <USER_TOKEN>"
```

### Admin Updates Order Status
```bash
curl -X PUT http://localhost:4000/api/admin/orders/<ORDER_ID>/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED"}'
```

### Check Updated Order
```bash
curl http://localhost:4000/api/orders/user \
  -H "Authorization: Bearer <USER_TOKEN>"
```

**Result:** You'll see `confirmedAt` now has a timestamp! ✅

---

## 📍 Key Timestamps in Database

When status changes, these fields are automatically set:

```typescript
if (status === 'CONFIRMED') updateData.confirmedAt = new Date();
if (status === 'PREPARING') updateData.preparingAt = new Date();
if (status === 'BAKING') updateData.bakingAt = new Date();
if (status === 'OUT_FOR_DELIVERY') updateData.outForDeliveryAt = new Date();
if (status === 'DELIVERED') updateData.deliveredAt = new Date();
if (status === 'CANCELLED') updateData.cancelledAt = new Date();
```

---

## 🔄 Frontend Auto-Update Timing

```
Time | Event
─────┼──────────────────────────────────────────
0s   | User opens orders page
5s   | First poll: GET /api/orders/user
10s  | Second poll: GET /api/orders/user
15s  | Admin updates status in parallel
16s  | Database updated with new status
20s  | Third poll: User sees new status! ⚡
25s  | Fourth poll (and continues)
```

**Maximum wait time for user to see update: ~5 seconds**

---

## 💡 How Database Persistence Works

### Order Record in SQLite Database

```sql
SELECT id, status, confirmedAt, preparingAt, bakingAt, outForDeliveryAt, deliveredAt, cancelledAt, updatedAt
FROM Order
WHERE id = 'clyu8ax3w0001pxyz';
```

**After Each Status Update:**

| status | confirmedAt | preparingAt | bakingAt | outForDeliveryAt | deliveredAt | cancelledAt | updatedAt |
|--------|-------------|-------------|----------|-----------------|-------------|------------|-----------|
| PENDING | NULL | NULL | NULL | NULL | NULL | NULL | 10:30 |
| CONFIRMED | 10:31:15 | NULL | NULL | NULL | NULL | NULL | 10:31:15 |
| PREPARING | 10:31:15 | 10:32:45 | NULL | NULL | NULL | NULL | 10:32:45 |
| BAKING | 10:31:15 | 10:32:45 | 10:35:20 | NULL | NULL | NULL | 10:35:20 |
| OUT_FOR_DELIVERY | 10:31:15 | 10:32:45 | 10:35:20 | 10:40:00 | NULL | NULL | 10:40:00 |
| DELIVERED | 10:31:15 | 10:32:45 | 10:35:20 | 10:40:00 | 10:50:30 | NULL | 10:50:30 |

**All data persists forever** - provides audit trail and order history

---

## ✅ Verification Checklist

- [ ] Backend server running on port 4000
- [ ] Frontend dev server running on port 3000
- [ ] User logged in and on `/orders` page
- [ ] Admin logged in with order visible
- [ ] Click status dropdown, select new status
- [ ] Check user's orders page within 5 seconds
- [ ] Status updated! ✅
- [ ] Timestamp shows when change occurred
- [ ] Timeline updates with new stage
- [ ] Repeat for all statuses

---

## 🎯 Success Indicators

✅ You know it's working when:

1. Admin changes status → updates appear instantly on admin panel
2. User page refreshes within 5 seconds
3. Status badge changes color
4. New timestamp appears in timeline
5. Order history shows progression
6. All statuses (including CANCELLED) work
7. Database persists changes

**If you experience any issues, check `REAL_TIME_ORDER_TRACKING_GUIDE.md` troubleshooting section!**
