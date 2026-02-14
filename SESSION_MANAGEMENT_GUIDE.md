# Session Management System Guide

## Overview
The ISUZU APP now has a comprehensive, centralized session management system using **Pinia** for state management and **Firebase Authentication** for auth services.

## Architecture

### 1. Auth Store (`src/stores/auth.js`)
Centralized state management for authentication:
- **State**: user, userRole, isAuthenticated, isLoading, sessionExpiry
- **Getters**: isAdmin, isManager, isUser, canAccess, isSessionValid
- **Actions**: 
  - `initializeAuth()` - Initialize auth state on app load
  - `login(email, password, rememberMe)` - User login
  - `logout()` - User logout
  - `updateLastActivity()` - Track user activity
  - `checkSessionTimeout()` - Check for session expiration

### 2. Auth Composable (`src/composables/useAuth.js`)
Reusable authentication logic:
- Provides reactive auth state
- Activity monitoring (30-minute inactivity timeout)
- Session warning system
- Permission checking

### 3. Router Guards (`src/Router/Router.js`)
Navigation protection:
- `requiresAuth` - Routes that need authentication
- `requiresGuest` - Routes for non-authenticated users only
- `allowedRoles` - Role-based access control
- Automatic redirect to login on session expiration

### 4. Session Features

#### Session Timeout
- **Warning**: 5 minutes before expiration (25 minutes of inactivity)
- **Auto-logout**: After 30 minutes of inactivity
- **Activity Tracking**: Monitors clicks, keypresses, scrolls

#### Role-Based Access Control
- **admin**: Full access (User Management, Approve, all features)
- **manager**: Limited admin access (Approve, Inventory, Dashboard)
- **user**: Basic access (Dashboard, Inventory view)

#### Remember Me
- **Enabled**: Session persists across browser restarts
- **Disabled**: Session only for current browser session

## Usage

### In Components
```vue
<script setup>
import { useAuth } from '../composables/useAuth'

const { user, isAuthenticated, isAdmin, logout } = useAuth()

// Check permissions
if (isAdmin.value) {
  // Admin-only feature
}

// Logout
const handleLogout = async () => {
  await logout()
}
</script>
```

### In Router
```javascript
{
  path: '/admin/user-management',
  component: UserManagement,
  meta: { 
    requiresAuth: true, 
    allowedRoles: ['admin'] 
  }
}
```

### Programmatic Navigation
```javascript
import { useRouter } from 'vue-router'
const router = useRouter()

// Redirect with session expired message
router.push({ 
  name: 'Login', 
  query: { session: 'expired', redirect: '/admin/inventory' } 
})
```

## Session Flow

1. **App Initialization** (`main.js`)
   - Initialize Pinia store
   - Initialize auth state
   - Mount app after auth is ready

2. **Route Navigation** (`Router.js`)
   - Check if auth is still loading
   - Validate authentication status
   - Check role permissions
   - Redirect if unauthorized

3. **Activity Monitoring** (`App.vue` + `useAuth.js`)
   - Track user interactions
   - Show warning modal at 25 minutes
   - Auto-logout at 30 minutes

4. **Session Expiration UI** (`App.vue`)
   - Modal warning before expiration
   - "Extend Session" button
   - "Logout Now" button

## Security Features

- **Automatic logout** on session timeout
- **Role-based route protection**
- **Email verification** required before access
- **Last activity tracking**
- **Session validity checking**
- **Secure Firebase Auth persistence**

## Files Modified

1. `src/main.js` - Added Pinia initialization
2. `src/Router/Router.js` - Added navigation guards
3. `src/App.vue` - Added session warning modal
4. `src/Pages/Login.vue` - Integrated with auth store
5. `src/Pages/Admin/AdminParent.vue` - Added auth guard wrapper
6. `src/Pages/Admin/Setting.vue` - Updated to use auth composable
7. `src/Pages/Admin/Dashboard.vue` - Updated to use auth composable
8. `src/Pages/Admin/Inventory.vue` - Updated to use auth composable

## New Files Created

1. `src/stores/auth.js` - Pinia auth store
2. `src/composables/useAuth.js` - Auth composable
3. `SESSION_MANAGEMENT_GUIDE.md` - This guide

## Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] Unverified email shows verification notice
- [ ] Remember me persists session
- [ ] Session expires after 30 minutes inactivity
- [ ] Warning modal appears at 25 minutes
- [ ] Clicking "Extend Session" resets timer
- [ ] Admin can access User Management
- [ ] Non-admin cannot access User Management
- [ ] Logout redirects to login page
- [ ] Direct URL access to protected routes redirects to login
