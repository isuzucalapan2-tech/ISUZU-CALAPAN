<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-white">
    <div class="flex flex-col items-center gap-3">
      <div class="w-8 h-8 border-2 border-neutral-100 border-t-neutral-900 rounded-full animate-spin"></div>
      <p class="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">Loading Ledger</p>
    </div>
  </div>

  <div v-else class="min-h-screen flex flex-col bg-white text-neutral-900 font-sans selection:bg-neutral-100">
    
    <header class="px-8 py-6 flex justify-between items-center border-b border-neutral-100">
      <div>
        <h1 class="text-lg font-bold tracking-tight uppercase isuzu-font">Payroll <span class="text-red-600">Register</span></h1>
        <p class="text-[10px] text-neutral-400 uppercase tracking-widest mt-0.5">
          {{ currentDateTime }} • Status: <span class="text-emerald-600">Finalized</span>
        </p>
      </div>

      <div class="flex items-center gap-4">
        <button 
          @click="showModal = true"
          class="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors active:bg-neutral-50"
        >
          <BarChart3 class="w-4 h-4" /> View Analytics
        </button>
        
        <button class="bg-neutral-900 text-white px-5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider active:bg-black">
          Export Bank File
        </button>
      </div>
    </header>

    <main class="flex-1 flex flex-col overflow-hidden">
      <div class="flex-1 overflow-hidden flex flex-col p-6">
        
        <div class="flex-1 border border-neutral-600 rounded-xl overflow-hidden flex flex-col">
          <div class="overflow-x-auto overflow-y-auto flex-1 bg-white">
            <table class="w-full text-[11px] border-separate border-spacing-0 min-w-[2000px]">
              <thead>
                <tr class="bg-neutral-50 text-neutral-500 uppercase tracking-tighter">
                  <th rowspan="2" class="px-6 py-4 font-bold border-b border-r border-neutral-600 sticky left-0 bg-neutral-50 z-30 text-neutral-900">Employee</th>
                  <th rowspan="2" class="px-4 py-4 font-bold border-b border-r border-neutral-600 text-center">Days</th>
                  <th colspan="2" class="px-4 py-2 font-bold border-b border-r border-neutral-600 text-center">Monthly Rates</th>
                  <th colspan="2" class="px-4 py-2 font-bold border-b border-r border-neutral-600 text-center text-emerald-600">Earnings</th>
                  <th colspan="5" class="px-4 py-2 font-bold border-b border-r border-neutral-600 text-center">Adjustments</th>
                  <th rowspan="2" class="px-6 py-4 font-bold border-b border-r border-neutral-600 text-right bg-neutral-100 text-neutral-900">Gross Salary</th>
                  <th colspan="12" class="px-4 py-2 font-bold border-b border-r border-neutral-600 text-center text-red-600">Deductions</th>
                  <th rowspan="2" class="px-6 py-4 font-bold border-b border-r border-neutral-600 text-right bg-neutral-100 text-neutral-900">Total Ded.</th>
                  <th rowspan="2" class="px-6 py-4 font-bold border-b border-neutral-600 text-right bg-emerald-600 text-white">Net Pay</th>
                </tr>
                <tr class="bg-neutral-50 text-[10px] text-neutral-400">
                  <th class="px-4 py-2 border-b border-r border-neutral-600 text-right">Basic</th>
                  <th class="px-4 py-2 border-b border-r border-neutral-600 text-right">Allow.</th>
                  <th class="px-4 py-2 border-b border-r border-neutral-600 text-right text-emerald-600">Basic</th>
                  <th class="px-4 py-2 border-b border-r border-neutral-600 text-right text-emerald-600">Allow.</th>
                  <th class="px-4 py-2 border-b border-r border-neutral-600 text-right">OT</th>
                  <th class="px-4 py-2 border-b border-r border-neutral-600 text-right">RD</th>
                  <th class="px-4 py-2 border-b border-r border-neutral-600 text-right">Hol</th>
                  <th class="px-4 py-2 border-b border-r border-neutral-600 text-right">Rice</th>
                  <th class="px-4 py-2 border-b border-r border-neutral-600 text-right font-bold text-neutral-700">Add</th>
                  <th v-for="label in deductionLabels" :key="label" class="px-3 py-2 border-b border-r border-neutral-600 text-right text-red-400">
                    {{ label }}
                  </th>
                </tr>
              </thead>
              
              <tbody class="divide-y divide-neutral-100">
                <tr v-for="row in payrollRows" :key="row.name">
                  <td class="px-6 py-4 border-r border-neutral-600 font-bold sticky left-0 bg-white z-20">{{ row.name }}</td>
                  <td class="px-4 py-4 border-r border-neutral-600 text-center text-neutral-400 font-medium">{{ row.days }}</td>
                  <td class="px-4 py-4 border-r border-neutral-600 text-right font-medium">{{ format(row.basicRate) }}</td>
                  <td class="px-4 py-4 border-r border-neutral-600 text-right font-medium">{{ format(row.allowanceRate) }}</td>
                  <td class="px-4 py-4 border-r border-neutral-600 text-right text-emerald-600 font-bold bg-emerald-50/30">{{ format(row.basicPeriod) }}</td>
                  <td class="px-4 py-4 border-r border-neutral-600 text-right text-emerald-600 font-bold bg-emerald-50/30">{{ format(row.allowancePeriod) }}</td>
                  <td class="px-4 py-4 border-r border-neutral-600 text-right">{{ format(row.ot) }}</td>
                  <td class="px-4 py-4 border-r border-neutral-600 text-right">{{ format(row.restDay) }}</td>
                  <td class="px-4 py-4 border-r border-neutral-600 text-right">{{ format(row.legalHol) }}</td>
                  <td class="px-4 py-4 border-r border-neutral-600 text-right">{{ format(row.rice) }}</td>
                  <td class="px-4 py-4 border-r border-neutral-600 text-right font-bold bg-neutral-50">{{ format(row.totalAdd) }}</td>
                  <td class="px-6 py-4 border-r border-neutral-600 text-right font-bold bg-neutral-50">{{ format(row.gross) }}</td>
                  <td class="px-3 py-4 border-r border-neutral-600 text-right text-red-500">{{ format(row.sss) }}</td>
                  <td class="px-3 py-4 border-r border-neutral-600 text-right text-red-500">{{ format(row.phic) }}</td>
                  <td class="px-3 py-4 border-r border-neutral-600 text-right text-red-500">{{ format(row.hdmf) }}</td>
                  <td class="px-3 py-4 border-r border-neutral-600 text-right text-red-500">{{ format(row.tax) }}</td>
                  <td class="px-3 py-4 border-r border-neutral-600 text-right text-red-600 font-bold italic">{{ format(row.absences) }}</td>
                  <td class="px-3 py-4 border-r border-neutral-600 text-right text-red-500">{{ format(row.tardiness) }}</td>
                  <td class="px-3 py-4 border-r border-neutral-600 text-right text-red-500">{{ format(row.undertime) }}</td>
                  <td class="px-3 py-4 border-r border-neutral-600 text-right text-red-500">{{ format(row.mp2) }}</td>
                  <td class="px-3 py-4 border-r border-neutral-600 text-right text-red-500">{{ format(row.sssLoan) }}</td>
                  <td class="px-3 py-4 border-r border-neutral-600 text-right text-red-500">{{ format(row.pagibigLoan) }}</td>
                  <td class="px-3 py-4 border-r border-neutral-600 text-right text-red-500">{{ format(row.coop) }}</td>
                  <td class="px-3 py-4 border-r border-neutral-600 text-right text-red-500">{{ format(row.others) }}</td>
                  <td class="px-6 py-4 border-r border-neutral-600 text-right font-bold text-red-600 bg-red-50/50">{{ format(row.totalDeduct) }}</td>
                  <td class="px-6 py-4 text-right font-bold text-emerald-700 bg-emerald-50">₱{{ format(row.net) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="mt-8 grid grid-cols-3 gap-12 max-w-5xl">
          <div v-for="sign in signatures" :key="sign.name" class="flex flex-col">
            <div class="h-px bg-neutral-200 w-full mb-3"></div>
            <span class="text-[10px] font-bold text-neutral-900 uppercase tracking-wider">{{ sign.name }}</span>
            <span class="text-[9px] text-neutral-400 uppercase font-medium">{{ sign.role }}</span>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-white p-4 md:p-12">
      <div class="bg-white w-full max-w-7xl h-full flex flex-col overflow-hidden">
        
        <div class="px-10 py-4 border-b border-neutral-100 flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-black uppercase tracking-tight">Executive Dashboard</h2>
            <p class="text-xs text-neutral-400 font-medium tracking-widest mt-1">REAL-TIME PAYROLL ANALYTICS — {{ currentDateTime }}</p>
          </div>
          <button @click="showModal = false" class="p-3 border border-neutral-200 rounded-full bg-white active:bg-neutral-50 transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>
        
        <div class="flex-1 p-6 overflow-y-auto space-y-10">
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 border border-neutral-100 rounded-2xl bg-white">
              <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Total Gross Pay</p>
              <h3 class="text-3xl font-bold">₱100,000.00</h3>
              <div class="mt-4 h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div class="h-full bg-neutral-900 w-[100%]"></div>
              </div>
            </div>
            <div class="p-6 border border-neutral-100 rounded-2xl bg-white">
              <p class="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Total Deductions</p>
              <h3 class="text-3xl font-bold text-red-600">₱17,259.49</h3>
              <div class="mt-4 h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div class="h-full bg-red-500 w-[17%]"></div>
              </div>
            </div>
            <div class="p-6 border border-neutral-100 rounded-2xl bg-emerald-600 text-white">
              <p class="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mb-2">Total Net Disbursement</p>
              <h3 class="text-3xl font-bold">₱82,740.51</h3>
              <p class="text-[9px] mt-4 opacity-80 uppercase tracking-widest">Ready for bank transfer</p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div class="space-y-6">
               <h4 class="text-xs font-bold uppercase tracking-widest text-neutral-400">Salary Breakdown by Employee</h4>
               <div class="space-y-4">
                 <div v-for="row in payrollRows" :key="row.name" class="space-y-2">
                    <div class="flex justify-between text-[11px] font-bold uppercase">
                      <span>{{ row.name }}</span>
                      <span>₱{{ format(row.net) }}</span>
                    </div>
                    <div class="h-3 bg-neutral-50 rounded-sm overflow-hidden border border-neutral-100">
                      <div class="h-full bg-emerald-500" :style="{ width: (row.net / 35000 * 100) + '%' }"></div>
                    </div>
                 </div>
               </div>
            </div>

            <div class="bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-col p-8 items-center justify-center text-center">
               <div class="relative w-48 h-48 flex items-center justify-center mb-6">
                  <svg class="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="80" stroke="currentColor" stroke-width="24" fill="transparent" class="text-neutral-200" />
                    <circle cx="96" cy="96" r="80" stroke="currentColor" stroke-width="24" fill="transparent" stroke-dasharray="502" stroke-dashoffset="85" class="text-emerald-500" />
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-2xl font-black">83%</span>
                    <span class="text-[8px] uppercase font-bold text-neutral-400 tracking-tighter">Retention Rate</span>
                  </div>
               </div>
               <p class="text-[11px] font-medium text-neutral-500 max-w-xs">
                 Net pay represents 82.7% of the total gross expenditure for this period. 
                 Tax and Mandatory contributions account for 17.3%.
               </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { BarChart3, X } from 'lucide-vue-next';

const isLoading = ref(true);
const showModal = ref(false);
const timestamp = ref(new Date());

const deductionLabels = ['SSS','PHIC','HDMF','Tax','Abs','Tard','UT','MP2','SSS Ln','P-Ib Ln','Coop','Other'];

// Dynamic Date Logic
const currentDateTime = computed(() => {
  return timestamp.value.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();
});

const format = (num) => {
  if (num === 0 || !num) return '—';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2 });
};

