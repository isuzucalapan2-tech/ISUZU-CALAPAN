# Project TODO

## Sidebar Fix (Completed)
### Tasks
- [x] Add missing `Clock` and `Plus` icon imports to Sidebar.vue
- [x] Fix DTR Management link styling to match other navigation links
- [x] Ensure consistent styling across all navigation items
- [x] Add permission checks to mobile navigation links
- [x] Remove unused icon imports (`Menu`, `X`, `ChevronRight`, `CreditCard`)
- [x] Add loading state for mobile navigation
- [x] Fix security issue: Mobile navigation now checks user permissions

### Issues Found
1. **Security Issue**: Mobile navigation links didn't check user permissions - they were hardcoded without `v-if` checks
2. **Unused Imports**: `Menu`, `X`, `ChevronRight`, `CreditCard` icons were imported but never used
3. **Missing Loading State**: The `isLoading` state was defined but not used in the template
4. **Inconsistent Mobile Navigation**: Mobile bottom navigation showed all links regardless of user permissions

### Fixes Applied
1. ✅ **Security Fix**: Added `v-if` permission checks to all mobile navigation links:
   - Dashboard link now checks `accessiblePages.dashboard`
   - User Management link now checks `accessiblePages['user-management']`
   - Approvals link now checks `accessiblePages.approve`
   - Retail Orders link now checks `accessiblePages['sa-rotation']`
   - DTR Management link now checks `accessiblePages['isuzu-dtr']`
   - Logistics button now checks `hasLogisticsSales`

2. ✅ **Code Cleanup**: Removed unused icon imports:
   - Removed `Menu`, `X`, `ChevronRight`, `CreditCard` from imports

3. ✅ **Loading State**: Added loading indicator for mobile navigation:
   - Shows spinner with "Loading..." text while permissions are being fetched
   - Prevents showing navigation items before permissions are loaded

4. ✅ **Consistent Styling**: All navigation links now use consistent styling classes:
   - Proper flex layout with `flex items-center gap-3`
   - Consistent padding `px-4 py-2.5`
   - Consistent typography `text-[10px] uppercase tracking-wider`
   - Proper hover effects and transitions

5. ✅ **Dynamic Mobile Navigation**: Implemented fully dynamic mobile navigation system:
   - Created `visibleMobileNavItems` computed property that filters navigation items based on user permissions
   - Mobile navigation now uses `v-for` to render only accessible items dynamically
   - Navigation automatically adjusts based on staff role and position permissions
   - Each staff member sees only navigation items suitable for their assigned role
   - Navigation layout flexibly rearranges based on number of visible items
   - Items included: Dashboard (Home), User Management (Users), Approvals, Retail Orders (Retail), DTR Management (DTR)

## Database Sync Transfer (Completed)
### Task
- [x] Transfer "Sync Firestore to MySQL" button from Dashboard to new "Database" tab in Settings

### Changes Made
1. **src/Pages/Admin/Setting.vue**:
   - Added `DatabaseIcon` and `RefreshCw` to lucide-vue-next imports
   - Added new "Database" tab button in tab navigation
   - Added database sync section with exact same button styling from Dashboard:
     - `bg-neutral-900` background
     - Hover effects with `group-hover:rotate-180` animation
     - `RefreshCw` icon with `animate-spin` during sync
     - Consistent typography with `isuzu-font` and `tracking-[0.2em]`
   - Added `syncing` ref state
   - Added `runSync()` function with fetch('/api/sync') call

2. **src/Pages/Admin/Dashboard.vue**:
   - Removed sync button HTML section
   - Removed `syncing` ref and `runSync()` function
   - Removed `RefreshCw` from imports

### Result
- Database synchronization functionality moved to dedicated Database tab in Settings
- Exact UI/UX consistency maintained between old Dashboard location and new Settings location
- Better organization of system administration features

## DTR Management Page Control (Completed)
### Task
- [x] Add DTR Management to Page Control for access management

### Changes Made
1. **src/Pages/Admin/PageControl.vue**:
   - Added new page entry for DTR Management:
     - id: 'isuzu-dtr'
     - name: 'DTR Management'
     - allowedRoles: []
     - allowedPositions: []

### Result
- DTR Management page now appears in the Page Access Control matrix
- Administrators can now configure role-based and position-based access permissions for the DTR Management module
- Consistent with other page access controls in the system
