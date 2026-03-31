# Role Management Fix - TODO

## Task
Fix and verify the "Add Role" and "Add Position" modals in Settings page

## Current Status
- Setting.vue has "Role & Position" tab with CRUD functionality
- Modals exist in code but may have issues

## Steps to Complete

### 1. Verify Modal Implementation
- [ ] Check modal template structure
- [ ] Verify all required imports (PlusIcon, XIcon, etc.)
- [ ] Check modal state variables (showAddRoleModal, showAddPositionModal)
- [ ] Verify modal open/close functions

### 2. Fix Any Issues Found
- [ ] Fix modal positioning/z-index if needed
- [ ] Fix any missing imports or variables
- [ ] Ensure modals are properly placed in DOM hierarchy

### 3. Test the Flow
- [ ] Open "Role & Position" tab
- [ ] Click "Add Role" button - modal should appear
- [ ] Add a new role - should save to Firestore
- [ ] Verify role appears in the list
- [ ] Repeat for "Add Position"

### 4. Fix UserManagement.vue (Dynamic Fetching)
- [ ] Change from hardcoded IDs to dynamic fetching
- [ ] Ensure new roles appear in UserManagement dropdown
