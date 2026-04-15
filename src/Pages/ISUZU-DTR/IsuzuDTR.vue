<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-white">
    <Loaders />
  </div>

  <div v-else :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col font-sans relative overflow-hidden">
    <!-- Background Decoration -->
    <div class="absolute top-0 left-0 w-full z-0 opacity-10 pointer-events-none">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 15 H280 L330 45 H500" stroke="#cc0000" stroke-width="2" />
      </svg>
    </div>

    <!-- Header -->
    <header class="relative z-10 px-8 py-6 flex justify-between items-center backdrop-blur-none">
      <div class="flex items-center gap-4">
        <div class="bg-blue-600 p-2 rounded-lg">
          <Clock class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-black isuzu-font uppercase tracking-widest text-neutral-800">
            DTR <span class="text-blue-600">Management</span>
          </h1>
          <p class="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Daily Time Record & Attendance System</p>
        </div>
      </div>

      <div class="hidden md:flex items-center gap-6">
        <div class="text-right border-r pr-6 border-gray-300">
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Records Status</p>
          <p class="text-xs font-black text-blue-600 uppercase flex items-center justify-end gap-1">
            <Database class="w-3 h-3" /> {{ dtrData.length }} Entries
          </p>
        </div>
        <div class="flex gap-2">
          <button @click="showUploadModal = true" class="group bg-blue-600 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all duration-300 shadow-lg flex items-center gap-2">
            <Upload class="w-4 h-4" /> Upload Excel
          </button>
          <button @click="downloadTemplate" class="group bg-neutral-100 text-neutral-700 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all duration-300 border border-neutral-300 flex items-center gap-2">
            <Download class="w-4 h-4" /> Template
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 relative z-10 overflow-auto p-6 lg:p-6">
      <div class="max-w-450 mx-auto space-y-6">

        <!-- Filters Card -->
        <div class="bg-white rounded-2xl p-6 border border-neutral-300 space-y-4">
          <div class="flex flex-col xl:flex-row gap-6">
            <!-- Search and Filters -->
            <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="relative">
                <Search class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input v-model="searchQuery" type="text" placeholder="Search employee..." :class="inputClass" class="w-full pl-12 pr-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 border transition-all" />
              </div>

              <select v-model="selectedDepartment" :class="inputClass" class="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none border focus:ring-2 focus:ring-blue-500">
                <option value="">ALL DEPARTMENTS</option>
                <option v-for="dept in availableDepartments" :key="dept" :value="dept">{{ dept }}</option>
              </select>

              <select v-model="selectedStatus" :class="inputClass" class="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none border focus:ring-2 focus:ring-blue-500">
                <option value="">ALL STATUS</option>
                <option value="valid">Valid Only</option>
                <option value="invalid">Invalid Only</option>
                <option value="late">Late</option>
                <option value="undertime">Undertime</option>
              </select>

              <select v-model="itemsPerPage" :class="inputClass" class="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none border focus:ring-2 focus:ring-blue-500">
                <option v-for="opt in [10, 25, 50, 100]" :key="opt" :value="opt">{{ opt }} / Page</option>
              </select>
            </div>

            <!-- Action Buttons -->
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
            </div>
          </div>

          <!-- Date Range Filters -->
          <div class="pt-4 border-t border-dashed border-gray-200 grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[9px] font-black text-gray-400 uppercase ml-1">Date From</label>
              <input v-model="startDate" type="date" :class="inputClass" class="w-full px-3 py-2 rounded-lg text-[10px] border" />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-black text-gray-400 uppercase ml-1">Date To</label>
              <input v-model="endDate" type="date" :class="inputClass" class="w-full px-3 py-2 rounded-lg text-[10px] border" />
            </div>
          </div>

          <!-- Clear Filters -->
          <div v-if="hasActiveFilters" class="flex items-center justify-between pt-2">
            <button @click="clearAllFilters" class="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase hover:underline">
              <XCircle class="w-4 h-4" /> Clear All Filters
            </button>
            <span class="text-[10px] text-gray-400 font-bold uppercase">{{ filteredDTR.length }} results found</span>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl p-4 border border-neutral-200">
            <div class="flex items-center gap-3">
              <div class="bg-blue-100 p-2 rounded-lg">
                <Users class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase">Total Employees</p>
                <p class="text-xl font-black text-neutral-800">{{ uniqueEmployees.length }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl p-4 border border-neutral-200">
            <div class="flex items-center gap-3">
              <div class="bg-green-100 p-2 rounded-lg">
                <CheckCircle class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase">Valid Records</p>
                <p class="text-xl font-black text-green-600">{{ validRecordsCount }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl p-4 border border-neutral-200">
            <div class="flex items-center gap-3">
              <div class="bg-red-100 p-2 rounded-lg">
                <AlertTriangle class="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase">Issues</p>
                <p class="text-xl font-black text-red-600">{{ invalidRecordsCount }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- DTR Table -->
        <div class="bg-white rounded-2xl border border-neutral-300 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-350">
              <thead>
                <tr class="bg-neutral-800 text-white text-[10px] uppercase tracking-widest isuzu-font">
                  <th class="p-4 font-black">Employee No.</th>
                  <th class="p-4 font-black">Department</th>
                  <th class="p-4 font-black">Name</th>
                  <th class="p-4 font-black">Date</th>
                  <th class="p-4 font-black text-center bg-blue-900/50" colspan="2">Morning</th>
                  <th class="p-4 font-black text-center bg-orange-900/50" colspan="2">Afternoon</th>
                  <th class="p-4 font-black">Remarks</th>
                  <th class="p-4 font-black text-center">Status</th>
                </tr>
                <tr class="bg-neutral-700 text-white text-[9px] uppercase tracking-widest">
                  <th class="p-2 font-black" colspan="4"></th>
                  <th class="p-2 font-black text-center bg-blue-800/30">IN</th>
                  <th class="p-2 font-black text-center bg-blue-800/30">OUT</th>
                  <th class="p-2 font-black text-center bg-orange-800/30">IN</th>
                  <th class="p-2 font-black text-center bg-orange-800/30">OUT</th>
                  <th class="p-2 font-black" colspan="2"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in paginatedDTR" :key="`${item.name}-${item.date}`" 
                    :class="[
                      'hover:bg-blue-50/30 transition-colors text-[11px] font-bold uppercase tracking-tight',
                      !item.isValid ? 'bg-red-50/50' : ''
                    ]">
                  <td class="p-4 text-neutral-600 font-mono">{{ item.employeeNo || '-' }}</td>
                  <td class="p-4">
                    <span class="px-2 py-1 rounded bg-neutral-100 text-neutral-600 text-[9px]">
                      {{ item.department || 'N/A' }}
                    </span>
                  </td>
                  <td class="p-4 text-neutral-800 font-black">{{ item.name }}</td>
                  <td class="p-4 text-neutral-500">{{ item.dateFormatted }}</td>
                  
                  <!-- Morning IN -->
                  <td class="p-4 text-center bg-blue-50/30">
                    <div :class="getTimeStatusClass(item.morning.statusIn)" class="px-2 py-1 rounded text-[9px] font-black">
                      {{ item.morning.in }}
                    </div>
                    <div v-if="item.morning.statusIn !== 'Missing'" class="text-[8px] text-gray-400 mt-1">
                      {{ item.morning.statusIn }}
                    </div>
                  </td>
                  
                  <!-- Morning OUT -->
                  <td class="p-4 text-center bg-blue-50/30">
                    <div :class="getTimeStatusClass(item.morning.statusOut)" class="px-2 py-1 rounded text-[9px] font-black">
                      {{ item.morning.out }}
                    </div>
                    <div v-if="item.morning.statusOut !== 'Missing'" class="text-[8px] text-gray-400 mt-1">
                      {{ item.morning.statusOut }}
                    </div>
                  </td>
                  
                  <!-- Afternoon IN -->
                  <td class="p-4 text-center bg-orange-50/30">
                    <div :class="getTimeStatusClass(item.afternoon.statusIn)" class="px-2 py-1 rounded text-[9px] font-black">
                      {{ item.afternoon.in }}
                    </div>
                    <div v-if="item.afternoon.statusIn !== 'Missing'" class="text-[8px] text-gray-400 mt-1">
                      {{ item.afternoon.statusIn }}
                    </div>
                  </td>
                  
                  <!-- Afternoon OUT -->
                  <td class="p-4 text-center bg-orange-50/30">
                    <div :class="getTimeStatusClass(item.afternoon.statusOut)" class="px-2 py-1 rounded text-[9px] font-black">
                      {{ item.afternoon.out }}
                    </div>
                    <div v-if="item.afternoon.statusOut !== 'Missing'" class="text-[8px] text-gray-400 mt-1">
                      {{ item.afternoon.statusOut }}
                    </div>
                  </td>
                  
                  <td class="p-4 max-w-50">
                    <div class="text-[9px] leading-tight" :class="item.isValid ? 'text-gray-600' : 'text-red-600'">
                      {{ item.remarks }}
                    </div>
                  </td>
                  
                  <td class="p-4 text-center">
                    <span :class="getRecordStatusClass(item)" class="px-2 py-1 rounded text-[9px] font-black uppercase">
                      {{ item.isValid ? 'Valid' : 'Invalid' }}
                    </span>
                  </td>
                </tr>

                <tr v-if="paginatedDTR.length === 0">
                  <td colspan="10" class="p-20 text-center opacity-30">
                    <div class="flex flex-col items-center">
                      <Database class="w-16 h-16 mb-2" />
                      <p class="font-black isuzu-font uppercase tracking-widest">No DTR records found</p>
                      <p class="text-[10px] mt-2">Upload an Excel file to get started</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="px-8 py-5 bg-gray-50 flex flex-col md:flex-row items-center justify-between border-t border-gray-200">
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredDTR.length) }} of {{ filteredDTR.length }} Records
            </div>

            <div class="flex items-center gap-2">
              <button @click="currentPage = 1" :disabled="currentPage === 1" class="p-2 rounded-lg bg-white border hover:text-blue-600 disabled:opacity-30">
                <ChevronsLeft class="w-4 h-4" />
              </button>
              <button @click="currentPage--" :disabled="currentPage === 1" class="p-2 rounded-lg bg-white border hover:text-blue-600 disabled:opacity-30">
                <ChevronLeft class="w-4 h-4" />
              </button>

              <div class="flex gap-1 mx-2">
                <button v-for="page in displayedPages" :key="page" @click="currentPage = page"
                  :class="currentPage === page ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-neutral-600'"
                  class="w-8 h-8 rounded-lg text-xs font-bold transition-all border">
                  {{ page }}
                </button>
              </div>

              <button @click="currentPage++" :disabled="currentPage === totalPages" class="p-2 rounded-lg bg-white border hover:text-blue-600 disabled:opacity-30">
                <ChevronRight class="w-4 h-4" />
              </button>
              <button @click="currentPage = totalPages" :disabled="currentPage === totalPages" class="p-2 rounded-lg bg-white border hover:text-blue-600 disabled:opacity-30">
                <ChevronsRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Upload Modal -->
    <Transition name="fade">
      <div v-if="showUploadModal" class="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-neutral-900/60 backdrop-blur-none" @click="closeUploadModal"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-8 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden flex flex-col">
          
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <div class="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
                <Upload class="w-8 h-8" />
              </div>
              <div>
                <h3 class="text-2xl font-black isuzu-font uppercase text-neutral-800 tracking-tighter">
                  Upload <span class="text-blue-600">Attendance</span>
                </h3>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Import Excel DTR Data</p>
              </div>
            </div>
            <button @click="downloadTemplate" class="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-widest">
              <Download class="w-4 h-4" /> Download Template
            </button>
          </div>

          <!-- Processing Progress -->
          <div v-if="isProcessing" class="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-black text-blue-600 uppercase">{{ processingMessage }}</span>
              <span class="text-[10px] font-black text-blue-600">{{ processingProgress }}%</span>
            </div>
            <div class="w-full bg-blue-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{ width: processingProgress + '%' }"></div>
            </div>
          </div>

          <!-- File Drop Zone -->
          <div v-if="!hasUploadedData && !isProcessing" class="border-4 border-dashed border-gray-100 rounded-3xl p-12 text-center hover:border-blue-100 transition-all group flex-1 flex flex-col justify-center">
            <input type="file" ref="fileInput" @change="handleFileSelect" accept=".xlsx,.xls" class="hidden" />
            <FileSpreadsheet class="w-16 h-16 text-gray-200 mx-auto mb-4 group-hover:text-blue-400 transition-colors" />
            <p class="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Drop Excel File Here or Click to Browse</p>
            <button @click="$refs.fileInput.click()" class="bg-blue-600 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mx-auto">
              Select Spreadsheet
            </button>
            <p class="text-[9px] text-gray-400 mt-4 max-w-md mx-auto">
              Supports: .xlsx, .xls formats. Each sheet can represent one employee or use Name column for multiple employees.
            </p>
          </div>

          <!-- Preview Results -->
          <div v-else-if="hasUploadedData" class="space-y-4 flex-1 overflow-hidden flex flex-col">
            <!-- Summary Header -->
            <div class="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div class="text-xs font-black uppercase tracking-widest flex items-center gap-4">
                <span class="text-blue-600">📊 {{ totalRawRows }} Raw Rows</span>
                <span class="text-green-600">✓ {{ dtrData.length }} Processed</span>
                <span v-if="invalidRecordsCount > 0" class="text-red-600">✗ {{ invalidRecordsCount }} Issues</span>
              </div>
              <div class="flex gap-2">
                <button @click="resetUpload" class="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 rounded-full transition-all">
                  Cancel
                </button>
                <button @click="confirmUpload" class="bg-blue-600 text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                  Process Data
                </button>
              </div>
            </div>

            <!-- Preview Table -->
            <div class="flex-1 overflow-auto border border-gray-200 rounded-xl">
              <table class="w-full text-[10px]">
                <thead class="bg-neutral-800 text-white sticky top-0">
                  <tr>
                    <th class="p-3 text-left font-black uppercase">Name</th>
                    <th class="p-3 text-left font-black uppercase">Date</th>
                    <th class="p-3 text-center font-black uppercase">Morning</th>
                    <th class="p-3 text-center font-black uppercase">Afternoon</th>
                    <th class="p-3 text-left font-black uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in dtrData.slice(0, 20)" :key="idx" 
                      :class="idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
                    <td class="p-3 font-bold">{{ item.name }}</td>
                    <td class="p-3 text-gray-500">{{ item.dateFormatted }}</td>
                    <td class="p-3 text-center">
                      <span class="text-[9px]">{{ item.morning.in }} - {{ item.morning.out }}</span>
                    </td>
                    <td class="p-3 text-center">
                      <span class="text-[9px]">{{ item.afternoon.in }} - {{ item.afternoon.out }}</span>
                    </td>
                    <td class="p-3">
                      <span :class="item.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="px-2 py-1 rounded text-[9px] font-black uppercase">
                        {{ item.isValid ? 'Valid' : 'Invalid' }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="dtrData.length > 20">
                    <td colspan="5" class="p-3 text-center text-gray-400 text-[10px]">
                      ... and {{ dtrData.length - 20 }} more records
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useIsuzuDTR } from '../../composables/useIsuzuDTR';
import { useToast } from '../../composables/useToast';
import Loaders from '../../components/Loaders.vue';

