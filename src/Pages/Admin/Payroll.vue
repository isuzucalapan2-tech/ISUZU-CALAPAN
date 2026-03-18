<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-white">
    <div class="flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      <p class="isuzu-font text-xs font-black uppercase tracking-[0.3em] text-gray-500">Calculating Ledger...</p>
    </div>
  </div>

  <div v-else class="min-h-screen flex flex-col font-sans relative overflow-hidden bg-neutral-50">
    <div class="absolute top-0 left-0 w-full z-0 opacity-10 pointer-events-none">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 15 H280 L330 45 H500" stroke="#cc0000" stroke-width="2" />
      </svg>
    </div>

    <header class="relative z-10 px-8 py-6 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <div class="bg-neutral-900 p-2 rounded-lg">
          <Wallet class="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h1 class="text-2xl font-black isuzu-font uppercase tracking-widest text-neutral-800">
            Payroll <span class="text-red-600">Disbursement</span>
          </h1>
          <p class="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Financial Operations Console</p>
        </div>
      </div>

      <div class="hidden md:flex items-center gap-6">
        <div class="text-right">
          <p class="text-[9px] font-black uppercase text-gray-400 tracking-widest">Pay Period</p>
          <p class="text-xs font-black text-neutral-800">MAR 01 - MAR 15, 2026</p>
        </div>
        <div class="h-10 w-[1px] bg-neutral-200"></div>
        <button class="bg-red-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-lg shadow-red-100">
          Process Batch
        </button>
      </div>
    </header>

    <main class="flex-1 relative z-10 overflow-auto">
      <div class="max-w-[1600px] mx-auto p-6 space-y-6">
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div v-for="stat in payrollStats" :key="stat.label" class="bg-white border border-neutral-200 p-5 rounded-2xl">
            <p class="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">{{ stat.label }}</p>
            <p class="text-xl font-black" :class="stat.color">₱{{ stat.value }}</p>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm">
          <div class="flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div class="relative flex-1 w-full max-w-md">
              <Search class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="SEARCH EMPLOYEE NAME OR ID..."
                class="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
            </div>
            <div class="flex gap-2 w-full lg:w-auto">
              <select class="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none">
                <option>ALL DEPARTMENTS</option>
                <option>LOGISTICS</option>
                <option>MAINTENANCE</option>
                <option>ADMINISTRATION</option>
              </select>
              <button class="flex items-center gap-2 bg-neutral-900 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all">
                <FileText class="w-4 h-4" /> Reports
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-neutral-300 overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-neutral-900 text-white text-[10px] uppercase tracking-[0.2em] isuzu-font">
                  <th class="px-6 py-5 font-black">Employee Details</th>
                  <th class="px-6 py-5 font-black">Position</th>
                  <th class="px-6 py-5 font-black text-right">Basic Pay</th>
                  <th class="px-6 py-5 font-black text-right">Overtime</th>
                  <th class="px-6 py-5 font-black text-right">Deductions</th>
                  <th class="px-6 py-5 font-black text-right">Net Pay</th>
                  <th class="px-6 py-5 font-black text-center">Status</th>
                  <th class="px-6 py-5 font-black text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100">
                <tr v-for="emp in payrollData" :key="emp.id" class="hover:bg-red-50/30 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="text-sm font-black text-neutral-800 uppercase">{{ emp.name }}</span>
                      <span class="text-[10px] font-mono text-red-600 font-bold uppercase">{{ emp.idNumber }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-[10px] font-black bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded uppercase">{{ emp.position }}</span>
                  </td>
                  <td class="px-6 py-4 text-right text-xs font-bold text-neutral-700">₱{{ emp.basic.toLocaleString() }}</td>
                  <td class="px-6 py-4 text-right text-xs font-bold text-blue-600">+₱{{ emp.ot.toLocaleString() }}</td>
                  <td class="px-6 py-4 text-right text-xs font-bold text-red-500">-₱{{ emp.deductions.toLocaleString() }}</td>
                  <td class="px-6 py-4 text-right">
                    <span class="text-sm font-black text-neutral-900">₱{{ emp.net.toLocaleString() }}</span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span :class="emp.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'" 
                          class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">
                      {{ emp.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button title="View Payslip" class="bg-neutral-100 hover:bg-neutral-800 hover:text-white text-neutral-500 p-2 rounded-lg transition-all">
                        <Eye class="w-4 h-4" />
                      </button>
                      <button title="Edit Adjustment" class="bg-neutral-100 hover:bg-blue-600 hover:text-white text-neutral-500 p-2 rounded-lg transition-all">
                        <Edit3 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <div class="absolute bottom-0 left-0 w-full z-0 opacity-10 pointer-events-none transform rotate-180">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 45 H170 L220 15 H500" stroke="#cc0000" stroke-width="2" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  Wallet, Search, FileText, Eye, Edit3, 
  ChevronRight, TrendingUp, Users, AlertCircle 
} from 'lucide-vue-next';

const isLoading = ref(true);

const payrollStats = [
  { label: 'Total Gross Pay', value: '1,240,500.00', color: 'text-neutral-800' },
  { label: 'Total Deductions', value: '85,200.50', color: 'text-red-600' },
  { label: 'Net Disbursement', value: '1,155,299.50', color: 'text-green-600' },
  { label: 'Active Employees', value: '142', color: 'text-neutral-800' }
];

const payrollData = ref([
  { id: 1, name: 'RODRIGUEZ, ANTONIO', idNumber: 'EMP-2024-001', position: 'Logistics Manager', basic: 45000, ot: 5200, deductions: 2100, net: 48100, status: 'Paid' },
  { id: 2, name: 'SANTOS, MARIA CLARA', idNumber: 'EMP-2024-042', position: 'Inventory Specialist', basic: 32000, ot: 1500, deductions: 1800, net: 31700, status: 'Pending' },
  { id: 3, name: 'DELA CRUZ, JUAN', idNumber: 'EMP-2024-089', position: 'Warehouse Lead', basic: 28000, ot: 8400, deductions: 1200, net: 35200, status: 'Paid' },
  { id: 4, name: 'BAUTISTA, ELENA', idNumber: 'EMP-2024-102', position: 'Fleet Coordinator', basic: 35000, ot: 0, deductions: 1950, net: 33050, status: 'Pending' },
]);

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);
});
</script>

<style>
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}

/* Animations matching your previous setup */
.animate-in {
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
}

@keyframes slideInFromTop {
  from { transform: translateY(-1rem); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.slide-in-from-top-4 {
  animation-name: slideInFromTop;
}
</style>