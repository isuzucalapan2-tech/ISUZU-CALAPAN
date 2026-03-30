# Project TODO

## Sidebar Fix
### Tasks
- [x] Add missing `Clock` and `Plus` icon imports to Sidebar.vue
- [x] Fix DTR Management link styling to match other navigation links
- [x] Ensure consistent styling across all navigation items

### Issues Found
1. Missing Icon Imports: `Clock` and `Plus` icons are used but not imported
2. Inconsistent Navigation Link Styling: DTR Management uses undefined CSS classes
3. Layout inconsistencies in navigation items

### Fixes Applied
1. ✅ Added `Clock` icon to the import statement from `lucide-vue-next`
2. ✅ Fixed DTR Management link to use consistent styling classes:
   - Changed from undefined `nav-link`, `nav-link-active`, `nav-icon`, `nav-text` classes
   - Now uses the same styling as other navigation links with proper flex layout, padding, colors, and transitions
   - Icon now has proper sizing (`w-4 h-4`) and hover effects
   - Text now uses consistent typography (`text-[10px] uppercase tracking-wider`)

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
