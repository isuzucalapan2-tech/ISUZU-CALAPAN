<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-white">
    <Loaders />
  </div>

  <div v-else :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col font-sans relative overflow-hidden">
    
    <div class="absolute top-0 left-0 w-full z-0 opacity-10 pointer-events-none">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 15 H280 L330 45 H500" stroke="#cc0000" stroke-width="2" />
      </svg>
    </div>

    <header class="relative z-10 px-8 py-6 flex justify-between items-center backdrop-blur-none">
      <div class="flex items-center gap-4">
        <div class="bg-red-600 p-2 rounded-lg">
          <ArrowDownCircle class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-black isuzu-font uppercase tracking-widest text-neutral-800">
            Transaction <span class="text-red-600">IN</span>
          </h1>
          <p class="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Incoming Stock & Reception Ledger</p>
        </div>
      </div>

      <div class="hidden md:flex items-center gap-6">
        <div class="text-right border-r pr-6 border-gray-300">
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Database Status</p>
          <p class="text-xs font-black text-green-600 uppercase flex items-center justify-end gap-1">
            <Database class="w-3 h-3" /> Synchronized
          </p>
        </div>
        <button @click="openTransactionInModal" class="group bg-neutral-800 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all duration-300 shadow-lg flex items-center gap-2">
          <Plus class="w-4 h-4" /> Add New Record
        </button>
      </div>
    </header>

    <main class="flex-1 relative z-10 overflow-auto p-6 lg:p-6">
      <div class="max-w-[1800px] mx-auto space-y-6">
        
        <div class="bg-white rounded-2xl p-6 border border-neutral-300 space-y-2">
          <div class="flex flex-col xl:flex-row gap-6">
            <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="relative">
                <Search class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input v-model="searchQuery" type="text" placeholder="Search" :class="inputClass" class="w-full pl-12 pr-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-red-500 border transition-all" />
              </div>

              <select v-model="selectedCategory" :class="inputClass" class="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none border focus:ring-2 focus:ring-red-500">
                <option value="">ALL CATEGORIES</option>
                <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>

              <select v-model="selectedStatus" :class="inputClass" class="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none border focus:ring-2 focus:ring-red-500">
                <option value="">ALL STATUSES</option>
                <option v-for="status in availableStatuses" :key="status" :value="status">{{ status }}</option>
              </select>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <div class="relative export-menu-container">
                <button @click="toggleExportMenu" class="flex items-center gap-2 bg-neutral-100 text-neutral-700 px-5 py-3 rounded-xl font-black text-[10px] uppercase border border-neutral-400 tracking-widest hover:bg-neutral-200 transition-all">
                  <FileDown class="w-4 h-4" /> Export <ChevronDown class="w-3 h-3" />
                </button>
                <div v-if="showExportMenu" class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2">
                  <button @click="exportFilteredData" class="w-full text-left px-4 py-2 text-[10px] font-bold uppercase hover:bg-gray-50">Filtered Data</button>
                  <button @click="exportAllData" class="w-full text-left px-4 py-2 text-[10px] font-bold uppercase hover:bg-gray-50 border-t">All Data</button>
                </div>
              </div>

              <div class="relative print-menu-container">
                <button @click="togglePrintMenu" class="flex items-center gap-2 bg-neutral-100 text-neutral-700 px-5 py-3 rounded-xl font-black text-[10px] uppercase border border-neutral-400 tracking-widest hover:bg-neutral-200 transition-all">
                  <Printer class="w-4 h-4" /> Print <ChevronDown class="w-3 h-3" />
                </button>
                <div v-if="showPrintMenu" class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2">
                  <button @click="printFilteredData" class="w-full text-left px-4 py-2 text-[10px] font-bold uppercase hover:bg-gray-50">Print Filtered</button>
                  <button @click="printAllData" class="w-full text-left px-4 py-2 text-[10px] font-bold uppercase hover:bg-gray-50 border-t">Print All</button>
                </div>
              </div>

              <button @click="showImportModal = true" class="flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-3 rounded-xl font-black text-[10px] uppercase border border-blue-400 tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                <Upload class="w-4 h-4" /> Import Excel
              </button>
            </div>
          </div>

          <div class="pt-4 border-t border-dashed border-gray-200 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
             <div class="space-y-1">
                <label class="text-[9px] font-black text-gray-400 uppercase ml-1">Date From</label>
                <input v-model="startDate" type="date" :class="inputClass" class="w-full px-3 py-2 rounded-lg text-[10px] border" />
             </div>
             <div class="space-y-1">
                <label class="text-[9px] font-black text-gray-400 uppercase ml-1">Date To</label>
                <input v-model="endDate" type="date" :class="inputClass" class="w-full px-3 py-2 rounded-lg text-[10px] border" />
             </div>
             <div class="space-y-1">
                <label class="text-[9px] font-black text-gray-400 uppercase ml-1">Min Price</label>
                <input v-model="minPrice" type="number" placeholder="0.00" :class="inputClass" class="w-full px-3 py-2 rounded-lg text-[10px] border" />
             </div>
             <div class="space-y-1">
                <label class="text-[9px] font-black text-gray-400 uppercase ml-1">Max Price</label>
                <input v-model="maxPrice" type="number" placeholder="MAX" :class="inputClass" class="w-full px-3 py-2 rounded-lg text-[10px] border" />
             </div>
             <div v-if="hasActiveFilters" class="lg:col-span-2 flex items-end">
                <button @click="clearAllFilters" class="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase hover:underline mb-2">
                  <XCircle class="w-4 h-4" /> Clear All Filters
                </button>
             </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-neutral-300 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[1600px]">
              <thead>
                <tr class="bg-neutral-800 text-white text-[10px] uppercase tracking-widest isuzu-font">
                  <th class="p-4 font-black">Control No</th>
                  <th class="p-4 font-black">Transaction ID</th>
                  <th class="p-4 font-black">Category</th>
                  <th class="p-4 font-black">Part No.</th>
                  <th class="p-4 font-black">Part Name</th>
                  <th class="p-4 font-black">Model</th>
                  <th class="p-4 font-black text-right">Qty</th>
                  <th class="p-4 font-black text-right">Unit Price</th>
                  <th class="p-4 font-black text-right">Total Price</th>
                  <th class="p-4 font-black">Source</th>
                  <th class="p-4 font-black">Received At</th>
                  <th class="p-4 font-black text-center">Status</th>
                  <th class="p-4 font-black text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in paginatedTransactions" :key="item.id" class="hover:bg-red-50/30 transition-colors text-[11px] font-bold uppercase tracking-tight">
                  <td class="p-4 text-red-600 font-black">{{ item.controlNo }}</td>
                  <td class="p-4 font-mono text-neutral-500">{{ item.transactionID }}</td>
                  <td class="p-4">
                    <span class="px-2 py-1 rounded bg-neutral-100 text-neutral-600">{{ item.category }}</span>
                  </td>
                  <td class="p-4">{{ item.partNo }}</td>
                  <td class="p-4 text-neutral-800">{{ item.partName }}</td>
                  <td class="p-4 text-neutral-500">{{ item.model }}</td>
                  <td class="p-4 text-right font-black">{{ item.quantity.toLocaleString() }}</td>
                  <td class="p-4 text-right">₱{{ item.unitPrice?.toLocaleString() }}</td>
                  <td class="p-4 text-right text-red-600 font-black">₱{{ item.totalPrice?.toLocaleString() }}</td>
                  <td class="p-4 max-w-[150px] truncate" :title="item.source">{{ item.source }}</td>
                  <td class="p-4 text-neutral-400">{{ formatDate(item.receivedAt) }}</td>
                  
                  <td class="p-4 text-center">
                    <span :class="getStatusBadgeClass(item.statusIN)" class="px-2 py-1 rounded text-[9px] font-black uppercase">
                      {{ item.statusIN || 'To Review' }}
                    </span>
                  </td>

                  <td class="p-4">
                    <div class="flex items-center justify-center gap-2">
                      <button 
                        v-if="item.statusIN === 'To Review' || !item.statusIN"
                        @click="processStockIn(item)" 
                        :disabled="processingItems[item.id]"
                        class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-neutral-800 transition-all flex items-center gap-1 disabled:opacity-50"
                      >
                        <Check class="w-3 h-3" /> {{ processingItems[item.id] ? '...' : 'Stock IN' }}
                      </button>

                      <div v-if="item.statusIN === 'Stock IN'" class="flex items-center gap-2">
                        <button 
                          v-if="isStockOutButtonEnabled(item)"
                          @click="processStockOut(item)" 
                          :disabled="processingItems[item.id]"
                          class="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-neutral-800 transition-all flex items-center gap-1"
                        >
                          <X class="w-3 h-3" /> {{ processingItems[item.id] ? '...' : 'Stock OUT' }}
                          <span class="text-[8px] opacity-70">({{ getStockOutExpirationText(item) }})</span>
                        </button>

                        <span v-else class="text-neutral-400 text-[9px] font-black flex items-center gap-1">
                          <Lock class="w-3 h-3" /> EXPIRED
                        </span>
                      </div>

                      <span v-if="item.statusIN === 'Stock OUT'" class="text-red-600 flex items-center gap-1 text-[9px]">
                        <XCircle class="w-4 h-4" /> RETURNED
                      </span>
                    </div>
                  </td>
                </tr>

                <tr v-if="paginatedTransactions.length === 0">
                  <td colspan="13" class="p-20 text-center opacity-30">
                    <div class="flex flex-col items-center">
                      <Database class="w-16 h-16 mb-2" />
                      <p class="font-black isuzu-font uppercase tracking-widest">No transaction records found</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="px-8 py-5 bg-gray-50 flex flex-col md:flex-row items-center justify-between border-t border-gray-200">
             <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, resultCount) }} of {{ resultCount }} Records
             </div>
            
            <div class="flex items-center gap-2">
              <button @click="currentPage = 1" :disabled="currentPage === 1" class="p-2 rounded-lg bg-white border hover:text-red-600 disabled:opacity-30"><ChevronsLeft class="w-4 h-4" /></button>
              <button @click="currentPage--" :disabled="currentPage === 1" class="p-2 rounded-lg bg-white border hover:text-red-600 disabled:opacity-30"><ChevronLeft class="w-4 h-4" /></button>
              
              <div class="flex gap-1 mx-2">
                <button v-for="page in displayedPages" :key="page" @click="currentPage = page" 
                  :class="currentPage === page ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-neutral-600'"
                  class="w-8 h-8 rounded-lg text-xs font-bold transition-all border">
                  {{ page }}
                </button>
              </div>

              <button @click="currentPage++" :disabled="currentPage === totalPages" class="p-2 rounded-lg bg-white border hover:text-red-600 disabled:opacity-30"><ChevronRight class="w-4 h-4" /></button>
              <button @click="currentPage = totalPages" :disabled="currentPage === totalPages" class="p-2 rounded-lg bg-white border hover:text-red-600 disabled:opacity-30"><ChevronsRight class="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Transition name="fade">
      <div v-if="showTransactionInModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" @click="closeTransactionInModal"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-neutral-200">
          <div class="bg-neutral-800 p-6 flex justify-between items-center border-b-4 border-red-600">
            <h2 class="text-white isuzu-font font-black uppercase tracking-widest flex items-center gap-3">
              <Plus class="w-5 h-5 text-red-600" /> Stock In Registration
            </h2>
            <button @click="closeTransactionInModal" class="text-gray-400 hover:text-white transition-colors"><X class="w-6 h-6" /></button>
          </div>

          <div class="p-8 space-y-6">
            <div class="space-y-2 relative inventory-selector">
              <label class="text-[10px] font-black uppercase text-gray-400 ml-1">Search Catalog for Part</label>
              <div class="relative">
                <Search class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input v-model="inventorySearchQuery" type="text" placeholder="TYPE PART NAME..." class="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl text-xs font-bold uppercase focus:ring-2 focus:ring-red-500 outline-none transition-all" />
              </div>

              <div v-if="showInventoryDropdown && inventoryItems.length > 0" class="absolute z-50 w-full mt-2 bg-white border rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                <div v-for="item in inventoryItems" :key="item.controlNo" @click="selectInventoryItem(item)" class="px-4 py-3 hover:bg-red-50 cursor-pointer flex justify-between items-center border-b last:border-0">
                  <div class="flex flex-col">
                    <span class="text-xs font-black uppercase text-neutral-800">{{ item.partName }}</span>
                    <span class="text-[9px] font-bold text-gray-400">PN: {{ item.partNo }} | CAT: {{ item.category }}</span>
                  </div>
                  <span class="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-500">{{ item.controlNo }}</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase text-gray-400">Quantity</label>
                <input v-model.number="transactionInForm.quantity" type="number" class="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold outline-none" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase text-gray-400">Unit Price</label>
                <input v-model.number="transactionInForm.unitPrice" type="number" readonly class="w-full bg-gray-100 border rounded-xl px-4 py-3 text-sm font-bold text-gray-500" />
              </div>
            </div>

            <div class="p-5 bg-green-50 rounded-2xl border border-green-100 flex justify-between items-center">
               <div class="flex items-center gap-3">
                  <CheckCircle class="w-6 h-6 text-green-600" />
                  <div>
                    <p class="text-[10px] font-black text-green-600 uppercase">Calculated Valuation</p>
                    <p class="text-lg font-black text-neutral-800">₱ {{ transactionInForm.totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</p>
                  </div>
               </div>
               <div class="text-right">
                  <p class="text-[10px] font-black text-neutral-400 uppercase">Control Reference</p>
                  <p class="text-xs font-mono font-black text-neutral-600">{{ transactionInForm.controlNo || 'N/A' }}</p>
               </div>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <input v-model="transactionInForm.source" type="text" placeholder="STOCK SOURCE..." class="w-full bg-gray-50 border rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none" />
              <input v-model="transactionInForm.note" type="text" placeholder="ADDITIONAL NOTES..." class="w-full bg-gray-50 border rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none" />
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t">
              <button @click="closeTransactionInModal" class="px-8 py-3 text-[10px] font-black uppercase text-gray-500 hover:bg-gray-100 rounded-full transition-all">Discard</button>
              <button @click="saveTransactionIn" class="bg-red-600 text-white px-12 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl">
                Register Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { db } from '../../Firebase/Firebase';
import { collection, getDocs, doc, setDoc, getDoc, collectionGroup, updateDoc } from 'firebase/firestore';
import { 
  getNextControlNumber, 
  loadAllInventoryItems, 
  getInventoryItemByPartNo, 
  getControlNoByPartNo,
  generateTransactionID,
  searchInventoryItems 
} from '../../composables/useControlNumber';
import { useToast } from '../../composables/useToast';
import { useExcelExport } from '../../composables/useExcelExport';
import Loaders from '../../components/Loaders.vue';

import { 
  Plus, 
  ArrowDownCircle, 
  Search, 
  Check, 
  X, 
  CheckCircle, 
  XCircle, 
  Lock,
  Upload,
  FileDown,
  ChevronDown,
  Filter,
  Database,
  Printer,
  FileSpreadsheet,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-vue-next';


// Toast notification
const toast = useToast();
const { exportTransactionIn, parseTransactionInExcelFile, processTransactionInImportItems } = useExcelExport();


// Loading state
const isLoading = ref(true);

// Transaction data
const transactionInItems = ref([]);

// Search and filter states
const searchQuery = ref('');
const debouncedSearchQuery = ref('');
const selectedCategory = ref('');
const selectedStatus = ref('');
const minQty = ref('');
const maxQty = ref('');
const minPrice = ref('');
const maxPrice = ref('');
const startDate = ref('');
const endDate = ref('');

// Pagination states
const currentPage = ref(1);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [10, 25, 50, 100];

// Export/Print/Import menu states
const showExportMenu = ref(false);
const showPrintMenu = ref(false);
const showImportModal = ref(false);
const importFile = ref(null);
const importPreview = ref({ validItems: [], invalidItems: [] });
const isImporting = ref(false);
const isPrinting = ref(false);
const fileInput = ref(null);


// Processing state for individual items
const processingItems = ref({});

// Transaction modal state
const showTransactionInModal = ref(false);

// Transaction form
const transactionInForm = ref({
  partNo: '',
  partName: '',
  quantity: 0,
  unitPrice: 0,
  totalPrice: 0,
  source: '',
  note: '',
  controlNo: '',
  transactionID: ''
});

// Collection path constants - Updated to match requirements
const TRANSACTION_COLLECTION = 'Transactions';
const TRANSACTION_IN_SUBCOLLECTION = 'Transaction_IN';

// Inventory items for selector
const inventoryItems = ref([]);
const inventorySearchQuery = ref('');
const showInventoryDropdown = ref(false);
const selectedInventoryItem = ref(null);

// Debounce timer for search
let searchDebounceTimer = null;


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

const borderClass = computed(() =>
  isDarkMode.value ? 'border-gray-700' : 'border-gray-200'
);

// Debounce utility
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
watch([selectedCategory, selectedStatus, debouncedSearchQuery, minQty, maxQty, minPrice, maxPrice, startDate, endDate], () => {
  currentPage.value = 1;
});


// Status badge class helper
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Stock IN':
      return 'bg-green-100 text-green-800';
    case 'Stock OUT':
      return 'bg-red-100 text-red-800';
    case 'To Review':
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

// Available categories from transaction data
const availableCategories = computed(() => {
  const categories = new Set(transactionInItems.value.map(item => item.category).filter(Boolean));
  return Array.from(categories).sort();
});

// Available statuses
const availableStatuses = ['To Review', 'Stock IN', 'Stock OUT'];

// Filtered transactions
const filteredTransactions = computed(() => {
  let filtered = [...transactionInItems.value];

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(item => item.category === selectedCategory.value);
  }

  // Status filter
  if (selectedStatus.value) {
    filtered = filtered.filter(item => (item.statusIN || 'To Review') === selectedStatus.value);
  }

  // Text search (debounced)
  if (debouncedSearchQuery.value) {
    const query = debouncedSearchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(item =>
      item.controlNo?.toLowerCase().includes(query) ||
      item.transactionID?.toLowerCase().includes(query) ||
      item.partNo?.toLowerCase().includes(query) ||
      item.partName?.toLowerCase().includes(query) ||
      item.source?.toLowerCase().includes(query) ||
      item.model?.toLowerCase().includes(query)
    );
  }


  // Quantity range filter
  const minQ = parseInt(minQty.value);
  const maxQ = parseInt(maxQty.value);
  if (!isNaN(minQ)) {
    filtered = filtered.filter(item => (item.quantity || 0) >= minQ);
  }
  if (!isNaN(maxQ)) {
    filtered = filtered.filter(item => (item.quantity || 0) <= maxQ);
  }

  // Price range filter (totalPrice)
  const minP = parseFloat(minPrice.value);
  const maxP = parseFloat(maxPrice.value);
  if (!isNaN(minP)) {
    filtered = filtered.filter(item => (item.totalPrice || 0) >= minP);
  }
  if (!isNaN(maxP)) {
    filtered = filtered.filter(item => (item.totalPrice || 0) <= maxP);
  }

  // Date range filter
  if (startDate.value) {
    const start = new Date(startDate.value);
    start.setHours(0, 0, 0, 0);
    filtered = filtered.filter(item => {
      if (!item.receivedAt) return false;
      const itemDate = item.receivedAt.toDate ? item.receivedAt.toDate() : new Date(item.receivedAt);
      return itemDate >= start;
    });
  }
  if (endDate.value) {
    const end = new Date(endDate.value);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter(item => {
      if (!item.receivedAt) return false;
      const itemDate = item.receivedAt.toDate ? item.receivedAt.toDate() : new Date(item.receivedAt);
      return itemDate <= end;
    });
  }

  return filtered.sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateB - dateA;
  });
});

