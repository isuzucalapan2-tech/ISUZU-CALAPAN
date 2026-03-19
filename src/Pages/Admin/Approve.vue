<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-white">
    <div class="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
  </div>

  <div v-else :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col font-sans relative overflow-hidden">
    
    <div class="absolute top-0 left-0 w-full z-0 opacity-5 pointer-events-none">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 15 H280 L330 45 H500" stroke="currentColor" stroke-width="1" />
      </svg>
    </div>

    <header class="relative z-10 px-8 py-8 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <div class="bg-red-600 p-2 rounded-lg">
          <UserPlus class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight uppercase text-neutral-800 isuzu-font">
            User <span class="text-red-600">Approval</span>
          </h1>
          <p class="text-[10px] text-neutral-500 uppercase tracking-widest font-medium">Pending Registrations</p>
        </div>
      </div>

      <div class="hidden md:flex items-center">
        <span class="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          Total Pending: <span class="text-red-600 ml-1">{{ resultCount }}</span>
        </span>
      </div>
    </header>

    <main class="flex-1 relative z-10 overflow-auto px-8 pb-12">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <div class="flex flex-wrap items-center gap-4">
          <div class="relative flex-1 min-w-[300px]">
            <Search class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by username or email..."
              class="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm border border-neutral-200 bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all"
            />
          </div>

          <div class="flex items-center gap-2">
            <select v-model="selectedRole" class="px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-bold outline-none cursor-pointer bg-white">
              <option value="">ALL ROLES</option>
              <option v-for="role in roleOptions" :key="role" :value="role">{{ role.toUpperCase() }}</option>
            </select>

            <select v-model="selectedPosition" class="px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-bold outline-none cursor-pointer bg-white">
              <option value="">ALL POSITIONS</option>
              <option v-for="pos in positionOptions" :key="pos" :value="pos">{{ pos.toUpperCase() }}</option>
            </select>

            <button 
              v-if="hasActiveFilters"
              @click="clearAllFilters"
              class="p-2.5 text-neutral-500 hover:text-red-600 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-neutral-300 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-neutral-100">
                  <th class="px-6 py-4 text-[11px] font-bold uppercase tracking-wider opacity-40">User Info</th>
                  <th class="px-6 py-4 text-[11px] font-bold uppercase tracking-wider opacity-40">Assign Role</th>
                  <th class="px-6 py-4 text-[11px] font-bold uppercase tracking-wider opacity-40">Assign Position</th>
                  <th class="px-6 py-4 text-[11px] font-bold uppercase tracking-wider opacity-40">Assign Permission</th>
                  <th class="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-right opacity-40">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-50">
                <tr v-for="user in paginatedPendingUsers" :key="user.id" class="transition-colors hover:bg-neutral-50/50">
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="text-sm font-semibold text-neutral-800">{{ user.username }}</span>
                      <span class="text-[11px] text-neutral-500 font-medium">{{ user.email }}</span>
                    </div>
                  </td>

                  <td class="px-6 py-4">
                    <select v-model="user.selectedRole" class="bg-transparent border border-neutral-200 rounded px-2 py-1.5 text-[10px] font-bold outline-none focus:border-red-500 transition-colors uppercase">
                      <option disabled value="">Select Role</option>
                      <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
                    </select>
                  </td>

                  <td class="px-6 py-4">
                    <select v-model="user.selectedPosition" class="bg-transparent border border-neutral-200 rounded px-2 py-1.5 text-[10px] font-bold outline-none focus:border-red-500 transition-colors uppercase">
                      <option disabled value="">Select Position</option>
                      <option v-for="pos in positionOptions" :key="pos" :value="pos">{{ pos }}</option>
                    </select>
                  </td>

                  <td class="px-6 py-4">
                    <select v-model="user.selectedPermission" class="bg-transparent border border-neutral-200 rounded px-2 py-1.5 text-[10px] font-bold outline-none focus:border-red-500 transition-colors uppercase">
                      <option disabled value="">Select Permission</option>
                      <option v-for="perm in permissionOptions" :key="perm" :value="perm">{{ perm }}</option>
                    </select>
                  </td>

                  <td class="px-6 py-4">
                    <div class="flex justify-end items-center gap-1">
                      <button @click="approveUser(user)" class="p-2 text-neutral-400 hover:text-green-600 transition-colors" title="Approve">
                        <Check class="w-4 h-4" />
                      </button>
                      <button @click="denyUser(user)" class="p-2 text-neutral-400 hover:text-red-600 transition-colors" title="Deny">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="paginatedPendingUsers.length === 0">
                  <td colspan="5" class="px-6 py-20 text-center">
                    <div class="flex flex-col items-center opacity-10">
                      <Users class="w-16 h-16 mb-4" />
                      <p class="text-lg font-bold uppercase tracking-widest">No Pending Requests</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="px-6 py-4 border-t border-neutral-50 flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-50/30">
            <p class="text-[11px] font-medium text-neutral-500">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredPendingUsers.length) }} of {{ resultCount }}
            </p>
            
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1">
                <button @click="currentPage--" :disabled="currentPage === 1" class="p-2 disabled:opacity-20 hover:text-red-600 transition-all">
                  <ChevronLeft class="w-4 h-4" />
                </button>
                
                <div class="flex gap-1 px-2">
                  <button v-for="page in displayedPages" :key="page" @click="currentPage = page" 
                    :class="currentPage === page ? 'text-red-600 font-black' : 'text-neutral-400 font-bold'"
                    class="w-6 h-6 text-[11px] transition-all">
                    {{ page }}
                  </button>
                </div>

                <button @click="currentPage++" :disabled="currentPage === totalPages" class="p-2 disabled:opacity-20 hover:text-red-600 transition-all">
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div class="absolute bottom-0 left-0 w-full z-0 opacity-5 pointer-events-none transform rotate-180">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 45 H170 L220 15 H500" stroke="currentColor" stroke-width="1" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../Firebase/Firebase";

