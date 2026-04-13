<template>
  <div :class="themeClass" :style="themeStyle" class="min-h-screen p-8 relative overflow-hidden">
    <div class="absolute top-0 left-0 w-full z-0 opacity-10 pointer-events-none">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 15 H280 L330 45 H500" stroke="#cc0000" stroke-width="2" />
      </svg>
    </div>

    <div class="relative z-10 flex items-center gap-4 mb-10">
      <div class="bg-red-600 p-2.5 rounded-xl shadow-lg">
        <ShieldAlert class="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 :class="['text-2xl font-black isuzu-font uppercase tracking-widest', textClass]">
          Page Access <span class="text-red-600">Control</span>
        </h1>
        <p class="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Permission Management Matrix</p>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col justify-center items-center py-24 gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      <p class="text-xs font-black uppercase tracking-widest text-gray-400">Syncing Permissions...</p>
    </div>

    <div v-else class="relative z-10 space-y-8">
      <div v-for="page in pages" :key="page.id" 
           :class="[cardClass, 'rounded-2xl p-8 border border-neutral-600/40 relative overflow-hidden']" 
           :style="cardStyle">
        
        <div class="absolute -right-3 -top-1 opacity-[0.05] pointer-events-none">
          <ShieldCheck class="w-48 h-48 text-neutral-900" />
        </div>

        <div class="flex items-center justify-between mb-8 border-b border-neutral-500/10 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-2 h-6 bg-red-600 rounded-full"></div>
            <h2 :class="['text-xl font-black uppercase tracking-tighter isuzu-font', textClass]">{{ page.name }}</h2>
          </div>
          <!-- Lock/Unlock Button for Master Admin -->
          <button 
            @click="togglePageLock(page)"
            :class="['p-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-xs font-bold uppercase tracking-wider',
                     page.locked 
                       ? 'bg-red-600 text-white hover:bg-red-700' 
                       : 'bg-green-600 text-white hover:bg-green-700']"
            :title="page.locked ? 'Page access is locked - click to unlock' : 'Page access is unlocked - click to lock'"
          >
            <LockIcon v-if="page.locked" class="w-4 h-4" />
            <UnlockIcon v-else class="w-4 h-4" />
            {{ page.locked ? 'Locked' : 'Unlocked' }}
          </button>
        </div>
        
        <div class="space-y-6">
          <h3 :class="['text-[11px] font-black uppercase tracking-[0.2em] text-red-600', subTextClass]">
            Visibility Protocols
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-[10px] font-bold uppercase text-gray-400 mb-3 tracking-widest">Allowed Roles</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="role in availableRoles" :key="role" 
                       :class="['flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider',
                                isMasterAdminRole(role)
                                ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-600/20 cursor-not-allowed opacity-100' 
                                : page.locked && page.allowedRoles.includes(role)
                                  ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-600/20 cursor-not-allowed'
                                  : page.locked && !page.allowedRoles.includes(role)
                                    ? 'bg-neutral-600/5 border-neutral-300/20 text-gray-500 cursor-not-allowed'
                                    : page.allowedRoles.includes(role) 
                                      ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-600/20 cursor-pointer' 
                                      : 'bg-neutral-600/5 border-neutral-300/20 text-gray-500 hover:bg-neutral-600/10 cursor-pointer']">
                  <input type="checkbox" 
                         :checked="page.allowedRoles.includes(role) || isMasterAdminRole(role)" 
                         @change="handleRoleChange(page, role)" 
                         :disabled="isMasterAdminRole(role) || page.locked"
                         class="hidden" />
                  {{ role }}
                  <span v-if="isMasterAdminRole(role)" class="text-[8px] opacity-70">(Required)</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold uppercase text-gray-400 mb-3 tracking-widest">Allowed Positions</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="position in availablePositions" :key="position"
                       :class="['flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider',
                                isStaffPositionRequired(page, position)
                                ? 'bg-neutral-900 border-neutral-900 text-white shadow-md cursor-not-allowed opacity-100' 
                                : page.locked && page.allowedPositions.includes(position)
                                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-md cursor-not-allowed'
                                  : page.locked && !page.allowedPositions.includes(position)
                                    ? 'bg-neutral-600/5 border-neutral-300/20 text-gray-500 cursor-not-allowed'
                                    : page.allowedPositions.includes(position) 
                                      ? 'bg-neutral-900 border-neutral-900 text-white shadow-md cursor-pointer' 
                                      : 'bg-neutral-600/5 border-neutral-300/20 text-gray-500 hover:bg-neutral-600/10 cursor-pointer']">
                  <input type="checkbox" 
                         :value="position" 
                         :checked="page.allowedPositions.includes(position) || isStaffPositionRequired(page, position)"
                         @change="handlePositionChange(page, position)" 
                         :disabled="isStaffPositionRequired(page, position) || page.locked"
                         class="hidden" />
                  {{ position }}
                  <span v-if="isStaffPositionRequired(page, position)" class="text-[8px] opacity-70">(Required)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-4 border-t border-neutral-500/10 flex justify-between items-center">
          <div class="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
            <Clock class="w-3 h-3" />
            Last Synced: {{ page.updatedAt?.toDate?.() ? page.updatedAt.toDate().toLocaleString() : 'System Default' }}
          </div>
          <div class="h-1.5 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div class="h-full bg-red-600 w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import { 
  ShieldCheck, ShieldAlert, Clock, Lock as LockIcon, Unlock as UnlockIcon
} from 'lucide-vue-next'