// Result count
const resultCount = computed(() => filteredTransactions.value.length);

// Paginated transactions
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTransactions.value.slice(start, end);
});

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage.value) || 1;
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
  selectedCategory.value ||
  selectedStatus.value ||
  searchQuery.value ||
  minQty.value ||
  maxQty.value ||
  minPrice.value ||
  maxPrice.value ||
  startDate.value ||
  endDate.value
);

// Clear all filters
const clearAllFilters = () => {
  searchQuery.value = '';
  debouncedSearchQuery.value = '';
  selectedCategory.value = '';
  selectedStatus.value = '';
  minQty.value = '';
  maxQty.value = '';
  minPrice.value = '';
  maxPrice.value = '';
  startDate.value = '';
  endDate.value = '';
};


// Check if Stock OUT button is enabled (within 3 days of creation)
const isStockOutButtonEnabled = (transaction) => {
  if (!transaction.createdAt) return false;
  
  const createdDate = transaction.createdAt.toDate ? transaction.createdAt.toDate() : new Date(transaction.createdAt);
  const now = new Date();
  const diffTime = now - createdDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24); // Convert to days
  
  return diffDays <= 3; // Button enabled only within 3 days
};

// Get Stock OUT expiration text
const getStockOutExpirationText = (transaction) => {
  if (!transaction.createdAt) return '';
  
  const createdDate = transaction.createdAt.toDate ? transaction.createdAt.toDate() : new Date(transaction.createdAt);
  const now = new Date();
  const diffTime = now - createdDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const remainingDays = Math.max(0, 3 - Math.floor(diffDays));
  
  if (remainingDays === 0) {
    const remainingHours = Math.max(0, 72 - Math.floor(diffTime / (1000 * 60 * 60)));
    if (remainingHours > 0) {
      return `${remainingHours}h left`;
    }
    return 'Expired';
  }
  
  return `${remainingDays}d left`;
};


