# Granular Permissions Guide

## Overview
The `usePermissions` composable provides granular permission control (canView, canEdit, canCreate, canDelete) to manage staff abilities within accessible pages.

## Available Permissions

```javascript
const { 
  canView,      // Can view/read data
  canEdit,      // Can edit/update data
  canCreate,    // Can create/add new data
  canDelete,    // Can delete/remove data
  canAll,       // Has all permissions
  canAccessPage // Check page access
} = usePermissions()
```

## Usage Examples

### 1. Basic Component Usage

```vue
<script setup>
import { usePermissions } from '../composables/usePermissions'

const { canView, canEdit, canCreate, canDelete } = usePermissions()
</script>

<template>
  <div>
    <!-- View Data -->
    <div v-if="canView">
      <DataTable :data="items" />
    </div>
    
    <!-- Create Button -->
    <button v-if="canCreate" @click="openCreateModal">
      Add New
    </button>
    
    <!-- Edit Button -->
    <button v-if="canEdit" @click="editItem(item)">
      Edit
    </button>
    
    <!-- Delete Button -->
    <button v-if="canDelete" @click="deleteItem(item)">
      Delete
    </button>
  </div>
</template>
```

### 2. Table with Conditional Actions

```vue
<template>
  <table v-if="canView">
    <thead>
      <tr>
        <th>Name</th>
        <th>Quantity</th>
        <th v-if="canEdit || canDelete">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td>{{ item.name }}</td>
        <td>{{ item.quantity }}</td>
        <td v-if="canEdit || canDelete">
          <button v-if="canEdit" @click="editItem(item)">Edit</button>
          <button v-if="canDelete" @click="deleteItem(item)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

### 3. Form with Read-Only Mode

```vue
<script setup>
const { canEdit, canCreate } = usePermissions()

const isReadOnly = computed(() => {
  if (isCreating.value) return !canCreate.value
  if (isEditing.value) return !canEdit.value
  return true
})
</script>

<template>
  <form>
    <input v-model="form.name" :disabled="isReadOnly" />
    <button v-if="!isReadOnly" type="submit">Save</button>
  </form>
</template>
```

### 4. Complete Page Example

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { usePermissions } from '../../composables/usePermissions'

const { 
  canView, 
  canEdit, 
  canCreate, 
  canDelete, 
  canAccessPage 
} = usePermissions()

const hasAccess = ref(false)
const isLoading = ref(true)

onMounted(async () => {
  hasAccess.value = await canAccessPage('inventory')
  isLoading.value = false
})
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  
  <div v-else-if="!hasAccess">Access Denied</div>
  
  <div v-else>
    <!-- Header -->
    <div class="header">
      <h1>Inventory</h1>
      <button v-if="canCreate" @click="addItem">Add New</button>
    </div>
    
    <!-- Data Table -->
    <table v-if="canView">
      <tr v-for="item in items" :key="item.id">
        <td>{{ item.name }}</td>
        <td>
          <button v-if="canEdit" @click="editItem(item)">Edit</button>
          <button v-if="canDelete" @click="deleteItem(item)">Delete</button>
        </td>
      </tr>
    </table>
  </div>
</template>
```

## Firestore Data Structure

```javascript
// Administrator/{userId}/Roles/Default_Roles
{
  role: "Staff",
  position: "Inventory Clerk",
  permissionMap: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false
  }
}
```

## Permission Combinations

| Role | canView | canCreate | canEdit | canDelete |
|------|---------|-----------|---------|-----------|
| View Only | ✅ | ❌ | ❌ | ❌ |
| Data Entry | ✅ | ✅ | ❌ | ❌ |
| Editor | ✅ | ✅ | ✅ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ |

## Best Practices

1. Always check `canAccessPage` first before checking granular permissions
2. Use `v-if` to conditionally render UI elements based on permissions
3. Disable form inputs with `:disabled` for read-only users
4. Show permission denied messages when users lack access
5. Combine permissions for complex scenarios (e.g., show Actions column if canEdit OR canDelete)