/* ICONS */
import { 
  Search, X, ChevronLeft, ChevronRight, Check, Trash2, 
  UserPlus, Users, AlertCircle 
} from "lucide-vue-next";

/* STATE */
const isLoading = ref(true);
const pendingUsers = ref([]);
const positionOptions = ref([]);
const roleOptions = ref([]);
const permissionOptions = ref([]);

/* FILTER & PAGINATION */
const searchQuery = ref("");
const debouncedSearchQuery = ref("");
const selectedRole = ref("");
const selectedPosition = ref("");
const selectedPermission = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

/* THEME COMPUTED (Sync with your system settings) */
const themeClass = computed(() => "bg-gray-100 text-neutral-900");
const themeStyle = computed(() => ({}));

/* FETCH LOGIC (Incorporate your existing functions) */
const fetchPositionOptions = async () => {
  const docIds = ["isuzu$calapan$position201", "isuzu$calapan$position202", "isuzu$calapan$position203", "isuzu$calapan$position204", "isuzu$calapan$position205", "isuzu$calapan$position206"];
  for (const id of docIds) {
    const d = await getDoc(doc(db, "Position_Access", id));
    if (d.exists()) positionOptions.value.push(d.data().position);
  }
};

const fetchRoleOptions = async () => {
  const docIds = ["isuzu&calapan&staff103", "isuzu&calapan&admin102", "isuzu&calapan&master&admin101"];
  for (const id of docIds) {
    const d = await getDoc(doc(db, "Role_Access", id));
    if (d.exists()) roleOptions.value.push(d.data().roleName);
  }
};

const fetchPermissionOptions = async () => {
  const docIds = ["isuzu#calapan#permission301", "isuzu#calapan#permission302", "isuzu#calapan#permission303", "isuzu#calapan#permission304", "isuzu#calapan#permission305"];
  for (const id of docIds) {
    const d = await getDoc(doc(db, "Permission_Access", id));
    if (d.exists()) permissionOptions.value.push(d.data().permission);
  }
};

const loadPendingUsers = () => {
  const q = query(collection(db, "Administrator"), where("accountStatus", "==", "pending"));
  onSnapshot(q, async (snapshot) => {
    const promises = snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        username: data.username || "N/A",
        email: data.email || "N/A",
        selectedPosition: "",
        selectedRole: "",
        selectedPermission: ""
      };
    });
    pendingUsers.value = await Promise.all(promises);
    isLoading.value = false;
  });
};

/* ACTIONS */
const approveUser = async (user) => {
  if (!user.selectedPosition || !user.selectedRole || !user.selectedPermission) {
    alert("Please assign all fields first.");
    return;
  }
  try {
    await setDoc(doc(db, "Administrator", user.id, "Roles", "Default_Roles"), {
      position: user.selectedPosition,
      role: user.selectedRole,
      permission: user.selectedPermission,
      setAt: new Date()
    });
    await updateDoc(doc(db, "Administrator", user.id), {
      accountStatus: "approved",
      Status: "Active"
    });
  } catch (e) { console.error(e); }
};

const denyUser = async (user) => {
  if (!confirm("Deny this user?")) return;
  await updateDoc(doc(db, "Administrator", user.id), { accountStatus: "denied" });
};

/* FILTERING LOGIC */
const filteredPendingUsers = computed(() => {
  return pendingUsers.value.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        u.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchSearch;
  });
});

const resultCount = computed(() => filteredPendingUsers.value.length);
const totalPages = computed(() => Math.ceil(resultCount.value / itemsPerPage.value) || 1);
const paginatedPendingUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredPendingUsers.value.slice(start, start + itemsPerPage.value);
});

const displayedPages = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPages.value; i++) pages.push(i);
  return pages;
});

const hasActiveFilters = computed(() => searchQuery.value !== "");
const clearAllFilters = () => searchQuery.value = "";

onMounted(() => {
  loadPendingUsers();
  fetchPositionOptions();
  fetchRoleOptions();
  fetchPermissionOptions();
});
</script>

<style scoped>
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.animate-in {
  animation-duration: 0.5s;
}
</style>