// Format date helper
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleString();
  }
  return new Date(timestamp).toLocaleString();
};

// Load inventory items for selector
const loadInventoryItems = async () => {
  try {
    inventoryItems.value = await loadAllInventoryItems();
    console.log('Loaded inventory items:', inventoryItems.value.length);
  } catch (error) {
    console.error('Error loading inventory items:', error);
  }
};

// Search inventory items with debounce
const debouncedSearchInventory = (query) => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(async () => {
    if (query.trim()) {
      const results = await searchInventoryItems(query);
      inventoryItems.value = results;
      showInventoryDropdown.value = true;
    } else {
      await loadInventoryItems();
      showInventoryDropdown.value = false;
    }
  }, 300);
};

// Watch inventory search query
watch(inventorySearchQuery, (newValue) => {
  debouncedSearchInventory(newValue);
});

// Select inventory item
const selectInventoryItem = (item) => {
  selectedInventoryItem.value = item;
  transactionInForm.value.partNo = item.partNo || '';
  transactionInForm.value.partName = item.partName || '';
  transactionInForm.value.unitPrice = item.unitPrice || 0;
  transactionInForm.value.controlNo = item.controlNo || '';
  inventorySearchQuery.value = `${item.partNo} - ${item.partName}`;
  showInventoryDropdown.value = false;
  
  calculateTotalPrice();
};