import {
  Clock,
  Upload,
  Download,
  Search,
  FileDown,
  ChevronDown,
  Database,
  Printer,
  FileSpreadsheet,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  CheckCircle,
  AlertTriangle
} from 'lucide-vue-next';

// Composables
const { 
  isProcessing, 
  processingProgress, 
  processingMessage,
  parseAttendanceExcel, 
  generateDTR, 
  exportDTRToExcel, 
  downloadDTRTemplate 
} = useIsuzuDTR();
const toast = useToast();

// Loading state
const isLoading = ref(true);

// Data
const dtrData = ref([]);
const hasUploadedData = ref(false);
const totalRawRows = ref(0);

// Search and filter states
const searchQuery = ref('');
const selectedDepartment = ref('');
const selectedStatus = ref('');
const startDate = ref('');
const endDate = ref('');

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(25);

// UI states
const showUploadModal = ref(false);
const showExportMenu = ref(false);
const showPrintMenu = ref(false);
const fileInput = ref(null);

// Theme
const isDarkMode = computed(() => document.documentElement.classList.contains('dark'));

const themeClass = computed(() =>
  isDarkMode.value ? 'text-white' : 'bg-gray-100 text-gray-900'
);

const themeStyle = computed(() =>
  isDarkMode.value ? { backgroundColor: '#232323' } : {}
);

