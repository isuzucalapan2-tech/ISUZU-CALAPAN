<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-white">
    <Loaders />
  </div>

    <div v-else :class="themeClass" class="min-h-screen flex flex-col font-sans relative overflow-hidden bg-white">
      
      <div class="absolute top-0 left-0 w-full z-0 opacity-5 pointer-events-none">
        <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
          <path d="M0 15 H280 L330 45 H500" stroke="#cc0000" stroke-width="2" />
        </svg>
      </div>

      <main class="flex-1 relative z-10 overflow-auto">
        <div class="max-w-full mx-auto p-3 sm:p-4 lg:p-6 xl:p-10 space-y-6 sm:space-y-8 lg:space-y-12">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 :class="['text-xl sm:text-3xl font-black text-neutral-900 isuzu-font uppercase tracking-tight flex items-center gap-2 sm:gap-3', textClass]">
                <span class="w-2 h-8 sm:h-10 bg-red-600 rounded-full"></span>
                System <span class="text-red-600">Dashboard</span>
              </h1>
              <p :class="['text-[8px] sm:text-[10px] uppercase tracking-[0.3em] ml-3 sm:ml-5', subTextClass]">Real-time Operations Overview</p>
            </div>
            
            <div :class="[cardClass, 'backdrop-blur-sm border border-neutral-400 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-3 sm:gap-4']">
              <Calendar class="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
              <span :class="['text-[9px] sm:text-xs font-bold uppercase tracking-widest', subTextClass]">{{ new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}</span>
            </div>
          </div>

          <!-- INVENTORY GROUP - Only show if user has inventory access -->
          <section v-if="canViewInventory" id="dashboard-group-inventory" class="space-y-6">
            <div class="flex items-center gap-3 mb-2">
              <div class="bg-red-600 p-2 rounded-xl">
                <Boxes class="w-5 h-5 text-white" />
              </div>
              <h2 :class="['text-lg text-neutral-900 uppercase tracking-tighter isuzu-font', textClass]">Inventory <span class="text-red-600">Overview</span></h2>
            </div>

            <!-- DYNAMIC INVENTORY DASHBOARD CARDS -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
              <!-- Total Items -->
              <div :class="[cardClass, 'rounded-2xl p-6 flex flex-col items-start justify-between relative overflow-hidden group']" :style="cardStyle">
                <div class="flex items-center gap-2 mb-2">
                  <Boxes class="w-6 h-6 text-red-600" />
                  <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Items</span>
                </div>
                <p class="text-3xl font-black text-neutral-900">{{ inventoryItems.length }}</p>
                <span class="mt-2 text-[10px] text-gray-500 uppercase">Unique Inventory Records</span>
              </div>

              <!-- Total Stock Quantity -->
              <div :class="[cardClass, 'rounded-2xl p-6 flex flex-col items-start justify-between relative overflow-hidden group']" :style="cardStyle">
                <div class="flex items-center gap-2 mb-2">
                  <Package class="w-6 h-6 text-green-600" />
                  <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Quantity</span>
                </div>
                <p class="text-3xl font-black text-green-600">{{ totalInventoryQuantity.toLocaleString() }}</p>
                <span class="mt-2 text-[10px] text-gray-500 uppercase">All Stock Units</span>
              </div>

              <!-- Total Inventory Value -->
              <div :class="[cardClass, 'rounded-2xl p-6 flex flex-col items-start justify-between relative overflow-hidden group']" :style="cardStyle">
                <div class="flex items-center gap-2 mb-2">
                  <Banknote class="w-6 h-6 text-emerald-600" />
                  <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Value</span>
                </div>
                <p class="text-3xl font-black text-emerald-600">₱{{ totalInventoryValue.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</p>
                <span class="mt-2 text-[10px] text-gray-500 uppercase">Inventory Valuation</span>
              </div>


              <!-- Low Stock Items with Popover/Modal (fixed popover logic) -->
              <div class="relative group" @mouseenter="showLowStockPopover = true" @mouseleave="showLowStockPopover = false">
                <div
                  :class="[cardClass, 'rounded-2xl p-6 flex flex-col items-start justify-between relative cursor-pointer']"
                  :style="cardStyle"
                  @click="toggleLowStockModal"
                  tabindex="0"
                  @keydown.enter="toggleLowStockModal"
                  @keydown.space.prevent="toggleLowStockModal"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <AlertTriangle class="w-6 h-6 text-orange-500" />
                    <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Low Stock</span>
                  </div>
                  <p class="text-3xl font-black text-orange-500">{{ lowStockItems.length }}</p>
                  <span class="mt-2 text-[10px] text-gray-500 uppercase">Below Minimum</span>
                </div>
                <!-- Desktop Popover -->
                <div
                  v-if="showLowStockPopover && !isMobile"
                  class="absolute left-0 top-full mt-2 z-50 w-80 bg-gray-50 border border-gray-200 rounded-xl shadow-xl p-3"
                >
                  <div class="font-bold text-orange-600 text-xs mb-2">Low Stock Items</div>
                  <div v-if="lowStockItems.length === 0" class="text-xs text-gray-400">No low stock items.</div>
                  <div v-else class="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800">
                    <div v-for="item in lowStockItems" :key="item.id" class="py-2">
                      <div class="font-bold text-[11px] text-orange-700">{{ item.partName || 'N/A' }}</div>
                      <div class="text-[10px] text-gray-500">Part No: <span class="font-mono">{{ item.partNo }}</span></div>
                      <div class="text-[10px] text-gray-500">Model: <span>{{ item.model || 'N/A' }}</span></div>
                      <div class="text-[10px] text-orange-600">Stock: <span class="font-bold">{{ item.quantity }}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mobile Modal -->
              <transition name="fade">
                <div v-if="showLowStockModal && isMobile" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-11/12 max-w-md p-5 relative">
                    <button @click="showLowStockModal = false" class="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                      <X class="w-5 h-5" />
                    </button>
                    <div class="font-bold text-orange-600 text-base mb-3">Low Stock Items</div>
                    <div v-if="lowStockItems.length === 0" class="text-xs text-gray-400">No low stock items.</div>
                    <div v-else class="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800">
                      <div v-for="item in lowStockItems" :key="item.id" class="py-3">
                        <div class="font-bold text-[13px] text-orange-700">{{ item.partName || 'N/A' }}</div>
                        <div class="text-[11px] text-gray-500">Part No: <span class="font-mono">{{ item.partNo }}</span></div>
                        <div class="text-[11px] text-gray-500">Model: <span>{{ item.model || 'N/A' }}</span></div>
                        <div class="text-[11px] text-orange-600">Stock: <span class="font-bold">{{ item.quantity }}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>


              <!-- Out of Stock Items with Popover/Modal -->
              <div class="relative group" @mouseenter="showOutOfStockPopover = true" @mouseleave="showOutOfStockPopover = false">
                <div
                  :class="[cardClass, 'rounded-2xl p-6 flex flex-col items-start justify-between relative cursor-pointer']"
                  :style="cardStyle"
                  @click="toggleOutOfStockModal"
                  tabindex="0"
                  @keydown.enter="toggleOutOfStockModal"
                  @keydown.space.prevent="toggleOutOfStockModal"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <PackageX class="w-6 h-6 text-red-600" />
                    <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Out of Stock</span>
                  </div>
                  <p class="text-3xl font-black text-red-600">{{ outOfStockItems.length }}</p>
                  <span class="mt-2 text-[10px] text-gray-500 uppercase">Zero Quantity</span>
                </div>
                <!-- Desktop Popover -->
                <div
                  v-if="showOutOfStockPopover && !isMobile"
                  class="absolute left-0 top-full mt-2 z-50 w-80 bg-gray-50 border border-gray-200 rounded-xl shadow-xl p-3"
                >
                  <div class="font-bold text-red-600 text-xs mb-2">Out of Stock Items</div>
                  <div v-if="outOfStockItems.length === 0" class="text-xs text-gray-400">No out of stock items.</div>
                  <div v-else class="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800">
                    <div v-for="item in outOfStockItems" :key="item.id" class="py-2">
                      <div class="font-bold text-[11px] text-red-700">{{ item.partName || 'N/A' }}</div>
                      <div class="text-[10px] text-gray-500">Part No: <span class="font-mono">{{ item.partNo }}</span></div>
                      <div class="text-[10px] text-gray-500">Model: <span>{{ item.model || 'N/A' }}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mobile Modal -->
              <transition name="fade">
                <div v-if="showOutOfStockModal && isMobile" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-11/12 max-w-md p-5 relative">
                    <button @click="showOutOfStockModal = false" class="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                      <X class="w-5 h-5" />
                    </button>
                    <div class="font-bold text-red-600 text-base mb-3">Out of Stock Items</div>
                    <div v-if="outOfStockItems.length === 0" class="text-xs text-gray-400">No out of stock items.</div>
                    <div v-else class="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800">
                      <div v-for="item in outOfStockItems" :key="item.id" class="py-3">
                        <div class="font-bold text-[13px] text-red-700">{{ item.partName || 'N/A' }}</div>
                        <div class="text-[11px] text-gray-500">Part No: <span class="font-mono">{{ item.partNo }}</span></div>
                        <div class="text-[11px] text-gray-500">Model: <span>{{ item.model || 'N/A' }}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>

              <!-- Categories Count -->
              <div :class="[cardClass, 'rounded-2xl p-6 flex flex-col items-start justify-between relative overflow-hidden group']" :style="cardStyle">
                <div class="flex items-center gap-2 mb-2">
                  <Filter class="w-6 h-6 text-blue-600" />
                  <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Categories</span>
                </div>
                <p class="text-3xl font-black text-blue-600">{{ uniqueCategories.length }}</p>
                <span class="mt-2 text-[10px] text-gray-500 uppercase">Inventory Groups</span>
              </div>


              <!-- Most Stocked Items with Popover/Modal -->
              <div v-if="mostStockedItem" class="relative group" @mouseenter="showMostStockedPopover = true" @mouseleave="showMostStockedPopover = false">
                <div
                  :class="[cardClass, 'rounded-2xl p-6 flex flex-col items-start justify-between relative cursor-pointer']"
                  :style="cardStyle"
                  @click="toggleMostStockedModal"
                  tabindex="0"
                  @keydown.enter="toggleMostStockedModal"
                  @keydown.space.prevent="toggleMostStockedModal"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <ChevronUp class="w-6 h-6 text-green-700" />
                    <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Most Stocked</span>
                  </div>
                  <p class="text-lg font-black text-green-700">{{ mostStockedItem.partName || mostStockedItem.partNo }}</p>
                  <span class="mt-2 text-[10px] text-gray-500 uppercase">Qty: {{ mostStockedItem.quantity }}</span>
                </div>
                <!-- Desktop Popover -->
                <div
                  v-if="showMostStockedPopover && !isMobile"
                  class="absolute left-0 top-full mt-2 z-50 w-80 bg-gray-50 border border-gray-200 rounded-xl shadow-xl p-3"
                >
                  <div class="font-bold text-green-700 text-xs mb-2">Top 5 Most Stocked</div>
                  <div v-if="topMostStocked.length === 0" class="text-xs text-gray-400">No items.</div>
                  <div v-else class="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800">
                    <div v-for="item in topMostStocked" :key="item.id" class="py-2 flex justify-between items-center">
                      <span class="font-bold text-[11px] text-green-700">{{ item.partName || 'N/A' }}</span>
                      <span class="text-[11px] font-black">{{ item.quantity }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mobile Modal -->
              <transition name="fade">
                <div v-if="showMostStockedModal && isMobile" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-11/12 max-w-md p-5 relative">
                    <button @click="showMostStockedModal = false" class="absolute top-2 right-2 text-gray-400 hover:text-green-700">
                      <X class="w-5 h-5" />
                    </button>
                    <div class="font-bold text-green-700 text-base mb-3">Top 5 Most Stocked</div>
                    <div v-if="topMostStocked.length === 0" class="text-xs text-gray-400">No items.</div>
                    <div v-else class="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800">
                      <div v-for="item in topMostStocked" :key="item.id" class="py-3 flex justify-between items-center">
                        <span class="font-bold text-[13px] text-green-700">{{ item.partName || 'N/A' }}</span>
                        <span class="text-[13px] font-black">{{ item.quantity }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>


              <!-- Least Stocked Items with Popover/Modal -->
              <div v-if="leastStockedItem" class="relative group" @mouseenter="showLeastStockedPopover = true" @mouseleave="showLeastStockedPopover = false">
                <div
                  :class="[cardClass, 'rounded-2xl p-6 flex flex-col items-start justify-between relative cursor-pointer']"
                  :style="cardStyle"
                  @click="toggleLeastStockedModal"
                  tabindex="0"
                  @keydown.enter="toggleLeastStockedModal"
                  @keydown.space.prevent="toggleLeastStockedModal"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <ChevronDown class="w-6 h-6 text-orange-700" />
                    <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Least Stocked</span>
                  </div>
                  <p class="text-lg font-black text-orange-700">{{ leastStockedItem.partName || leastStockedItem.partNo }}</p>
                  <span class="mt-2 text-[10px] text-gray-500 uppercase">Qty: {{ leastStockedItem.quantity }}</span>
                </div>
                <!-- Desktop Popover -->
                <div
                  v-if="showLeastStockedPopover && !isMobile"
                  class="absolute left-0 top-full mt-2 z-50 w-80 bg-gray-50 border border-gray-200 rounded-xl shadow-xl p-3"
                >
                  <div class="font-bold text-orange-700 text-xs mb-2">Top 5 Least Stocked</div>
                  <div v-if="topLeastStocked.length === 0" class="text-xs text-gray-400">No items.</div>
                  <div v-else class="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800">
                    <div v-for="item in topLeastStocked" :key="item.id" class="py-2 flex justify-between items-center">
                      <span class="font-bold text-[11px] text-orange-700">{{ item.partName || 'N/A' }}</span>
                      <span class="text-[11px] font-black">{{ item.quantity }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mobile Modal -->
              <transition name="fade">
                <div v-if="showLeastStockedModal && isMobile" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-11/12 max-w-md p-5 relative">
                    <button @click="showLeastStockedModal = false" class="absolute top-2 right-2 text-gray-400 hover:text-orange-700">
                      <X class="w-5 h-5" />
                    </button>
                    <div class="font-bold text-orange-700 text-base mb-3">Top 5 Least Stocked</div>
                    <div v-if="topLeastStocked.length === 0" class="text-xs text-gray-400">No items.</div>
                    <div v-else class="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800">
                      <div v-for="item in topLeastStocked" :key="item.id" class="py-3 flex justify-between items-center">
                        <span class="font-bold text-[13px] text-orange-700">{{ item.partName || 'N/A' }}</span>
                        <span class="text-[13px] font-black">{{ item.quantity }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>


              <!-- Highest Value Items with Popover/Modal -->
              <div v-if="highestValueItem" class="relative group" @mouseenter="showHighestValuePopover = true" @mouseleave="showHighestValuePopover = false">
                <div
                  :class="[cardClass, 'rounded-2xl p-6 flex flex-col items-start justify-between relative cursor-pointer']"
                  :style="cardStyle"
                  @click="toggleHighestValueModal"
                  tabindex="0"
                  @keydown.enter="toggleHighestValueModal"
                  @keydown.space.prevent="toggleHighestValueModal"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <Banknote class="w-6 h-6 text-emerald-700" />
                    <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Highest Value</span>
                  </div>
                  <p class="text-lg font-black text-emerald-700">{{ highestValueItem.partName || highestValueItem.partNo }}</p>
                  <span class="mt-2 text-[10px] text-gray-500 uppercase">₱{{ highestValueItem.totalValue?.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</span>
                </div>
                <!-- Desktop Popover -->
                <div
                  v-if="showHighestValuePopover && !isMobile"
                  class="absolute left-0 top-full mt-2 z-50 w-80 bg-gray-50 border border-gray-200 rounded-xl shadow-xl p-3"
                >
                  <div class="font-bold text-emerald-700 text-xs mb-2">Top 5 Highest Value</div>
                  <div v-if="topHighestValue.length === 0" class="text-xs text-gray-400">No items.</div>
                  <div v-else class="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800">
                    <div v-for="item in topHighestValue" :key="item.id" class="py-2 flex justify-between items-center">
                      <span class="font-bold text-[11px] text-emerald-700">{{ item.partName || 'N/A' }}</span>
                      <span class="text-[11px] font-black">₱{{ item.totalValue?.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mobile Modal -->
              <transition name="fade">
                <div v-if="showHighestValueModal && isMobile" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-11/12 max-w-md p-5 relative">
                    <button @click="showHighestValueModal = false" class="absolute top-2 right-2 text-gray-400 hover:text-emerald-700">
                      <X class="w-5 h-5" />
                    </button>
                    <div class="font-bold text-emerald-700 text-base mb-3">Top 5 Highest Value</div>
                    <div v-if="topHighestValue.length === 0" class="text-xs text-gray-400">No items.</div>
                    <div v-else class="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800">
                      <div v-for="item in topHighestValue" :key="item.id" class="py-3 flex justify-between items-center">
                        <span class="font-bold text-[13px] text-emerald-700">{{ item.partName || 'N/A' }}</span>
                        <span class="text-[13px] font-black">₱{{ item.totalValue?.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <!-- Alerts & Notifications in Inventory -->
            <div v-if="outOfStock > 0 || lowStock > 0 || pendingUsersCount > 0" :class="[cardClass, 'rounded-2xl p-6 border border-neutral-600/40 shadow-sm']" :style="cardStyle">
              <h3 :class="['text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 isuzu-font', textClass]">
                <AlertTriangle class="w-4 h-4 text-red-600" /> Active <span :class="isDarkMode ? 'text-red-400' : 'text-red-600'">Alerts</span>
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div v-if="outOfStock > 0" :class="['p-5 rounded-xl border transition-all', isDarkMode ? 'bg-neutral-900/50 border-red-900/50' : 'bg-white border-neutral-200 shadow-sm']">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                      <div class="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                      <h4 :class="['text-[10px] font-black uppercase tracking-[0.15em]', isDarkMode ? 'text-red-400' : 'text-red-600']">
                        Critical Stock
                      </h4>
                    </div>
                    <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-md', isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700']">{{ outOfStock }}</span>
                  </div>
                  
                  <div class="space-y-3">
                    <div v-for="item in inventoryItems.filter(i => i.quantity === 0).slice(0, 4)" :key="item.id" class="group">
                      <p :class="['text-[11px] font-bold leading-none mb-1', textClass]">{{ item.partNo }}</p>
                      <p :class="['text-[9px] truncate opacity-60 uppercase tracking-tighter', subTextClass]">{{ item.partName }}</p>
                    </div>
                  </div>
                  
                  <p v-if="outOfStock > 4" :class="['text-[9px] font-bold uppercase mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800', subTextClass]">
                    + {{ outOfStock - 4 }} More Items
                  </p>
                </div>

                <!-- Low Inventory alert card removed as requested -->

                <!-- User Requests Card - Only show if user has approve/user-management access -->
                <div v-if="(isMasterAdmin || accessiblePages.includes('approve') || accessiblePages.includes('user-management')) && pendingUsersCount > 0" :class="['p-5 rounded-xl border transition-all', isDarkMode ? 'bg-neutral-900/50 border-yellow-900/50' : 'bg-white border-neutral-200 shadow-sm']">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                      <div class="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                      <h4 :class="['text-[10px] font-black uppercase tracking-[0.15em]', isDarkMode ? 'text-yellow-500' : 'text-yellow-700']">
                        User Requests
                      </h4>
                    </div>
                    <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-md', isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-50 text-yellow-700']">{{ pendingUsersCount }}</span>
                  </div>

                  <div class="space-y-3 mb-4">
                    <div v-for="user in pendingUsers.slice(0, 3)" :key="user.id">
                      <p :class="['text-[11px] font-bold leading-none mb-1', textClass]">{{ user.username }}</p>
                      <p :class="['text-[9px] truncate opacity-60', subTextClass]">{{ user.email }}</p>
                    </div>
                  </div>

                  <button 
                    @click="$router.push('/admin/approve')" 
                    :class="['w-full text-[9px] font-black uppercase py-2 rounded-lg border transition-all active:scale-95', 
                    isDarkMode ? 'bg-yellow-500 text-neutral-900 border-yellow-500 hover:bg-yellow-400' : 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800']"
                  >
                    Review Applications
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- QUICK ACTIONS GROUP -->
          <section id="dashboard-group-quick-actions" class="space-y-4">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2.5 rounded-xl" :class="isDarkMode ? 'bg-yellow-900/40' : 'bg-yellow-100'">
                <Zap class="w-5 h-5" :class="isDarkMode ? 'text-yellow-400' : 'text-yellow-600'" />
              </div>
              <h2 :class="['text-sm font-black uppercase tracking-widest isuzu-font', textClass]">Quick <span :class="isDarkMode ? 'text-yellow-400' : 'text-yellow-600'">Actions</span></h2>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <!-- Critical Stock Quick Action - Only show if user has inventory access -->
              <button 
                v-if="canViewInventory"
                @click="$router.push('/admin/inventory')" 
                class="group relative flex flex-col p-4 sm:p-5 bg-white dark:bg-neutral-800 border border-red-200 dark:border-red-900/50 rounded-xl active:scale-95 cursor-pointer text-left"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
                      <AlertTriangle class="w-5 h-5 text-red-600" />
                    </div>
                    <span class="font-bold text-sm text-gray-600 dark:text-gray-300">Critical Stock</span>
                  </div>
                  <span class="text-3xl font-black text-red-600">{{ lowStockItems.length + outOfStockItems.length }}</span>
                </div>
                <div class="mt-auto pt-2 border-t border-gray-50 dark:border-neutral-700 flex justify-between items-center">
                  <span class="text-[10px] uppercase tracking-wider font-semibold text-gray-400 group-hover:text-red-500 transition-colors">
                    Go to Inventory
                    <template v-if="(lowStockItems.length + outOfStockItems.length) > 0">
                      ({{ lowStockItems.length + outOfStockItems.length }} Issue{{ (lowStockItems.length + outOfStockItems.length) > 1 ? 's' : '' }})
                    </template>
                  </span>
                  <ChevronRight class="w-3 h-3 text-gray-300 group-hover:text-red-500 transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              <!-- Transaction In Quick Action - Only show if user has transaction-in access -->
              <button 
                v-if="accessiblePages.includes('transaction-in') || isMasterAdmin"
                @click="$router.push('/admin/transaction-in')" 
                class="group relative flex flex-col p-4 sm:p-5 bg-white dark:bg-neutral-800 border border-green-200 dark:border-green-900/50 rounded-xl active:scale-95 cursor-pointer text-left"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                      <ArrowDownCircle class="w-5 h-5 text-green-600" />
                    </div>
                    <span class="font-bold text-sm text-gray-600 dark:text-gray-300">Trans In (Today)</span>
                  </div>
                  <span class="text-3xl font-black text-green-600 dark:text-green-400">{{ filteredTransactionInCount }}</span>
                </div>
                <div class="mt-auto pt-2 border-t border-gray-50 dark:border-neutral-700 flex justify-between items-center">
                  <span class="text-[10px] uppercase tracking-wider font-semibold text-gray-400 group-hover:text-green-500 transition-colors">Go to Transaction In</span>
                  <ChevronRight class="w-3 h-3 text-gray-300 group-hover:text-green-500 transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              <!-- Transaction Out Quick Action - Only show if user has transaction-out access -->
              <button 
                v-if="accessiblePages.includes('transaction-out') || isMasterAdmin"
                @click="$router.push('/admin/transaction-out')" 
                class="group relative flex flex-col p-4 sm:p-5 bg-white dark:bg-neutral-800 border border-orange-200 dark:border-orange-900/50 rounded-xl active:scale-95 cursor-pointer text-left"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
                      <ArrowUpCircle class="w-5 h-5 text-orange-600" />
                    </div>
                    <span class="font-bold text-sm text-gray-600 dark:text-gray-300">Trans Out (Today)</span>
                  </div>
                  <span class="text-3xl font-black text-orange-600 dark:text-orange-400">{{ filteredTransactionOutCount }}</span>
                </div>
                <div class="mt-auto pt-2 border-t border-gray-50 dark:border-neutral-700 flex justify-between items-center">
                  <span class="text-[10px] uppercase tracking-wider font-semibold text-gray-400 group-hover:text-orange-500 transition-colors">Go to Transaction Out</span>
                  <ChevronRight class="w-3 h-3 text-gray-300 group-hover:text-orange-500 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            </div>
          </section>

          <!-- RECENT ACTIVITY GROUP - Show if user has access to EITHER transaction-in OR transaction-out (logical OR) -->
          <section v-if="canViewRecentActivity" id="dashboard-group-activity" :class="[cardClass, 'rounded-2xl p-4 sm:p-5 border border-neutral-600/40']" :style="cardStyle">
            <div class="flex items-center gap-2 mb-6">
              <div class=" p-2">
                <Activity class="w-5 h-5 text-blue-600" />
              </div>
              <h2 :class="['text-xl text-neutral-900 uppercase tracking-tighter isuzu-font', textClass]">
                Recent <span class="text-blue-600">Activity</span>
              </h2>
            </div>

            <div class="space-y-2">
              <div v-for="item in recentTransactionIn.slice(0,3)" :key="`in-${item.id}`" 
                  class="flex items-center gap-4 p-4 rounded-2xl border border-neutral-600/40 bg-neutral-600/5 transition-all">
                <div :class="['p-2.5 rounded-xl', isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600']">
                  <ArrowDownCircle class="w-5 h-5" />
                </div>
                
                <div class="flex-1 min-w-0">
                  <p :class="['text-[10px] font-black uppercase tracking-widest text-gray-400']">{{ item.partNo }}</p>
                  <p :class="['text-sm font-bold', textClass]">Stock Replenishment</p>
                </div>

                <div class="text-right">
                  <p :class="['text-lg font-black', isDarkMode ? 'text-green-400' : 'text-green-600']">+{{ item.quantity }}</p>
                  <span class="text-[8px] font-black px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 uppercase">Incoming</span>
                </div>
              </div>

              <div v-for="item in filteredTransactionOut.slice(0,3)" :key="`out-${item.id}`" 
                  class="flex items-center gap-4 p-4 rounded-2xl border border-neutral-600/40 bg-neutral-600/5 transition-all">
                <div :class="['p-2.5 rounded-xl', isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600']">
                  <ArrowUpCircle class="w-5 h-5" />
                </div>
                
                <div class="flex-1 min-w-0">
                  <p :class="['text-[10px] font-black uppercase tracking-widest text-gray-400']">{{ item.partNo }}</p>
                  <p :class="['text-sm font-bold', textClass]">Inventory Outflow</p>
                </div>

                <div class="text-right">
                  <p :class="['text-lg font-black', isDarkMode ? 'text-orange-400' : 'text-orange-600']">-{{ item.quantity }}</p>
                  <span class="text-[8px] font-black px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 uppercase">Outgoing</span>
                </div>
              </div>
            </div>
          </section>

          <!-- EMPTY STATE FALLBACK - Show when no dashboard groups are visible -->
          <section v-if="!hasAnyVisibleGroups" id="dashboard-group-empty" :class="[cardClass, 'rounded-2xl p-8 sm:p-12 border border-neutral-600/40 text-center']" :style="cardStyle">
            <div class="max-w-md mx-auto space-y-6">
              <div class="w-20 h-20 mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                <AlertTriangle class="w-10 h-10 text-yellow-600" />
              </div>
              
              <div class="space-y-2">
                <h2 :class="['text-xl font-black uppercase tracking-tighter isuzu-font', textClass]">
                  No <span class="text-red-600">Access</span> Available
                </h2>
                <p :class="['text-sm', subTextClass]">
                  You currently don't have access to any dashboard sections. Please contact the Company Master Admin to request access permissions.
                </p>
              </div>

              <div :class="['p-4 rounded-xl border', isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-gray-50 border-gray-200']">
                <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Contact Information</p>
                <p :class="['text-sm font-medium', textClass]">Company Master Admin</p>
                <p :class="['text-xs', subTextClass]">Request access to specific pages through your administrator</p>
              </div>

            </div>
          </section>

          <!-- FINANCIAL HIGHLIGHTS GROUP - Only show if user has transaction-out access -->
          <section v-if="canViewFinancials" id="dashboard-group-financials" class="space-y-6">
            <div class="flex items-center gap-3 mt-8 mb-4">
              <div class="bg-green-600 p-2 rounded-xl">
                <TrendingUp class="w-5 h-5 text-white" />
              </div>
              <h2 :class="['text-xl text-neutral-900 uppercase tracking-tighter isuzu-font', textClass]">Financial <span class="text-green-600">Highlights</span></h2>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-6 sm:mb-8">
              <div class="bg-neutral-900 rounded-2xl p-4 sm:p-6 relative overflow-hidden group">
                <div class="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-[4rem]"></div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Today's Revenue</p>
                <p class="text-3xl font-black text-green-500">₱{{ todaysRevenue.toLocaleString() }}</p>
                <p class="mt-4 text-[10px] text-white/40 uppercase tracking-widest">{{ todaysTransactionCount }} Successful Sales</p>
              </div>

              <div class="bg-neutral-600/10 rounded-2xl p-4 sm:p-6 border border-neutral-600/40 hover:border-blue-600 transition-all group relative overflow-hidden">
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Avg Transaction</p>
                <p class="text-3xl font-black" :class="textClass">₱{{ averageTransactionValue.toLocaleString() }}</p>
                <div class="mt-4 h-1.5 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500 rounded-full" style="width: 65%"></div>
                </div>
              </div>

              <div class="bg-neutral-600/10 rounded-2xl p-4 sm:p-6 border border-neutral-600/40 hover:border-purple-600 transition-all group relative overflow-hidden">
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Top Selling Part</p>
                <p class="text-2xl font-black truncate" :class="textClass">{{ topSellingPart.partNo }}</p>
                <p class="mt-2 text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-1">
                  <Package class="w-3 h-3" /> {{ topSellingPart.quantity }} Units Moved
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
              <div :class="[cardClass, 'rounded-2xl p-4 sm:p-6 lg:p-8 border border-neutral-600/40']" :style="cardStyle">
                <h3 :class="['text-[11px] font-black uppercase tracking-widest mb-6 flex items-center gap-2', textClass]">
                  <Activity class="w-4 h-4 text-emerald-500" /> Performance Trends
                </h3>
                <div class="space-y-6">
                  <div class="flex justify-between items-end">
                    <div>
                      <p class="text-[10px] font-black text-gray-400 uppercase">vs Yesterday</p>
                      <p :class="['text-3xl font-black', revenueGrowthVsYesterday >= 0 ? 'text-green-500' : 'text-red-500']">
                        {{ revenueGrowthVsYesterday >= 0 ? '+' : '' }}{{ revenueGrowthVsYesterday }}%
                      </p>
                    </div>
                    <div class="h-12 w-24">
                      <TrendingUp :class="['w-8 h-8', revenueGrowthVsYesterday >= 0 ? 'text-green-500/20' : 'text-red-500/20']" />
                    </div>
                  </div>
                  <div class="border-t border-neutral-200/50 pt-4">
                    <p class="text-[10px] font-black text-gray-400 uppercase mb-2">Weekly Momentum</p>
                    <div class="flex items-center gap-3">
                      <span :class="['px-2 py-1 rounded text-[10px] font-black', revenueGrowthVsLastWeek >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                        {{ revenueGrowthVsLastWeek >= 0 ? 'GROWTH' : 'DECLINE' }}
                      </span>
                      <p class="text-sm font-bold" :class="textClass">{{ Math.abs(revenueGrowthVsLastWeek) }}% vs last week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- DAILY VOLUME COMPARISON GROUP - Show if user has access to EITHER transaction-in OR transaction-out (logical OR) -->
          <section v-if="canViewTransactions" id="dashboard-group-volume-comparison" class="mt-6">
            <div :class="[cardClass, 'rounded-2xl p-4 sm:p-6 lg:p-8 border border-neutral-600/40']" :style="cardStyle">
              <h3 :class="['text-[11px] font-black uppercase tracking-widest mb-6', textClass]">Daily Volume Comparison</h3>
              <div class="grid grid-cols-2 gap-8">
                <div class="bg-neutral-600/5 p-6 rounded-2xl border border-neutral-600/40">
                  <p class="text-[10px] font-black text-neutral-400 uppercase mb-1">Transaction Count</p>
                  <p class="text-4xl font-black mb-4" :class="textClass">{{ todaysTransactionCount }}</p>
                  <div class="flex items-center gap-2 text-[10px] font-bold">
                    <span class="text-gray-400">PREV: {{ yesterdaysTransactionCount }}</span>
                    <span :class="txCountGrowthVsYesterday >= 0 ? 'text-green-500' : 'text-red-500'">
                      ({{ txCountGrowthVsYesterday >= 0 ? '↑' : '↓' }} {{ Math.abs(txCountGrowthVsYesterday) }}%)
                    </span>
                  </div>
                </div>
                <div class="bg-neutral-600/5 p-6 rounded-2xl border border-neutral-600/40">
                  <p class="text-[10px] font-black text-neutral-400 uppercase mb-1">Average Ticket</p>
                  <p class="text-4xl font-black mb-4" :class="textClass">₱{{ averageTransactionValue }}</p>
                  <div class="flex items-center gap-2 text-[10px] font-bold">
                    <span class="text-gray-400">PREV: ₱{{ yesterdaysAvgValue }}</span>
                    <span :class="avgValueGrowthVsYesterday >= 0 ? 'text-green-500' : 'text-red-500'">
                      ({{ avgValueGrowthVsYesterday >= 0 ? '↑' : '↓' }} {{ Math.abs(avgValueGrowthVsYesterday) }}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div class="flex items-center gap-2 pb-1 border-b-2 border-neutral-600/40 mb-6"></div>

          <section v-if="canViewUserManagement" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 items-stretch">
            <div :class="[cardClass, 'rounded-3xl p-4 sm:p-6 lg:p-8 border border-neutral-600/40 relative overflow-hidden group']" :style="cardStyle">
              <div class="absolute -right-6 -bottom-6 opacity-15 rotate-12 group-hover:scale-110 transition-transform duration-500">
                <UserCheck class="w-40 h-40" :class="isDarkMode ? 'text-white' : 'text-neutral-900'" />
              </div>

              <div class="relative z-10 flex flex-col h-full">
                <div class="flex items-center justify-between mb-10 ">
                  <div :class="['p-3 rounded-2xl', isDarkMode ? 'bg-green-900/50' : 'bg-green-100']">
                    <UserCheck class="w-6 h-6" :class="isDarkMode ? 'text-green-400' : 'text-green-600'" />
                  </div>
                  <span :class="['text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border', isDarkMode ? 'bg-green-900/50 text-green-400 border-green-800' : 'bg-green-50 text-green-700 border-green-100']">Verified System Access</span>
                </div>
                
                <div class="mt-auto">
                  <h2 :class="['text-[11px] font-black uppercase tracking-[0.2em] mb-1', subTextClass]">Total Approved</h2>
                  <div class="flex items-baseline gap-2">
                    <p :class="['text-6xl font-black tracking-tighter leading-none', textClass]">
                      {{ approvedUsersCount }}
                    </p>
                    <p :class="['text-xs font-bold uppercase tracking-tighter', isDarkMode ? 'text-green-400' : 'text-green-600']">Users</p>
                  </div>
                  <div class="mt-4 flex items-center gap-2">
                    <div :class="['h-1.5 w-full rounded-full overflow-hidden', isDarkMode ? 'bg-gray-700' : 'bg-neutral-100']">
                      <div class="h-full bg-green-500 rounded-full" :style="{ width: '100%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-neutral-900 rounded-3xl p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden shadow-xl">
              <div class="absolute -right-6 -bottom-6 opacity-15 rotate-12">
                <Users class="w-40 h-40" />
              </div>

              <button 
                @click="$router.push('/admin/approve')" 
                class="absolute top-6 right-6 z-30 group flex items-center gap-2 bg-white/5 hover:bg-yellow-500 backdrop-blur-md border border-white/10 hover:border-yellow-500 p-2 pr-4 rounded-2xl transition-all duration-300"
              >
                <div class="bg-yellow-500 p-1.5 rounded-lg group-hover:bg-neutral-900 transition-colors">
                  <ExternalLink class="w-3 h-3 text-neutral-900 group-hover:text-yellow-500" />
                </div>
                <span class="text-[9px] font-black uppercase tracking-widest text-white group-hover:text-neutral-900">Review All</span>
              </button>

              <div class="relative z-10 flex flex-col h-full">
                <div class="flex items-center gap-3 mb-10">
                  <div class="bg-yellow-500 p-3 rounded-2xl shadow-lg shadow-yellow-500/20">
                    <UserX class="w-6 h-6 text-neutral-900" />
                  </div>
                  <span v-if="pendingUsersCount > 0" class="text-[9px] font-black bg-yellow-500 text-neutral-900 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                    Action Required
                  </span>
                </div>

                <div class="mt-auto">
                  <h2 class="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Awaiting Approval</h2>
                  <div class="flex items-baseline gap-2">
                    <p class="text-6xl font-black tracking-tighter text-yellow-500 leading-none">
                      {{ pendingUsersCount }}
                    </p>
                    <p class="text-xs font-bold text-yellow-500 uppercase tracking-tighter italic">Pending</p>
                  </div>
                  
                  <div class="flex items-center gap-2 mt-4">
                    <div class="w-1 h-1 bg-yellow-500 rounded-full"></div>
                    <p class="text-[9px] font-medium text-gray-500 uppercase tracking-widest">New registration requests in queue</p>
                  </div>
                </div>
              </div>
            </div>

            <div :class="[cardClass, 'rounded-3xl p-4 sm:p-6 lg:p-8 border border-neutral-600/40 flex flex-col relative group']" :style="cardStyle">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 :class="['text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2', subTextClass]">
                    <PieChart class="w-3.5 h-3.5 text-yellow-600" /> Access Distribution
                  </h3>
                </div>
                <div class="flex -space-x-2">
                  <div class="w-6 h-6 rounded-full border-2" :class="isDarkMode ? 'border-gray-700 bg-gray-500' : 'border-neutral-200 bg-neutral-400'"></div>
                  <div class="w-6 h-6 rounded-full border-2 border-neutral-200 bg-yellow-500"></div>
                </div>
              </div>
              
              <div class="flex-1 min-h-40 relative flex items-center justify-center px-4">
                <canvas ref="approvalChart" class="max-h-45"></canvas>
              </div>
            </div>
          </section>

          <!-- Service Advisor Integration Section -->
          <section v-if="canViewServiceAdvisor" class="space-y-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="bg-purple-600 p-2 rounded-xl shadow-lg">
                <Users class="w-5 h-5 text-white" />
              </div>
              <h2 :class="['text-xl text-neutral-900 uppercase tracking-tighter isuzu-font', textClass]">
                Service Advisor <span class="text-purple-600">Overview</span>
              </h2>
              <router-link to="/admin/sa-rotation" class="ml-auto text-[10px] font-black uppercase bg-neutral-900 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors tracking-widest shadow-sm">
                Rotation Logic →
              </router-link>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div class="bg-neutral-600/10 rounded-2xl p-4 sm:p-6 border border-neutral-600/40 relative overflow-hidden shadow-sm">
                <div class="absolute -right-4 -bottom-2 opacity-10">
                  <Users class="w-24 h-24 text-purple-500" />
                </div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Active SAs</p>
                <p class="text-4xl font-black text-purple-600">{{ activeSAsCount }}</p>
                <div class="mt-4 flex items-center text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/30 w-fit px-2 py-1 rounded-lg uppercase">
                  On Duty
                </div>
              </div>

              <div class="bg-neutral-600/10 rounded-2xl p-6 border border-neutral-600/40 relative overflow-hidden shadow-sm">
                <div class="absolute -right-4 -bottom-2 opacity-10">
                  <CheckCircle class="w-24 h-24 text-green-500" />
                </div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Jobs Done Today</p>
                <p class="text-4xl font-black" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">{{ jobsDoneToday }}</p>
                <div class="mt-4 h-1.5 w-full bg-green-500/20 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500 rounded-full" style="width: 100%"></div>
                </div>
              </div>

              <div class="bg-neutral-600/10 rounded-2xl p-4 sm:p-6 border border-neutral-600/40 relative overflow-hidden shadow-sm">
                <div class="absolute -right-4 -bottom-2 opacity-10">
                  <Clock class="w-24 h-24 text-blue-500" />
                </div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Ongoing Jobs</p>
                <p class="text-4xl font-black" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">{{ ongoingJobs }}</p>
                <p class="mt-4 text-[10px] font-bold text-blue-500/60 uppercase tracking-tighter">In Progress</p>
              </div>

              <div class="bg-neutral-900 rounded-2xl p-4 sm:p-6 relative overflow-hidden shadow-xl">
                <div class="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-bl-[4rem]"></div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Efficiency Rate</p>
                <p class="text-3xl font-black text-yellow-500">{{ efficiencyRate }}%</p>
                <p class="mt-4 text-[10px] text-white/40 uppercase tracking-widest">Performance Score</p>
              </div>
            </div>

            <div :class="[cardClass, 'rounded-2xl p-4 sm:p-6 lg:p-8 border border-neutral-600/40']" :style="cardStyle">
              <div class="flex items-center justify-between mb-8">
                <h3 :class="['text-sm font-black uppercase tracking-widest flex items-center gap-2', textClass]">
                  <Activity class="w-4 h-4 text-purple-600" /> SA Workload Distribution
                </h3>
                <div class="flex items-center gap-3">
                  <p :class="['text-[10px] font-black uppercase text-gray-400']">Balance Status</p>
                  <span :class="['text-[11px] font-black px-3 py-1 rounded-lg', workloadBalanceClass]">
                    {{ workloadBalance }}%
                  </span>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <div v-for="sa in saWorkload" :key="sa.name" 
                    class="bg-neutral-600/5 p-5 rounded-2xl border border-neutral-600/40 transition-all">
                  <div class="flex items-center justify-between mb-4">
                    <p :class="['text-[11px] font-black uppercase truncate tracking-wider', textClass]">{{ sa.name }}</p>
                    <span :class="['text-[8px] font-black px-2 py-0.5 rounded uppercase border', sa.statusClass]">
                      {{ sa.status }}
                    </span>
                  </div>
                  
                  <div class="space-y-2">
                    <div class="flex justify-between items-end">
                      <p class="text-[10px] font-bold text-gray-400 uppercase">Load</p>
                      <p :class="['text-xs font-black', textClass]">{{ sa.ongoing }} / {{ sa.capacity }}</p>
                    </div>
                    <div class="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div :class="['h-full rounded-full transition-all duration-500', sa.barClass]" 
                          :style="{ width: sa.workloadPercent + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section v-if="canViewTransactions" class="space-y-8">          
            <div class="flex items-center gap-3 pb-3 border-b-2 border-blue-600 mb-6">
              <div class="flex -space-x-2">
                <ArrowDownCircle class="w-7 h-7 text-blue-600 bg-white rounded-full shadow-sm" />
                <ArrowUpCircle class="w-7 h-7 text-orange-600 bg-white rounded-full shadow-sm" />
              </div>
              <h2 :class="['text-2xl font-black uppercase tracking-tighter isuzu-font', textClass]">
                Transactions <span :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">Overview</span>
              </h2>
            </div>

            <div class="space-y-6">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 :class="['text-lg font-bold flex items-center gap-2', textClass, isDarkMode ? 'text-green-400' : 'text-green-600']">
                    <ArrowDownCircle class="w-5 h-5" />
                    Transaction In 
                  </h3>
                  <p :class="['text-[10px] font-black uppercase tracking-[0.2em]', subTextClass]">
                    Status: {{ transactionInFilter === 'today' ? 'Daily' : transactionInFilter === 'week' ? 'Weekly' : 'Monthly' }} Report
                  </p>
                </div>
                
                <div :class="['flex p-1 rounded-xl border', isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-neutral-100 border-neutral-200 shadow-inner']">
                  <button 
                    v-for="filter in ['today', 'week', 'month']" 
                    :key="filter"
                    @click="transactionInFilter = filter"
                    :class="transactionInFilter === filter 
                      ? ['bg-white dark:bg-neutral-600 shadow-sm text-white scale-105'] 
                      : [isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700']"
                    class="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200"
                  >
                    {{ filter }}
                  </button>
                </div>
              </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
              <div class="bg-neutral-600/10 rounded-2xl p-4 sm:p-6 border border-neutral-600/40 relative overflow-hidden shadow-sm">
                <div class="absolute -right-4 -bottom-2 opacity-10">
                  <ArrowDownCircle class="w-20 h-20 text-green-500" />
                </div>
                <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Total Records</p>
                <p class="text-3xl font-black" :class="textClass">{{ filteredTransactionInCount }}</p>
                <div class="mt-4 flex items-center text-[9px] font-bold text-green-600 bg-green-50 dark:bg-green-900/30 w-fit px-2 py-1 rounded-lg">
                  <Activity class="w-3 h-3 mr-1" /> LOGGED
                </div>
              </div>

              <div class="bg-neutral-600/10 rounded-2xl p-6 border border-neutral-600/40 relative overflow-hidden shadow-sm">
                <div class="absolute -right-4 -bottom-2 opacity-10">
                  <Package class="w-20 h-20 text-blue-500" />
                </div>
                <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Total Qty</p>
                <p class="text-3xl font-black" :class="textClass">{{ filteredTransactionInQty.toLocaleString() }}</p>
                <div class="mt-4 h-1 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500 rounded-full" style="width: 100%"></div>
                </div>
              </div>

              <div class="bg-neutral-900 rounded-2xl p-4 sm:p-6 relative overflow-hidden shadow-xl">
                <div class="absolute top-0 right-0 w-12 h-12 bg-purple-500/10 rounded-bl-[3rem]"></div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Value</p>
                <p class="text-2xl font-black text-purple-400">₱{{ filteredTransactionInValue.toLocaleString() }}</p>
                <p class="mt-4 text-[9px] text-white/40 uppercase tracking-widest font-bold">Gross Valuation</p>
              </div>

              <div class="bg-neutral-600/10 rounded-2xl p-4 sm:p-6 border border-neutral-600/40 relative overflow-hidden shadow-sm">
                <div class="absolute -right-4 -bottom-2 opacity-10">
                  <Clock class="w-20 h-20 text-yellow-500" />
                </div>
                <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">To Review</p>
                <p class="text-3xl font-black" :class="isDarkMode ? 'text-yellow-400' : 'text-yellow-600'">{{ filteredTransactionInToReview }}</p>
                <div class="mt-4 flex items-center text-[9px] font-bold text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 w-fit px-2 py-1 rounded-lg">
                  PENDING
                </div>
              </div>

              <div class="bg-neutral-600/10 rounded-2xl p-4 sm:p-6 border border-neutral-600/40 relative overflow-hidden shadow-sm">
                <div class="absolute -right-4 -bottom-2 opacity-10">
                  <CheckCircle class="w-20 h-20 text-emerald-500" />
                </div>
                <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Stock IN</p>
                <p class="text-3xl font-black text-emerald-500">{{ filteredTransactionInStockIn }}</p>
                <p class="mt-4 text-[9px] font-bold text-emerald-500/50 uppercase">Verified</p>
              </div>

              <div class="bg-neutral-600/10 rounded-2xl p-4 sm:p-6 border-b-4 border-red-600 relative overflow-hidden shadow-sm">
                <div class="absolute -right-4 -bottom-2 opacity-10">
                  <XCircle class="w-20 h-20 text-red-600" />
                </div>
                <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Stock OUT</p>
                <p class="text-3xl font-black text-red-600">{{ filteredTransactionInStockOut }}</p>
                <p class="mt-4 text-[9px] font-bold text-red-600/50 uppercase">Discharged</p>
              </div>
            </div>

              <div v-if="recentTransactionIn.length > 0" :class="[cardClass, 'overflow-hidden rounded-2xl border border-neutral-600/40']" :style="isDarkMode ? { ...cardStyle, borderColor: '#374151' } : { ...cardStyle, borderColor: '#e5e7eb' }">
                <div :class="['p-4 border-b flex items-center justify-between', isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-50 bg-gray-50/50']">
                  <h4 :class="['text-xs font-black uppercase tracking-widest flex items-center gap-2 isuzu-font', textClass]">
                    <TrendingUp class="w-4 h-4 text-green-600" />
                    Recent Stock Inflow
                  </h4>
                  <span :class="['text-[9px] font-bold uppercase tracking-tighter italic', subTextClass]">Live Updates</span>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left ">
                    <thead class="isuzu-font">
                      <tr :class="[isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100']">
                        <th :class="['p-4 text-[10px] font-black uppercase tracking-widest', subTextClass]">Part No</th>
                        <th :class="['p-4 text-[10px] font-black uppercase tracking-widest', subTextClass]">Description</th>
                        <th :class="['p-4 text-[10px] font-black uppercase tracking-widest text-center', subTextClass]">Qty</th>
                        <th :class="['p-4 text-[10px] font-black uppercase tracking-widest text-center', subTextClass]">Status</th>
                        <th :class="['p-4 text-[10px] font-black uppercase tracking-widest', subTextClass]">Date</th>
                      </tr>
                    </thead>
                    <tbody :class="['divide-y', isDarkMode ? 'divide-gray-700' : 'divide-gray-50']">
                      <tr v-for="item in recentTransactionIn.slice(0, 5)" :key="item.id" :class="['transition-colors group', isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50/80']">
                        <td :class="['p-4 text-[12px] font-bold', textClass, 'group-hover:text-blue-600']">{{ item.partNo }}</td>
                        <td :class="['p-4 text-[12px] font-medium', subTextClass]">{{ item.partName }}</td>
                        <td :class="['p-4 text-[12px] font-black text-center', textClass]">{{ item.quantity }}</td>
                        <td class="p-4 text-center">
                          <span :class="getTransactionInStatusClass(item.statusIN)" class="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border shadow-sm">
                            {{ item.statusIN || 'To Review' }}
                          </span>
                        </td>
                        <td :class="['p-4 text-[11px] font-bold uppercase', subTextClass]">{{ formatTransactionDate(item.createdAt) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <hr :class="['border-dashed', isDarkMode ? 'border-gray-700' : 'border-neutral-600/40']" />

            <div class="space-y-6">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 :class="['text-lg font-bold flex items-center gap-2', textClass, isDarkMode ? 'text-orange-400' : 'text-orange-600']">
                    <ArrowUpCircle class="w-5 h-5" />
                    Transaction Out / Sales
                  </h3>
                  <p :class="['text-[10px] font-black uppercase tracking-[0.2em]', subTextClass]">
                      Status: {{
                        transactionOutFilter === 'today' ? 'Daily'
                        : transactionOutFilter === 'week' ? 'Weekly'
                        : transactionOutFilter === 'month' ? 'Monthly'
                        : transactionOutFilter === 'year' ? 'Yearly'
                        : 'Custom'
                      }} Report
                  </p>
                </div>
                <div :class="['flex p-1 rounded-xl border', isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-neutral-100 border-neutral-200 shadow-inner']">
                  <button 
                    v-for="filter in ['today', 'week', 'month', 'year', 'custom']" 
                    :key="filter"
                    @click="transactionOutFilter = filter"
                    :class="transactionOutFilter === filter 
                      ? ['bg-white dark:bg-neutral-600 shadow-sm text-white scale-105'] 
                      : [isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700']"
                    class="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200"
                  >
                    {{ filter }}
                  </button>
                  <input v-if="transactionOutFilter === 'custom'" type="datetime-local" v-model="customTransactionOutDate" class="ml-2 px-2 py-1 rounded border text-xs" />
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                <div class="bg-neutral-600/10 rounded-2xl p-4 sm:p-6 border border-neutral-600/40 relative overflow-hidden shadow-sm">
                  <div class="absolute -right-4 -bottom-2 opacity-10">
                    <ArrowUpCircle class="w-24 h-24 text-orange-500" />
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Total Records</p>
                  <p class="text-3xl font-black text-orange-600">{{ filteredTransactionOutCount }}</p>
                  <div class="mt-4 flex items-center text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/30 w-fit px-2 py-1 rounded-lg">
                    LOG ENTRIES
                  </div>
                </div>

                <div class="bg-neutral-600/10 rounded-2xl p-6 border border-neutral-600/40 relative overflow-hidden shadow-sm">
                  <div class="absolute -right-4 -bottom-2 opacity-10">
                    <Package class="w-24 h-24 text-blue-500" />
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Total Qty Sold</p>
                  <p class="text-3xl font-black" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">
                    {{ filteredTransactionOutQty.toLocaleString() }}
                  </p>
                  <div class="mt-4 h-1 w-full bg-blue-500/20 rounded-full"></div>
                </div>

                <div class="bg-neutral-900 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-[4rem]"></div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Total Sales</p>
                  <p class="text-2xl font-black text-purple-400">₱{{ filteredTransactionOutValue.toLocaleString() }}</p>
                  <p class="mt-4 text-[10px] text-white/40 uppercase tracking-widest">Gross Revenue</p>
                </div>

                <div class="bg-neutral-600/10 rounded-2xl p-4 sm:p-6 border border-neutral-600/40 relative overflow-hidden shadow-sm">
                  <div class="absolute -right-4 -bottom-2 opacity-10">
                    <Clock class="w-24 h-24 text-yellow-500" />
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Pending Sales</p>
                  <p class="text-3xl font-black text-yellow-500">{{ filteredPendingTransactionOut }}</p>
                  <div class="mt-4 flex items-center text-[8px] font-bold text-yellow-600 border border-yellow-600/30 w-fit px-2 py-0.5 rounded uppercase">
                    Awaiting Action
                  </div>
                </div>

                <div class="bg-neutral-600/10 rounded-2xl p-4 sm:p-6 border border-neutral-600/40 relative overflow-hidden shadow-sm">
                  <div class="absolute -right-4 -bottom-2 opacity-10">
                    <CheckCircle class="w-24 h-24 text-emerald-500" />
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Stock Out</p>
                  <p class="text-3xl font-black text-emerald-500">{{ filteredTransactionOutStockOut }}</p>
                  <p class="mt-4 text-[9px] font-bold text-emerald-500/60 uppercase tracking-tighter">Completed Orders</p>
                </div>

                <div class="bg-neutral-600/10 rounded-2xl p-4 sm:p-6 border-b-4 border-red-600 relative overflow-hidden shadow-sm">
                  <div class="absolute -right-4 -bottom-2 opacity-[0.05]">
                    <XCircle class="w-24 h-24 text-red-600" />
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Cancelled</p>
                  <p class="text-3xl font-black text-red-600">{{ filteredTransactionOutCancelled }}</p>
                  <p class="mt-4 text-[9px] font-bold text-red-600/50 uppercase flex items-center gap-1">
                    <XCircle class="w-3 h-3" /> VOIDED RECORDS
                  </p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              
              <div :class="[cardClass, 'rounded-3xl p-4 sm:p-6 bg-white/10 backdrop-blur-none lg:col-span-2']" :style="cardStyle">
                <div class="flex items-center justify-between mb-6">
                  <h2 :class="['text-lg font-black uppercase tracking-tighter isuzu-font flex items-center gap-2', textClass]">
                    <TrendingUp class="w-5 h-5 text-blue-600" />
                    Stock Flow <span :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">Analytics</span>
                  </h2>
                  <span :class="['text-[10px] font-black uppercase tracking-widest', subTextClass]">Last 7 Days</span>
                </div>
                <div class="h-80 w-full relative">
                  <canvas ref="transactionChart"></canvas>
                </div>
              </div>

              <div :class="[cardClass, 'rounded-3xl p-4 sm:p-6 bg-white/10 backdrop-blur-none']" :style="cardStyle">
                <div class="flex items-center justify-between mb-6">
                  <h2 :class="['text-lg font-black uppercase tracking-tighter isuzu-font flex items-center gap-2', textClass]">
                    <BarChart3 class="w-5 h-5 text-orange-600" />
                    Category <span :class="isDarkMode ? 'text-orange-400' : 'text-orange-600'">Sales</span>
                  </h2>
                </div>
                <div class="h-80 w-full relative">
                  <canvas ref="salesCategoryChart"></canvas>
                </div>
              </div>
              
            </div>
          </section>

        </div>
      </main>

      <div class="absolute bottom-0 left-0 w-full z-0 opacity-5 pointer-events-none transform rotate-180">
        <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
          <path d="M0 45 H170 L220 15 H500" stroke="#cc0000" stroke-width="2" />
        </svg>
      </div>
  </div>
</template>


<script setup>
// --- Most/Least/Highest Value Popover/Modal State ---
const showMostStockedPopover = ref(false);
const showMostStockedModal = ref(false);
const showLeastStockedPopover = ref(false);
const showLeastStockedModal = ref(false);
const showHighestValuePopover = ref(false);
const showHighestValueModal = ref(false);

function toggleMostStockedModal() {
  if (isMobile.value) {
    showMostStockedModal.value = !showMostStockedModal.value;
  }
}
function toggleLeastStockedModal() {
  if (isMobile.value) {
    showLeastStockedModal.value = !showLeastStockedModal.value;
  }
}
function toggleHighestValueModal() {
  if (isMobile.value) {
    showHighestValueModal.value = !showHighestValueModal.value;
  }
}

// Top 5 computed lists
const topMostStocked = computed(() =>
  [...inventoryItems.value]
    .filter(item => typeof item.quantity === 'number')
    .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
    .slice(0, 5)
);
const topLeastStocked = computed(() =>
  [...inventoryItems.value]
    .filter(item => typeof item.quantity === 'number')
    .sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
    .slice(0, 5)
);
const topHighestValue = computed(() =>
  [...inventoryItems.value]
    .filter(item => typeof item.totalValue === 'number')
    .sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0))
    .slice(0, 5)
);
import { ref, onMounted, computed, nextTick, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../../composables/useAuth";
import { usePermissions } from "../../composables/usePermissions";
import { db } from "../../Firebase/Firebase";
import { collection, getDocs, doc, onSnapshot, query, where, collectionGroup } from "firebase/firestore";
import Loaders from "../../components/Loaders.vue";

import {
  LayoutDashboard,
  Boxes,
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
  PieChart,
  BarChart3,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Clock,
  UserCheck,
  UserX,
  Calendar,
  X,
  Zap,
  ExternalLink,
  Activity,
  Activity as ActivityIcon
} from "lucide-vue-next";

import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

/* ===== THEME ===== */
const isDarkMode = computed(() => document.documentElement.classList.contains('dark'));
const themeClass = computed(() => isDarkMode.value ? 'text-white bg-neutral-900' : 'bg-gray-50 text-gray-900');
const themeStyle = computed(() => isDarkMode.value ? { backgroundColor: '#171717' } : {});
const cardClass = computed(() => isDarkMode.value ? 'text-white border-neutral-700/50' : 'bg-white text-gray-900 border-neutral-200');
const cardStyle = computed(() => isDarkMode.value ? { backgroundColor: '#262626' } : {});
const textClass = computed(() => isDarkMode.value ? 'text-white' : 'text-gray-800');
const subTextClass = computed(() => isDarkMode.value ? 'text-gray-300' : 'text-gray-600');
const tableHeaderClass = computed(() => isDarkMode.value ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700');
const tableRowClass = computed(() => isDarkMode.value ? 'hover:bg-gray-800' : 'hover:bg-gray-50');


// --- Low Stock Popover/Modal State ---
const showLowStockPopover = ref(false);
const showLowStockModal = ref(false);
const isMobile = ref(false);

function toggleLowStockModal() {
  if (isMobile.value) {
    showLowStockModal.value = !showLowStockModal.value;
  }
}

onMounted(() => {
  // Simple mobile detection
  isMobile.value = window.innerWidth <= 768;
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768;
  });
});


// --- Inventory Dashboard Card Computed Properties ---
const lowStockItems = computed(() => inventoryItems.value.filter(item => item.quantity > 0 && item.quantity <= (item.minimum ?? 0)));
const outOfStockItems = computed(() => inventoryItems.value.filter(item => (item.quantity || 0) === 0));
const uniqueCategories = computed(() => Array.from(new Set(inventoryItems.value.map(item => item.category))));
const mostStockedItem = computed(() => {
  if (!inventoryItems.value.length) return null;
  return inventoryItems.value.reduce((max, item) => (item.quantity > (max?.quantity || 0) ? item : max), null);
});
const leastStockedItem = computed(() => {
  const filtered = inventoryItems.value.filter(item => item.quantity > 0);
  if (!filtered.length) return null;
  return filtered.reduce((min, item) => (item.quantity < (min?.quantity || Infinity) ? item : min), null);
});
const highestValueItem = computed(() => {
  if (!inventoryItems.value.length) return null;
  return inventoryItems.value.reduce((max, item) => (item.totalValue > (max?.totalValue || 0) ? item : max), null);
});

// --- Out of Stock Popover/Modal State ---
const showOutOfStockPopover = ref(false);
const showOutOfStockModal = ref(false);

function toggleOutOfStockModal() {
  if (isMobile.value) {
    showOutOfStockModal.value = !showOutOfStockModal.value;
  }
}

/* ===== STATE ===== */
const { user, isAuthenticated } = useAuth();
const { canAccessPage, fetchUserRoles, getAccessiblePages, isMasterAdmin } = usePermissions();
const router = useRouter();
const isLoading = ref(true);
const hasDashboardAccess = ref(false);
const accessiblePages = ref([]);

// Permission-based section visibility
const canViewInventory = computed(() => isMasterAdmin.value || accessiblePages.value.includes('inventory'));
const canViewServiceAdvisor = computed(() => isMasterAdmin.value || accessiblePages.value.includes('sa-rotation'));
const canViewTransactions = computed(() => isMasterAdmin.value || accessiblePages.value.includes('transaction-in') || accessiblePages.value.includes('transaction-out'));
const canViewFinancials = computed(() => isMasterAdmin.value || accessiblePages.value.includes('transaction-out'));
const canViewUserManagement = computed(() => isMasterAdmin.value || accessiblePages.value.includes('approve') || accessiblePages.value.includes('user-management'));

// Recent Activity - show if user has access to EITHER transaction-in OR transaction-out (logical OR)
const canViewRecentActivity = computed(() => isMasterAdmin.value || accessiblePages.value.includes('transaction-in') || accessiblePages.value.includes('transaction-out'));

// Check if any dashboard groups are visible (for empty state fallback)
const hasAnyVisibleGroups = computed(() => {
  return canViewInventory.value || 
         canViewServiceAdvisor.value || 
         canViewTransactions.value || 
         canViewFinancials.value || 
         canViewUserManagement.value ||
         canViewRecentActivity.value;
});

const inventoryItems = ref([]);
const pendingUsers = ref([]);
const transactionInItems = ref([]);
const transactionOutItems = ref([]);
const approvedUsers = ref([]);

// Transaction In Filter
const transactionInFilter = ref('today'); // 'today', 'week', 'month'


const statusChart = ref(null);
const categoryChart = ref(null);
const transactionChart = ref(null);
const salesCategoryChart = ref(null);
const approvalChart = ref(null);

let statusChartInstance = null;
let categoryChartInstance = null;
let transactionChartInstance = null;
let salesCategoryChartInstance = null;
let approvalChartInstance = null;

// Real-time listeners
const inventoryListeners = ref([]);
const pendingUsersListener = ref(null);
const transactionInListener = ref(null);
const transactionOutListener = ref(null);
const approvedUsersListener = ref(null);

/* ===== COUNTS ===== */
const inStock = computed(() => inventoryItems.value.filter(i => i.quantity > 10).length);
const lowStock = computed(() => inventoryItems.value.filter(i => i.quantity > 0 && i.quantity <= 10).length);
const outOfStock = computed(() => inventoryItems.value.filter(i => i.quantity === 0).length);

const totalInventoryValue = computed(() => {
  return inventoryItems.value.reduce((sum, item) => sum + (item.totalValue || 0), 0);
});

const totalInventoryQuantity = computed(() => {
  return inventoryItems.value.reduce((sum, item) => sum + (item.quantity || 0), 0);
});

const today = new Date();
today.setHours(0, 0, 0, 0);

// Transaction In calculations
const todaysTransactionIn = computed(() => {
  return transactionInItems.value.filter(item => {
    const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
    return itemDate >= today;
  });
});

const todaysTransactionInCount = computed(() => todaysTransactionIn.value.length);
const todaysTransactionInQty = computed(() => {
  return todaysTransactionIn.value.reduce((sum, item) => sum + (item.quantity || 0), 0);
});
const todaysTransactionInValue = computed(() => {
  return todaysTransactionIn.value.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
});
const pendingTransactionIn = computed(() => {
  return transactionInItems.value.filter(item => item.statusIN === 'To Review' || !item.statusIN).length;
});

// Filtered Transaction In based on selected filter
const filteredTransactionIn = computed(() => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return transactionInItems.value.filter(item => {
    const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
    
    if (transactionInFilter.value === 'today') {
      return itemDate >= startOfDay;
    } else if (transactionInFilter.value === 'week') {
      return itemDate >= startOfWeek;
    } else if (transactionInFilter.value === 'month') {
      return itemDate >= startOfMonth;
    }
    return true;
  });
});

const filteredTransactionInCount = computed(() => filteredTransactionIn.value.length);
const filteredTransactionInQty = computed(() => {
  return filteredTransactionIn.value.reduce((sum, item) => sum + (item.quantity || 0), 0);
});
const filteredTransactionInValue = computed(() => {
  return filteredTransactionIn.value.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
});
const filteredTransactionInToReview = computed(() => {
  return filteredTransactionIn.value.filter(item => item.statusIN === 'To Review' || !item.statusIN).length;
});
const filteredTransactionInStockIn = computed(() => {
  return filteredTransactionIn.value.filter(item => item.statusIN === 'Stock IN').length;
});
const filteredTransactionInStockOut = computed(() => {
  return filteredTransactionIn.value.filter(item => item.statusIN === 'Stock OUT').length;
});

const recentTransactionIn = computed(() => {
  return [...transactionInItems.value]
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    })
    .slice(0, 10);
});

// Helper function for status badge class
const getTransactionInStatusClass = (status) => {
  switch (status) {
    case 'Stock IN':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Stock OUT':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'To Review':
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  }
};

// Format transaction date
const formatTransactionDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/* ===== TREND INDICATORS ===== */
// Yesterday's metrics
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
yesterday.setHours(0, 0, 0, 0);

const yesterdaysRevenue = computed(() => {
  return transactionOutItems.value.filter(item => {
    const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
    const dayAfter = new Date(yesterday);
    dayAfter.setDate(dayAfter.getDate() + 1);
    return itemDate >= yesterday && itemDate < dayAfter && item.statusOUT === 'Stock OUT';
  }).reduce((sum, item) => sum + (item.totalPrice || 0), 0);
});

const yesterdaysTransactionCount = computed(() => {
  return transactionOutItems.value.filter(item => {
    const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
    const dayAfter = new Date(yesterday);
    dayAfter.setDate(dayAfter.getDate() + 1);
    return itemDate >= yesterday && itemDate < dayAfter && item.statusOUT === 'Stock OUT';
  }).length;
});

// Last week's metrics
const lastWeekStart = new Date();
lastWeekStart.setDate(lastWeekStart.getDate() - 7);
lastWeekStart.setHours(0, 0, 0, 0);

const lastWeekRevenue = computed(() => {
  return transactionOutItems.value.filter(item => {
    const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
    return itemDate >= lastWeekStart && itemDate < new Date() && item.statusOUT === 'Stock OUT';
  }).reduce((sum, item) => sum + (item.totalPrice || 0), 0);
});

// Revenue growth comparison
const revenueGrowthVsYesterday = computed(() => {
  if (yesterdaysRevenue.value === 0) return todaysRevenue.value > 0 ? 100 : 0;
  return Math.round(((todaysRevenue.value - yesterdaysRevenue.value) / yesterdaysRevenue.value) * 100);
});

const revenueGrowthVsLastWeek = computed(() => {
  const dailyLastWeekAvg = lastWeekRevenue.value / 7;
  if (dailyLastWeekAvg === 0) return todaysRevenue.value > 0 ? 100 : 0;
  return Math.round(((todaysRevenue.value - dailyLastWeekAvg) / dailyLastWeekAvg) * 100);
});

// Transaction count growth
const txCountGrowthVsYesterday = computed(() => {
  if (yesterdaysTransactionCount.value === 0) return todaysTransactionCount.value > 0 ? 100 : 0;
  return Math.round(((todaysTransactionCount.value - yesterdaysTransactionCount.value) / yesterdaysTransactionCount.value) * 100);
});

// Average value growth
const yesterdaysAvgValue = computed(() => {
  if (yesterdaysTransactionCount.value === 0) return 0;
  return Math.round(yesterdaysRevenue.value / yesterdaysTransactionCount.value);
});

const avgValueGrowthVsYesterday = computed(() => {
  if (yesterdaysAvgValue.value === 0) return averageTransactionValue.value > 0 ? 100 : 0;
  return Math.round(((averageTransactionValue.value - yesterdaysAvgValue.value) / yesterdaysAvgValue.value) * 100);
});

// Helper function to get trend class and icon
const getTrendIndicator = (growthPercent) => {
  if (growthPercent > 0) {
    return { class: isDarkMode.value ? 'text-green-400' : 'text-green-600', icon: 'up' };
  } else if (growthPercent < 0) {
    return { class: isDarkMode.value ? 'text-red-400' : 'text-red-600', icon: 'down' };
  }
  return { class: isDarkMode.value ? 'text-gray-400' : 'text-gray-600', icon: 'neutral' };
};

// Transaction Out Filter
const transactionOutFilter = ref('today'); // 'today', 'week', 'month', 'custom'
const customTransactionOutDate = ref('');

const filteredTransactionOut = computed(() => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  return transactionOutItems.value.filter(item => {
    const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
    if (transactionOutFilter.value === 'today') {
      return itemDate >= startOfDay;
    } else if (transactionOutFilter.value === 'week') {
      return itemDate >= startOfWeek;
    } else if (transactionOutFilter.value === 'month') {
      return itemDate >= startOfMonth;
    } else if (transactionOutFilter.value === 'year') {
      return itemDate >= startOfYear;
    } else if (transactionOutFilter.value === 'custom' && customTransactionOutDate.value) {
      const customDate = new Date(customTransactionOutDate.value);
      return itemDate >= customDate;
    }
    return true;
  });
});

const filteredTransactionOutCount = computed(() => filteredTransactionOut.value.length);
const filteredTransactionOutQty = computed(() => {
  return filteredTransactionOut.value.reduce((sum, item) => sum + (item.quantity || 0), 0);
});
const filteredTransactionOutValue = computed(() => {
  return filteredTransactionOut.value.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
});
const filteredPendingTransactionOut = computed(() => {
  return filteredTransactionOut.value.filter(item => item.statusOUT === 'Pending' || !item.statusOUT).length;
});
const filteredTransactionOutStockOut = computed(() => {
  return filteredTransactionOut.value.filter(item => item.statusOUT === 'Stock OUT').length;
});
const filteredTransactionOutCancelled = computed(() => {
  return filteredTransactionOut.value.filter(item => item.statusOUT === 'Cancelled').length;
});

/* ===== FINANCIAL HIGHLIGHTS ===== */
const todaysRevenue = computed(() => {
  return filteredTransactionOut.value.filter(item => item.statusOUT === 'Stock OUT').reduce((sum, item) => sum + (item.totalPrice || 0), 0);
});

const todaysTransactionCount = computed(() => {
  return filteredTransactionOut.value.filter(item => item.statusOUT === 'Stock OUT').length;
});

const averageTransactionValue = computed(() => {
  if (todaysTransactionCount.value === 0) return 0;
  return Math.round(todaysRevenue.value / todaysTransactionCount.value);
});

const topSellingPart = computed(() => {
  if (filteredTransactionOut.value.length === 0) return { partNo: 'N/A', quantity: 0 };
  
  const partCounts = {};
  filteredTransactionOut.value.forEach(item => {
    if (item.statusOUT === 'Stock OUT') {
      partCounts[item.partNo] = (partCounts[item.partNo] || 0) + (item.quantity || 0);
    }
  });
  
  let topPart = { partNo: 'N/A', quantity: 0 };
  Object.entries(partCounts).forEach(([partNo, quantity]) => {
    if (quantity > topPart.quantity) {
      topPart = { partNo, quantity };
    }
  });
  
  return topPart;
});

const pendingUsersCount = computed(() => pendingUsers.value.length);
const approvedUsersCount = computed(() => approvedUsers.value.length);

/* ===== SERVICE ADVISOR STATE ===== */
const serviceAdvisors = ref([]);
const saAssignments = ref([]);
const saListener = ref(null);
const saAssignmentsListener = ref(null);

const activeSAsCount = computed(() => {
  return serviceAdvisors.value.filter(sa => 
    sa.saStatus === 'WORKING' || 
    sa.saStatus === 'AVAILABLE' || 
    sa.saStatus === 'BUSY'
  ).length;
});

const jobsDoneToday = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return saAssignments.value.filter(a => {
    const aDate = a.completedDate?.toDate ? a.completedDate.toDate() : new Date(a.completedDate);
    return a.status === 'JOB DONE' && aDate >= today;
  }).length;
});

const ongoingJobs = computed(() => {
  return saAssignments.value.filter(a => a.status === 'ON GOING').length;
});

const efficiencyRate = computed(() => {
  const total = saAssignments.value.filter(a => 
    a.status === 'JOB DONE' || a.status === 'CANCELLED'
  ).length;
  if (total === 0) return 0;
  const completed = saAssignments.value.filter(a => a.status === 'JOB DONE').length;
  return Math.round((completed / total) * 100);
});

const workloadBalance = computed(() => {
  if (serviceAdvisors.value.length === 0) return 0;
  const workloads = serviceAdvisors.value.map(sa => {
    return saAssignments.value.filter(a => a.saName === sa.saName && a.status === 'ON GOING').length;
  });
  if (workloads.length === 0) return 100;
  const max = Math.max(...workloads);
  const min = Math.min(...workloads);
  if (max === 0) return 100;
  return Math.round(((max - min) / max) * 100);
});

const workloadBalanceClass = computed(() => {
  if (workloadBalance.value >= 80) return 'bg-green-100 text-green-700';
  if (workloadBalance.value >= 50) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
});

const saWorkload = computed(() => {
  return serviceAdvisors.value.map(sa => {
    const ongoing = saAssignments.value.filter(a => a.saName === sa.saName && a.status === 'ON GOING').length;
    let statusClass = '';
    let barClass = '';
    switch (sa.saStatus) {
      case 'WORKING':
        statusClass = 'bg-green-100 text-green-700';
        barClass = 'bg-green-500';
        break;
      case 'BUSY':
        statusClass = 'bg-red-100 text-red-700';
        barClass = 'bg-red-500';
        break;
      case 'AVAILABLE':
        statusClass = 'bg-blue-100 text-blue-700';
        barClass = 'bg-blue-500';
        break;
      case 'ABSENT':
        statusClass = 'bg-amber-100 text-amber-700';
        barClass = 'bg-amber-500';
        break;
      default:
        statusClass = 'bg-gray-100 text-gray-700';
        barClass = 'bg-gray-500';
    }
    return {
      name: sa.saName,
      status: sa.saStatus,
      ongoing: ongoing,
      capacity: 5,
      workloadPercent: Math.min(100, (ongoing / 5) * 100),
      statusClass,
      barClass
    };
  });
});

const setupServiceAdvisorListener = () => {
  const docRef = doc(db, "Service_Advisor", "isuzu&calapan&sa");
  saListener.value = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      serviceAdvisors.value = Object.values(data).map(item => ({
        saName: item.saName,
        saStatus: item.saStatus
      }));
    }
  }, (error) => {
    console.error("Error in SA listener:", error);
  });
};

const setupServiceAdvisorAssignmentsListener = () => {
  const dateKey = getTodayDateKey();
  const docRef = doc(db, "SA_Assignment", `isuzu&calapan&assignments&${dateKey}`);
  saAssignmentsListener.value = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      saAssignments.value = Object.values(data).map(item => ({
        pro: item.pro || "",
        saName: item.saName || "",
        status: item.status || "ON GOING",
        completedDate: item.completedDate || null
      }));
    } else {
      saAssignments.value = [];
    }
  }, (error) => {
    console.error("Error in SA assignments listener:", error);
  });
};

const getTodayDateKey = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/* ===== REAL-TIME LISTENERS ===== */
const setupInventoryListeners = async () => {
  try {
    const categoryDoc = await getDocs(collection(db, "Category"));
    let categories = [];
    if (!categoryDoc.empty) {
      const catData = categoryDoc.docs[0].data();
      categories = catData.list || [];
    }

    cleanupInventoryListeners();

    for (const category of categories) {
      const docRef = doc(db, "Inventory", `isuzu11&calapan16&inventory2019&${category.toLowerCase()}`);
      
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          inventoryItems.value = inventoryItems.value.filter(item => item.category !== category);
          
          const categoryItems = [];
          Object.keys(data).forEach(controlNo => {
            if (controlNo.startsWith('ISZ-')) {
              const itemData = data[controlNo];
              categoryItems.push({
                id: controlNo,
                controlNo,
                category,
                ...itemData,
                status: itemData.quantity === 0 ? 'out' : itemData.quantity <= 10 ? 'low' : 'in-stock'
              });
            }
          });
          
          inventoryItems.value.push(...categoryItems);
        }
      }, (error) => {
        console.warn(`Error in inventory listener for ${category}:`, error);
      });
      
      inventoryListeners.value.push(unsubscribe);
    }
  } catch (error) {
    console.error("Error setting up inventory listeners:", error);
  }
};