// Calculate total price
const calculateTotalPrice = () => {
  const qty = parseInt(transactionInForm.value.quantity) || 0;
  const price = parseFloat(transactionInForm.value.unitPrice) || 0;
  transactionInForm.value.totalPrice = qty * price;
};

// Watch quantity changes to auto-calculate total
watch(() => transactionInForm.value.quantity, () => {
  calculateTotalPrice();
});

// Load Transaction IN data
const loadTransactionIn = async () => {
  try {
    transactionInItems.value = [];
    
    console.log('Loading Transaction IN data...');
    
    const transactionInQuery = collectionGroup(db, TRANSACTION_IN_SUBCOLLECTION);
    const snapshot = await getDocs(transactionInQuery);
    
    console.log('Total Transaction_IN documents found:', snapshot.docs.length);
    
    for (const transDoc of snapshot.docs) {
      const transData = transDoc.data();
      
      const pathParts = transDoc.ref.path.split('/');
      const collectionName = pathParts.length >= 1 ? pathParts[0] : '';
      const partNo = pathParts.length >= 2 ? pathParts[1] : 'Unknown';
      
      if (collectionName !== TRANSACTION_COLLECTION) {
        console.log('Skipping document from old collection:', transDoc.ref.path);
        continue;
      }
      
      transactionInItems.value.push({
        id: transDoc.id,
        transactionID: transData.transactionID || '',
        controlNo: transData.controlNo || '',
        category: transData.category || '',
        partNo: transData.partNo || partNo,
        partName: transData.partName || '',
        model: transData.model || '',
        quantity: transData.quantity || 0,
        unitPrice: transData.unitPrice || 0,
        totalPrice: transData.totalPrice || 0,
        source: transData.source || '',
        note: transData.note || '',
        statusIN: transData.statusIN || 'To Review',
        receivedAt: transData.receivedAt || null,
        createdAt: transData.createdAt || null
      });
    }
    
    transactionInItems.value.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });
    
    console.log('Total Transaction IN items loaded:', transactionInItems.value.length);
  } catch (error) {
    console.error('Error loading transaction in:', error);
  }
};