const inputClass = computed(() =>
  isDarkMode.value
    ? 'bg-gray-800 text-white border-gray-600 placeholder-gray-400'
    : 'bg-white text-gray-900 border-gray-300'
);

// Available departments
const availableDepartments = computed(() => {
  const departments = new Set(dtrData.value.map(item => item.department).filter(Boolean));
  return Array.from(departments).sort();
});

// Unique employees
const uniqueEmployees = computed(() => {
  const employees = new Set(dtrData.value.map(item => item.name));
  return Array.from(employees).sort();
});

// Statistics
const validRecordsCount = computed(() => dtrData.value.filter(d => d.isValid).length);
const invalidRecordsCount = computed(() => dtrData.value.filter(d => !d.isValid).length);

// Filtered DTR data
const filteredDTR = computed(() => {
  let filtered = [...dtrData.value];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(item =>
      item.name?.toLowerCase().includes(query) ||
      item.employeeNo?.toLowerCase().includes(query) ||
      item.department?.toLowerCase().includes(query)
    );
  }

  // Department filter
  if (selectedDepartment.value) {
    filtered = filtered.filter(item => item.department === selectedDepartment.value);
  }

  // Status filter
  if (selectedStatus.value) {
    switch (selectedStatus.value) {
      case 'valid':
        filtered = filtered.filter(item => item.isValid);
        break;
      case 'invalid':
        filtered = filtered.filter(item => !item.isValid);
        break;
      case 'late':
        filtered = filtered.filter(item => item.remarks.includes('Late'));
        break;
      case 'undertime':
        filtered = filtered.filter(item => item.remarks.includes('Undertime'));
        break;
    }
  }

  // Date range filter
  if (startDate.value) {
    const start = new Date(startDate.value);
    start.setHours(0, 0, 0, 0);
    filtered = filtered.filter(item => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      return itemDate >= start;
    });
  }
  
  if (endDate.value) {
    const end = new Date(endDate.value);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter(item => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      return itemDate <= end;
    });
  }

  return filtered;
});