const cleanupInventoryListeners = () => {
  inventoryListeners.value.forEach(unsubscribe => {
    if (typeof unsubscribe === 'function') unsubscribe();
  });
  inventoryListeners.value = [];
};

const setupPendingUsersListener = () => {
  const q = query(collection(db, "Administrator"), where("accountStatus", "==", "pending"));
  pendingUsersListener.value = onSnapshot(q, (snapshot) => {
    pendingUsers.value = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      username: docSnap.data().username || "N/A",
      email: docSnap.data().email || "N/A",
      accountStatus: docSnap.data().accountStatus || "pending"
    }));
  }, (error) => {
    console.error("Error in pending users listener:", error);
  });
};

const setupApprovedUsersListener = () => {
  const q = query(collection(db, "Administrator"), where("accountStatus", "==", "approved"));
  approvedUsersListener.value = onSnapshot(q, (snapshot) => {
    approvedUsers.value = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      username: docSnap.data().username || "N/A",
      email: docSnap.data().email || "N/A",
      accountStatus: docSnap.data().accountStatus || "approved"
    }));
  }, (error) => {
    console.error("Error in approved users listener:", error);
  });
};

const setupTransactionInListener = () => {
  const q = collectionGroup(db, "Transaction_IN");
  transactionInListener.value = onSnapshot(q, (snapshot) => {
    transactionInItems.value = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return { id: docSnap.id, ...data, createdAt: data.createdAt || data.receivedAt };
    });
  }, (error) => {
    console.error("Error in transaction in listener:", error);
  });
};

