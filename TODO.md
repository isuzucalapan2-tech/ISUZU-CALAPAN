# RBAC Implementation TODO

## Completed Tasks:
- [x] 1. Created `usePermissions.js` composable for RBAC functionality
- [x] 2. Updated `Router.js` with page access control and PageControl route
- [x] 3. Updated `Topbar.vue` with dynamic menu visibility based on permissions
- [x] 4. Created `PageControl.vue` for Master Admin to manage page access
- [x] 5. **UPDATED: Changed access logic to AND (both role AND position must match)**

## Files Modified/Created:
1. `src/composables/usePermissions.js` - NEW - RBAC composable (AND logic)
2. `src/Router/Router.js` - UPDATED - Added pageId meta fields and access checks (AND logic)
3. `src/components/Topbar.vue` - UPDATED - Dynamic menu based on permissions
4. `src/Pages/Admin/PageControl.vue` - NEW - Master Admin page control interface

## How It Works:

### 1. Default Roles (Already Implemented)
- During registration, system fetches from:
  - Position_Access/isuzu$calapan$position201 (position)
  - Role_Access/isuzu&calapan&staff103 (roleName)
  - Permission_Access/isuzu#calapan#permission305 (permission)
- Creates Roles/Default_Roles subcollection with:
  - position, role, permission, setAt, updateAt

### 2. Page Access Control (AND Logic)
**BOTH role AND position must match for access to be granted**

Example:
- Page Control Settings:
  - allowedRoles: ["Staff"]
  - allowedPositions: ["Parts Admin"]

- User A: role="Staff" ✅, position="Parts Staff" ❌ → **DENIED**
- User B: role="Staff" ✅, position="Parts Admin" ✅ → **GRANTED**

### 3. Permission Levels
- View (1) - Can only view data
- Edit (2) - Can modify existing data
- Create (3) - Can create new records
- Delete (4) - Can delete records
- All (5) - Full access including admin functions

## Firestore Collections Needed:
```
Page_Control/
  ├── dashboard
  ├── user-management
  ├── approve
  ├── inventory
  ├── sa-rotation
  ├── settings
  └── page-control
```

Each document contains:
- pageName: string
- allowedRoles: array
- allowedPositions: array
- features: object with minPermission for each feature
- updatedAt: timestamp
- updatedBy: string

## Next Steps:
- Test the implementation
- Apply feature-level permissions to individual components
- Add more granular controls as needed