// Paginated data
const paginatedDTR = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredDTR.value.slice(start, end);
});

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredDTR.value.length / itemsPerPage.value) || 1;
});

// Displayed page numbers
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
  searchQuery.value ||
  selectedDepartment.value ||
  selectedStatus.value ||
  startDate.value ||
  endDate.value
);

// Reset page when filters change
watch([searchQuery, selectedDepartment, selectedStatus, startDate, endDate], () => {
  currentPage.value = 1;
});

// Clear all filters
const clearAllFilters = () => {
  searchQuery.value = '';
  selectedDepartment.value = '';
  selectedStatus.value = '';
  startDate.value = '';
  endDate.value = '';
};

// Get time status class
const getTimeStatusClass = (status) => {
  switch (status) {
    case 'Early':
      return 'bg-green-100 text-green-700';
    case 'Late':
      return 'bg-red-100 text-red-700';
    case 'Undertime':
      return 'bg-orange-100 text-orange-700';
    case 'Missing':
      return 'bg-gray-100 text-gray-400';
    default:
      return 'bg-blue-100 text-blue-700';
  }
};

// Get record status class
const getRecordStatusClass = (item) => {
  if (!item.isValid) {
    return 'bg-red-100 text-red-700';
  }
  if (item.hoursWorked < 8) {
    return 'bg-yellow-100 text-yellow-700';
  }
  return 'bg-green-100 text-green-700';
};