const signatures = [
  { name: 'VANESSA KYLA A. BARQUILLA', role: 'HR & Admin Officer' },
  { name: 'MARITES L. BERNALES', role: 'Accounting Supervisor' },
  { name: 'GENARO RHON D. CLEOFE JR.', role: 'Operations Manager' }
];

const payrollRows = ref([
  {
    name: 'BERNALES, Marites L.',
    days: 15, basicRate: 60000, allowanceRate: 10000, basicPeriod: 30000, allowancePeriod: 5000,
    ot: 0, restDay: 0, legalHol: 0, rice: 0, totalAdd: 5000, gross: 35000,
    sss: 1025, phic: 517.50, hdmf: 200, tax: 689.93, absences: 0, tardiness: 215.65, undertime: 0,
    mp2: 0, sssLoan: 0, pagibigLoan: 0, coop: 1000, others: 0, totalDeduct: 3648.08, net: 31351.92
  },
  {
    name: 'DE JARO, Kimberly D.',
    days: 15, basicRate: 60000, allowanceRate: 5000, basicPeriod: 30000, allowancePeriod: 2500,
    ot: 0, restDay: 0, legalHol: 0, rice: 0, totalAdd: 2500, gross: 32500,
    sss: 900, phic: 450, hdmf: 200, tax: 313.80, absences: 3738.02, tardiness: 0, undertime: 0,
    mp2: 0, sssLoan: 0, pagibigLoan: 0, coop: 1000, others: 0, totalDeduct: 6601.82, net: 25898.18
  },
  {
    name: 'VELASQUEZ, Kathleene M.',
    days: 15, basicRate: 60000, allowanceRate: 5000, basicPeriod: 30000, allowancePeriod: 2500,
    ot: 0, restDay: 0, legalHol: 0, rice: 0, totalAdd: 2500, gross: 32500,
    sss: 900, phic: 450, hdmf: 200, tax: 313.80, absences: 1246.01, tardiness: 2966.45, undertime: 0,
    mp2: 0, sssLoan: 0, pagibigLoan: 0, coop: 0, others: 933.33, totalDeduct: 7009.59, net: 25490.41
  }
]);

onMounted(() => {
  // Update date every minute to keep it fresh
  setInterval(() => {
    timestamp.value = new Date();
  }, 60000);

  setTimeout(() => isLoading.value = false, 600);
});
</script>

<style scoped>
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #d4d4d4; }
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>