const setupTransactionOutListener = () => {
  const q = collectionGroup(db, "Transaction_OUT");
  transactionOutListener.value = onSnapshot(q, (snapshot) => {
    transactionOutItems.value = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return { id: docSnap.id, ...data, createdAt: data.createdAt || data.soldAt };
    });
  }, (error) => {
    console.error("Error in transaction out listener:", error);
  });
};

/* ===== INIT CHARTS ===== */
const initCharts = () => {
  if (!statusChart.value || !categoryChart.value) return;

  statusChartInstance?.destroy();
  categoryChartInstance?.destroy();
  transactionChartInstance?.destroy();
  salesCategoryChartInstance?.destroy();
  approvalChartInstance?.destroy();

  // Pie Chart Design (Referencing 2nd Image) - Exploded/Gap Styling
  statusChartInstance = new Chart(statusChart.value, {
    type: "doughnut",
    data: {
      labels: ["In Stock", "Low Stock", "Out of Stock"],
      datasets: [{ 
        data: [inStock.value, lowStock.value, outOfStock.value], 
        backgroundColor: ["#10b981", "#fb7185", "#ef4444"],
        borderWidth: 8,
        borderColor: isDarkMode.value ? '#262626' : '#ffffff',
        hoverOffset: 15,
        borderRadius: 10
      }],
    },
    options: { 
      responsive: true, 
      maintainAspectRatio: false, 
      cutout: '70%',
      plugins: { 
        legend: { 
          position: 'bottom',
          labels: { usePointStyle: true, font: { size: 10, weight: '900' }, padding: 20 }
        } 
      } 
    }
  });

  // Bar Chart Design (Referencing 1st Image) - Rounded Corners
  // Function para gumawa ng stripe pattern
  const createStripePattern = (color1, color2) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 10;
    canvas.height = 10;

    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, 10, 10);

    ctx.strokeStyle = color2;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-2, 12);
    ctx.lineTo(12, -2);
    ctx.stroke();

    return ctx.createPattern(canvas, 'repeat');
  };

  // Bar Chart Initialization
  const categories = {};
  inventoryItems.value.forEach(item => {
    const cat = item.category || "Uncategorized";
    categories[cat] = (categories[cat] || 0) + (item.quantity || 0);
  });

  const labels = Object.keys(categories);
  const dataValues = Object.values(categories);
  const ctx = categoryChart.value.getContext('2d');

  // Gawa tayo ng pattern: Itim na may dark grey stripes
  const darkStripe = createStripePattern('#1a1a1a', '#262626');

  // Logic para sa kulay: Ang pinakamataas (max value) ay magiging Light Grey gaya ng "Mar" sa image
  const backgroundColors = dataValues.map(val => {
    return val === Math.max(...dataValues) ? '#9ca3af' : darkStripe;
  });

  categoryChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: 'Quantity',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderRadius: 12, // Sobrang rounded gaya ng nasa image
        borderSkipped: false,
        barThickness: 60, // Makapal na bars
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#000',
          bodyColor: '#000',
          cornerRadius: 10,
          displayColors: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: 'rgba(0,0,0,0.05)', // Maninipis na gridlines gaya ng image
            drawBorder: false
          },
          ticks: {
            font: { size: 10, family: 'Inter' },
            callback: function(value) {
              return value >= 1000 ? (value / 1000) + 'K' : value; // K formatting (2K, 4K, etc)
            }
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 11, weight: '500' }
          }
        }
      }
    }
  });

  // Line Chart Design (Referencing 3rd Image) - Smooth Area Chart
  const last7Days = [];
  const transInData = [];
  const transOutData = [];

  // Use filteredTransactionOut for sales/transaction out data
  // For the last 7 days, filter both transactionInItems and filteredTransactionOut
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

    const dayTransIn = transactionInItems.value.filter(item => {
      const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
      return itemDate.toDateString() === date.toDateString();
    }).reduce((sum, item) => sum + (item.quantity || 0), 0);

    const dayTransOut = filteredTransactionOut.value.filter(item => {
      const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
      return itemDate.toDateString() === date.toDateString();
    }).reduce((sum, item) => sum + (item.quantity || 0), 0);

    transInData.push(dayTransIn);
    transOutData.push(dayTransOut);
  }

  if (transactionChart.value) {
    transactionChartInstance = new Chart(transactionChart.value, {
      type: "line",
      data: {
        labels: last7Days,
        datasets: [
          { 
            label: 'Transaction In', 
            data: transInData, 
            borderColor: '#2563eb', 
            backgroundColor: 'rgba(37, 99, 235, 0.1)', 
            fill: true, 
            tension: 0.5, // Ultra smooth like Image 3
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: '#2563eb',
            borderWidth: 3
          },
          { 
            label: 'Transaction Out', 
            data: transOutData, 
            borderColor: '#f97316', 
            backgroundColor: 'rgba(249, 115, 22, 0.1)', 
            fill: true, 
            tension: 0.5, // Ultra smooth like Image 3
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: '#f97316',
            borderWidth: 3
          }
        ]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        interaction: { intersect: false, mode: 'index' },
        plugins: { 
          legend: { position: 'top', labels: { usePointStyle: true, font: { weight: 'bold', size: 10 } } } 
        },
        scales: {
          y: { grid: { color: isDarkMode.value ? '#333' : '#f0f0f0' }, ticks: { font: { size: 9 } } },
          x: { grid: { display: false }, ticks: { font: { size: 9 } } }
        }
      }
    });
  }

  // Sales Category Chart
  const salesByCategory = {};
  filteredTransactionOut.value.forEach(item => {
    const cat = item.category || "Uncategorized";
    salesByCategory[cat] = (salesByCategory[cat] || 0) + (item.totalPrice || 0);
  });

  if (salesCategoryChart.value) {
    salesCategoryChartInstance = new Chart(salesCategoryChart.value, {
      type: "bar",
      data: {
        labels: Object.keys(salesByCategory),
        datasets: [{ 
          label: 'Sales (₱)', 
          data: Object.values(salesByCategory), 
          backgroundColor: '#f97316',
          borderRadius: 15,
          barThickness: 20
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { display: false }, ticks: { font: { size: 9 } } },
          x: { grid: { display: false }, ticks: { font: { size: 9 } } }
        }
      }
    });
  }

  // Approval Status Chart
  if (approvalChart.value) {
    approvalChartInstance = new Chart(approvalChart.value, {
      type: "pie",
      data: {
        labels: ["Pending", "Approved"],
        datasets: [{ 
          data: [pendingUsersCount.value, approvedUsersCount.value], 
          backgroundColor: ["#eab308", "#22c55e"],
          borderWidth: 5,
          borderColor: isDarkMode.value ? '#262626' : '#ffffff',
          borderRadius: 5
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { 
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9, weight: 'bold' } } } 
        } 
      }
    });
  }
};