// Toggle menus
const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value;
};

const togglePrintMenu = () => {
  showPrintMenu.value = !showPrintMenu.value;
};

// Close menus when clicking outside
const closeMenus = (event) => {
  if (!event.target.closest('.export-menu-container')) {
    showExportMenu.value = false;
  }
  if (!event.target.closest('.print-menu-container')) {
    showPrintMenu.value = false;
  }
};

// File handling
const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    toast.error('Please select a valid Excel file (.xlsx or .xls)', 'Invalid File');
    return;
  }

  try {
    toast.info('Reading attendance file...', 'Processing');
    
    // Parse the Excel file
    const records = await parseAttendanceExcel(file);
    
    // Store total raw rows read from Excel
    totalRawRows.value = records.length;
    
    if (records.length === 0) {
      toast.warning('No attendance data found in file', 'Empty File');
      return;
    }

    toast.info(`Found ${records.length} attendance logs. Processing...`, 'Processing');
    
    // Generate DTR from records
    const dtr = generateDTR(records);
    
    if (dtr.length === 0) {
      toast.warning('No valid DTR entries could be generated', 'Processing Failed');
      return;
    }

    dtrData.value = dtr;
    hasUploadedData.value = true;
    
    toast.success(`Successfully processed ${dtr.length} DTR entries from ${totalRawRows.value} raw rows`, 'Success');
  } catch (error) {
    console.error('Error processing file:', error);
    toast.error('Failed to process Excel file. Please check the format.', 'Error');
  }
};

