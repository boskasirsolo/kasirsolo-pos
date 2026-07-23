# Auth Flow

## Overview

KASIRSOLO uses Supabase Auth for authentication. The auth system supports email/password login, role-based access control, and PIN-based quick access for POS cashiers.

---

## User Types

| Type | Auth Method | Where | Role |
|------|------------|-------|------|
| Client/Owner | Email + Password | Landing, Admin, POS | owner |
| Manager | Email + Password or PIN | POS | manager |
| Cashier | PIN only | POS | cashier |

---

## Registration Flow

```
LANDING PAGE (/coba-gratis)
        |
        v
+-------------------+
| Registration Form |
| - name            |
| - business_name   |
| - email           |
| - whatsapp        |
| - city            |
| - app (select)    |
+--------+----------+
         |
         v
+--------+----------+
| Server Action:    |
| 1. supabase.auth  |
|    .signUp({      |
|      email,       |
|      password:    |
|      generated    |
|    })             |
+--------+----------+
         |
         v
+--------+----------+
| 2. INSERT INTO    |
|    ksp_clients    |
|    (name, email,  |
|     business_name,|
|     auth_user_id) |
+--------+----------+
         |
         v
+--------+----------+
| 3. INSERT INTO    |
|    ksp_licenses   |
|    (client_id,    |
|     app_id,       |
|     status: trial,|
|     trial_ends_at:|
|     +14 days)     |
+--------+----------+
         |
         v
+--------+----------+
| 4. INSERT INTO    |
|    ksp_users      |
|    (auth_user_id, |
|     license_id,   |
|     client_id,    |
|     role: owner)  |
+--------+----------+
         |
         v
+--------+----------+
| 5. Send welcome   |
|    email with      |
|    credentials     |
+--------+----------+
         |
         v
+--------+----------+
| 6. INSERT INTO    |
|    ksp_logs       |
|    (action:       |
|     auth.register)|
+--------+----------+
         |
         v
  /coba-gratis/berhasil
  (Success page with
   login instructions)
```

---

## Login Flow

### Owner/Manager Login (Email + Password)

```
LOGIN PAGE (/login)
        |
        v
+-------------------+
| Login Form        |
| - email           |
| - password        |
+--------+----------+
         |
         v
+--------+----------+
| supabase.auth     |
|   .signInWith     |
|   Password({      |
|     email,        |
|     password      |
|   })              |
+--------+----------+
         |
    +----+----+
    |         |
  SUCCESS   FAILURE
    |         |
    v         v
+---+---+  Show error
| Fetch |  message
| ksp_  |
| users |
| (by   |
| auth_ |
| user  |
| _id)  |
+---+---+
    |
    v
+---+---+
| Check |
| role  |
+---+---+
    |
    +----> owner    --> /dashboard (full access)
    +----> manager  --> / (POS + reports)
    +----> cashier  --> / (POS only)
```

### Cashier Login (PIN)

```
POS APP (/)
        |
        v
+-------------------+
| PIN Entry Screen  |
| [_ _ _ _ _ _]    |
+--------+----------+
         |
         v
+--------+----------+
| Query ksp_users   |
| WHERE pin = input |
| AND license_id =  |
|   current_license |
| AND is_active     |
+--------+----------+
         |
    +----+----+
    |         |
  MATCH    NO MATCH
    |         |
    v         v
  Set user  Show error
  context   "PIN salah"
  in state
    |
    v
  POS screen
  (with user's
   role permissions)
```

---

## Session Management

### Web Session
- Supabase Auth uses JWT tokens stored in cookies
- Access token expires after 1 hour
- Refresh token automatically renews the session
- Next.js middleware validates the session on each request

### Offline Session
- Cached auth state in IndexedDB (`pos_settings.auth_cache`)
- License key cached for offline validation
- PIN-based access works offline (PIN stored in `ksp_users.pin`, cached locally)
- Online re-validation required every 7 days

---

## Role Management

### Adding a New User (Owner action)

```
SETTINGS > USERS > ADD USER
        |
        v
+-------------------+
| New User Form     |
| - name            |
| - email           |
| - phone           |
| - role (select)   |
| - PIN (6 digits)  |
+--------+----------+
         |
         v
+--------+----------+
| If role needs     |
| Supabase auth:    |
| supabase.auth     |
|   .admin.create   |
|   User({email,    |
|     password})    |
+--------+----------+
         |
         v
+--------+----------+
| INSERT INTO       |
| ksp_users         |
| (auth_user_id,    |
|  license_id,      |
|  client_id,       |
|  name, email,     |
|  role, pin)       |
+--------+----------+
         |
         v
+--------+----------+
| Log action:       |
| user.create       |
+--------+----------+
```

### Role Permissions Matrix

| Permission | Owner | Manager | Cashier |
|-----------|-------|---------|---------|
| Make sales | Yes | Yes | Yes |
| View own sales | Yes | Yes | Yes |
| View all sales | Yes | Yes | No |
| Void/refund sale | Yes | Yes | No |
| Manage products | Yes | Yes | No |
| Manage inventory | Yes | Yes | No |
| View reports | Yes | Yes | No |
| Export data | Yes | Yes | No |
| Manage customers | Yes | Yes | View only |
| App settings | Yes | No | No |
| User management | Yes | No | No |
| License/devices | Yes | No | No |
| Billing/payments | Yes | No | No |

---

## Logout Flow

```
USER MENU > LOGOUT
        |
        v
+-------------------+
| supabase.auth     |
|   .signOut()      |
+--------+----------+
         |
         v
+--------+----------+
| Clear local state |
| (Zustand store    |
|  reset)           |
+--------+----------+
         |
         v
+--------+----------+
| Log action:       |
| auth.logout       |
+--------+----------+
         |
         v
+--------+----------+
| Redirect to       |
| /login            |
+--------+----------+
```

Note: Logging out does NOT clear IndexedDB data. The POS data remains on the device for the next login session.

---

## Password Reset

```
LOGIN > FORGOT PASSWORD
        |
        v
+-------------------+
| Enter email       |
+--------+----------+
         |
         v
+--------+----------+
| supabase.auth     |
|   .resetPassword  |
|   ForEmail(email) |
+--------+----------+
         |
         v
  Email sent with
  reset link
         |
         v
  User clicks link
         |
         v
+--------+----------+
| supabase.auth     |
|   .updateUser({   |
|     password: new |
|   })              |
+--------+----------+
         |
         v
  Redirect to /login
```
