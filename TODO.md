# Default Roles Implementation TODO

## Tasks:
- [x] 1. Update `src/Pages/Register.vue` to fetch default values and create Roles subcollection
- [x] 2. Update `src/Pages/Admin/UserManagement.vue` to display and manage role fields
- [x] 3. Update `src/Pages/Admin/Approve.vue` to ensure roles are maintained during approval
- [x] 4. Test the implementation - Fixed collection name from "users" to "Administrator"





## Implementation Details:

### Register.vue Changes:
- Import `getDoc` from firebase/firestore
- Add function to fetch default values from:
  - Position_Access/isuzu$calapan$position201 (position field)
  - Role_Access/isuzu&calapan&staff103 (roleName field)
  - Permission_Access/isuzu#calapan#permission305 (permission field)
- Create Roles subcollection under Administrator with:
  - position: fetched value
  - role: fetched value
  - permission: fetched value
  - setAt: new Date()
  - updateAt: null

### UserManagement.vue Changes:
- Fetch and display Roles subcollection data
- Add fields for position, role, permission
- Update updateAt timestamp when changes are made

### Approve.vue Changes:
- Ensure Roles subcollection exists when approving users
- Initialize with defaults if missing
