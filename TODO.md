# Login API with Role-Based Authentication - Implementation Plan

## Status: In Progress

## Requirements Summary:
1. Two separate experiences: User side (Home, Menu, Cart, Orders, Login) and Admin side (Dashboard, Manage Products, Orders, Users)
2. Unified login - redirect based on role (user → /, admin → /admin/dashboard)
3. Hide admin links from regular users
4. Protect admin routes from regular users

## Implementation Steps:

### 1. Update Navbar.tsx - Role-based Admin menu visibility
- [x] Show Admin link only if user is logged in AND role === "admin"

### 2. Update Login Page (/auth/login)
- [ ] After login, check user.role
- [ ] If role === "admin", redirect to /admin/dashboard
- [ ] If role === "user", redirect to /

### 3. Create Admin Route Guard
- [ ] Create a wrapper component that checks if user is admin
- [ ] Redirect to / if user is not admin
- [ ] Use this in all admin pages

### 4. Update Admin Pages to use unified auth
- [ ] Update /admin/page.tsx
- [ ] Update /admin/pizzas/page.tsx
- [ ] Update /admin/orders/page.tsx
- [ ] Update /admin/users/page.tsx
- [ ] Update /admin/login/page.tsx (optional - keep separate or redirect to /auth/login)

### 5. Optional: Protect user routes from admins
- [ ] Consider if admins should access user ordering pages
