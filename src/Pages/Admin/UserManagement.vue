<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-white">
    <Loaders />
  </div>

  <div v-else :class="themeClass" class="min-h-screen flex flex-col font-sans relative overflow-hidden">
    
    <div class="absolute top-0 left-0 w-full z-0 opacity-5 pointer-events-none">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 15 H280 L330 45 H500" stroke="currentColor" stroke-width="1" />
      </svg>
    </div>

    <header :class="[headerClass, 'relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex justify-between items-center']">
      <div class="flex items-center gap-3 sm:gap-4">
        <div class="bg-red-600 p-2 rounded-lg text-white">
          <Users class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <h1 :class="['text-sm sm:text-xl font-bold tracking-tight uppercase isuzu-font', textClass]">
            User <span class="text-red-600">Management</span>
          </h1>
          <p :class="['text-[9px] sm:text-[10px] uppercase tracking-widest font-medium opacity-50', subTextClass]">Access Control Matrix</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
         <span :class="['text-[10px] sm:text-[11px] font-bold uppercase tracking-wider', isDarkMode ? 'text-neutral-400' : 'text-neutral-500']">
            {{ resultCount }} Active Records
         </span>
      </div>
    </header>

    <main class="flex-1 relative z-10 overflow-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
      <div class="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div class="relative flex-1 min-w-70 sm:min-w-75">
            <Search class="w-4 h-4 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 opacity-30" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users..."
              :class="['w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all', isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-800']"
            />
          </div>

          <div class="flex flex-wrap items-center gap-2 sm:gap-2">
            <select v-model="selectedRole" :class="['px-3 sm:px-4 py-2.5 border rounded-xl text-xs font-bold outline-none cursor-pointer min-w-30', isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-800']">
              <option value="">ALL ROLES</option>
              <option v-for="role in roleOptions" :key="role" :value="role">{{ role.toUpperCase() }}</option>
            </select>

            <select v-model="selectedStatus" :class="['px-3 sm:px-4 py-2.5 border rounded-xl text-xs font-bold outline-none cursor-pointer min-w-30', isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-800']">
              <option value="">ALL STATUS</option>
              <option value="Active">ACTIVE</option>
              <option value="Deactivated">DEACTIVATED</option>
            </select>

            <button
              v-if="hasActiveFilters"
              @click="clearAllFilters"
              class="p-2.5 text-neutral-500 hover:text-red-600 transition-colors"
            >
              <X class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div :class="[cardClass, 'rounded-xl border overflow-hidden shadow-sm']" :style="cardStyle">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr :class="['border-b', isDarkMode ? 'border-neutral-700' : 'border-neutral-100']">
                  <th class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-[8px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider opacity-40">Administrator</th>
                  <th class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-[8px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider opacity-40 hidden sm:table-cell">Contact</th>
                  <th class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-[8px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider opacity-40">Position & Role</th>
                  <th class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-[8px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider opacity-40 hidden md:table-cell">Permission</th>
                  <th class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-[8px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider opacity-40">Status</th>
                  <th class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-[8px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-wider text-right opacity-40">Actions</th>
                </tr>
              </thead>
              <tbody :class="['divide-y', isDarkMode ? 'divide-neutral-800' : 'divide-neutral-50']">
                <tr v-for="admin in paginatedAdmins" :key="admin.id" class="transition-colors">
                  <td class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                    <div class="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                      <div :class="['w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-[7px] sm:text-[9px] lg:text-[10px] font-bold text-white', isDarkMode ? 'bg-neutral-700' : 'bg-neutral-900']">
                        {{ admin.firstName?.[0] }}{{ admin.lastName?.[0] }}
                      </div>
                      <div class="min-w-0 flex-1">
                        <p :class="['text-xs sm:text-sm font-semibold truncate', textClass]">{{ admin.firstName }} {{ admin.lastName }}</p>
                        <p class="text-[9px] sm:text-[10px] lg:text-[11px] text-neutral-500 truncate">@{{ admin.username }}</p>
                        <p class="text-[8px] sm:text-[9px] lg:text-[10px] text-neutral-500 sm:hidden">{{ admin.email }}</p>
                      </div>
                    </div>
                  </td>

                  <td :class="['px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-[9px] sm:text-xs font-medium hidden sm:table-cell', isDarkMode ? 'text-neutral-400' : 'text-neutral-500']">
                    {{ admin.email }}
                  </td>

                  <td class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                    <div v-if="admin.isEditing" class="flex flex-col gap-1 sm:gap-2 max-w-25 sm:max-w-30 lg:max-w-35">
                      <select v-model="admin.selectedPosition" class="bg-transparent border border-neutral-500/30 rounded px-1 sm:px-2 py-0.5 sm:py-1 text-[7px] sm:text-[9px] lg:text-[10px] font-bold outline-none">
                        <option v-for="pos in positionOptions" :key="pos" :value="pos">{{ pos }}</option>
                      </select>
                      <select v-model="admin.selectedRole" class="bg-transparent border border-neutral-500/30 rounded px-1 sm:px-2 py-0.5 sm:py-1 text-[7px] sm:text-[9px] lg:text-[10px] font-bold outline-none">
                        <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
                      </select>
                    </div>
                    <div v-else>
                      <p :class="['text-[9px] sm:text-xs font-semibold uppercase', textClass]">{{ admin.position || 'N/A' }}</p>
                      <p class="text-[7px] sm:text-[9px] lg:text-[10px] font-medium text-neutral-500 uppercase">{{ admin.roleName || 'N/A' }}</p>
                    </div>
                  </td>

                  <td class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 hidden md:table-cell">
                    <select v-if="admin.isEditing" v-model="admin.selectedPermission" class="bg-transparent border border-neutral-500/30 rounded px-1 sm:px-2 py-0.5 sm:py-1 text-[7px] sm:text-[9px] lg:text-[10px] font-bold outline-none">
                      <option v-for="perm in permissionOptions" :key="perm" :value="perm">{{ perm }}</option>
                    </select>
                    <span v-else class="text-[8px] sm:text-[10px] lg:text-[11px] font-bold text-neutral-500">
                      {{ admin.permission || "STANDARD" }}
                    </span>
                  </td>

                  <td class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                    <div class="flex items-center gap-1 sm:gap-2">
                      <div :class="['w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full', admin.Status === 'Active' ? 'bg-green-500' : 'bg-neutral-400']"></div>
                      <span :class="['text-[8px] sm:text-[10px] lg:text-[11px] font-bold uppercase', admin.Status === 'Active' ? 'text-green-600' : 'text-neutral-500']">
                        {{ admin.Status || "Deactivated" }}
                      </span>
                    </div>
                  </td>

                  <td class="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                    <div class="flex justify-end items-center gap-0.5 sm:gap-1">
                      <button v-if="!admin.isEditing" @click="enableEditing(admin)" class="p-1 sm:p-1.5 lg:p-2 text-neutral-400 hover:text-blue-600 transition-colors"><Edit class="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" /></button>
                      <button v-else @click="grantPrivilege(admin)" class="p-1 sm:p-1.5 lg:p-2 text-green-600 transition-colors"><CheckCircle class="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" /></button>
                      
                      <button v-if="admin.accountStatus !== 'pending'" @click="toggleStatus(admin)" 
                        :class="admin.Status === 'Active' ? 'text-neutral-400 hover:text-orange-500' : 'text-neutral-400 hover:text-green-500'" 
                        class="p-1 sm:p-1.5 lg:p-2 transition-colors">
                        <Power class="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div :class="['px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 lg:gap-4', isDarkMode ? 'border-neutral-700' : 'border-neutral-50']">
            <p class="text-[9px] sm:text-[10px] lg:text-[11px] font-medium text-neutral-500 text-center sm:text-left">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredAdmins.length) }} of {{ filteredAdmins.length }}
            </p>
            
            <div class="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4">
              <div class="flex items-center gap-1 sm:gap-2">
                <span class="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-neutral-400 uppercase">Rows:</span>
                <select v-model="itemsPerPage" :class="['text-[9px] sm:text-[10px] lg:text-[11px] font-bold bg-transparent outline-none focus:text-red-600 transition-colors', isDarkMode ? 'text-white' : 'text-neutral-800']">
                  <option v-for="opt in itemsPerPageOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>

              <div class="flex items-center gap-0.5 sm:gap-1">
                <button @click="currentPage--" :disabled="currentPage === 1" class="p-1 sm:p-1.5 lg:p-2 disabled:opacity-20 hover:text-red-600 transition-all"><ChevronLeft class="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" /></button>
                <span class="text-[9px] sm:text-[10px] lg:text-[11px] font-bold mx-0.5 sm:mx-1 lg:mx-2">
                  <span class="text-red-600">{{ currentPage }}</span> / {{ totalPages }}
                </span>
                <button @click="currentPage++" :disabled="currentPage === totalPages" class="p-1 sm:p-1.5 lg:p-2 disabled:opacity-20 hover:text-red-600 transition-all"><ChevronRight class="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { db } from "../../Firebase/Firebase";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import Loaders from "../../components/Loaders.vue";
import { 
  Users, Edit, CheckCircle, Power, Search, X, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-vue-next";

/* ===== THEME & STYLES ===== */
// Inalis ang mga duplicate declarations dito
const isDarkMode = computed(() => document.documentElement.classList.contains('dark'));
const themeClass = computed(() => isDarkMode.value ? 'text-white bg-neutral-900' : 'bg-neutral-50 text-gray-900');
const headerClass = computed(() => isDarkMode.value ? 'bg-neutral-800/10' : 'bg-white/10');
const cardClass = computed(() => isDarkMode.value ? 'text-white' : 'bg-white text-gray-900');
const cardStyle = computed(() => isDarkMode.value ? { backgroundColor: '#262626', borderColor: '#374151' } : { borderColor: '#e5e7eb' });
const textClass = computed(() => isDarkMode.value ? 'text-white' : 'text-neutral-800');
const subTextClass = computed(() => isDarkMode.value ? 'text-gray-400' : 'text-gray-500');

/* ===== STATE MANAGEMENT ===== */
const admins = ref([]);
const isLoading = ref(true);
const positionOptions = ref([]);
const roleOptions = ref([]);
const permissionOptions = ref([]);

const searchQuery = ref("");
const debouncedSearchQuery = ref("");
const selectedRole = ref("");
const selectedStatus = ref("");

const currentPage = ref(1);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [10, 25, 50];

/* =====================
   FETCHING LOGIC
===================== */
const fetchOptions = async (collectionName, docIds, fieldName, targetRef) => {
  try {
    const options = [];
    for (const id of docIds) {
      const d = await getDoc(doc(db, collectionName, id));
      if (d.exists() && d.data()[fieldName]) options.push(d.data()[fieldName]);
    }
    targetRef.value = options;
  } catch (err) { console.error(`Error fetching ${collectionName}:`, err); }
};

const fetchAdminRoles = async (adminId) => {
  try {
    const roleDoc = await getDoc(doc(db, "Administrator", adminId, "Roles", "Default_Roles"));
    return roleDoc.exists() ? roleDoc.data() : { position: "", role: "", permission: "" };
  } catch { return { position: "", role: "", permission: "" }; }
};

const fetchAdmins = async () => {
  isLoading.value = true;
  try {
    const snapshot = await getDocs(collection(db, "Administrator"));
    const adminPromises = snapshot.docs.map(async (d) => {
      const roleData = await fetchAdminRoles(d.id);
      return {
        id: d.id,
        ...d.data(),
        Status: d.data().Status || "Deactivated",
        accountStatus: d.data().accountStatus || "pending",
        position: roleData.position || "",
        roleName: roleData.role || "",
        permission: roleData.permission || "",
        isEditing: false,
        selectedPosition: roleData.position || "",
        selectedRole: roleData.role || "",
        selectedPermission: roleData.permission || ""
      };
    });
    admins.value = await Promise.all(adminPromises);
  } catch (err) {
    console.error("Error fetching admins:", err);
  } finally {
    isLoading.value = false;
  }
};

/* =====================
   ACTIONS
===================== */
const enableEditing = (admin) => {
  // Siguraduhin na isa lang ang ine-edit at a time para iwas gulo sa UI
  admins.value.forEach(a => a.isEditing = false);
  admin.isEditing = true;
};

const grantPrivilege = async (admin) => {
  if (!admin.selectedPosition || !admin.selectedRole || !admin.selectedPermission) return;
  try {
    await updateDoc(doc(db, "Administrator", admin.id, "Roles", "Default_Roles"), {
      position: admin.selectedPosition,
      role: admin.selectedRole,
      permission: admin.selectedPermission,
      updateAt: new Date()
    });
    admin.position = admin.selectedPosition;
    admin.roleName = admin.selectedRole;
    admin.permission = admin.selectedPermission;
    admin.isEditing = false;
  } catch (err) { console.error(err); }
};

const toggleStatus = async (admin) => {
  const newStatus = admin.Status === 'Active' ? 'Deactivated' : 'Active';
  try {
    await updateDoc(doc(db, "Administrator", admin.id), { Status: newStatus });
    admin.Status = newStatus;
  } catch (err) { console.error(err); }
};

const clearAllFilters = () => {
  searchQuery.value = ""; 
  debouncedSearchQuery.value = "";
  selectedRole.value = ""; 
  selectedStatus.value = "";
  currentPage.value = 1;
};

const getStatusBadgeClass = (status) => {
  if (isDarkMode.value) {
    return status === 'Active' 
      ? "bg-green-900/30 border-green-700 text-green-400" 
      : "bg-red-900/30 border-red-700 text-red-400";
  }
  return status === 'Active' 
    ? "bg-green-50 border-green-200 text-green-700" 
    : "bg-red-50 border-red-200 text-red-700";
};

/* =====================
   COMPUTED & WATCHERS
===================== */
let debounceTimeout = null;
watch(searchQuery, (v) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => { 
    debouncedSearchQuery.value = v; 
    currentPage.value = 1; // Reset to page 1 on search
  }, 300);
});

const filteredAdmins = computed(() => {
  return admins.value.filter(admin => {
    const query = debouncedSearchQuery.value.toLowerCase().trim();
    const fullName = `${admin.firstName || ''} ${admin.lastName || ''}`.toLowerCase();
    const username = (admin.username || '').toLowerCase();
    const email = (admin.email || '').toLowerCase();
    
    const matchesSearch = !query || fullName.includes(query) || username.includes(query) || email.includes(query);
    const matchesRole = !selectedRole.value || admin.roleName === selectedRole.value;
    const matchesStat = !selectedStatus.value || admin.Status === selectedStatus.value;
    
    return matchesSearch && matchesRole && matchesStat;
  });
});

const paginatedAdmins = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredAdmins.value.slice(start, start + itemsPerPage.value);
});

const totalPages = computed(() => Math.ceil(filteredAdmins.value.length / itemsPerPage.value) || 1);
const resultCount = computed(() => filteredAdmins.value.length);
const hasActiveFilters = computed(() => selectedRole.value || selectedStatus.value || searchQuery.value);

/* =====================
   LIFECYCLE
===================== */
onMounted(() => {
  fetchAdmins();
  // Fetch dynamic access options
  fetchOptions("Position_Access", ["isuzu$calapan$position201", "isuzu$calapan$position202", "isuzu$calapan$position203", "isuzu$calapan$position204", "isuzu$calapan$position205", "isuzu$calapan$position206"], "position", positionOptions);
  fetchOptions("Role_Access", ["isuzu&calapan&staff103", "isuzu&calapan&admin102", "isuzu&calapan&master&admin101"], "roleName", roleOptions);
  fetchOptions("Permission_Access", ["isuzu#calapan#permission301", "isuzu#calapan#permission302", "isuzu#calapan#permission303", "isuzu#calapan#permission304", "isuzu#calapan#permission305"], "permission", permissionOptions);
});
</script>

<style scoped>
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}

/* Transisyon para sa smooth editing UI */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>