// Reset upload
const resetUpload = () => {
  dtrData.value = [];
  hasUploadedData.value = false;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// Confirm upload and close modal
const confirmUpload = () => {
  hasUploadedData.value = false;
  showUploadModal.value = false;
  toast.success('DTR data loaded successfully!', 'Complete');
};

// Close upload modal
const closeUploadModal = () => {
  if (!hasUploadedData.value) {
    showUploadModal.value = false;
  }
};

// Download template
const downloadTemplate = () => {
  downloadDTRTemplate();
  toast.success('Template downloaded successfully!', 'Template');
};

// Export functions
const exportFilteredData = () => {
  if (filteredDTR.value.length === 0) {
    toast.warning('No filtered data to export', 'Export');
    return;
  }

  showExportMenu.value = false;
  exportDTRToExcel(filteredDTR.value, 'DTR_Filtered_Export');
  toast.success(`Exported ${filteredDTR.value.length} filtered records successfully!`, 'Export Complete');
};

const exportAllData = () => {
  if (dtrData.value.length === 0) {
    toast.warning('No data to export', 'Export');
    return;
  }

  showExportMenu.value = false;
  exportDTRToExcel(dtrData.value, 'DTR_All_Export');
  toast.success(`Exported all ${dtrData.value.length} records successfully!`, 'Export Complete');
};

// Print functions
const printFilteredData = () => {
  if (filteredDTR.value.length === 0) {
    toast.warning('No filtered data to print', 'Print');
    return;
  }

  showPrintMenu.value = false;
  printDTR(filteredDTR.value, 'Filtered DTR Report');
};

const printAllData = () => {
  if (dtrData.value.length === 0) {
    toast.warning('No data to print', 'Print');
    return;
  }

  showPrintMenu.value = false;
  printDTR(dtrData.value, 'Complete DTR Report');
};

// Print DTR
const printDTR = (data, title) => {
  // Calculate totals
  const totalRecords = data.length;
  const validCount = data.filter(d => d.isValid).length;
  const invalidCount = totalRecords - validCount;

  // Get current date
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create print content
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - ISUZU DTR</title>
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
          font-size: 8pt;
          line-height: 1.3;
          color: #000;
          background: #fff;
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          margin-bottom: 10px;
          border-bottom: 4px solid #2563eb;
        }
        .header-left {
          flex: 1;
          text-align: left;
        }
        .header-left img {
          height: 60px;
          object-fit: contain;
        }
        .header-center {
          flex: 1;
          text-align: center;
        }
        .header-right {
          flex: 2;
          text-align: left;
          font-family: "Arial Narrow", Arial, sans-serif;
        }
        .company-title {
          font-size: 14pt;
          font-weight: bold;
          color: #000;
          margin-bottom: 2px;
        }
        .company-info {
          font-size: 10pt;
          color: #000;
          line-height: 1.2;
        }

        .report-sub-header {
          text-align: center;
          margin-bottom: 15px;
        }
        .report-title {
          font-size: 12pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .report-meta {
          font-size: 8pt;
          color: #666;
        }

        .summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding: 8px;
          background: #eff6ff;
          border-radius: 4px;
          border: 1px solid #bfdbfe;
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
          color: #2563eb;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          font-size: 7pt;
        }
        th {
          background: #1e40af;
          color: white;
          padding: 6px 4px;
          text-align: left;
          font-weight: bold;
          border: 1px solid #1e40af;
        }
        td {
          padding: 4px;
          border: 1px solid #d1d5db;
          vertical-align: top;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        .status-badge {
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 6pt;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-valid { background: #d1fae5; color: #065f46; }
        .status-invalid { background: #fee2e2; color: #991b1b; }
        .status-warning { background: #fef3c7; color: #92400e; }

        .time-early { background: #d1fae5; color: #065f46; }
        .time-late { background: #fee2e2; color: #991b1b; }
        .time-undertime { background: #ffedd5; color: #9a3412; }
        .time-missing { background: #f3f4f6; color: #6b7280; }

        .footer {
          margin-top: 20px;
          padding-top: 8px;
          border-top: 1px solid #d1d5db;
          font-size: 7pt;
          color: #666;
          text-align: center;
        }

        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <div class="header-left">
          <img src="/isuzucalapanHeader.png" alt="Isuzu Calapan City">
        </div>
        <div class="header-center">
          <img src="/mdoLogo.png" alt="MDO Logo">
        </div>
        <div class="header-right">
          <div class="company-title">MINA DE ORO MOTORS INCORPORATED</div>
          <div class="company-info">
            Km. 9 Nautical Highway, Puting Tubig, Calapan City,<br>
            Oriental Mindoro, 5200
          </div>
        </div>
      </div>

      <div class="report-sub-header">
        <div class="report-title">${title}</div>
        <div class="report-meta">Generated on ${dateStr}</div>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Total Records</div>
          <div class="summary-value">${totalRecords.toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Valid Records</div>
          <div class="summary-value">${validCount.toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Issues</div>
          <div class="summary-value">${invalidCount.toLocaleString()}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Employee No.</th>
            <th>Department</th>
            <th>Name</th>
            <th>Date</th>
            <th class="text-center">Morning In</th>
            <th class="text-center">Morning Out</th>
            <th class="text-center">Afternoon In</th>
            <th class="text-center">Afternoon Out</th>
            <th>Remarks</th>
            <th class="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => {
            const statusClass = item.isValid ? 'status-valid' : 'status-invalid';
            const morningInClass = item.morning.statusIn === 'Early' ? 'time-early' : 
                                  item.morning.statusIn === 'Late' ? 'time-late' : 
                                  item.morning.statusIn === 'Missing' ? 'time-missing' : '';
            const morningOutClass = item.morning.statusOut === 'Undertime' ? 'time-undertime' : 
                                   item.morning.statusOut === 'Missing' ? 'time-missing' : '';
            const afternoonInClass = item.afternoon.statusIn === 'Late' ? 'time-late' : 
                                    item.afternoon.statusIn === 'Missing' ? 'time-missing' : '';
            const afternoonOutClass = item.afternoon.statusOut === 'Undertime' ? 'time-undertime' : 
                                     item.afternoon.statusOut === 'Missing' ? 'time-missing' : '';
            
            return `
            <tr>
              <td>${item.employeeNo || '-'}</td>
              <td>${(item.department || '-').toUpperCase()}</td>
              <td>${(item.name || '-').toUpperCase()}</td>
              <td>${item.dateFormatted}</td>
              <td class="text-center ${morningInClass}">${item.morning.in}</td>
              <td class="text-center ${morningOutClass}">${item.morning.out}</td>
              <td class="text-center ${afternoonInClass}">${item.afternoon.in}</td>
              <td class="text-center ${afternoonOutClass}">${item.afternoon.out}</td>
              <td>${item.remarks}</td>
              <td class="text-center"><span class="status-badge ${statusClass}">${item.isValid ? 'Valid' : 'Invalid'}</span></td>
            </tr>
          `}).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>ISUZU Calapan DTR Management System &copy; ${now.getFullYear()}</p>
        <p>This is a computer-generated report. No signature required.</p>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 700);
        };
      <\/script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
  } else {
    toast.error('Unable to open print window. Please check your popup blocker settings.', 'Print Error');
  }
};

// Initialize
onMounted(async () => {
  await nextTick();
  document.addEventListener('click', closeMenus);
  isLoading.value = false;
});
</script>

<style scoped>
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
