<template>
  <!-- 🔧 LOADING -->
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <Loaders />
  </div>

  <!-- MAIN CONTENT -->
  <div v-else :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col">

    <!-- Topbar -->
    <!-- <Topbar /> -->

    <main class="flex-1 p-6">
      <!-- Page Title -->
      <h1 :class="textClass"
        class="text-3xl font-bold mb-6 border-l-4 border-red-600 pl-4 flex items-center gap-2">
        <Users class="w-7 h-7 text-red-600" />
        User Management
      </h1>

      <div
        :class="cardClass"
        :style="cardStyle"
        class="shadow-lg rounded-lg p-6 border-l-2 border-red-600 hover:shadow-xl transition-all duration-300"
      >

        <!-- Search and Filter Bar -->
        <div class="mb-6 flex flex-col sm:flex-row gap-3 flex-wrap">
          <!-- Search -->
          <div class="relative flex-1 max-w-md">
            <Search class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name, username, email..."
              :class="inputClass"
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200"
            />
          </div>

          <!-- Role Filter -->
          <select
            v-model="selectedRole"
            :class="inputClass"
            class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200"
          >
            <option value="">All Roles</option>
            <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
          </select>

          <!-- Position Filter -->
          <select
            v-model="selectedPosition"
            :class="inputClass"
            class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200"
          >
            <option value="">All Positions</option>
            <option v-for="pos in positionOptions" :key="pos" :value="pos">{{ pos }}</option>
          </select>

          <!-- Permission Filter -->
          <select
            v-model="selectedPermission"
            :class="inputClass"
            class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200"
          >
            <option value="">All Permissions</option>
            <option v-for="perm in permissionOptions" :key="perm" :value="perm">{{ perm }}</option>
          </select>

          <!-- Status Filter -->
          <select
            v-model="selectedStatus"
            :class="inputClass"
            class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Deactivated">Deactivated</option>
          </select>

          <!-- Clear All Filters Button -->
          <button
            v-if="hasActiveFilters"
            @click="clearAllFilters"
            class="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm"
            :class="textClass"
            title="Clear all filters"
          >
            <X class="w-4 h-4" />
            Clear
          </button>

          <!-- Result Count -->
          <div class="ml-auto flex items-center">
            <span class="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              {{ resultCount }} user{{ resultCount !== 1 ? 's' : '' }} found
            </span>
          </div>
        </div>

        <!-- Card Title -->
        <h2 :class="textClass" class="text-xl font-bold mb-4 flex items-center gap-2">
          <Shield class="w-6 h-6 text-red-600" />
          Administrators
        </h2>

        <div class="overflow-x-auto">

          <table class="min-w-full divide-y border-t-2 border-red-600">
            <thead :class="tableHeaderClass" class="border-b-2 border-red-600">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <User class="w-4 h-4" /> Name
                  </div>
                </th>

                <th class="px-6 py-3 text-left text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <AtSign class="w-4 h-4" /> Username
                  </div>
                </th>

                <th class="px-6 py-3 text-left text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <Mail class="w-4 h-4" /> Email
                  </div>
                </th>

                <th class="px-6 py-3 text-left text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <Shield class="w-4 h-4" /> Role
                  </div>
                </th>

                <th class="px-6 py-3 text-left text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <Briefcase class="w-4 h-4" /> Position
                  </div>
                </th>

                <th class="px-6 py-3 text-left text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <Settings class="w-4 h-4" /> Permission
                  </div>
                </th>

                <th class="px-6 py-3 text-left text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <Shield class="w-4 h-4" /> Status
                  </div>
                </th>

                <th class="px-6 py-3 text-left text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <Settings class="w-4 h-4" /> Actions
                  </div>
                </th>

              </tr>
            </thead>

            <tbody>
            <tr
              v-for="admin in paginatedAdmins"
              :key="admin.id"
              :class="tableRowClass"
              class="transition duration-200 hover:shadow-md"
            >


                <td :class="textClass" class="px-6 py-4 text-sm">
                  {{ admin.firstName }} {{ admin.lastName }}
                </td>

                <td :class="textClass" class="px-6 py-4 text-sm">
                  {{ admin.username }}
                </td>

                <td :class="textClass" class="px-6 py-4 text-sm">
                  {{ admin.email }}
                </td>

                <!-- Role - Display or Dropdown -->
                <td :class="textClass" class="px-6 py-4 text-sm">
                  <select
                    v-if="admin.isEditing"
                    v-model="admin.selectedRole"
                    class="border border-black px-2 py-1 rounded w-full hover:border-red-600 hover:shadow-sm transition-all duration-200"
                  >
                    <option disabled value="">Select Role</option>
                    <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
                  </select>
                  <span v-else>{{ admin.roleName || "N/A" }}</span>
                </td>

                <!-- Position - Display or Dropdown -->
                <td :class="textClass" class="px-6 py-4 text-sm">
                  <select
                    v-if="admin.isEditing"
                    v-model="admin.selectedPosition"
                    class="border border-black px-2 py-1 rounded w-full hover:border-red-600 hover:shadow-sm transition-all duration-200"
                  >
                    <option disabled value="">Select Position</option>
                    <option v-for="pos in positionOptions" :key="pos" :value="pos">{{ pos }}</option>
                  </select>
                  <span v-else>{{ admin.position || "N/A" }}</span>
                </td>

                <!-- Permission - Display or Dropdown -->
                <td :class="textClass" class="px-6 py-4 text-sm">
                  <select
                    v-if="admin.isEditing"
                    v-model="admin.selectedPermission"
                    class="border border-black px-2 py-1 rounded w-full hover:border-red-600 hover:shadow-sm transition-all duration-200"
                  >
                    <option disabled value="">Select Permission</option>
                    <option v-for="perm in permissionOptions" :key="perm" :value="perm">{{ perm }}</option>
                  </select>
                  <span v-else>{{ admin.permission || "N/A" }}</span>
                </td>

                <td :class="textClass" class="px-6 py-4 text-sm">
                  <span :class="getStatusBadgeClass(admin.Status)">
                    {{ admin.Status || "Deactivated" }}
                  </span>
                </td>

                <td class="px-6 py-4 text-sm flex gap-2">
                  <!-- Modify/Grant Privilege Button -->
                  <button
                    v-if="!admin.isEditing"
                    @click="enableEditing(admin)"
                    class="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Edit class="w-4 h-4" /> Modify Privilege
                  </button>

                  <button
                    v-else
                    @click="grantPrivilege(admin)"
                    class="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <CheckCircle class="w-4 h-4" /> Grant Privilege
                  </button>

                  <!-- Show Activate/Deactivate button only if not pending -->
                  <button
                    v-if="admin.accountStatus !== 'pending'"
                    @click="toggleStatus(admin)"
                    :class="getToggleButtonClass(admin.Status)"
                    class="flex items-center gap-1 text-white px-3 py-1 rounded hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Power class="w-4 h-4" /> 
                    {{ admin.Status === 'Active' ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>

              </tr>

              <tr v-if="paginatedAdmins.length === 0">
                <td colspan="8" :class="subTextClass" class="text-center py-6">
                  <div class="flex justify-center items-center gap-2">
                    <AlertCircle class="w-5 h-5" />
                    {{ filteredAdmins.length === 0 && hasActiveFilters ? 'No users match your filters' : 'No administrator records found' }}
                  </div>
                </td>
              </tr>


            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredAdmins.length > 0" class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <!-- Items info -->
          <div :class="subTextClass" class="text-sm">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredAdmins.length) }} of {{ filteredAdmins.length }} users
          </div>

          <!-- Pagination controls -->
          <div class="flex items-center gap-2">
            <!-- Items per page selector -->
            <select
              v-model="itemsPerPage"
              :class="inputClass"
              class="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option v-for="option in itemsPerPageOptions" :key="option" :value="option">{{ option }}/page</option>
            </select>

            <!-- First page -->
            <button
              @click="currentPage = 1"
              :disabled="currentPage === 1"
              class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :class="textClass"
              title="First page"
            >
              <ChevronsLeft class="w-5 h-5" />
            </button>

            <!-- Previous page -->
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :class="textClass"
              title="Previous page"
            >
              <ChevronLeft class="w-5 h-5" />
            </button>

            <!-- Page numbers -->
            <div class="flex items-center gap-1">
              <button
                v-for="page in displayedPages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-3 py-1 text-sm rounded transition-colors',
                  currentPage === page
                    ? 'bg-red-600 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 ' + textClass
                ]"
              >
                {{ page }}
              </button>
            </div>

            <!-- Next page -->
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :class="textClass"
              title="Next page"
            >
              <ChevronRight class="w-5 h-5" />
            </button>

            <!-- Last page -->
            <button
              @click="currentPage = totalPages"
              :disabled="currentPage === totalPages"
              class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :class="textClass"
              title="Last page"
            >
              <ChevronsRight class="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>


