<template>
  <div v-if="!isLoading" :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col">
    <!-- Topbar -->
    <!-- <Topbar /> -->

    <!-- Main Content -->
    <main class="flex-1 p-6">
      <h1 :class="textClass" class="text-3xl font-bold mb-6 border-l-4 border-red-600 pl-4 flex items-center gap-2">
        <Package class="w-7 h-7 text-red-600" />
        Inventory Management
      </h1>

      <!-- Search and Filter Bar -->
      <div :class="cardClass" :style="cardStyle" class="shadow-lg rounded-lg p-6 mb-6 border-l-2 border-red-600 hover:shadow-xl transition-all duration-300">

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search Box -->
          <div>
            <label :class="subTextClass" class="block font-medium mb-2">Search Parts</label>
            <input
              v-model="searchQuery"
              type="text"
              :class="inputClass"
              class="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Search by part name or code..."
            />
          </div>

          <!-- Category Filter -->
          <div>
            <label :class="subTextClass" class="block font-medium mb-2">Category</label>
            <select
              v-model="filterCategory"
              :class="inputClass"
              class="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Categories</option>
              <option value="Engine Parts">Engine Parts</option>
              <option value="Transmission">Transmission</option>
              <option value="Suspension">Suspension</option>
              <option value="Electrical">Electrical</option>
              <option value="Body Parts">Body Parts</option>
            </select>
          </div>

          <!-- Stock Status Filter -->
          <div>
            <label :class="subTextClass" class="block font-medium mb-2">Stock Status</label>
            <select
              v-model="filterStatus"
              :class="inputClass"
              class="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          <!-- Add Button -->
          <div class="flex items-end">
            <button
              @click="openAddModal"
              class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
            >
              <Plus class="w-5 h-5" />
              Add New Part
            </button>
          </div>
        </div>
      </div>

      <!-- Inventory Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div :class="cardClass" :style="cardStyle" class="shadow-lg rounded-lg p-6 border-l-2 border-green-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">

          <div class="flex items-center gap-4">
            <CheckCircle class="w-10 h-10 text-green-600" />
            <div>
              <h3 :class="subTextClass" class="text-sm">In Stock</h3>
              <p :class="textClass" class="text-3xl font-bold">{{ inStockCount }}</p>
            </div>
          </div>
        </div>

        <div :class="cardClass" :style="cardStyle" class="shadow-lg rounded-lg p-6 border-l-2 border-yellow-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">

          <div class="flex items-center gap-4">
            <AlertTriangle class="w-10 h-10 text-yellow-600" />
            <div>
              <h3 :class="subTextClass" class="text-sm">Low Stock</h3>
              <p :class="textClass" class="text-3xl font-bold">{{ lowStockCount }}</p>
            </div>
          </div>
        </div>

        <div :class="cardClass" :style="cardStyle" class="shadow-lg rounded-lg p-6 border-l-2 border-red-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">

          <div class="flex items-center gap-4">
            <XCircle class="w-10 h-10 text-red-600" />
            <div>
              <h3 :class="subTextClass" class="text-sm">Out of Stock</h3>
              <p :class="textClass" class="text-3xl font-bold">{{ outOfStockCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory Table -->
      <div :class="cardClass" :style="cardStyle" class="shadow-lg rounded-lg overflow-hidden border-t-2 border-red-600 hover:shadow-xl transition-all duration-300">

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead :class="tableHeaderClass" class="border-b-2 border-red-600">
              <tr>
                <th class="p-4 text-left">Part Code</th>
                <th class="p-4 text-left">Part Name</th>
                <th class="p-4 text-left">Category</th>
                <th class="p-4 text-left">Quantity</th>
                <th class="p-4 text-left">Min Level</th>
                <th class="p-4 text-left">Unit Price</th>
                <th class="p-4 text-left">Status</th>
                <th class="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredInventory"
                :key="item.id"
                :class="tableRowClass"
                class="border-b border-gray-300 transition duration-200 hover:shadow-md"
              >

                <td :class="textClass" class="p-4 font-medium">{{ item.partCode }}</td>
                <td :class="textClass" class="p-4">{{ item.partName }}</td>
                <td :class="textClass" class="p-4">{{ item.category }}</td>
                <td :class="textClass" class="p-4">{{ item.quantity }}</td>
                <td :class="textClass" class="p-4">{{ item.minLevel }}</td>
                <td :class="textClass" class="p-4">₱{{ item.unitPrice.toLocaleString() }}</td>
                <td class="p-4">
                  <span
                    :class="{
                      'bg-green-100 text-green-800': item.status === 'in-stock',
                      'bg-yellow-100 text-yellow-800': item.status === 'low',
                      'bg-red-100 text-red-800': item.status === 'out'
                    }"
                    class="px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {{ item.status === 'in-stock' ? 'In Stock' : item.status === 'low' ? 'Low Stock' : 'Out of Stock' }}
                  </span>
                </td>
                <td class="p-4">
                  <div class="flex gap-2">
                    <button
                      @click="editPart(item)"
                      class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-1"
                    >

                      <Edit class="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      @click="deletePart(item.id)"
                      class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-1"
                    >

                      <Trash2 class="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredInventory.length === 0">
                <td colspan="8" :class="subTextClass" class="text-center p-8">
                  <div class="flex justify-center items-center gap-2">
                    <Package class="w-5 h-5" />
                    No inventory items found
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div :class="modalClass" :style="modalStyle" class="rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 :class="textClass" class="text-2xl font-bold mb-4 flex items-center gap-2">
          <Package class="w-6 h-6 text-red-600" />
          {{ editingPart ? 'Edit Part' : 'Add New Part' }}
        </h2>

        <div class="space-y-4">
          <div>
            <label :class="subTextClass" class="block mb-1">Part Code</label>
            <input
              v-model="form.partCode"
              type="text"
              :class="inputClass"
              class="w-full border rounded px-4 py-2"
              placeholder="e.g., ISZ-001"
            />
          </div>

          <div>
            <label :class="subTextClass" class="block mb-1">Part Name</label>
            <input
              v-model="form.partName"
              type="text"
              :class="inputClass"
              class="w-full border rounded px-4 py-2"
              placeholder="e.g., Engine Oil Filter"
            />
          </div>

          <div>
            <label :class="subTextClass" class="block mb-1">Category</label>
            <select v-model="form.category" :class="inputClass" class="w-full border rounded px-4 py-2">
              <option value="">Select Category</option>
              <option value="Engine Parts">Engine Parts</option>
              <option value="Transmission">Transmission</option>
              <option value="Suspension">Suspension</option>
              <option value="Electrical">Electrical</option>
              <option value="Body Parts">Body Parts</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label :class="subTextClass" class="block mb-1">Quantity</label>
              <input
                v-model.number="form.quantity"
                type="number"
                :class="inputClass"
                class="w-full border rounded px-4 py-2"
                placeholder="0"
              />
            </div>

            <div>
              <label :class="subTextClass" class="block mb-1">Min Level</label>
              <input
                v-model.number="form.minLevel"
                type="number"
                :class="inputClass"
                class="w-full border rounded px-4 py-2"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label :class="subTextClass" class="block mb-1">Unit Price (₱)</label>
            <input
              v-model.number="form.unitPrice"
              type="number"
              :class="inputClass"
              class="w-full border rounded px-4 py-2"
              placeholder="0.00"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="closeModal"
            class="px-4 py-2 border rounded hover:bg-gray-100 hover:shadow-md transition-all duration-200"
            :class="isDarkMode ? 'border-gray-600 hover:bg-gray-800 text-white' : 'border-gray-300'"
          >

            Cancel
          </button>
          <button
            @click="savePart"
            class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >

            {{ editingPart ? 'Update' : 'Add' }} Part
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading Screen -->
  <div v-else class="min-h-screen flex items-center justify-center">
    <Loaders />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { db } from '../../Firebase/Firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Loaders from '../../components/Loaders.vue';


import {
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-vue-next';

const { user, isAuthenticated } = useAuth();
const isLoading = ref(true);

const inventoryItems = ref([]);
const searchQuery = ref('');
const filterCategory = ref('');
const filterStatus = ref('');
const showModal = ref(false);
const editingPart = ref(null);

const form = ref({
  partCode: '',
  partName: '',
  category: '',
  quantity: 0,
  minLevel: 0,
  unitPrice: 0
});

// Theme
const isDarkMode = computed(() => document.documentElement.classList.contains('dark'));

const themeClass = computed(() =>
  isDarkMode.value ? 'text-white' : 'bg-gray-100 text-gray-900'
);

const themeStyle = computed(() =>
  isDarkMode.value ? { backgroundColor: '#232323' } : {}
);

const cardClass = computed(() =>
  isDarkMode.value ? 'text-white' : 'bg-white text-gray-900'
);

const cardStyle = computed(() =>
  isDarkMode.value ? { backgroundColor: '#2a2a2a' } : {}
);

const textClass = computed(() =>
  isDarkMode.value ? 'text-white' : 'text-gray-900'
);

const subTextClass = computed(() =>
  isDarkMode.value ? 'text-gray-300' : 'text-gray-600'
);

const tableHeaderClass = computed(() =>
  isDarkMode.value ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
);

const tableRowClass = computed(() =>
  isDarkMode.value ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
);

const inputClass = computed(() =>
  isDarkMode.value
    ? 'bg-gray-800 text-white border-gray-600 placeholder-gray-400'
    : 'bg-white text-gray-900 border-gray-300'
);

const modalClass = computed(() =>
  isDarkMode.value ? 'bg-gray-800 text-white' : 'bg-white'
);

const modalStyle = computed(() =>
  isDarkMode.value ? { backgroundColor: '#2a2a2a' } : {}
);

// Load inventory from Firestore
const loadInventory = async (uid) => {
  try {
    const snapshot = await getDocs(collection(db, 'users', uid, 'inventory'));
    inventoryItems.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error loading inventory:', error);
  }
};

// Load inventory on mount
const initializeInventory = async () => {
  if (user.value) {
    await loadInventory(user.value.uid);
    isLoading.value = false;
  }
};


// Computed filtered inventory
const filteredInventory = computed(() => {
  return inventoryItems.value.filter(item => {
    const matchesSearch =
      item.partName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.partCode?.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = !filterCategory.value || item.category === filterCategory.value;
    const matchesStatus = !filterStatus.value || item.status === filterStatus.value;
    return matchesSearch && matchesCategory && matchesStatus;
  });
});

// Counts
const inStockCount = computed(() =>
  inventoryItems.value.filter(i => i.status === 'in-stock').length
);

const lowStockCount = computed(() =>
  inventoryItems.value.filter(i => i.status === 'low').length
);

const outOfStockCount = computed(() =>
  inventoryItems.value.filter(i => i.status === 'out').length
);

// Modal functions
const openAddModal = () => {
  editingPart.value = null;
  form.value = {
    partCode: '',
    partName: '',
    category: '',
    quantity: 0,
    minLevel: 0,
    unitPrice: 0
  };
  showModal.value = true;
};

const editPart = (item) => {
  editingPart.value = item;
  form.value = { ...item };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingPart.value = null;
};

const savePart = async () => {
  if (!form.value.partCode || !form.value.partName || !form.value.category) {
    alert('Please fill in all required fields');
    return;
  }

  if (!user.value) return;


  // Determine status based on quantity vs minLevel
  let status = 'in-stock';
  if (form.value.quantity === 0) {
    status = 'out';
  } else if (form.value.quantity <= form.value.minLevel) {
    status = 'low';
  }

  const partData = {
    ...form.value,
    status,
    updatedAt: new Date()
  };

  try {
    if (editingPart.value) {
      await updateDoc(doc(db, 'users', user.value.uid, 'inventory', editingPart.value.id), partData);
    } else {
      partData.createdAt = new Date();
      await addDoc(collection(db, 'users', user.value.uid, 'inventory'), partData);
    }
    await loadInventory(user.value.uid);
    closeModal();
  } catch (error) {
    console.error('Error saving part:', error);

    alert('Error saving part. Please try again.');
  }
};

const deletePart = async (id) => {
  if (!confirm('Are you sure you want to delete this part?')) return;

  if (!user.value) return;

  try {
    await deleteDoc(doc(db, 'users', user.value.uid, 'inventory', id));
    await loadInventory(user.value.uid);
  } catch (error) {
    console.error('Error deleting part:', error);
    alert('Error deleting part. Please try again.');
  }
};


// Initialize
onMounted(() => {
  initializeInventory();
});
</script>
