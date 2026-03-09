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
      <div class="max-w-[1600px] mx-auto p-6 lg:p-10 space-y-12">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 :class="['text-3xl font-black text-neutral-900 isuzu-font uppercase tracking-tight flex items-center gap-3', textClass]">
              <span class="w-2 h-10 bg-red-600 rounded-full"></span>
              System <span class="text-red-600">Dashboard</span>
            </h1>
            <p :class="['text-[10px] uppercase tracking-[0.3em] ml-5', subTextClass]">Real-time Operations Overview</p>
          </div>
          
          <div :class="[cardClass, 'backdrop-blur-sm border border-neutral-400 rounded-2xl px-4 py-3 flex items-center gap-4 shadow-sm']">
            <Calendar class="w-4 h-4 text-red-600" />
            <span :class="['text-xs font-bold uppercase tracking-widest', subTextClass]">{{ new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}</span>
          </div>
        </div>

        <section class="space-y-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="bg-red-600 p-2 rounded-xl">
              <Boxes class="w-5 h-5 text-white" />
            </div>
            <h2 :class="['text-xl text-neutral-900 uppercase tracking-tighter isuzu-font', textClass]">Inventory <span class="text-red-600">Overview</span></h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div class="bg-neutral-600/10 rounded-3xl p-6 border border-neutral-300/20 hover:border-red-600 transition-all group relative overflow-hidden shadow-sm">
               <div class="absolute -right-4 -bottom-2 opacity-10 group-hover:scale-110 transition-transform">
                <Package class="w-24 h-24 text-neutral-500" />
              </div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Parts</p>
              <p class="text-3xl font-black text-neutral-800">{{ inventoryItems.length }}</p>
              <div class="mt-4 flex items-center text-[10px] font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
                <ArrowUpRight class="w-3 h-3 mr-1" /> ACTIVE ITEMS
              </div>
            </div>

            <div class="bg-neutral-600/10 rounded-3xl p-6 border border-neutral-300/20 hover:border-blue-600 transition-all group relative overflow-hidden shadow-sm">
              <div class="absolute -right-4 -bottom-2 opacity-10 group-hover:scale-110 transition-transform text-blue-500">
                <DollarSign class="w-24 h-24" />
              </div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Stock Value</p>
              
              <p class="text-3xl font-black text-neutral-800">
                ₱{{ formatValue(totalInventoryValue) }}
              </p>
              
              <div class="mt-4 text-[10px] font-bold text-blue-600 uppercase tracking-widest">Market Valuation</div>
            </div>

            <div class="bg-neutral-600/10 rounded-3xl p-6 border border-neutral-300/20 hover:border-purple-600 transition-all group relative overflow-hidden shadow-sm">
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Quantity</p>
              <p class="text-3xl font-black text-neutral-800">{{ totalInventoryQuantity.toLocaleString() }}</p>
              <div class="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-purple-500 rounded-full" style="width: 70%"></div>
              </div>
            </div>

            <div class="bg-neutral-900 rounded-3xl p-6 relative overflow-hidden group shadow-xl">
              <div class="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-[4rem]"></div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Availability</p>
              <p class="text-3xl font-black text-green-500">{{ inStock }} <span class="text-xs text-white/50 font-medium">IN STOCK</span></p>
              <p class="mt-4 text-[10px] text-white/40 uppercase tracking-widest">Optimal Levels</p>
            </div>

            <div class="bg-neutral-600/10 rounded-3xl p-6 border-b-4 border-red-600 hover:border-red-900 relative group overflow-hidden shadow-sm">
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Critical Stock</p>
              <p class="text-3xl font-black text-red-600">{{ outOfStock }}</p>
              <p class="mt-4 text-[10px] font-bold text-red-600/50 uppercase tracking-widest flex items-center gap-1">
                <AlertTriangle class="w-3 h-3" /> Reorder Needed
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div :class="[cardClass, 'rounded-3xl p-8 border border-neutral-400/20 xl:col-span-1 shadow-sm']" :style="cardStyle">
              <h3 :class="['text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2', textClass]">
                <PieChart class="w-4 h-4 text-red-600" /> Status Distribution
              </h3>
              <div class="h-[280px] relative px-4">
                <canvas ref="statusChart"></canvas>
              </div>
            </div>

            <div :class="[cardClass, 'rounded-3xl p-8 border border-neutral-400/20 xl:col-span-2 shadow-sm']" :style="cardStyle">
              <h3 :class="['text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2', textClass]">
                <BarChart3 class="w-4 h-4 text-red-600" /> Stock by Category
              </h3>
              <div class="h-[280px] relative">
                <canvas ref="categoryChart"></canvas>
              </div>
            </div>
          </div>
        </section>

        <div class="flex items-center gap-2 pb-1 border-b-2 border-neutral-600/40 mb-6"></div>

        <section class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <div :class="[cardClass, 'rounded-3xl p-8 border border-neutral-400/20 relative overflow-hidden group hover:shadow-md transition-all']" :style="cardStyle">
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

          <div class="bg-neutral-900 rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all">
            <div class="absolute -right-6 -bottom-6 opacity-15 rotate-12 group-hover:scale-110 transition-transform duration-500">
              <Users class="w-40 h-40" />
            </div>

            <div class="relative z-10 flex flex-col h-full">
              <div class="flex items-center justify-between mb-10">
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
                <p class="text-[9px] font-medium text-gray-500 uppercase tracking-widest mt-4">New registration requests in queue</p>
              </div>
            </div>
          </div>

          <div :class="[cardClass, 'rounded-3xl p-8 border border-neutral-400/20 flex flex-col relative group shadow-sm']" :style="cardStyle">
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
            
            <div class="flex-1 min-h-[160px] relative flex items-center justify-center px-4">
              <canvas ref="approvalChart" class="max-h-[180px]"></canvas>
            </div>

            <div :class="['mt-4 pt-4 border-t flex justify-between items-center', isDarkMode ? 'border-gray-700' : 'border-neutral-300']">
              <span :class="['text-[9px] font-black uppercase tracking-widest italic', subTextClass]">Live Analytics</span>
              <button :class="['text-[9px] font-black uppercase hover:underline', isDarkMode ? 'text-yellow-400' : 'text-yellow-700']">View Matrix</button>
            </div>
          </div>
        </section>

        <section class="space-y-8">          
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
                    ? ['bg-white dark:bg-neutral-600 shadow-sm text-green-600 scale-105'] 
                    : [isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700']"
                  class="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200"
                >
                  {{ filter }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <div :class="[cardClass, 'relative overflow-hidden rounded-2xl p-4 border-l-4 border-green-500 group transition-all shadow-sm']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Total Records</h3>
                  <p :class="['text-2xl font-black leading-none', textClass]">{{ filteredTransactionInCount }}</p>
                </div>
                <ArrowDownCircle class="absolute -right-2 -bottom-2 w-12 h-12 text-green-500/10 group-hover:scale-110 transition-transform" />
              </div>

              <div :class="[cardClass, 'relative overflow-hidden rounded-2xl p-4 border-l-4 border-blue-500 group transition-all shadow-sm']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Total Qty</h3>
                  <p :class="['text-2xl font-black leading-none', textClass]">{{ filteredTransactionInQty.toLocaleString() }}</p>
                </div>
                <Package class="absolute -right-2 -bottom-2 w-12 h-12 text-blue-500/10 group-hover:scale-110 transition-transform" />
              </div>

              <div :class="[cardClass, 'relative overflow-hidden rounded-2xl p-4 border-l-4 border-purple-500 group transition-all shadow-sm']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Total Value</h3>
                  <p :class="['text-2xl font-black leading-none', textClass, isDarkMode ? 'text-purple-400' : 'text-purple-600']">₱{{ filteredTransactionInValue.toLocaleString() }}</p>
                </div>
                <DollarSign class="absolute -right-2 -bottom-2 w-12 h-12 text-purple-500/10 group-hover:scale-110 transition-transform" />
              </div>

              <div :class="[cardClass, 'relative overflow-hidden rounded-2xl p-4 border-l-4 border-yellow-500 group transition-all shadow-sm']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">To Review</h3>
                  <p :class="['text-2xl font-black leading-none', isDarkMode ? 'text-yellow-400' : 'text-yellow-600']">{{ filteredTransactionInToReview }}</p>
                </div>
                <Clock class="absolute -right-2 -bottom-2 w-12 h-12 text-yellow-500/10 group-hover:scale-110 transition-transform" />
              </div>

              <div :class="[cardClass, 'relative overflow-hidden rounded-2xl p-4 border-l-4 border-emerald-600 group transition-all shadow-sm']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Stock IN</h3>
                  <p :class="['text-2xl font-black leading-none', isDarkMode ? 'text-emerald-400' : 'text-emerald-600']">{{ filteredTransactionInStockIn }}</p>
                </div>
                <CheckCircle class="absolute -right-2 -bottom-2 w-12 h-12 text-emerald-600/10 group-hover:scale-110 transition-transform" />
              </div>

              <div :class="[cardClass, 'relative overflow-hidden rounded-2xl p-4 border-l-4 border-red-500 group transition-all shadow-sm']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Stock OUT</h3>
                  <p :class="['text-2xl font-black leading-none text-red-500', textClass]">{{ filteredTransactionInStockOut }}</p>
                </div>
                <XCircle class="absolute -right-2 -bottom-2 w-12 h-12 text-red-500/10 group-hover:scale-110 transition-transform" />
              </div>
            </div>

            <div v-if="recentTransactionIn.length > 0" :class="[cardClass, 'overflow-hidden rounded-3xl border shadow-sm']" :style="isDarkMode ? { ...cardStyle, borderColor: '#374151' } : { ...cardStyle, borderColor: '#e5e7eb' }">
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

          <hr :class="['border-dashed', isDarkMode ? 'border-gray-700' : 'border-gray-200']" />

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
                    ? ['bg-white dark:bg-neutral-600 shadow-sm text-orange-600 scale-105'] 
                    : [isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700']"
                  class="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200"
                >
                  {{ filter }}
                </button>
                <input v-if="transactionOutFilter === 'custom'" type="datetime-local" v-model="customTransactionOutDate" class="ml-2 px-2 py-1 rounded border text-xs" />
              </div>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-6 xl:grid-cols-6 gap-3">
              <div :class="[cardClass, 'relative overflow-hidden rounded-2xl p-4 border-l-4 border-orange-500 group transition-all shadow-sm']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Total Records</h3>
                  <p :class="['text-2xl font-black leading-none', textClass]">{{ filteredTransactionOutCount }}</p>
                </div>
                <ArrowUpCircle class="absolute -right-2 -bottom-2 w-12 h-12 text-orange-500/10 group-hover:scale-110 transition-transform" />
              </div>

              <div :class="[cardClass, 'relative overflow-hidden rounded-2xl p-4 border-l-4 border-blue-500 group transition-all shadow-sm']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Total Qty Sold</h3>
                  <p :class="['text-2xl font-black leading-none', textClass, isDarkMode ? 'text-blue-400' : 'text-blue-600']">{{ filteredTransactionOutQty.toLocaleString() }}</p>
                </div>
                <Package class="absolute -right-2 -bottom-2 w-12 h-12 text-blue-500/10 group-hover:scale-110 transition-transform" />
              </div>

              <div :class="[cardClass, 'relative overflow-hidden rounded-2xl p-4 border-l-4 border-purple-500 group transition-all shadow-sm']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Total Sales (₱)</h3>
                  <p :class="['text-2xl font-black leading-none', textClass, isDarkMode ? 'text-purple-400' : 'text-purple-600']">₱{{ filteredTransactionOutValue.toLocaleString() }}</p>
                </div>
                <DollarSign class="absolute -right-2 -bottom-2 w-12 h-12 text-purple-500/10 group-hover:scale-110 transition-transform" />
              </div>

              <div :class="[cardClass, 'relative overflow-hidden rounded-2xl p-4 border-l-4 border-yellow-500 group transition-all shadow-sm']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Pending Sales</h3>
                  <p :class="['text-2xl font-black leading-none', isDarkMode ? 'text-yellow-400' : 'text-yellow-600']">{{ filteredPendingTransactionOut }}</p>
                </div>
                <Clock class="absolute -right-2 -bottom-2 w-12 h-12 text-yellow-500/10 group-hover:scale-110 transition-transform" />
              </div>

              <div :class="[cardClass, 'relative overflow-hidden rounded-2xl p-4 border-l-4 border-emerald-600 group transition-all shadow-sm']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Stock OUT</h3>
                  <p :class="['text-2xl font-black leading-none', isDarkMode ? 'text-emerald-400' : 'text-emerald-600']">{{ filteredTransactionOutStockOut }}</p>
                </div>
                <CheckCircle class="absolute -right-2 -bottom-2 w-12 h-12 text-emerald-600/10 group-hover:scale-110 transition-transform" />
              </div>

              <div :class="[cardClass, 'relative overflow-hidden rounded-2xl p-4 border-l-4 border-red-500 group transition-all shadow-sm']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Cancelled</h3>
                  <p :class="['text-2xl font-black leading-none text-red-500', textClass]">{{ filteredTransactionOutCancelled }}</p>
                </div>
                <XCircle class="absolute -right-2 -bottom-2 w-12 h-12 text-red-500/10 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            <div :class="[cardClass, 'rounded-3xl p-6 bg-white/10 backdrop-blur-none xl:col-span-2']" :style="cardStyle">
              <div class="flex items-center justify-between mb-6">
                <h2 :class="['text-lg font-black uppercase tracking-tighter isuzu-font flex items-center gap-2', textClass]">
                  <TrendingUp class="w-5 h-5 text-blue-600" />
                  Stock Flow <span :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">Analytics</span>
                </h2>
                <span :class="['text-[10px] font-black uppercase tracking-widest', subTextClass]">Last 7 Days</span>
              </div>
              <div class="h-[320px] w-full relative">
                <canvas ref="transactionChart"></canvas>
              </div>
            </div>

            <div :class="[cardClass, 'rounded-3xl p-6 bg-white/10 backdrop-blur-none']" :style="cardStyle">
              <div class="flex items-center justify-between mb-6">
                <h2 :class="['text-lg font-black uppercase tracking-tighter isuzu-font flex items-center gap-2', textClass]">
                  <BarChart3 class="w-5 h-5 text-orange-600" />
                  Category <span :class="isDarkMode ? 'text-orange-400' : 'text-orange-600'">Sales</span>
                </h2>
              </div>
              <div class="h-[320px] w-full relative">
                <canvas ref="salesCategoryChart"></canvas>
              </div>
            </div>
            
          </div>
        </section>

        <div class="mb-10 flex justify-end items-center gap-4">
          <div v-if="syncing" class="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            <span class="text-[9px] font-black uppercase tracking-widest text-yellow-600">Database Handshake in Progress</span>
          </div>

          <button
            @click="runSync"
            :disabled="syncing"
            class="group relative overflow-hidden flex items-center gap-3 bg-neutral-900 dark:bg-red-600 text-white px-6 py-3 rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed border border-white/10"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <RefreshCw 
              :class="['w-4 h-4 transition-transform duration-700', syncing ? 'animate-spin' : 'group-hover:rotate-180']" 
            />
            
            <span class="text-[11px] font-black uppercase tracking-[0.2em] isuzu-font relative z-10">
              <span v-if="!syncing">Sync Firestore <span class="text-red-500 dark:text-red-200">to MySQL</span></span>
              <span v-else>Processing Data Transfer...</span>
            </span>
          </button>
          
        </div>
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
import { ref, onMounted, computed, nextTick, onUnmounted, watch } from "vue";

import { useAuth } from "../../composables/useAuth";
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
  Calendar
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

/* ===== STATE ===== */
const { user, isAuthenticated } = useAuth();
const isLoading = ref(true);

const inventoryItems = ref([]);
const pendingUsers = ref([]);
const transactionInItems = ref([]);
const transactionOutItems = ref([]);
const approvedUsers = ref([]);

// Function to format the numbers to K, M, B, etc.
const formatValue = (value) => {
  if (value === null || value === undefined) return '0';
  
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1 // Para may isang decimal point kung kailangan (e.g., 1.5K)
  }).format(value);
};

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

const pendingUsersCount = computed(() => pendingUsers.value.length);
const approvedUsersCount = computed(() => approvedUsers.value.length);

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

  await setupInventoryListeners();
  setupPendingUsersListener();
  setupApprovedUsersListener();
  setupTransactionInListener();
  setupTransactionOutListener();
  
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
});

/* ===== SYNC ===== */
const syncing = ref(false);

const runSync = async () => {
  syncing.value = true;
  try {
    // Replace with your actual API endpoint
const res = await fetch("/api/sync", { method: "POST" });
    if (!res.ok) throw new Error("Sync failed");
    alert("Sync complete!");
  } catch (e) {
    alert("Sync failed: " + e.message);
  }
  syncing.value = false;
};
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