// Validate transaction against current inventory
const validateTransactionAgainstInventory = async (transaction) => {
  try {
    // Get current inventory item by partNo
    const currentInventoryItem = await getInventoryItemByPartNo(transaction.partNo);
    
    if (!currentInventoryItem) {
      return {
        valid: false,
        message: `Inventory item with Part No. ${transaction.partNo} not found`
      };
    }
    
    // Validate each field
    const mismatches = [];
    
    if (currentInventoryItem.controlNo !== transaction.controlNo) {
      mismatches.push(`Control No: expected "${currentInventoryItem.controlNo}", found "${transaction.controlNo}"`);
    }
    
    if (currentInventoryItem.category?.toLowerCase() !== transaction.category?.toLowerCase()) {
      mismatches.push(`Category: expected "${currentInventoryItem.category}", found "${transaction.category}"`);
    }
    
    if (currentInventoryItem.partNo?.toUpperCase() !== transaction.partNo?.toUpperCase()) {
      mismatches.push(`Part No: expected "${currentInventoryItem.partNo}", found "${transaction.partNo}"`);
    }
    
    if (currentInventoryItem.partName?.toUpperCase() !== transaction.partName?.toUpperCase()) {
      mismatches.push(`Part Name: expected "${currentInventoryItem.partName}", found "${transaction.partName}"`);
    }
    
    if (currentInventoryItem.model?.toUpperCase() !== transaction.model?.toUpperCase()) {
      mismatches.push(`Model: expected "${currentInventoryItem.model}", found "${transaction.model}"`);
    }
    
    if (parseFloat(currentInventoryItem.unitPrice) !== parseFloat(transaction.unitPrice)) {
      mismatches.push(`Unit Price: expected "${currentInventoryItem.unitPrice}", found "${transaction.unitPrice}"`);
    }
    
    if (mismatches.length > 0) {
      return {
        valid: false,
        message: 'Data mismatch with current inventory:\n• ' + mismatches.join('\n• '),
        inventoryItem: currentInventoryItem
      };
    }
    
    return {
      valid: true,
      inventoryItem: currentInventoryItem
    };
  } catch (error) {
    console.error('Error validating transaction:', error);
    return {
      valid: false,
      message: 'Error validating against inventory: ' + error.message
    };
  }
};