<script setup>
import { ref, onMounted, computed, watch } from "vue";

import { db } from "../../Firebase/Firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc
} from "firebase/firestore";


//import Topbar from "../../components/Topbar.vue";
/* 🔧 ADDED */
import Loaders from "../../components/Loaders.vue";

/* ICONS */
import {
  Users,
  User,
  Shield,
  Mail,
  AtSign,
  Briefcase,
  Settings,
  Edit,
  CheckCircle,
  Power,
  AlertCircle,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-vue-next";


/* =====================
   DATA
===================== */
const admins = ref([]);
const isLoading = ref(true);
const positionOptions = ref([]);
const roleOptions = ref([]);
const permissionOptions = ref([]);

// Search and Filter State
const searchQuery = ref("");
const debouncedSearchQuery = ref("");
const selectedRole = ref("");
const selectedPosition = ref("");
const selectedPermission = ref("");
const selectedStatus = ref("");

// Pagination State
const currentPage = ref(1);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [10, 25, 50, 100];


/* =====================
   FETCH OPTIONS
===================== */
const fetchPositionOptions = async () => {
  try {
    const positions = [];
    const docIds = [
      "isuzu$calapan$position201",
      "isuzu$calapan$position202", 
      "isuzu$calapan$position203",
      "isuzu$calapan$position204",
      "isuzu$calapan$position205",
      "isuzu$calapan$position206"
    ];
    
    for (const docId of docIds) {
      const docRef = await getDoc(doc(db, "Position_Access", docId));
      if (docRef.exists() && docRef.data().position) {
        positions.push(docRef.data().position);
      }
    }
    positionOptions.value = positions;
  } catch (err) {
    console.error("Error fetching position options:", err);
  }
};

const fetchRoleOptions = async () => {
  try {
    const roles = [];
    const docIds = [
      "isuzu&calapan&staff103",
      "isuzu&calapan&admin102",
      "isuzu&calapan&master&admin101"
    ];
    
    for (const docId of docIds) {
      const docRef = await getDoc(doc(db, "Role_Access", docId));
      if (docRef.exists() && docRef.data().roleName) {
        roles.push(docRef.data().roleName);
      }
    }
    roleOptions.value = roles;
  } catch (err) {
    console.error("Error fetching role options:", err);
  }
};

const fetchPermissionOptions = async () => {
  try {
    const permissions = [];
    const docIds = [
      "isuzu#calapan#permission301",
      "isuzu#calapan#permission302",
      "isuzu#calapan#permission303",
      "isuzu#calapan#permission304",
      "isuzu#calapan#permission305"
    ];
    
    for (const docId of docIds) {
      const docRef = await getDoc(doc(db, "Permission_Access", docId));
      if (docRef.exists() && docRef.data().permission) {
        permissions.push(docRef.data().permission);
      }
    }
    permissionOptions.value = permissions;
  } catch (err) {
    console.error("Error fetching permission options:", err);
  }
};

// Helper function to fetch role data for an admin
const fetchAdminRoles = async (adminId) => {
  try {
    const roleDoc = await getDoc(doc(db, "Administrator", adminId, "Roles", "Default_Roles"));
    if (roleDoc.exists()) {
      return roleDoc.data();
    }
    return { position: "", role: "", permission: "", setAt: null, updateAt: null };
  } catch (err) {
    console.error("Error fetching roles:", err);
    return { position: "", role: "", permission: "", setAt: null, updateAt: null };
  }
};



/* =====================
   FETCH ADMINISTRATORS
===================== */
const fetchAdmins = async () => {
  const snapshot = await getDocs(collection(db, "Administrator"));
  
  // Fetch admins and their role data
  const adminPromises = snapshot.docs.map(async (d) => {
    const adminData = {
      id: d.id,
      role: d.data().role || "",
      Status: d.data().Status || "Deactivated",
      accountStatus: d.data().accountStatus || "pending",
      ...d.data()
    };
    
    // Fetch role data from subcollection
    const roleData = await fetchAdminRoles(d.id);
    
    return {
      ...adminData,
      position: roleData.position || "",
      roleName: roleData.role || "",
      permission: roleData.permission || "",
      setAt: roleData.setAt || null,
      updateAt: roleData.updateAt || null,
      isEditing: false,
      selectedPosition: roleData.position || "",
      selectedRole: roleData.role || "",
      selectedPermission: roleData.permission || ""
    };
  });
  
  admins.value = await Promise.all(adminPromises);
  isLoading.value = false;
};


/* =====================
   ENABLE EDITING
===================== */
const enableEditing = (admin) => {
  admin.isEditing = true;
  // Initialize selected values with current values
  admin.selectedPosition = admin.position;
  admin.selectedRole = admin.roleName;
  admin.selectedPermission = admin.permission;
};

/* =====================
   GRANT PRIVILEGE
===================== */
const grantPrivilege = async (admin) => {
  if (!admin.selectedPosition || !admin.selectedRole || !admin.selectedPermission) {
    alert("Please select Position, Role, and Permission before granting privilege");
    return;
  }
  
  try {
    // Update Roles subcollection with new values
    await updateDoc(doc(db, "Administrator", admin.id, "Roles", "Default_Roles"), {
      position: admin.selectedPosition,
      role: admin.selectedRole,
      permission: admin.selectedPermission,
      updateAt: new Date()
    });
    
    // Update local state
    admin.position = admin.selectedPosition;
    admin.roleName = admin.selectedRole;
    admin.permission = admin.selectedPermission;
    admin.updateAt = new Date();
    admin.isEditing = false;
    
    alert("Privilege granted successfully");
  } catch (err) {
    console.error("Error granting privilege:", err);
    alert("Failed to grant privilege. Please try again.");
  }
};


/* =====================
   TOGGLE STATUS (Activate/Deactivate)
===================== */
const toggleStatus = async (admin) => {
  const newStatus = admin.Status === 'Active' ? 'Deactivated' : 'Active';
  const action = newStatus === 'Active' ? 'activate' : 'deactivate';
  
  if (!confirm(`Are you sure you want to ${action} this administrator?`)) return;
  
  try {
    await updateDoc(doc(db, "Administrator", admin.id), {
      Status: newStatus
    });
    
    // Update local state
    admin.Status = newStatus;
    
    alert(`Administrator ${action}d successfully`);
  } catch (err) {
    console.error("Error toggling status:", err);
    alert("Failed to update status. Please try again.");
  }
};

/* =====================
   STATUS BADGE CLASS
===================== */
const getStatusBadgeClass = (status) => {
  const baseClass = "px-2 py-1 rounded text-xs font-medium ";
  switch (status) {
    case 'Active':
      return baseClass + "bg-green-100 text-green-800";
    case 'Deactivated':
      return baseClass + "bg-red-100 text-red-800";
    default:
      return baseClass + "bg-gray-100 text-gray-800";
  }
};

/* =====================
   TOGGLE BUTTON CLASS
===================== */
const getToggleButtonClass = (status) => {
  return status === 'Active' 
    ? "bg-orange-600 hover:bg-orange-700" 
    : "bg-green-600 hover:bg-green-700";
};

/* =====================
   THEME
===================== */
const isDarkMode = computed(() =>
  document.documentElement.classList.contains("dark")
);

const themeClass = computed(() =>
  isDarkMode.value ? "text-white" : "bg-gray-100 text-gray-900"
);

const themeStyle = computed(() =>
  isDarkMode.value ? { backgroundColor: "#232323" } : {}
);

const cardClass = computed(() =>
  isDarkMode.value ? "text-white" : "bg-white text-gray-900"
);

const cardStyle = computed(() =>
  isDarkMode.value ? { backgroundColor: "#2a2a2a" } : {}
);

const textClass = computed(() =>
  isDarkMode.value ? "text-white" : "text-gray-900"
);

const subTextClass = computed(() =>
  isDarkMode.value ? "text-gray-300" : "text-gray-500"
);

const tableHeaderClass = computed(() =>
  isDarkMode.value ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-900"
);

const tableRowClass = computed(() =>
  isDarkMode.value ? "hover:bg-gray-700" : "hover:bg-gray-100"
);

const inputClass = computed(() =>
  isDarkMode.value 
    ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400" 
    : "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
);

/* =====================
   DEBOUNCE UTILITY
===================== */
let debounceTimeout = null;
const debounceSearch = (value, delay = 300) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    debouncedSearchQuery.value = value;
  }, delay);
};

