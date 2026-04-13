# Dashboard Granular Permissions Implementation

## Requirements Confirmed:
- [x] Master Admin sees all sections regardless of page permissions
- [x] Completely hide unauthorized sections (no "Restricted Access" message)
- [x] Just hide the UI (keep existing data fetching)
- [x] Quick actions completely hidden for unauthorized pages

## Implementation Steps:

### Step 1: Update Dashboard.vue - Add Permission Checks
- [x] Import `getAccessiblePages` and `isMasterAdmin` from usePermissions
- [x] Add `accessiblePages` ref and `isMasterAdmin` computed property
- [x] Create computed properties for section visibility:
  - [x] `canViewInventory` - checks 'inventory' page access
  - [x] `canViewServiceAdvisor` - checks 'sa-rotation' page access
  - [x] `canViewTransactions` - checks 'transaction-in' or 'transaction-out' access
  - [x] `canViewFinancials` - checks 'transaction-out' access
  - [x] `canViewUserManagement` - checks 'approve' or 'user-management' access
- [x] Fetch accessible pages on mount

### Step 2: Add v-if Directives to Sections
- [x] Inventory Overview section - v-if="canViewInventory"
- [x] Service Advisor Overview section - v-if="canViewServiceAdvisor"
- [x] Transactions Overview section - v-if="canViewTransactions"
- [x] Financial Highlights section - v-if="canViewFinancials"
- [x] User Management Stats section - v-if="canViewUserManagement"

### Step 3: Filter Quick Actions
- [ ] Filter quick actions array based on accessible pages
- [ ] Only show quick actions for pages user can access

### Step 4: Testing
- [ ] Test with Master Admin (should see all)
- [ ] Test with limited permissions (only see allowed sections)
- [ ] Verify quick actions are properly filtered