// Update inventory quantity and total value
const updateInventoryStock = async (inventoryItem, quantityToAdd) => {
  try {
    const docRef = doc(db, "Inventory", `isuzu11&calapan16&inventory2019&${inventoryItem.category.toLowerCase()}`);
    
    // Get current data
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Inventory document not found');
    }
    
    const currentData = docSnap.data();
    const currentItemData = currentData[inventoryItem.controlNo];
    
    if (!currentItemData) {
      throw new Error('Inventory item not found in document');
    }
    
    // Calculate new values
    const currentQty = parseInt(currentItemData.quantity) || 0;
    const newQty = currentQty + parseInt(quantityToAdd);
    const unitPrice = parseFloat(currentItemData.unitPrice) || 0;
    const newTotalValue = newQty * unitPrice;
    
    // Update the specific control number map field
    const updateData = {};
    updateData[`${inventoryItem.controlNo}.quantity`] = newQty;
    updateData[`${inventoryItem.controlNo}.totalValue`] = newTotalValue;
    updateData[`${inventoryItem.controlNo}.updatedAt`] = new Date();
    
    await updateDoc(docRef, updateData);
    
    return {
      success: true,
      previousQty: currentQty,
      newQty: newQty,
      addedQty: quantityToAdd
    };
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

// Process Stock IN
const processStockIn = async (transaction) => {
  // Set processing state
  processingItems.value[transaction.id] = true;
  
  try {
    toast.info('Validating transaction against inventory...', 'Validation');
    
    // Validate transaction
    const validation = await validateTransactionAgainstInventory(transaction);
    
    if (!validation.valid) {
      toast.error(validation.message, 'Validation Failed');
      processingItems.value[transaction.id] = false;
      return;
    }
    
    toast.info('Updating inventory stock...', 'Processing');
    
    // Update inventory
    const updateResult = await updateInventoryStock(validation.inventoryItem, transaction.quantity);
    
    // Update transaction status
    const pathParts = transaction.id.split('&');
    const partNo = pathParts[1] || transaction.partNo;
    const cleanPartNo = partNo.replace(/[\/\.\#\$\[\]\&]/g, '-');
    
    const transactionRef = doc(db, TRANSACTION_COLLECTION, cleanPartNo, TRANSACTION_IN_SUBCOLLECTION, transaction.id);
    await updateDoc(transactionRef, {
      statusIN: 'Stock IN',
      processedAt: new Date(),
      previousInventoryQty: updateResult.previousQty,
      newInventoryQty: updateResult.newQty
    });
    
    toast.success(
      `Stock IN successful! Added ${updateResult.addedQty} units. Inventory updated from ${updateResult.previousQty} to ${updateResult.newQty}.`,
      'Stock IN Complete'
    );
    
    // Refresh the list
    await loadTransactionIn();
  } catch (error) {
    console.error('Error processing Stock IN:', error);
    toast.error('Failed to process Stock IN: ' + error.message, 'Error');
  } finally {
    processingItems.value[transaction.id] = false;
  }
};

// Process Stock OUT (return/subtract from inventory)
const processStockOut = async (transaction) => {
  // Set processing state
  processingItems.value[transaction.id] = true;
  
  try {
    // Check if within 3-day window
    if (!isStockOutButtonEnabled(transaction)) {
      toast.error('Stock OUT button has expired. Transaction is locked after 3 days.', 'Transaction Locked');
      processingItems.value[transaction.id] = false;
      return;
    }
    
    toast.info('Validating transaction against inventory...', 'Validation');
    
    // Validate transaction against current inventory
    const validation = await validateTransactionAgainstInventory(transaction);
    
    if (!validation.valid) {
      toast.error(validation.message, 'Validation Failed');
      processingItems.value[transaction.id] = false;
      return;
    }
    
    toast.info('Updating inventory stock (subtracting quantity)...', 'Processing');
    
    // Update inventory by SUBTRACTING the quantity (negative value)
    const updateResult = await updateInventoryStock(validation.inventoryItem, -transaction.quantity);
    
    // Update transaction status to Stock OUT
    const pathParts = transaction.id.split('&');
    const partNo = pathParts[1] || transaction.partNo;
    const cleanPartNo = partNo.replace(/[\/\.\#\$\[\]\&]/g, '-');
    
    const transactionRef = doc(db, TRANSACTION_COLLECTION, cleanPartNo, TRANSACTION_IN_SUBCOLLECTION, transaction.id);
    await updateDoc(transactionRef, {
      statusIN: 'Stock OUT',
      processedAt: new Date(),
      previousInventoryQty: updateResult.previousQty,
      newInventoryQty: updateResult.newQty
    });
    
    toast.success(
      `Stock OUT successful! Removed ${transaction.quantity} units. Inventory updated from ${updateResult.previousQty} to ${updateResult.newQty}.`,
      'Stock OUT Complete'
    );
    
    // Refresh the list
    await loadTransactionIn();
  } catch (error) {
    console.error('Error processing Stock OUT:', error);
    toast.error('Failed to process Stock OUT: ' + error.message, 'Error');
  } finally {
    processingItems.value[transaction.id] = false;
  }
};

// Open Transaction IN modal
const openTransactionInModal = async () => {
  transactionInForm.value = {
    partNo: '',
    partName: '',
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0,
    source: '',
    note: '',
    controlNo: '',
    transactionID: ''
  };
  inventorySearchQuery.value = '';
  selectedInventoryItem.value = null;
  showInventoryDropdown.value = false;
  
  await loadInventoryItems();
  showTransactionInModal.value = true;
};


// Close Transaction IN modal
const closeTransactionInModal = () => {
  showTransactionInModal.value = false;
};

// Save Transaction IN
const saveTransactionIn = async () => {
  try {
    if (!transactionInForm.value.partNo) {
      alert('Please select an inventory item');
      return;
    }
    
    if (!transactionInForm.value.quantity || transactionInForm.value.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const dateTimeStr = `${dateStr}_${timeStr}`;
    
    const partNo = transactionInForm.value.partNo || 'UNKNOWN';
    const cleanPartNo = partNo.replace(/[\/\.\#\$\[\]\&]/g, '-');
    
    const documentId = `TransactionIN&${cleanPartNo}&${dateTimeStr}`;
    const transactionID = generateTransactionID();
    
    const transactionData = {
      transactionID: transactionID,
      partNo: transactionInForm.value.partNo,
      partName: transactionInForm.value.partName,
      controlNo: transactionInForm.value.controlNo,
      category: selectedInventoryItem.value?.category || '',
      model: selectedInventoryItem.value?.model || '',
      quantity: parseInt(transactionInForm.value.quantity) || 0,
      unitPrice: parseFloat(transactionInForm.value.unitPrice) || 0,
      totalPrice: parseFloat(transactionInForm.value.totalPrice) || 0,
      source: transactionInForm.value.source || '',
      note: transactionInForm.value.note || '',
      statusIN: 'To Review', // Default status
      receivedAt: now,
      createdAt: now
    };
    
    await setDoc(
      doc(db, TRANSACTION_COLLECTION, cleanPartNo, TRANSACTION_IN_SUBCOLLECTION, documentId),
      transactionData
    );
    
    toast.success('Transaction created successfully! Status: To Review', 'Transaction Created');
    
    await loadTransactionIn();
    closeTransactionInModal();
  } catch (error) {
    console.error('Error saving transaction in:', error);
    toast.error('Failed to save transaction. Please try again.', 'Error');
  }
};

// Watch for data changes
watch(transactionInItems, (newVal) => {
  console.log('transactionInItems updated:', newVal.length, 'items');
}, { deep: true, immediate: true });

// Initialize
onMounted(async () => {
  await nextTick();
  console.log('Transaction component mounted');
  await loadTransactionIn();
  console.log('Transaction data loaded, items count:', transactionInItems.value.length);
  isLoading.value = false;
  document.addEventListener('click', closeExportMenu);
  document.addEventListener('click', closePrintMenu);
  document.addEventListener('click', closeDropdown);
});

// Close dropdown when clicking outside
const closeDropdown = (event) => {
  if (!event.target.closest('.inventory-selector')) {
    showInventoryDropdown.value = false;
  }
};

const closeExportMenu = (event) => {
  if (!event.target.closest('.export-menu-container')) {
    showExportMenu.value = false;
  }
};

const closePrintMenu = (event) => {
  if (!event.target.closest('.print-menu-container')) {
    showPrintMenu.value = false;
  }
};

// Toggle export menu
const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value;
};

// Toggle print menu
const togglePrintMenu = () => {
  showPrintMenu.value = !showPrintMenu.value;
};

// Export functions
const exportFilteredData = () => {
  if (filteredTransactions.value.length === 0) {
    toast.warning('No filtered data to export', 'Export');
    return;
  }
  
  showExportMenu.value = false;
  exportTransactionIn(filteredTransactions.value, 'TransactionIn_Filtered_Export');
  toast.success(`Exported ${filteredTransactions.value.length} filtered items successfully!`, 'Export Complete');
};

const exportAllData = () => {
  if (transactionInItems.value.length === 0) {
    toast.warning('No data to export', 'Export');
    return;
  }
  
  showExportMenu.value = false;
  exportTransactionIn(transactionInItems.value, 'TransactionIn_All_Export');
  toast.success(`Exported all ${transactionInItems.value.length} items successfully!`, 'Export Complete');
};

// Print functions
const printFilteredData = () => {
  if (filteredTransactions.value.length === 0) {
    toast.warning('No filtered data to print', 'Print');
    return;
  }
  
  showPrintMenu.value = false;
  printTransactions(filteredTransactions.value, 'Filtered Transaction In Report');
};

const printAllData = () => {
  if (transactionInItems.value.length === 0) {
    toast.warning('No data to print', 'Print');
    return;
  }
  
  showPrintMenu.value = false;
  printTransactions(transactionInItems.value, 'Complete Transaction In Report');
};

const printTransactions = (data, title) => {
  isPrinting.value = true;
  
  // Calculate totals
  const totalItems = data.length;
  const totalQuantity = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalValue = data.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  
  // Get current date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PH', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('en-PH', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Create print window content
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - ISUZU Calapan</title>
      <style>
        @page {
          size: landscape;
          margin: 10mm;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 9pt;
          line-height: 1.3;
          color: #000;
          background: #fff;
        }
        .header {
          text-align: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #16a34a;
        }
        .company-name {
          font-size: 16pt;
          font-weight: bold;
          color: #16a34a;
          margin-bottom: 3px;
        }
        .company-address {
          font-size: 8pt;
          color: #666;
          margin-bottom: 6px;
        }
        .report-title {
          font-size: 12pt;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .report-meta {
          font-size: 8pt;
          color: #666;
          margin-bottom: 8px;
        }
        .summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding: 8px;
          background: #f0fdf4;
          border-radius: 4px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-label {
          font-size: 7pt;
          color: #666;
          text-transform: uppercase;
        }
        .summary-value {
          font-size: 12pt;
          font-weight: bold;
          color: #16a34a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          font-size: 8pt;
        }
        th {
          background: #16a34a;
          color: white;
          padding: 6px 4px;
          text-align: left;
          font-size: 8pt;
          font-weight: bold;
          border: 1px solid #16a34a;
        }
        td {
          padding: 4px;
          border: 1px solid #d1d5db;
          vertical-align: top;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .status-badge {
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 7pt;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-to-review {
          background: #fef3c7;
          color: #92400e;
        }
        .status-stock-in {
          background: #d1fae5;
          color: #065f46;
        }
        .status-stock-out {
          background: #fee2e2;
          color: #991b1b;
        }
        .total-value {
          color: #059669;
          font-weight: bold;
        }
        .footer {
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid #d1d5db;
          font-size: 7pt;
          color: #666;
          text-align: center;
        }
        @media print {
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">ISUZU CALAPAN</div>
        <div class="company-address">Transaction In Management System</div>
        <div class="report-title">${title}</div>
        <div class="report-meta">Generated on ${dateStr} at ${timeStr}</div>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Total Items</div>
          <div class="summary-value">${totalItems.toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Quantity</div>
          <div class="summary-value">${totalQuantity.toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Value</div>
          <div class="summary-value">₱${totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Control No.</th>
            <th>Trans. ID</th>
            <th>Category</th>
            <th>Part No.</th>
            <th>Part Name</th>
            <th>Model</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Total Price</th>
            <th>Source</th>
            <th>Status</th>
            <th>Received At</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => {
            const statusClass = item.statusIN === 'Stock IN' ? 'status-stock-in' : 
                               item.statusIN === 'Stock OUT' ? 'status-stock-out' : 'status-to-review';
            const receivedDate = item.receivedAt ? 
              (item.receivedAt.toDate ? item.receivedAt.toDate().toLocaleDateString() : new Date(item.receivedAt).toLocaleDateString()) 
              : '-';
            return `
            <tr>
              <td>${item.controlNo || '-'}</td>
              <td>${item.transactionID || '-'}</td>
              <td>${(item.category || '-').toUpperCase()}</td>
              <td>${(item.partNo || '-').toUpperCase()}</td>
              <td>${(item.partName || '-').toUpperCase()}</td>
              <td>${(item.model || '-').toUpperCase()}</td>
              <td class="text-center">${item.quantity || 0}</td>
              <td class="text-right">₱${(item.unitPrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td class="text-right total-value">₱${(item.totalPrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>${(item.source || '-').toUpperCase()}</td>
              <td><span class="status-badge ${statusClass}">${item.statusIN || 'To Review'}</span></td>
              <td>${receivedDate}</td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>ISUZU Calapan Transaction In Management System &copy; ${now.getFullYear()}</p>
        <p>This is a computer-generated report. No signature required.</p>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 500);
        };
      <\/script>
    </body>
    </html>
  `;
  
  // Open print window
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
  } else {
    toast.error('Unable to open print window. Please check your popup blocker settings.', 'Print Error');
  }
  
  isPrinting.value = false;
};

// Import functions
const openImportModal = () => {
  showImportModal.value = true;
  resetImport();
};

const closeImportModal = () => {
  showImportModal.value = false;
  resetImport();
};

const resetImport = () => {
  importFile.value = null;
  importPreview.value = { validItems: [], invalidItems: [] };
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
  if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    toast.error('Please select a valid Excel file (.xlsx or .xls)', 'Invalid File');
    return;
  }
  
  try {
    toast.info('Reading file...', 'Processing');
    const items = await parseTransactionInExcelFile(file);
    
    if (items.length === 0) {
      toast.warning('No data found in file', 'Empty File');
      return;
    }
    
    // Process and validate items
    const { validItems, invalidItems } = processTransactionInImportItems(items);
    importPreview.value = { validItems, invalidItems };
    
    if (validItems.length === 0) {
      toast.error(`All ${items.length} items have validation errors`, 'Validation Failed');
    } else if (invalidItems.length > 0) {
      toast.warning(`${validItems.length} valid, ${invalidItems.length} invalid items found`, 'Partially Valid');
    } else {
      toast.success(`All ${validItems.length} items are valid and ready to import`, 'Validation Passed');
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    toast.error('Failed to read Excel file. Please check the format.', 'Parse Error');
  }
};

const confirmImport = async () => {
  const validItems = importPreview.value.validItems;
  if (validItems.length === 0) return;
  
  isImporting.value = true;
  let successCount = 0;
  let errorCount = 0;
  
  try {
    toast.info(`Importing ${validItems.length} items...`, 'Importing');
    
    for (const item of validItems) {
      try {
        // Get inventory item by part number to get control number and other details
        const inventoryItem = await getInventoryItemByPartNo(item.partNo);
        
        if (!inventoryItem) {
          console.warn(`Inventory item not found for part number: ${item.partNo}`);
          errorCount++;
          continue;
        }
        
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        const dateTimeStr = `${dateStr}_${timeStr}`;
        
        const cleanPartNo = item.partNo.replace(/[\/\.\#\$\[\]\&]/g, '-');
        const documentId = `TransactionIN&${cleanPartNo}&${dateTimeStr}`;
        const transactionID = generateTransactionID();
        
        const transactionData = {
          transactionID: transactionID,
          partNo: item.partNo.toUpperCase(),
          partName: (item.partName || inventoryItem.partName || '').toUpperCase(),
          controlNo: inventoryItem.controlNo || '',
          category: item.category.toLowerCase(),
          model: (item.model || inventoryItem.model || '').toUpperCase(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          source: item.source.toUpperCase(),
          note: (item.note || '').toUpperCase(),
          statusIN: 'To Review',
          receivedAt: now,
          createdAt: now
        };
        
        await setDoc(
          doc(db, TRANSACTION_COLLECTION, cleanPartNo, TRANSACTION_IN_SUBCOLLECTION, documentId),
          transactionData
        );
        
        successCount++;
      } catch (err) {
        console.error('Error importing item:', err);
        errorCount++;
      }
    }
    
    // Reload transactions
    await loadTransactionIn();
    
    // Show result
    if (errorCount === 0) {
      toast.success(`Successfully imported all ${successCount} items!`, 'Import Complete');
    } else {
      toast.warning(`Imported ${successCount} items, ${errorCount} failed`, 'Import Partial');
    }
    
    closeImportModal();
  } catch (error) {
    console.error('Import error:', error);
    toast.error('Import failed. Please try again.', 'Import Error');
  } finally {
    isImporting.value = false;
  }
};

</script>

<style scoped>
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>