// Master Admin role identifiers
const MASTER_ADMIN_ROLES = ['Master Admin', 'isuzu&calapan&master&admin101'];

const loading = ref(false);
const pages = ref([
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    allowedRoles: [], 
    allowedPositions: [],
    locked: false
  },
  { 
    id: 'user-management', 
    name: 'User Management', 
    allowedRoles: [], 
    allowedPositions: [],
    locked: false
  },
  { 
    id: 'approve', 
    name: 'Approve Users', 
    allowedRoles: [], 
    allowedPositions: [],
    locked: false
  },
  { 
    id: 'inventory', 
    name: 'Inventory', 
    allowedRoles: [], 
    allowedPositions: [],
    locked: false
  },
  { 
    id: 'transaction-in', 
    name: 'Transaction In', 
    allowedRoles: [], 
    allowedPositions: [],
    locked: false
  },
  { 
    id: 'transaction-out', 
    name: 'Transaction Out', 
    allowedRoles: [], 
    allowedPositions: [],
    locked: false
  },
  { 
    id: 'sa-rotation', 
    name: 'Retail Order (SA Rotation)', 
    allowedRoles: [], 
    allowedPositions: [],
    locked: false
  },
  { 
    id: 'settings', 
    name: 'Settings', 
    allowedRoles: [], 
    allowedPositions: [],
    locked: false
  },
  { 
    id: 'isuzu-dtr', 
    name: 'DTR Management', 
    allowedRoles: [], 
    allowedPositions: [],
    locked: false
  }
]);

const availableRoles = ref([]);
const availablePositions = ref([]);

// Fetch all available roles and positions from Access collections
const fetchAccessOptions = async () => {
  try {
    // Fetch roles from Role_Access collection
    const roleSnapshot = await getDocs(collection(db, 'Role_Access'));
    availableRoles.value = roleSnapshot.docs
      .map(d => d.data().roleName)
      .filter(Boolean);

    // Fetch positions from Position_Access collection
    const positionSnapshot = await getDocs(collection(db, 'Position_Access'));
    availablePositions.value = positionSnapshot.docs
      .map(d => d.data().position)
      .filter(Boolean);
  } catch (err) {
    console.error('Error fetching access options:', err);
  }
};