// Watch searchQuery and debounce it
watch(searchQuery, (newValue) => {
  debounceSearch(newValue);
});

// Reset to first page when filters change
watch([selectedRole, selectedPosition, selectedPermission, selectedStatus, debouncedSearchQuery], () => {
  currentPage.value = 1;
});

/* =====================
   FILTER & PAGINATION COMPUTED
===================== */
const filteredAdmins = computed(() => {
  let filtered = admins.value;

  // Text search (debounced) - covers name, username, email
  if (debouncedSearchQuery.value) {
    const query = debouncedSearchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(admin =>
      admin.firstName?.toLowerCase().includes(query) ||
      admin.lastName?.toLowerCase().includes(query) ||
      admin.username?.toLowerCase().includes(query) ||
      admin.email?.toLowerCase().includes(query) ||
      `${admin.firstName} ${admin.lastName}`.toLowerCase().includes(query)
    );
  }

  // Role filter
  if (selectedRole.value) {
    filtered = filtered.filter(admin => admin.roleName === selectedRole.value);
  }

  // Position filter
  if (selectedPosition.value) {
    filtered = filtered.filter(admin => admin.position === selectedPosition.value);
  }

  // Permission filter
  if (selectedPermission.value) {
    filtered = filtered.filter(admin => admin.permission === selectedPermission.value);
  }

  // Status filter
  if (selectedStatus.value) {
    filtered = filtered.filter(admin => admin.Status === selectedStatus.value);
  }

  return filtered;
});

// Result count
const resultCount = computed(() => filteredAdmins.value.length);

// Paginated admins
const paginatedAdmins = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAdmins.value.slice(start, end);
});

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredAdmins.value.length / itemsPerPage.value) || 1;
});

// Page numbers to display
const displayedPages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Check if any filters are active
const hasActiveFilters = computed(() => 
  selectedRole.value ||
  selectedPosition.value ||
  selectedPermission.value ||
  selectedStatus.value ||
  searchQuery.value
);

/* =====================
   FILTER ACTIONS
===================== */
const clearAllFilters = () => {
  searchQuery.value = "";
  debouncedSearchQuery.value = "";
  selectedRole.value = "";
  selectedPosition.value = "";
  selectedPermission.value = "";
  selectedStatus.value = "";
  currentPage.value = 1;
};

/* =====================
   LIFECYCLE
===================== */

onMounted(() => {
  fetchAdmins();
  fetchPositionOptions();
  fetchRoleOptions();
  fetchPermissionOptions();
});
</script>
