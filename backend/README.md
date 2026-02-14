# Pizza Ordering Backend

Local development:

1. Copy `.env.example` to `.env` and set `JWT_SECRET`. Set `DATABASE_URL` to your MongoDB connection string (e.g. `mongodb://localhost:27017/pizzahub` or an Atlas URI).
2. Install dependencies: `pnpm install` or `npm install` inside the `backend` folder.
3. Install dependencies (already done): `npm install` inside the `backend` folder.
4. Seed sample data: `npm run seed` (creates admin user and pizzas).
5. Start server in dev mode: `npm run dev` (listens on PORT, default 4000).

Notes:
- This backend uses the native MongoDB driver. Make sure your `DATABASE_URL` points to an accessible MongoDB instance (local or Atlas).
- If you'd like, I can help configure a free Atlas cluster and update `.env` for you.

APIs:
- Auth: POST `/api/auth/register` / `/api/auth/login`
- Pizzas: GET `/api/pizzas` and GET `/api/pizzas/:id`
- Orders: POST `/api/orders` (protected), GET `/api/orders/user` (protected)
- Admin: `/api/admin/*` (requires ADMIN role)

Set `CORS_ORIGIN` in `.env` to your frontend origin (default `http://localhost:3000`).

Email verification (optional):
- You can send verification emails either via Gmail app password or any SMTP server. Add one of the following options to your `backend/.env`:

Option A — Gmail (recommended when using a Gmail account with 2FA):
```
GMAIL_USER=you@gmail.com
GMAIL_PASS=your_gmail_app_password
EMAIL_FROM="PizzaHub <no-reply@yourdomain.com>"
```
Use an **App Password** for `GMAIL_PASS` if your account has 2-factor authentication enabled.

Option B — SMTP server:
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM='PizzaHub <no-reply@example.com>'
```

Notes:
- If neither Gmail nor SMTP variables are set, emails won't be delivered. Verification codes are still created and stored in the `EmailVerification` collection (useful for local testing).
- Restart the backend after changing `.env` so new credentials take effect.
