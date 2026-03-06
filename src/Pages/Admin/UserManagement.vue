<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-white">
    <Loaders />
  </div>

  <div v-else :class="themeClass" class="min-h-screen flex flex-col font-sans relative overflow-hidden">
    
    <div class="absolute top-0 left-0 w-full z-0 opacity-10 pointer-events-none">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 15 H280 L330 45 H500" stroke="#cc0000" stroke-width="2" />
      </svg>
    </div>

    <header :class="[headerClass, 'relative z-10 px-8 py-6 flex justify-between items-center backdrop-blur-none']">
      <div class="flex items-center gap-4">
        <div class="bg-red-600 p-2.5 rounded-xl text-white">
          <Users class="w-6 h-6" />
        </div>
        <div>
          <h1 :class="['text-2xl font-black uppercase tracking-widest isuzu-font', textClass]">
            User <span class="text-red-600">Management</span>
          </h1>
          <p :class="['text-[10px] uppercase tracking-[0.3em] font-bold opacity-60', subTextClass]">Access Control Matrix</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
         <span :class="['px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border', isDarkMode ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-50 text-red-600 border-red-100']">
            {{ resultCount }} Active Records
         </span>
      </div>
    </header>

    <main class="flex-1 relative z-10 overflow-auto p-8">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <div :class="[cardClass, 'rounded-2xl p-6 border flex flex-wrap items-center gap-4']" :style="cardStyle">
          <div class="relative flex-1 min-w-[300px]">
            <Search class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="SEARCH BY NAME, USERNAME, EMAIL..."
              :class="['w-full pl-11 pr-4 py-3 border border-neutral-600/40 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all', isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-800']"
            />
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <select v-model="selectedRole" :class="['px-4 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none cursor-pointer', isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800']">
              <option value="">ALL ROLES</option>
              <option v-for="role in roleOptions" :key="role" :value="role">{{ role.toUpperCase() }}</option>
            </select>

            <select v-model="selectedStatus" :class="['px-4 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none cursor-pointer', isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800']">
              <option value="">ALL STATUS</option>
              <option value="Active">ACTIVE</option>
              <option value="Deactivated">DEACTIVATED</option>
            </select>

            <button
              v-if="hasActiveFilters"
              @click="clearAllFilters"
              class="p-3 bg-neutral-900 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg active:scale-90"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div :class="[cardClass, 'rounded-2xl border overflow-hidden relative']" :style="cardStyle">
          <div class="h-1.5 w-full bg-neutral-800 flex">
            <div class="h-full w-24 bg-red-600"></div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr :class="['border-b', isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-neutral-50/50 border-neutral-100']">
                  <th class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Administrator</th>
                  <th class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Contact</th>
                  <th class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Position & Role</th>
                  <th class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Permission</th>
                  <th class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Status</th>
                  <th class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center opacity-50">Actions</th>
                </tr>
              </thead>
              <tbody :class="['divide-y', isDarkMode ? 'divide-neutral-700' : 'divide-neutral-100']">
                <tr v-for="admin in paginatedAdmins" :key="admin.id" :class="['group transition-colors', isDarkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-red-50/30']">
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                      <div :class="['w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-xs uppercase shadow-sm', isDarkMode ? 'bg-neutral-800' : 'bg-neutral-900']">
                        {{ admin.firstName?.[0] }}{{ admin.lastName?.[0] }}
                      </div>
                      <div>
                        <p :class="['text-sm font-black uppercase tracking-tight', textClass]">{{ admin.firstName }} {{ admin.lastName }}</p>
                        <p class="text-[10px] text-red-600 font-bold tracking-widest">@{{ admin.username }}</p>
                      </div>
                    </div>
                  </td>

                  <td :class="['px-6 py-5 text-xs font-bold italic opacity-60', textClass]">
                    {{ admin.email }}
                  </td>

                  <td class="px-6 py-5">
                    <div v-if="admin.isEditing" class="flex flex-col gap-1.5 max-w-[150px]">
                      <select v-model="admin.selectedPosition" :class="['w-full border rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase outline-none focus:border-red-500', isDarkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-gray-200 text-neutral-800']">
                        <option v-for="pos in positionOptions" :key="pos" :value="pos">{{ pos }}</option>
                      </select>
                      <select v-model="admin.selectedRole" :class="['w-full border rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase outline-none focus:border-red-500', isDarkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-gray-200 text-neutral-800']">
                        <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
                      </select>
                    </div>
                    <div v-else>
                      <p :class="['text-xs font-black uppercase tracking-tight', textClass]">{{ admin.position || 'N/A' }}</p>
                      <p :class="['text-[10px] font-bold uppercase opacity-50', textClass]">{{ admin.roleName || 'N/A' }}</p>
                    </div>
                  </td>

                  <td class="px-6 py-5">
                    <select v-if="admin.isEditing" v-model="admin.selectedPermission" :class="['w-full border rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase outline-none focus:border-red-500', isDarkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white text-neutral-800 border-gray-200']">
                      <option v-for="perm in permissionOptions" :key="perm" :value="perm">{{ perm }}</option>
                    </select>
                    <span v-else :class="['px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border', isDarkMode ? 'bg-neutral-800 text-neutral-400 border-neutral-700' : 'bg-neutral-100 text-neutral-600 border-neutral-200']">
                      {{ admin.permission || "STANDARD" }}
                    </span>
                  </td>

                  <td class="px-6 py-5">
                    <span :class="getStatusBadgeClass(admin.Status)" class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit">
                      <span class="w-1.5 h-1.5 rounded-full" :class="admin.Status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'"></span>
                      {{ admin.Status || "Deactivated" }}
                    </span>
                  </td>

                  <td class="px-6 py-5 text-center">
                    <div class="flex justify-center items-center gap-2">
                      <button v-if="!admin.isEditing" @click="enableEditing(admin)" class="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Edit class="w-4 h-4" /></button>
                      <button v-else @click="grantPrivilege(admin)" class="p-2.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all"><CheckCircle class="w-4 h-4" /></button>
                      
                      <button v-if="admin.accountStatus !== 'pending'" @click="toggleStatus(admin)" 
                        :class="admin.Status === 'Active' ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'" 
                        class="p-2.5 rounded-xl transition-all">
                        <Power class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div :class="['px-8 py-6 border-t flex flex-col sm:flex-row items-center justify-between gap-6', isDarkMode ? 'bg-neutral-900/50 border-neutral-700' : 'bg-neutral-50/50 border-neutral-100']">
            <p :class="['text-[10px] font-black uppercase tracking-[0.2em] opacity-60', textClass]">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredAdmins.length) }} of {{ filteredAdmins.length }} records
            </p>
            
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-2">
                <span class="text-[9px] font-black uppercase opacity-40">Rows:</span>
                <select v-model="itemsPerPage" :class="['text-[10px] font-black border rounded-lg px-3 py-1.5 outline-none focus:border-red-500 transition-colors', isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-200 text-neutral-800']">
                  <option v-for="opt in itemsPerPageOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>

              <div class="flex items-center gap-1.5">
                <button @click="currentPage = 1" :disabled="currentPage === 1" :class="['p-2.5 rounded-xl border bg-white dark:bg-neutral-800 disabled:opacity-20 hover:text-red-600 transition-all shadow-sm', isDarkMode ? 'border-neutral-700 text-white' : 'border-neutral-200 text-neutral-800']"><ChevronsLeft class="w-4 h-4" /></button>
                <button @click="currentPage--" :disabled="currentPage === 1" :class="['p-2.5 rounded-xl border bg-white dark:bg-neutral-800 disabled:opacity-20 hover:text-red-600 transition-all shadow-sm', isDarkMode ? 'border-neutral-700 text-white' : 'border-neutral-200 text-neutral-800']"><ChevronLeft class="w-4 h-4" /></button>
                
                <div :class="['flex items-center px-6 text-[10px] font-black uppercase tracking-widest', textClass]">
                  PAGE <span class="text-red-600 mx-1">{{ currentPage }}</span> / {{ totalPages }}
                </div>

                <button @click="currentPage++" :disabled="currentPage === totalPages" :class="['p-2.5 rounded-xl border bg-white dark:bg-neutral-800 disabled:opacity-20 hover:text-red-600 transition-all shadow-sm', isDarkMode ? 'border-neutral-700 text-white' : 'border-neutral-200 text-neutral-800']"><ChevronRight class="w-4 h-4" /></button>
                <button @click="currentPage = totalPages" :disabled="currentPage === totalPages" :class="['p-2.5 rounded-xl border bg-white dark:bg-neutral-800 disabled:opacity-20 hover:text-red-600 transition-all shadow-sm', isDarkMode ? 'border-neutral-700 text-white' : 'border-neutral-200 text-neutral-800']"><ChevronsRight class="w-4 h-4" /></button>
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