// Watch inventory data and update charts
watch(inventoryItems, () => {
  if (statusChartInstance) {
    statusChartInstance.data.datasets[0].data = [inStock.value, lowStock.value, outOfStock.value];
    statusChartInstance.update('none');
  }
  if (categoryChartInstance) {
    const categories = {};
    inventoryItems.value.forEach(item => {
      const cat = item.category || "Uncategorized";
      categories[cat] = (categories[cat] || 0) + (item.quantity || 0);
    });
    categoryChartInstance.data.labels = Object.keys(categories);
    categoryChartInstance.data.datasets[0].data = Object.values(categories);
    categoryChartInstance.update('none');
  }
}, { deep: true });

// Watch transaction data and update transaction chart and sales by category chart with filter
watch([transactionInItems, transactionOutItems, transactionOutFilter, customTransactionOutDate], () => {
  if (transactionChartInstance) {
    // Dynamically adjust x-axis and data range based on transactionOutFilter
    let labels = [];
    let transInData = [];
    let transOutData = [];
    const now = new Date();

    if (transactionOutFilter.value === 'today') {
      labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      for (let hour = 0; hour < 24; hour++) {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 59, 59, 999);
        const inSum = transactionInItems.value.filter(item => {
          const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
          return d >= start && d <= end;
        }).reduce((sum, item) => sum + (item.quantity || 0), 0);
        const outSum = filteredTransactionOut.value.filter(item => {
          const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
          return d >= start && d <= end;
        }).reduce((sum, item) => sum + (item.quantity || 0), 0);
        transInData.push(inSum);
        transOutData.push(outSum);
      }
    } else if (transactionOutFilter.value === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        labels.push(day.toLocaleDateString('en-US', { weekday: 'short' }));
        const inSum = transactionInItems.value.filter(item => {
          const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
          return d.toDateString() === day.toDateString();
        }).reduce((sum, item) => sum + (item.quantity || 0), 0);
        const outSum = filteredTransactionOut.value.filter(item => {
          const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
          return d.toDateString() === day.toDateString();
        }).reduce((sum, item) => sum + (item.quantity || 0), 0);
        transInData.push(inSum);
        transOutData.push(outSum);
      }
    } else if (transactionOutFilter.value === 'month') {
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        labels.push(day.toString());
        const start = new Date(year, month, day, 0, 0, 0, 0);
        const end = new Date(year, month, day, 23, 59, 59, 999);
        const inSum = transactionInItems.value.filter(item => {
          const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
          return d >= start && d <= end;
        }).reduce((sum, item) => sum + (item.quantity || 0), 0);
        const outSum = filteredTransactionOut.value.filter(item => {
          const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
          return d >= start && d <= end;
        }).reduce((sum, item) => sum + (item.quantity || 0), 0);
        transInData.push(inSum);
        transOutData.push(outSum);
      }
    } else if (transactionOutFilter.value === 'year') {
      const year = now.getFullYear();
      labels = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1).toLocaleString('en-US', { month: 'short' }));
      for (let month = 0; month < 12; month++) {
        const start = new Date(year, month, 1, 0, 0, 0, 0);
        const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
        const inSum = transactionInItems.value.filter(item => {
          const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
          return d >= start && d <= end;
        }).reduce((sum, item) => sum + (item.quantity || 0), 0);
        const outSum = filteredTransactionOut.value.filter(item => {
          const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
          return d >= start && d <= end;
        }).reduce((sum, item) => sum + (item.quantity || 0), 0);
        transInData.push(inSum);
        transOutData.push(outSum);
      }
    } else if (transactionOutFilter.value === 'custom' && customTransactionOutDate.value) {
      const start = new Date(customTransactionOutDate.value);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      let current = new Date(start);
      while (current <= end) {
        labels.push(current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const dayStart = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 0, 0, 0, 0);
        const dayEnd = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 23, 59, 59, 999);
        const inSum = transactionInItems.value.filter(item => {
          const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
          return d >= dayStart && d <= dayEnd;
        }).reduce((sum, item) => sum + (item.quantity || 0), 0);
        const outSum = filteredTransactionOut.value.filter(item => {
          const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
          return d >= dayStart && d <= dayEnd;
        }).reduce((sum, item) => sum + (item.quantity || 0), 0);
        transInData.push(inSum);
        transOutData.push(outSum);
        current.setDate(current.getDate() + 1);
      }
    } else {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        date.setHours(0, 0, 0, 0);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        const inSum = transactionInItems.value.filter(item => {
          const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
          return d.toDateString() === date.toDateString();
        }).reduce((sum, item) => sum + (item.quantity || 0), 0);
        const outSum = filteredTransactionOut.value.filter(item => {
          const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
          return d.toDateString() === date.toDateString();
        }).reduce((sum, item) => sum + (item.quantity || 0), 0);
        transInData.push(inSum);
        transOutData.push(outSum);
      }
    }
    transactionChartInstance.data.labels = labels;
    transactionChartInstance.data.datasets[0].data = transInData;
    transactionChartInstance.data.datasets[1].data = transOutData;
    transactionChartInstance.update('none');
  }

  // Update sales by category chart with filter
  if (salesCategoryChartInstance) {
    const salesByCategory = {};
    filteredTransactionOut.value.forEach(item => {
      const cat = item.category || "Uncategorized";
      salesByCategory[cat] = (salesByCategory[cat] || 0) + (item.totalPrice || 0);
    });
    salesCategoryChartInstance.data.labels = Object.keys(salesByCategory);
    salesCategoryChartInstance.data.datasets[0].data = Object.values(salesByCategory);
    salesCategoryChartInstance.update('none');
  }
}, { deep: true });

