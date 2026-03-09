<template>
  <div class="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300">
    <div class="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center shrink-0">
      <div class="flex items-center gap-2 text-indigo-700">
        <span class="text-xl">📋</span>
        <h2 class="font-bold text-sm tracking-wide uppercase">Performed Retail Orders</h2>
      </div>
      <input 
          v-model="localSearchQuery"
          @input="$emit('update:searchQuery', localSearchQuery)"
          type="text"
          class="bg-white border border-slate-300 text-xs rounded-md px-3 py-1.5 w-64 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 transition-colors duration-200"
          placeholder="Search PRO or SA..."
      />
    </div>
    
    <div class="flex-1 overflow-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50 sticky top-0 z-10">
          <tr>
            <th class="px-2 py-1 text-left text-[13px] font-bold text-slate-500 uppercase tracking-wider">PRO</th>
            <th class="px-2 py-1 text-left text-[13px] font-bold text-slate-500 uppercase tracking-wider">Advisor</th>
            <th class="px-2 py-1 text-left text-[13px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
            <th class="px-2 py-1 text-left text-[13px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
            <th class="px-2 py-1 text-right text-[13px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-100">
          <tr v-for="(assignment, index) in paginatedActiveAssignments" :key="index" class="hover:bg-indigo-50/50 hover:shadow-sm transition-all duration-200">
            <td class="px-3 py-2 whitespace-nowrap text-[12px] font-medium text-slate-900">{{ assignment.pro }}</td>
            <td class="px-3 py-2 whitespace-nowrap text-[12px] text-slate-600">{{ assignment.saName }}</td>
            <td class="px-3 py-2 whitespace-nowrap">
              <span 
                :class="[
                  'px-1.5 inline-flex text-[10px] leading-4 font-semibold rounded-full uppercase',
                  isAssignmentCutOff(assignment) 
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                ]"
              >
                {{ isAssignmentCutOff(assignment) ? 'CUT OFF' : assignment.status }}
              </span>
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-[12px] text-slate-400">{{ formatDate(assignment.date) }}</td>
            <td class="px-3 py-2 whitespace-nowrap text-right text-sm font-medium space-x-1">
              <template v-if="isAssignmentCutOff(assignment)">
                <button class="text-red-600 hover:text-red-900" title="Delete" @click="$emit('delete-assignment-direct', getOriginalIndex(assignment))">🗑</button>
                <button class="text-amber-600 hover:text-amber-900" title="Reassign" @click="$emit('reassign-assignment', getOriginalIndex(assignment))">🔄</button>
              </template>
              <template v-else>
                <button class="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded px-1 transition-all duration-200" title="Edit" @click="$emit('open-edit-modal', getOriginalIndex(assignment), assignment)">✎</button>
                <button class="text-green-600 hover:text-green-900 hover:bg-green-100 rounded px-1 transition-all duration-200" title="Done" @click="$emit('mark-as-done', getOriginalIndex(assignment))">✓</button>
                <button class="text-orange-500 hover:text-orange-900 hover:bg-orange-100 rounded px-1 transition-all duration-200" title="Cancel" @click="$emit('cancel-assignment', getOriginalIndex(assignment))">✕</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredActiveAssignments.length === 0" class="p-8 text-center text-slate-400 text-sm">
        No active assignments found.
      </div>
    </div>

    <div class="p-2 border-t border-slate-200 bg-slate-50 flex justify-center gap-2 shrink-0">
      <button @click="$emit('prev-page')" :disabled="currentPage === 1" class="px-2 py-1 text-xs border rounded hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50">← Prev</button>
      <span class="text-xs self-center font-medium text-slate-600">Page {{ currentPage }}</span>
      <button @click="$emit('next-page')" :disabled="currentPage === totalActivePages" class="px-2 py-1 text-xs border rounded hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50">Next →</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PerformedRetailOrders',
  props: {
    assignments: {
      type: Array,
      default: () => []
    },
    searchQuery: {
      type: String,
      default: ''
    },
    itemsPerPage: {
      type: Number,
      default: 5
    },
    currentPage: {
      type: Number,
      default: 1
    },
    todayDate: {
      type: String,
      default: ''
    }
  },
  emits: [
    'update:searchQuery',
    'delete-assignment-direct',
    'reassign-assignment',
    'open-edit-modal',
    'mark-as-done',
    'cancel-assignment',
    'prev-page',
    'next-page'
  ],
  data() {
    return {
      localSearchQuery: this.searchQuery
    };
  },
  computed: {
    filteredActiveAssignments() {
      return this.assignments.filter(assignment => {
        const matchesSearch = !this.searchQuery || 
          assignment.pro.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          assignment.saName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (assignment.note && assignment.note.toLowerCase().includes(this.searchQuery.toLowerCase()));
        const isOnGoing = assignment.status === "ON GOING";
        return matchesSearch && isOnGoing;
      });
    },
    totalActivePages() {
      return Math.ceil(this.filteredActiveAssignments.length / this.itemsPerPage) || 1;
    },
    paginatedActiveAssignments() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredActiveAssignments.slice(start, start + this.itemsPerPage);
    }
  },
  watch: {
    searchQuery(newVal) {
      this.localSearchQuery = newVal;
    }
  },
  methods: {
    isAssignmentCutOff(assignment) {
      if (assignment.status !== "ON GOING") {
        return false;
      }
      const today = this.todayDate;
      const assignmentDateStr = assignment.date instanceof Date ? assignment.date.toISOString().split('T')[0] : String(assignment.date).split('T')[0];
      return assignmentDateStr !== today;
    },
    getOriginalIndex(assignment) {
      return this.assignments.findIndex(a => {
        const aDateStr = a.date instanceof Date ? a.date.toISOString().split('T')[0] : String(a.date).split('T')[0];
        const assignmentDateStr = assignment.date instanceof Date ? assignment.date.toISOString().split('T')[0] : String(assignment.date).split('T')[0];
        return a.pro === assignment.pro && 
              a.saName === assignment.saName && 
              aDateStr === assignmentDateStr;
      });
    },
    formatDate(date) {
      if (!date) return "—";
      const d = new Date(date);
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const year = d.getFullYear();
      return `${month}/${day}/${year}`;
    }
  }
};
</script>