// Fetch current page access settings from Page_Control
const fetchPageAccess = async () => {
  loading.value = true;
  try {
    const pageSnapshot = await getDocs(collection(db, 'Page_Control'));
    
    pageSnapshot.docs.forEach(docSnap => {
      const pageData = docSnap.data();
      const page = pages.value.find(p => p.id === docSnap.id);
      if (page) {
        page.allowedRoles = pageData.allowedRoles || [];
        page.allowedPositions = pageData.allowedPositions || [];
        page.locked = pageData.locked || false;
        page.updatedAt = pageData.updatedAt;
      }
    });
  } catch (err) {
    console.error('Error fetching page access:', err);
  } finally {
    loading.value = false;
  }
};

// Helper function to check if a role is Master Admin
const isMasterAdminRole = (role) => {
  return MASTER_ADMIN_ROLES.includes(role);
};

// Handle role checkbox change
const handleRoleChange = (page, role) => {
  // Prevent unchecking Master Admin roles
  if (isMasterAdminRole(role)) {
    return; // Do nothing - Master Admin cannot be unchecked
  }
  
  const index = page.allowedRoles.indexOf(role);
  if (index === -1) {
    page.allowedRoles.push(role);
  } else {
    page.allowedRoles.splice(index, 1);
  }
  
  // Update Firestore
  updatePageAccess(page);
};

// Check if page has Master Admin role
const pageHasMasterAdmin = (page) => {
  return page.allowedRoles.some(r => MASTER_ADMIN_ROLES.includes(r));
};

// Pages where Staff position should always be required
const STAFF_REQUIRED_PAGES = ['sa-rotation', 'settings'];

// Check if Staff position is required (when Master Admin is allowed OR for specific pages)
const isStaffPositionRequired = (page, position) => {
  // Staff position is required when Master Admin role is allowed
  if (position === 'Staff' && pageHasMasterAdmin(page)) {
    return true;
  }
  // Staff position is also required for specific pages (Retail Order and Settings)
  if (position === 'Staff' && STAFF_REQUIRED_PAGES.includes(page.id)) {
    return true;
  }
  return false;
};

// Handle position checkbox change
const handlePositionChange = (page, position) => {
  // Prevent unchecking Staff position when Master Admin is allowed
  if (isStaffPositionRequired(page, position)) {
    return; // Do nothing - Staff is required for Master Admin
  }
  
  const index = page.allowedPositions.indexOf(position);
  if (index === -1) {
    page.allowedPositions.push(position);
  } else {
    page.allowedPositions.splice(index, 1);
  }
  
  // Update Firestore
  updatePageAccess(page);
};

// Toggle page lock/unlock
const togglePageLock = async (page) => {
  page.locked = !page.locked;
  await updatePageAccess(page);
};

// Update page access in Firestore
const updatePageAccess = async (page) => {
  try {
    await setDoc(doc(db, 'Page_Control', page.id), {
      pageName: page.name,
      allowedRoles: page.allowedRoles,
      allowedPositions: page.allowedPositions,
      locked: page.locked || false,
      updatedAt: new Date(),
      updatedBy: 'Master Admin'
    });
    
    //alert(`${page.name} access updated successfully`);
  } catch (err) {
    console.error('Error updating page access:', err);
    //alert('Failed to update access');
  }
};

// Theme support
const isDarkMode = computed(() =>
  document.documentElement.classList.contains('dark')
);

const themeClass = computed(() =>
  isDarkMode.value ? 'text-white' : 'bg-gray-100 text-gray-900'
);

const themeStyle = computed(() =>
  isDarkMode.value ? { backgroundColor: '#232323' } : {}
);

const cardClass = computed(() =>
  isDarkMode.value ? 'text-white bg-gray-800' : 'bg-white text-gray-900'
);

const subTextClass = computed(() =>
  isDarkMode.value ? 'text-gray-300' : 'text-gray-600'
);

const textClass = computed(() =>
  isDarkMode.value ? 'text-white' : 'text-gray-900'
);

onMounted(() => {
  fetchAccessOptions();
  fetchPageAccess();
});
</script>

<style scoped>
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>