// Watch user approval data and update approval chart
watch([pendingUsers, approvedUsers], () => {
  if (approvalChartInstance) {
    approvalChartInstance.data.datasets[0].data = [pendingUsersCount.value, approvedUsersCount.value];
    approvalChartInstance.update('none');
  }
}, { deep: true });

/* ===== LIFECYCLE ===== */
onMounted(async () => {
  // Check permissions first
  await fetchUserRoles();
  hasDashboardAccess.value = await canAccessPage('Dashboard');
  
  if (!hasDashboardAccess.value) {
    isLoading.value = false;
    router.push('/403');
    return;
  }

  // Fetch accessible pages for granular dashboard permissions
  accessiblePages.value = await getAccessiblePages();

  await setupInventoryListeners();
  setupPendingUsersListener();
  setupApprovedUsersListener();
  setupTransactionInListener();
  setupTransactionOutListener();
  setupServiceAdvisorListener();
  setupServiceAdvisorAssignmentsListener();
  
  isLoading.value = false;
  await nextTick();
  initCharts();
});

onUnmounted(() => {
  cleanupInventoryListeners();
  if (pendingUsersListener.value) pendingUsersListener.value();
  if (approvedUsersListener.value) approvedUsersListener.value();
  if (transactionInListener.value) transactionInListener.value();
  if (transactionOutListener.value) transactionOutListener.value();
  if (saListener.value) saListener.value();
  if (saAssignmentsListener.value) saAssignmentsListener.value();
});

</script>

<style scoped>
.chart-wrapper { position: relative; height: 250px; width: 100%; }
.chart-wrapper-small { height: 200px; }
@media (min-width: 640px) { .chart-wrapper { height: 280px; } .chart-wrapper-small { height: 220px; } }
@media (min-width: 1024px) { .chart-wrapper { height: 320px; } .chart-wrapper-small { height: 250px; } }
canvas { width: 100% !important; height: 100% !important; }
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>

