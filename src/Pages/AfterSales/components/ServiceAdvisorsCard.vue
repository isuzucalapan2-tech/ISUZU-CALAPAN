<template>
  <div class="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300">
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 text-white flex items-center gap-2 shadow-sm shrink-0">
      <span class="text-xl">👤</span>
      <h2 class="font-bold text-sm tracking-wide uppercase">Service Advisors</h2>
      <button 
        @click="$emit('toggle-fairness-dashboard')"
        class="ml-auto text-[10px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors"
      >
        {{ showFairnessDashboard ? 'Hide' : 'Show' }} Stats
      </button>
    </div>

    <!-- Fairness Dashboard -->
    <div v-if="showFairnessDashboard && serviceAdvisors.length > 0" class="bg-slate-50 border-b border-slate-200 p-2">
      <div class="flex items-center justify-between mb-1">
        <span class="text-[10px] font-bold text-slate-600 uppercase">Workload Balance</span>
        <span 
          class="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          :class="workloadDistribution.fairness.isBalanced ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
        >
          {{ workloadDistribution.fairness.balanceScore }}%
        </span>
      </div>
      <div class="w-full bg-slate-200 rounded-full h-1.5 mb-2">
        <div 
          class="h-1.5 rounded-full transition-all duration-500"
          :class="workloadDistribution.fairness.isBalanced ? 'bg-green-500' : 'bg-amber-500'"
          :style="{ width: workloadDistribution.fairness.balanceScore + '%' }"
        ></div>
      </div>
      <div class="grid grid-cols-3 gap-1 text-center">
        <div class="bg-white rounded p-1">
          <div class="text-[10px] text-slate-400">Avg Load</div>
          <div class="text-xs font-bold text-indigo-600">{{ workloadDistribution.fairness.averageOngoing }}</div>
        </div>
        <div class="bg-white rounded p-1">
          <div class="text-[10px] text-slate-400">Min</div>
          <div class="text-xs font-bold text-green-600">{{ workloadDistribution.fairness.minOngoing }}</div>
        </div>
        <div class="bg-white rounded p-1">
          <div class="text-[10px] text-slate-400">Max</div>
          <div class="text-xs font-bold text-red-600">{{ workloadDistribution.fairness.maxOngoing }}</div>
        </div>
      </div>
    </div>

    <div class="flex-1 p-3 overflow-y-auto">
      <ul class="space-y-2">
        <li v-for="(sa, index) in shuffledServiceAdvisors" :key="index" 
            class="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div class="flex flex-col min-w-0 flex-1 mr-2">
            <span class="text-sm font-bold text-slate-700 truncate">{{ sa.saName }}</span>
            <span 
              class="text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mt-1 uppercase"
              :class="{
                'bg-green-600 text-white': sa.saStatus === 'WORKING',
                'bg-red-600 text-white': sa.saStatus === 'BUSY',
                'bg-blue-600 text-white': sa.saStatus === 'AVAILABLE',
                'bg-amber-700 text-white': sa.saStatus === 'ABSENT',
                'bg-slate-500 text-white': sa.saStatus === 'IDLE'
              }"
            >
              {{ sa.saStatus }}
            </span>
            <!-- Workload Bar -->
            <div class="mt-1.5 flex items-center gap-1">
              <div class="flex-1 bg-slate-200 rounded-full h-1">
                <div 
                  class="h-1 rounded-full transition-all duration-300"
                  :class="getWorkloadColor(getOngoingProCount(sa.saName))"
                  :style="{ width: Math.min(100, (getOngoingProCount(sa.saName) / 5) * 100) + '%' }"
                ></div>
              </div>
              <span class="text-[8px] text-slate-400 w-3">{{ getOngoingProCount(sa.saName) }}</span>
            </div>
          </div>

          <div class="flex gap-2">
            <!-- Ongoing PROs -->
            <div class="relative group" @mouseenter="$emit('hover-sa', index)" @mouseleave="$emit('hover-sa', null)">
              <div class="flex flex-col items-center bg-white border border-indigo-100 shadow-sm rounded px-2 py-1 cursor-help hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <span class="text-xs font-black text-indigo-600 leading-none">{{ getOngoingProCount(sa.saName) }}</span>
                <span class="text-[8px] text-slate-400 uppercase">Ongoing</span>
              </div>
              <div v-if="hoveringSAIndex === index" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in-up">
                <div class="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 text-center">Handled PROs</div>
                <ul class="max-h-32 overflow-y-auto py-1">
                  <li v-if="getOngoingProsList(sa.saName).length === 0" class="text-center text-[10px] text-slate-400 py-2 italic">No ongoing PROs</li>
                  <li v-for="pro in getOngoingProsList(sa.saName)" :key="pro" class="px-2 py-1 text-[10px] text-slate-700 border-b border-slate-50 last:border-0 truncate">
                    {{ pro }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Job Done -->
            <div class="relative group" @mouseenter="$emit('hover-job-done', index)" @mouseleave="$emit('hover-job-done', null)">
              <div class="flex flex-col items-center bg-white border border-green-100 shadow-sm rounded px-2 py-1 cursor-help hover:border-green-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <span class="text-xs font-black text-green-600 leading-none">{{ getJobDoneProCount(sa.saName) }}</span>
                <span class="text-[8px] text-slate-400 uppercase">Job Done</span>
              </div>
              <div v-if="hoveringJobDoneIndex === index" class="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in-up">
                <div class="bg-green-600 text-white text-[10px] font-bold px-2 py-1 text-center">Completed PROs</div>
                <ul class="max-h-32 overflow-y-auto py-1">
                  <li v-if="getJobDoneProsList(sa.saName).length === 0" class="text-center text-[10px] text-slate-400 py-2 italic">No completed PROs</li>
                  <li v-for="pro in getJobDoneProsList(sa.saName)" :key="pro" class="px-2 py-1 text-[10px] text-slate-700 border-b border-slate-50 last:border-0 truncate">
                    {{ pro }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Cancelled -->
            <div class="relative group" @mouseenter="$emit('hover-cancelled', index)" @mouseleave="$emit('hover-cancelled', null)">
              <div class="flex flex-col items-center bg-white border border-red-100 shadow-sm rounded px-2 py-1 cursor-help hover:border-red-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <span class="text-xs font-black text-red-600 leading-none">{{ getCancelledProCount(sa.saName) }}</span>
                <span class="text-[8px] text-slate-400 uppercase">Cancelled</span>
              </div>
              <div v-if="hoveringCancelledIndex === index" class="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in-up">
                <div class="bg-red-600 text-white text-[10px] font-bold px-2 py-1 text-center">Cancelled PROs</div>
                <ul class="max-h-32 overflow-y-auto py-1">
                  <li v-if="getCancelledProsList(sa.saName).length === 0" class="text-center text-[10px] text-slate-400 py-2 italic">No cancelled PROs</li>
                  <li v-for="pro in getCancelledProsList(sa.saName)" :key="pro" class="px-2 py-1 text-[10px] text-slate-700 border-b border-slate-50 last:border-0 truncate">
                    {{ pro }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Dropdown Menu -->
            <div class="relative">
              <button class="h-full px-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 hover:shadow-sm rounded transition-all duration-200"
                 @click.stop="$emit('toggle-dropdown', index, 'serviceAdvisors')">
                ⋮
              </button>
              <div v-if="dropdownIndex === index && dropdownType === 'serviceAdvisors'" 
                   class="absolute right-0 bottom-full mb-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-[60] overflow-hidden animate-fade-in-up">
                <button class="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:pl-4 transition-all duration-200" @click.stop="$emit('open-sa-edit', index, sa.saName, sa.saStatus)">✎ Edit</button>
                <button class="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 hover:pl-4 border-t border-slate-100 transition-all duration-200" @click.stop="$emit('open-sa-delete', index, sa.saName)">🗑 Delete</button>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <div v-if="serviceAdvisors.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
        <span class="text-4xl mb-2">📭</span>
        <span class="text-xs">No advisors</span>
      </div>
    </div>

    <div class="p-3 bg-white border-t border-slate-100 shrink-0 z-10">
      <form @submit.prevent="$emit('add-service-advisor')" class="flex gap-2">
        <input 
          v-model="localNewServiceAdvisor" 
          @input="$emit('update:newServiceAdvisor', localNewServiceAdvisor.toUpperCase())" 
          type="text"
          class="flex-1 rounded-lg border-slate-300 bg-slate-50 text-xs px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all hover:bg-white hover:border-indigo-300"
          placeholder="Enter name..." 
          required
        />
        <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shadow-md">
          Add
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ServiceAdvisorsCard',
  props: {
    serviceAdvisors: {
      type: Array,
      default: () => []
    },
    newServiceAdvisor: {
      type: String,
      default: ''
    },
    assignments: {
      type: Array,
      default: () => []
    },
    showFairnessDashboard: {
      type: Boolean,
      default: true
    },
    dropdownIndex: {
      type: Number,
      default: null
    },
    dropdownType: {
      type: String,
      default: null
    },
    hoveringSAIndex: {
      type: Number,
      default: null
    },
    hoveringJobDoneIndex: {
      type: Number,
      default: null
    },
    hoveringCancelledIndex: {
      type: Number,
      default: null
    },
    workloadDistribution: {
      type: Object,
      default: () => ({
        fairness: {
          balanceScore: 0,
          isBalanced: true,
          averageOngoing: 0,
          minOngoing: 0,
          maxOngoing: 0
        }
      })
    }
  },
  emits: [
    'add-service-advisor', 
    'update:newServiceAdvisor', 
    'toggle-dropdown', 
    'open-sa-edit', 
    'open-sa-delete',
    'toggle-fairness-dashboard',
    'hover-sa',
    'hover-job-done',
    'hover-cancelled'
  ],
  data() {
    return {
      localNewServiceAdvisor: this.newServiceAdvisor
    };
  },
  computed: {
    shuffledServiceAdvisors() {
      const array = [...this.serviceAdvisors];
      return this.fisherYatesShuffle(array);
    }
  },
  watch: {
    newServiceAdvisor(newVal) {
      this.localNewServiceAdvisor = newVal;
    }
  },
  methods: {
    fisherYatesShuffle(array) {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },
    getOngoingProCount(saName) {
      return this.assignments.filter(
        a => a.saName === saName && a.status === "ON GOING"
      ).length;
    },
    getOngoingProsList(saName) {
      return this.assignments
        .filter(a => a.saName === saName && a.status === "ON GOING")
        .map(a => a.pro);
    },
    getJobDoneProCount(saName) {
      return new Set(
        this.assignments
          .filter(a => a.saName === saName && a.status === "JOB DONE")
          .map(a => a.pro)
      ).size;
    },
    getJobDoneProsList(saName) {
      return [...new Set(
        this.assignments
          .filter(a => a.saName === saName && a.status === "JOB DONE")
          .map(a => a.pro)
      )];
    },
    getCancelledProCount(saName) {
      return new Set(
        this.assignments
          .filter(a => a.saName === saName && a.status === "CANCELLED")
          .map(a => a.pro)
      ).size;
    },
    getCancelledProsList(saName) {
      return [...new Set(
        this.assignments
          .filter(a => a.saName === saName && a.status === 'CANCELLED')
          .map(a => a.pro)
      )];
    },
    getWorkloadColor(count) {
      if (count <= 1) return 'bg-green-500';
      if (count === 2) return 'bg-yellow-500';
      if (count === 3) return 'bg-orange-500';
      if (count >= 4) return 'bg-red-500';
      return 'bg-slate-400';
    }
  }
};
</script>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fadeInUp 0.2s ease-out; }
</style>

