<template>
  <div class="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300">
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 text-white flex items-center gap-2 shadow-sm shrink-0 z-10">
      <span class="text-xl">📦</span>
      <h2 class="font-bold text-sm tracking-wide uppercase">Retail Orders</h2>
    </div>

    <div class="flex-1 overflow-y-auto p-3 relative">
      <ul class="space-y-2">
        <li v-for="(pr, index) in prOrders" :key="index" 
            class="group flex justify-between items-center p-2.5 bg-slate-50 hover:bg-indigo-50 hover:shadow-md rounded-lg border border-slate-100 transition-all duration-200 relative">
          <span class="text-xs font-semibold text-slate-700 truncate pr-2">{{ pr }}</span>
          <div class="relative">
            <button 
              class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
              @click.stop="$emit('toggle-dropdown', index, 'prOrders')"
            >
              <span class="text-lg leading-none font-bold">⋮</span>
            </button>
            <div v-if="dropdownIndex === index && dropdownType === 'prOrders'" 
                 class="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in-down">
              <button class="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:pl-5 transition-all duration-200 flex items-center gap-2" @click.stop="$emit('open-pr-edit', index, pr)">
                <span>✎</span> Edit
              </button>
              <button class="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 hover:pl-5 transition-all duration-200 flex items-center gap-2 border-t border-slate-100" @click.stop="$emit('open-pr-delete', index, pr)">
                <span>🗑</span> Delete
              </button>
            </div>
          </div>
        </li>
      </ul>
      <div v-if="prOrders.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
        <span class="text-4xl mb-2">📭</span>
        <span class="text-xs">No items added</span>
      </div>
    </div>

    <div class="p-3 bg-white border-t border-slate-100 shrink-0 z-10">
      <form @submit.prevent="$emit('add-pr-order')" class="flex gap-2">
        <input 
          v-model="localNewPROrder" 
          @input="$emit('update:newPROrder', localNewPROrder.toUpperCase())" 
          type="text"
          class="flex-1 rounded-lg border-slate-300 bg-slate-50 text-xs px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none hover:bg-white hover:border-indigo-300 transition-all duration-200"
          placeholder="Enter order..." 
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
  name: 'RetailOrdersCard',
  props: {
    prOrders: {
      type: Array,
      default: () => []
    },
    newPROrder: {
      type: String,
      default: ''
    },
    dropdownIndex: {
      type: Number,
      default: null
    },
    dropdownType: {
      type: String,
      default: null
    }
  },
  emits: ['add-pr-order', 'update:newPROrder', 'toggle-dropdown', 'open-pr-edit', 'open-pr-delete'],
  data() {
    return {
      localNewPROrder: this.newPROrder
    };
  },
  watch: {
    newPROrder(newVal) {
      this.localNewPROrder = newVal;
    }
  }
};
</script>

<style scoped>
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down { animation: fadeInDown 0.2s ease-out; }
</style>

