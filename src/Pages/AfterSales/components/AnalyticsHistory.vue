<template>
  <div class="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden opacity-90 hover:opacity-100 hover:shadow-xl transition-all duration-300">
    <div class="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center gap-2 shrink-0 flex-wrap">
      <div class="flex items-center gap-2 text-slate-600">
        <span class="text-xl">📊</span>
        <h2 class="font-bold text-sm tracking-wide uppercase">Analytics & History</h2>
      </div>
      <div class="flex gap-2 items-center flex-wrap">
        <input 
          v-model="localHistoryFromDate"
          @change="$emit('update:historyFromDate', localHistoryFromDate)"
          type="date"
          :max="todayDate"
          class="bg-white border border-slate-300 text-xs rounded-md px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 transition-colors duration-200"
        />
        <span class="text-xs text-slate-400">to</span>
        <input 
          v-model="localHistoryToDate"
          @change="$emit('update:historyToDate', localHistoryToDate)"
          type="date"
          :max="todayDate"
          class="bg-white border border-slate-300 text-xs rounded-md px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 transition-colors duration-200"
        />
        <input 
          v-model="localHistorySearchQuery"
          @input="$emit('update:historySearchQuery', localHistorySearchQuery)"
          type="text"
          class="bg-white border border-slate-300 text-xs rounded-md px-3 py-1.5 w-32 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 hover:shadow-sm transition-all duration-200"
          placeholder="Search PRO or SA..."
        />
        <select v-model="localHistoryStatusFilter" @change="$emit('update:historyStatusFilter', localHistoryStatusFilter)" class="bg-white border border-slate-300 text-xs rounded-md px-2 py-1.5 focus:ring-indigo-500 hover:border-indigo-400 transition-colors duration-200">
          <option value="">All Status</option>
          <option value="JOB DONE">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
    </div>

    <!-- Quick Analytics Panel -->
    <div v-if="!historyFromDate || historyFromDate === todayDate" class="bg-indigo-50 border-b border-indigo-100 p-2">
      <div class="grid grid-cols-5 gap-2 text-center">
        <div class="bg-white rounded p-1.5 shadow-sm">
          <div class="text-[9px] text-slate-400 uppercase">Today</div>
          <div class="text-sm font-bold text-indigo-600">{{ fairnessAnalytics.totalRecent }}</div>
        </div>
        <div class="bg-white rounded p-1.5 shadow-sm">
          <div class="text-[9px] text-slate-400 uppercase">Done</div>
          <div class="text-sm font-bold text-green-600">{{ fairnessAnalytics.statusDistribution['JOB DONE'] || 0 }}</div>
        </div>
        <div class="bg-white rounded p-1.5 shadow-sm">
          <div class="text-[9px] text-slate-400 uppercase">Active</div>
          <div class="text-sm font-bold text-blue-600">{{ fairnessAnalytics.statusDistribution['ON GOING'] || 0 }}</div>
        </div>
        <div class="bg-white rounded p-1.5 shadow-sm">
          <div class="text-[9px] text-slate-400 uppercase">Efficiency</div>
          <div class="text-sm font-bold" :class="getEfficiencyColor(fairnessAnalytics.efficiency)">
            {{ fairnessAnalytics.efficiency }}%
          </div>
        </div>
        <div class="bg-white rounded p-1.5 shadow-sm">
          <div class="text-[9px] text-slate-400 uppercase">Trend</div>
          <div class="text-sm font-bold" :class="getTrendColor(fairnessAnalytics.trend)">
            {{ getTrendIcon(fairnessAnalytics.trend) }}
          </div>
        </div>
      </div>
      <div class="mt-1.5 flex items-center justify-center gap-3 text-[9px]">
        <span v-if="fairnessAnalytics.peakHour" class="text-indigo-600">
          🕐 Peak: {{ fairnessAnalytics.peakHour.hour }}:00 ({{ fairnessAnalytics.peakHour.count }})
        </span>
        <span class="text-slate-400">|</span>
        <span class="text-slate-500">
          Avg: {{ fairnessAnalytics.averagePerDay }}/day
        </span>
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50 sticky top-0 z-10">
          <tr>
            <th class="px-2 py-1 text-left text-[13px] font-bold text-slate-500 uppercase">PRO</th>
            <th class="px-2 py-1 text-left text-[13px] font-bold text-slate-500 uppercase">Status</th>
            <th class="px-2 py-1 text-right text-[13px] font-bold text-slate-500 uppercase">Action</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-100">
          <tr v-for="(assignment, index) in paginatedHistoryAssignments" :key="index" class="hover:bg-slate-100 hover:shadow-sm transition-all duration-200">
            <td class="px-2 py-1 whitespace-nowrap text-[10px]">
              <div class="font-bold text-slate-700">{{ assignment.pro }}</div>
              <div class="text-[9px] text-slate-400">{{ assignment.saName }}</div>
            </td>
            <td class="px-2 py-1 whitespace-nowrap">
              <span 
                class="px-1.5 py-0.5 inline-flex text-[8px] leading-3 font-bold rounded-full uppercase tracking-wider"
                :class="assignment.status === 'JOB DONE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ assignment.status }}
              </span>
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-right text-sm">
              <button class="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded px-1 transition-all duration-200" @click="$emit('delete-assignment', getOriginalIndex(assignment))">🗑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="p-2 border-t border-slate-200 bg-slate-50 flex justify-center gap-2 shrink-0">
      <button @click="$emit('prev-history-page')" :disabled="historyPage === 1" class="px-2 py-1 text-xs border rounded hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50">← Prev</button>
      <span class="text-xs self-center font-medium text-slate-600">Page {{ historyPage }}</span>
      <button @click="$emit('next-history-page')" :disabled="historyPage === totalHistoryPages" class="px-2 py-1 text-xs border rounded hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50">Next →</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnalyticsHistory',
  props: {
    assignments: {
      type: Array,
      default: () => []
    },
    historySearchQuery: {
      type: String,
      default: ''
    },
    historyStatusFilter: {
      type: String,
      default: ''
    },
    historyFromDate: {
      type: String,
      default: ''
    },
    historyToDate: {
      type: String,
      default: ''
    },
    itemsPerPage: {
      type: Number,
      default: 5
    },
    historyPage: {
      type: Number,
      default: 1
    },
    todayDate: {
      type: String,
      default: ''
    },
    fairnessAnalytics: {
      type: Object,
      default: () => ({
        totalRecent: 0,
        statusDistribution: {},
        efficiency: 0,
        trend: 'stable',
        peakHour: null,
        averagePerDay: 0
      })
    }
  },
  emits: [
    'update:historySearchQuery',
    'update:historyStatusFilter',
    'update:historyFromDate',
    'update:historyToDate',
    'delete-assignment',
    'prev-history-page',
    'next-history-page'
  ],
  data() {
    return {
      localHistorySearchQuery: this.historySearchQuery,
      localHistoryStatusFilter: this.historyStatusFilter,
      localHistoryFromDate: this.historyFromDate,
      localHistoryToDate: this.historyToDate
    };
  },
  computed: {
    filteredHistoryAssignments() {
      return this.assignments.filter(assignment => {
        const matchesSearch = !this.historySearchQuery || 
          assignment.pro.toLowerCase().includes(this.historySearchQuery.toLowerCase()) ||
          assignment.saName.toLowerCase().includes(this.historySearchQuery.toLowerCase()) ||
          (assignment.note && assignment.note.toLowerCase().includes(this.historySearchQuery.toLowerCase()));
        const matchesStatus = !this.historyStatusFilter || assignment.status === this.historyStatusFilter;
        const isInHistory = assignment.status === "JOB DONE" || assignment.status === "CANCELLED";
        return matchesSearch && matchesStatus && isInHistory;
      });
    },
    totalHistoryPages() {
      return Math.ceil(this.filteredHistoryAssignments.length / this.itemsPerPage) || 1;
    },
    paginatedHistoryAssignments() {
      const start = (this.historyPage - 1) * this.itemsPerPage;
      return this.filteredHistoryAssignments.slice(start, start + this.itemsPerPage);
    }
  },
  watch: {
    historySearchQuery(newVal) {
      this.localHistorySearchQuery = newVal;
    },
    historyStatusFilter(newVal) {
      this.localHistoryStatusFilter = newVal;
    },
    historyFromDate(newVal) {
      this.localHistoryFromDate = newVal;
    },
    historyToDate(newVal) {
      this.localHistoryToDate = newVal;
    }
  },
  methods: {
    getOriginalIndex(assignment) {
      return this.assignments.findIndex(a => {
        const aDateStr = a.date instanceof Date ? a.date.toISOString().split('T')[0] : String(a.date).split('T')[0];
        const assignmentDateStr = assignment.date instanceof Date ? assignment.date.toISOString().split('T')[0] : String(assignment.date).split('T')[0];
        return a.pro === assignment.pro && 
              a.saName === assignment.saName && 
              aDateStr === assignmentDateStr;
      });
    },
    getEfficiencyColor(efficiency) {
      if (efficiency >= 80) return 'text-green-600';
      if (efficiency >= 60) return 'text-yellow-600';
      return 'text-red-600';
    },
    getTrendColor(trend) {
      if (trend === 'increasing') return 'text-green-600';
      if (trend === 'decreasing') return 'text-red-600';
      return 'text-slate-600';
    },
    getTrendIcon(trend) {
      if (trend === 'increasing') return '↑';
      if (trend === 'decreasing') return '↓';
      return '→';
    }
  }
};
</script>

