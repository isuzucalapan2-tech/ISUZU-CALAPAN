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

        <div class="flex items-center gap-3 mb-8 border-b border-neutral-500/10 pb-4">
          <div class="w-2 h-6 bg-red-600 rounded-full"></div>
          <h2 :class="['text-xl font-black uppercase tracking-tighter isuzu-font', textClass]">{{ page.name }}</h2>
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
                       :class="['flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer text-xs font-bold uppercase tracking-wider',
                                page.allowedRoles.includes(role) 
                                ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-600/20' 
                                : 'bg-neutral-600/5 border-neutral-300/20 text-gray-500 hover:bg-neutral-600/10']">
                  <input type="checkbox" :value="role" v-model="page.allowedRoles" @change="updatePageAccess(page)" class="hidden" />
                  {{ role }}
                </label>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold uppercase text-gray-400 mb-3 tracking-widest">Allowed Positions</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="position in availablePositions" :key="position"
                       :class="['flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer text-xs font-bold uppercase tracking-wider',
                                page.allowedPositions.includes(position) 
                                ? 'bg-neutral-900 border-neutral-900 text-white shadow-md' 
                                : 'bg-neutral-600/5 border-neutral-300/20 text-gray-500 hover:bg-neutral-600/10']">
                  <input type="checkbox" :value="position" v-model="page.allowedPositions" @change="updatePageAccess(page)" class="hidden" />
                  {{ position }}
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
import { ref, onMounted, computed } from 'vue';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import { 
  ShieldCheck, ShieldAlert, Clock, 
} from 'lucide-vue-next'

const loading = ref(false);
const pages = ref([
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    allowedRoles: [], 
    allowedPositions: []
  },
  { 
    id: 'user-management', 
    name: 'User Management', 
    allowedRoles: [], 
    allowedPositions: []
  },
  { 
    id: 'approve', 
    name: 'Approve Users', 
    allowedRoles: [], 
    allowedPositions: []
  },
  { 
    id: 'inventory', 
    name: 'Inventory', 
    allowedRoles: [], 
    allowedPositions: []
  },
  { 
    id: 'transaction-in', 
    name: 'Transaction In', 
    allowedRoles: [], 
    allowedPositions: []
  },
  { 
    id: 'transaction-out', 
    name: 'Transaction Out', 
    allowedRoles: [], 
    allowedPositions: []
  },
  { 
    id: 'sa-rotation', 
    name: 'Retail Order (SA Rotation)', 
    allowedRoles: [], 
    allowedPositions: []
  },
  { 
    id: 'settings', 
    name: 'Settings', 
    allowedRoles: [], 
    allowedPositions: []
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
        page.updatedAt = pageData.updatedAt;
      }
    });
  } catch (err) {
    console.error('Error fetching page access:', err);
  } finally {
    loading.value = false;
  }
};

// Update page access in Firestore
const updatePageAccess = async (page) => {
  try {
    await setDoc(doc(db, 'Page_Control', page.id), {
      pageName: page.name,
      allowedRoles: page.allowedRoles,
      allowedPositions: page.allowedPositions,
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