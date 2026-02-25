<template>
  <div :class="themeClass" :style="themeStyle" class="min-h-screen p-8">
    <h1 :class="textClass" class="text-2xl font-bold mb-6 border-l-4 border-red-600 pl-4">
      ⚙️ Page Access Control
    </h1>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>

    <div v-else>
      <div v-for="page in pages" :key="page.id" :class="cardClass" class="mb-6 p-6 rounded-lg shadow-lg border-l-4 border-red-600">
        <h2 :class="textClass" class="text-xl font-bold mb-4">{{ page.name }}</h2>
        
        <!-- Page Access Section -->
        <div class="mb-6 border-b pb-4">
          <h3 :class="subTextClass" class="font-semibold mb-3">Page Access (Who can see this page):</h3>
          
          <div class="mb-3">
            <label class="block mb-2 font-medium">Allowed Roles:</label>
            <div class="flex flex-wrap gap-2">
              <label 
                v-for="role in availableRoles" 
                :key="role" 
                class="flex items-center gap-2 border rounded px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <input 
                  type="checkbox" 
                  :value="role"
                  v-model="page.allowedRoles"
                  @change="updatePageAccess(page)"
                  class="w-4 h-4"
                />
                <span :class="textClass">{{ role }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block mb-2 font-medium">Allowed Positions:</label>
            <div class="flex flex-wrap gap-2">
              <label 
                v-for="position in availablePositions" 
                :key="position"
                class="flex items-center gap-2 border rounded px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <input 
                  type="checkbox" 
                  :value="position"
                  v-model="page.allowedPositions"
                  @change="updatePageAccess(page)"
                  class="w-4 h-4"
                />
                <span :class="textClass">{{ position }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Feature Permissions Section -->
        <div>
          <h3 :class="subTextClass" class="font-semibold mb-3">Feature Permissions (What can they do):</h3>
          
          <div v-for="(feature, featureName) in page.features" :key="featureName" class="mb-3 flex items-center gap-4">
            <span class="w-40 font-medium capitalize">{{ formatFeatureName(featureName) }}:</span>
            <select 
              v-model="feature.minPermission" 
              @change="updatePageAccess(page)"
              class="border rounded px-3 py-2 bg-white dark:bg-gray-700"
            >
              <option value="View">View Only</option>
              <option value="Edit">Edit</option>
              <option value="Create">Create</option>
              <option value="Delete">Delete</option>
              <option value="All">All Access</option>
            </select>
            <span class="text-sm text-gray-500">
              (Requires: {{ feature.minPermission }} or higher)
            </span>
          </div>
        </div>

        <div class="mt-4 text-sm text-gray-500">
          Last updated: {{ page.updatedAt?.toDate?.() ? page.updatedAt.toDate().toLocaleString() : 'Never' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';

const loading = ref(false);
const pages = ref([
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    allowedRoles: [], 
    allowedPositions: [],
    features: {
      viewDashboard: { minPermission: 'View' }
    }
  },
  { 
    id: 'user-management', 
    name: 'User Management', 
    allowedRoles: [], 
    allowedPositions: [],
    features: {
      viewUsers: { minPermission: 'View' },
      editUser: { minPermission: 'Edit' },
      createUser: { minPermission: 'Create' },
      deleteUser: { minPermission: 'Delete' },
      approveUser: { minPermission: 'All' }
    }
  },
  { 
    id: 'approve', 
    name: 'Approve Users', 
    allowedRoles: [], 
    allowedPositions: [],
    features: {
      viewPending: { minPermission: 'View' },
      approveUser: { minPermission: 'Edit' },
      denyUser: { minPermission: 'Delete' }
    }
  },
  { 
    id: 'inventory', 
    name: 'Inventory', 
    allowedRoles: [], 
    allowedPositions: [],
    features: {
      viewInventory: { minPermission: 'View' },
      addItem: { minPermission: 'Create' },
      editItem: { minPermission: 'Edit' },
      deleteItem: { minPermission: 'Delete' }
    }
  },
  { 
    id: 'transaction-in', 
    name: 'Transaction In', 
    allowedRoles: [], 
    allowedPositions: [],
    features: {
      viewTransactionIn: { minPermission: 'View' },
      createTransactionIn: { minPermission: 'Create' },
      editTransactionIn: { minPermission: 'Edit' },
      deleteTransactionIn: { minPermission: 'Delete' },
      stockOut: { minPermission: 'Edit' }
    }
  },
  { 
    id: 'transaction-out', 
    name: 'Transaction Out', 
    allowedRoles: [], 
    allowedPositions: [],
    features: {
      viewTransactionOut: { minPermission: 'View' },
      createTransactionOut: { minPermission: 'Create' },
      editTransactionOut: { minPermission: 'Edit' },
      deleteTransactionOut: { minPermission: 'Delete' },
      cancelSale: { minPermission: 'Delete' }
    }
  },
  { 
    id: 'sa-rotation', 
    name: 'Retail Order (SA Rotation)', 
    allowedRoles: [], 
    allowedPositions: [],
    features: {
      viewOrders: { minPermission: 'View' },
      createOrder: { minPermission: 'Create' },
      editOrder: { minPermission: 'Edit' },
      deleteOrder: { minPermission: 'Delete' }
    }
  },

  { 
    id: 'settings', 
    name: 'Settings', 
    allowedRoles: [], 
    allowedPositions: [],
    features: {
      viewSettings: { minPermission: 'View' },
      modifySettings: { minPermission: 'Edit' }
    }
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
        
        // Merge features if they exist
        if (pageData.features) {
          Object.keys(pageData.features).forEach(key => {
            if (page.features[key]) {
              page.features[key].minPermission = pageData.features[key].minPermission;
            }
          });
        }
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
      features: page.features,
      updatedAt: new Date(),
      updatedBy: 'Master Admin'
    });
    
    //alert(`${page.name} access updated successfully`);
  } catch (err) {
    console.error('Error updating page access:', err);
    //alert('Failed to update access');
  }
};

const formatFeatureName = (name) => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
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
