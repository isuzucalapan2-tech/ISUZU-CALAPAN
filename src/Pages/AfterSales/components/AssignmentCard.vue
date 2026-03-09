<template>
  <div class="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300">
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 text-white flex items-center gap-2 shadow-sm shrink-0 z-10">
      <span class="text-xl">🎯</span>
      <h2 class="font-bold text-sm tracking-wide uppercase">SA's Assign to RO's</h2>
    </div>

    <div class="flex-1 overflow-y-auto p-2 bg-slate-50/50">
      <div class="space-y-2">
        <div>
          <label class="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Select Retail Order</label>
          <select v-model="localSelectedPRO" @change="onProSelected" class="w-full rounded-lg border-slate-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1.5 hover:border-indigo-400 transition-colors duration-200">
            <option value="">Choose a Retail Order</option>
            <option v-for="pro in prOrders" :key="pro" :value="pro">{{ pro }}</option>
          </select>
        </div>

        <div v-if="localSelectedPRO && selectedSA" class="bg-indigo-50 border border-indigo-100 rounded-lg p-1 text-center transition-all">
          <div class="text-[8px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Auto-Assigned Agent</div>
          <div>
             <div class="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold py-0.5 px-1.5 rounded-lg shadow-lg inline-block mb-0.5">
               {{ selectedSA }}
             </div>
             <div class="text-[9px] text-indigo-600 font-medium">{{ assignmentReason }}</div>
          </div>
          <div v-if="!selectedSA" class="text-red-500 text-[9px] font-bold bg-red-50 p-0.5 rounded">
            No Agents Available
          </div>
        </div>

        <!-- Top Candidates Panel -->
        <div v-if="localSelectedPRO && topCandidates.length > 0" class="bg-white border border-slate-200 rounded-lg p-2">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[9px] font-bold text-slate-500 uppercase">Top Candidates</span>
            <button @click="$emit('toggle-top-candidates')" class="text-[8px] text-indigo-600 hover:text-indigo-800">
              {{ showTopCandidates ? 'Hide' : 'Show' }}
            </button>
          </div>
          <div v-if="showTopCandidates" class="space-y-1">
            <div v-for="(candidate, idx) in topCandidates" :key="candidate.saName" 
                 class="flex items-center justify-between p-1.5 rounded text-[10px]"
                 :class="{
                   'bg-yellow-50 border border-yellow-200': idx === 0,
                   'bg-slate-50 border border-slate-100': idx === 1,
                   'bg-orange-50 border border-orange-100': idx === 2
                 }">
              <div class="flex items-center gap-1.5">
                <span class="text-xs">{{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉' }}</span>
                <span class="font-semibold" :class="{ 'text-yellow-700': idx === 0 }">{{ candidate.saName }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex flex-col items-end">
                  <span class="text-[8px] text-slate-400">Score</span>
                  <span class="font-bold" :class="{
                    'text-yellow-600': idx === 0,
                    'text-slate-600': idx === 1,
                    'text-orange-600': idx === 2
                  }">{{ (candidate.totalScore * 100).toFixed(0) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fairness Warning -->
        <div v-if="fairnessWarning && fairnessWarning.wouldImpact" 
             class="bg-amber-50 border border-amber-200 rounded-lg p-2 animate-fade-in">
          <div class="flex items-start gap-2">
            <span class="text-sm">{{ fairnessWarning.severity === 'high' ? '⚠️' : 'ℹ️' }}</span>
            <div class="flex-1">
              <p class="text-[10px] text-amber-800 font-medium leading-tight">{{ fairnessWarning.message }}</p>
              <button @click="$emit('clear-fairness-warning')" class="text-[8px] text-amber-600 hover:text-amber-800 mt-1 underline">
                Dismiss
              </button>
            </div>
          </div>
        </div>

        <button 
          @click="$emit('toggle-manual-selection')"
          class="w-full py-1 text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded-md hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
        >
          {{ showManualSelection ? 'Close Manual Selection' : '+ Override Auto-Assign' }}
        </button>

        <!-- Manual Selection Grid -->
        <div v-if="showManualSelection" class="grid grid-cols-3 gap-1 bg-white p-1.5 rounded-lg border border-slate-200">
          <button 
            v-for="sa in shuffledAvailableSAs" 
            :key="sa.saName"
            type="button"
            :class="[
              'flex flex-col items-center p-1.5 rounded-md border text-[10px] transition-all duration-200',
              localSelectedSA === sa.saName 
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold ring-1 ring-indigo-500' 
                : 'border-slate-100 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-sm hover:-translate-y-0.5 text-slate-600'
            ]"
            @click="$emit('select-manual-sa', sa.saName)"
          >
            <span>{{ sa.saName }}</span>
            <span class="text-[8px] opacity-70">{{ sa.saStatus }}</span>
          </button>
          <button @click="$emit('reset-auto-assignment')" class="col-span-3 text-[9px] text-green-600 font-bold uppercase tracking-wide py-0.5 hover:underline hover:text-green-700 transition-colors duration-200">
            ↻ Reset to Auto
          </button>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Note (Optional)</label>
          <textarea 
            v-model="localNote" 
            @input="$emit('update:note', localNote)"
            class="w-full rounded-lg border-slate-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-1 min-h-12 hover:border-indigo-400 hover:bg-white transition-all duration-200"
            placeholder="Add notes..."
            rows="2"
          ></textarea>
        </div>
      </div>
    </div>

    <div class="p-3 bg-white border-t border-slate-100 shrink-0 z-10">
        <button 
          @click="$emit('proceed-assignment')"
          :disabled="!localSelectedPRO || !localSelectedSA || isHistoryDateFilterNotToday"
          :title="isHistoryDateFilterNotToday ? 'Can only assign when viewing today\'s history' : ''"
          class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Assign Order
        </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssignmentCard',
  props: {
    prOrders: {
      type: Array,
      default: () => []
    },
    serviceAdvisors: {
      type: Array,
      default: () => []
    },
    assignments: {
      type: Array,
      default: () => []
    },
    assignmentForm: {
      type: Object,
      default: () => ({
        selectedPRO: '',
        selectedSA: '',
        note: '',
        assignmentReason: ''
      })
    },
    showManualSelection: {
      type: Boolean,
      default: false
    },
    showTopCandidates: {
      type: Boolean,
      default: false
    },
    topCandidates: {
      type: Array,
      default: () => []
    },
    fairnessWarning: {
      type: Object,
      default: null
    },
    isHistoryDateFilterNotToday: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'update:assignmentForm',
    'update:note',
    'proceed-assignment',
    'toggle-manual-selection',
    'toggle-top-candidates',
    'select-manual-sa',
    'reset-auto-assignment',
    'clear-fairness-warning',
    'pro-selected'
  ],
  data() {
    return {
      localSelectedPRO: this.assignmentForm.selectedPRO,
      localSelectedSA: this.assignmentForm.selectedSA,
      localNote: this.assignmentForm.note
    };
  },
  computed: {
    shuffledAvailableSAs() {
      const available = this.serviceAdvisors.filter(s => s.saStatus !== 'BUSY' && s.saStatus !== 'ABSENT');
      return this.fisherYatesShuffle([...available]);
    },
    selectedSA() {
      return this.assignmentForm.selectedSA;
    },
    assignmentReason() {
      return this.assignmentForm.assignmentReason;
    }
  },
  watch: {
    assignmentForm: {
      handler(newVal) {
        this.localSelectedPRO = newVal.selectedPRO;
        this.localSelectedSA = newVal.selectedSA;
        this.localNote = newVal.note;
      },
      deep: true
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
    onProSelected() {
      this.$emit('update:assignmentForm', {
        ...this.assignmentForm,
        selectedPRO: this.localSelectedPRO
      });
      this.$emit('pro-selected');
    }
  }
};
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in { animation: fadeIn 0.2s ease-out; }
</style>

