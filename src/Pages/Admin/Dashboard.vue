<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
    <Loaders />
  </div>

  <div v-else :class="themeClass" class="min-h-screen flex flex-col font-sans relative overflow-hidden">
    
    <div class="absolute top-0 left-0 w-full z-0 opacity-5 pointer-events-none">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 15 H280 L330 45 H500" stroke="#cc0000" stroke-width="2" />
      </svg>
    </div>

    <main class="flex-1 relative z-10 overflow-auto">
      <div class="max-w-[1600px] mx-auto p-6 lg:p-10 space-y-12">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 :class="['text-3xl font-black isuzu-font uppercase tracking-tight flex items-center gap-3', textClass]">
              <span class="w-2 h-10 bg-red-600 rounded-full"></span>
              System <span class="text-red-600">Dashboard</span>
            </h1>
            <p :class="['text-[10px] uppercase tracking-[0.3em] ml-5', subTextClass]">Real-time Operations Overview</p>
          </div>
          
          <div :class="[cardClass, 'backdrop-blur-sm border rounded-2xl px-4 py-3 flex items-center gap-4']">
            <Calendar class="w-4 h-4 text-red-600" />
            <span :class="['text-xs font-bold uppercase tracking-widest', subTextClass]">{{ new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}</span>
          </div>
        </div>

        <section class="space-y-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="bg-red-600 p-2 rounded-xl">
              <Boxes class="w-5 h-5 text-white" />
            </div>
            <h2 :class="['text-xl font-black uppercase tracking-tighter isuzu-font', textClass]">Inventory <span class="text-red-600">Overview</span></h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div :class="[cardClass, 'rounded-2xl p-6 border hover:border-red-200 transition-all group relative overflow-hidden']" :style="cardStyle">
               <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                <Package class="w-24 h-24" :class="isDarkMode ? 'text-white' : 'text-neutral-900'" />
              </div>
              <p :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Total Parts</p>
              <p :class="['text-3xl font-black', textClass]">{{ inventoryItems.length }}</p>
              <div :class="['mt-4 flex items-center text-[10px] font-bold w-fit px-2 py-1 rounded-lg', isDarkMode ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-50']">
                <ArrowUpRight class="w-3 h-3 mr-1" /> ACTIVE ITEMS
              </div>
            </div>

            <div :class="[cardClass, 'rounded-2xl p-6 border hover:border-blue-200 transition-all group relative overflow-hidden']" :style="cardStyle">
              <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform text-blue-900">
                <DollarSign class="w-24 h-24" />
              </div>
              <p :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Stock Value</p>
              <p :class="['text-3xl font-black', textClass]">₱{{ totalInventoryValue.toLocaleString() }}</p>
              <div :class="['mt-4 text-[10px] font-bold uppercase tracking-widest', isDarkMode ? 'text-blue-400' : 'text-blue-600']">Market Valuation</div>
            </div>

            <div :class="[cardClass, 'rounded-2xl p-6 border group relative overflow-hidden']" :style="cardStyle">
              <p :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Total Quantity</p>
              <p :class="['text-3xl font-black', textClass]">{{ totalInventoryQuantity.toLocaleString() }}</p>
              <div :class="['mt-4 h-1.5 w-full rounded-full overflow-hidden', isDarkMode ? 'bg-gray-700' : 'bg-gray-100']">
                <div class="h-full bg-purple-500 rounded-full" style="width: 70%"></div>
              </div>
            </div>

            <div :class="[cardClass, 'rounded-2xl p-6 relative overflow-hidden group']" :style="isDarkMode ? { backgroundColor: '#1a202c' } : {}">
              <div class="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-[4rem]"></div>
              <p :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Availability</p>
              <p :class="['text-3xl font-black text-green-500', textClass]">{{ inStock }} <span class="text-xs opacity-50 font-medium" :class="isDarkMode ? 'text-white' : 'text-neutral-600'">IN STOCK</span></p>
              <p :class="['mt-4 text-[10px] uppercase tracking-widest', isDarkMode ? 'text-gray-400' : 'text-neutral-400']">Optimal Levels</p>
            </div>

            <div :class="[cardClass, 'rounded-2xl p-6 border-b-4 border-red-600 relative group overflow-hidden']" :style="cardStyle">
              <p :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Critical Stock</p>
              <p :class="['text-3xl font-black text-red-600', textClass]">{{ outOfStock }}</p>
              <p :class="['mt-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1', isDarkMode ? 'text-red-400/50' : 'text-red-600/50']">
                <AlertTriangle class="w-3 h-3" /> Reorder Needed
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div :class="[cardClass, 'rounded-2xl p-8 border xl:col-span-1']" :style="cardStyle">
              <h3 :class="['text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2', textClass]">
                <PieChart class="w-4 h-4 text-red-600" /> Status Distribution
              </h3>
              <div class="h-[250px] relative">
                <canvas ref="statusChart"></canvas>
              </div>
            </div>

            <div :class="[cardClass, 'rounded-2xl p-8 border xl:col-span-2']" :style="cardStyle">
              <h3 :class="['text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2', textClass]">
                <BarChart3 class="w-4 h-4 text-red-600" /> Stock by Category
              </h3>
              <div class="h-[250px] relative ">
                <canvas ref="categoryChart"></canvas>
              </div>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
          <div :class="[cardClass, 'rounded-2xl p-8 border shadow-sm relative overflow-hidden group hover:shadow-md transition-all']" :style="cardStyle">
            <div class="absolute -right-6 -bottom-6 opacity-15 rotate-12 group-hover:scale-110 transition-transform duration-500">
              <UserCheck class="w-40 h-40" :class="isDarkMode ? 'text-white' : 'text-neutral-900'" />
            </div>

            <div class="relative z-10 flex flex-col h-full">
              <div class="flex items-center justify-between mb-10">
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

          <div :class="[cardClass, 'rounded-2xl p-8', isDarkMode ? 'text-white' : 'text-neutral-900']" :style="isDarkMode ? { backgroundColor: '#171717' } : {}">
            <div class="absolute -right-6 -bottom-6 opacity-15 rotate-12 group-hover:scale-110 transition-transform duration-500">
              <Users class="w-40 h-40" :class="isDarkMode ? 'text-white' : 'text-neutral-900'" />
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
                <h2 :class="['text-[11px] font-black uppercase tracking-[0.2em] mb-1', isDarkMode ? 'text-gray-400' : 'text-neutral-500']">Awaiting Approval</h2>
                <div class="flex items-baseline gap-2">
                  <p :class="['text-6xl font-black tracking-tighter leading-none', isDarkMode ? 'text-yellow-400' : 'text-yellow-500']">
                    {{ pendingUsersCount }}
                  </p>
                  <p :class="['text-xs font-bold uppercase tracking-tighter italic', isDarkMode ? 'text-yellow-400' : 'text-yellow-500']">Pending</p>
                </div>
                <p :class="['text-[9px] font-medium uppercase tracking-widest mt-4', isDarkMode ? 'text-gray-500' : 'text-neutral-500']">New registration requests in queue</p>
              </div>
            </div>
          </div>

          <div :class="[cardClass, 'rounded-2xl p-8 border flex flex-col relative group']" :style="cardStyle">
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
            
            <div class="flex-1 min-h-[160px] relative flex items-center justify-center">
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
              <ArrowDownCircle class="w-7 h-7 text-blue-600 bg-white rounded-full" />
              <ArrowUpCircle class="w-7 h-7 text-orange-600 bg-white rounded-full" />
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
              
              <div :class="['flex p-1 rounded-xl border', isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-neutral-100 border-neutral-200']">
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
              <div :class="[cardClass, 'relative overflow-hidden rounded-xl p-4 border-l-4 border-green-500 group transition-all']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Total Records</h3>
                  <p :class="['text-2xl font-black leading-none', textClass]">{{ filteredTransactionInCount }}</p>
                </div>
                <ArrowDownCircle class="absolute -right-2 -bottom-2 w-12 h-12 text-green-500/10 group-hover:scale-110 transition-transform" />
              </div>

              <div :class="[cardClass, 'relative overflow-hidden rounded-xl p-4 border-l-4 border-blue-500 group transition-all']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Total Qty</h3>
                  <p :class="['text-2xl font-black leading-none', textClass]">{{ filteredTransactionInQty.toLocaleString() }}</p>
                </div>
                <Package class="absolute -right-2 -bottom-2 w-12 h-12 text-blue-500/10 group-hover:scale-110 transition-transform" />
              </div>

              <div :class="[cardClass, 'relative overflow-hidden rounded-xl p-4 border-l-4 border-purple-500 group transition-all']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Total Value</h3>
                  <p :class="['text-2xl font-black leading-none', textClass, isDarkMode ? 'text-purple-400' : 'text-purple-600']">₱{{ filteredTransactionInValue.toLocaleString() }}</p>
                </div>
                <DollarSign class="absolute -right-2 -bottom-2 w-12 h-12 text-purple-500/10 group-hover:scale-110 transition-transform" />
              </div>

              <div :class="[cardClass, 'relative overflow-hidden rounded-xl p-4 border-l-4 border-yellow-500 group transition-all']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">To Review</h3>
                  <p :class="['text-2xl font-black leading-none', isDarkMode ? 'text-yellow-400' : 'text-yellow-600']">{{ filteredTransactionInToReview }}</p>
                </div>
                <Clock class="absolute -right-2 -bottom-2 w-12 h-12 text-yellow-500/10 group-hover:scale-110 transition-transform" />
              </div>

              <div :class="[cardClass, 'relative overflow-hidden rounded-xl p-4 border-l-4 border-emerald-600 group transition-all']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Stock IN</h3>
                  <p :class="['text-2xl font-black leading-none', isDarkMode ? 'text-emerald-400' : 'text-emerald-600']">{{ filteredTransactionInStockIn }}</p>
                </div>
                <CheckCircle class="absolute -right-2 -bottom-2 w-12 h-12 text-emerald-600/10 group-hover:scale-110 transition-transform" />
              </div>

              <div :class="[cardClass, 'relative overflow-hidden rounded-xl p-4 border-l-4 border-red-500 group transition-all']" :style="cardStyle">
                <div class="relative z-10">
                  <h3 :class="['text-[10px] font-black uppercase tracking-widest mb-1', subTextClass]">Stock OUT</h3>
                  <p :class="['text-2xl font-black leading-none text-red-500', textClass]">{{ filteredTransactionInStockOut }}</p>
                </div>
                <XCircle class="absolute -right-2 -bottom-2 w-12 h-12 text-red-500/10 group-hover:scale-110 transition-transform" />
              </div>
            </div>

            <div v-if="recentTransactionIn.length > 0" :class="[cardClass, 'overflow-hidden rounded-2xl border']" :style="isDarkMode ? { ...cardStyle, borderColor: '#374151' } : { ...cardStyle, borderColor: '#e5e7eb' }">
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
                        <span :class="getTransactionInStatusClass(item.statusIN)" class="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border">
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
            <h3 :class="['text-lg font-bold flex items-center gap-2', textClass, isDarkMode ? 'text-orange-400' : 'text-orange-600']">
              <ArrowUpCircle class="w-5 h-5" />
              Transaction Out / Sales
            </h3>
            
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-neutral-800 rounded-2xl p-6 text-white relative overflow-hidden group">
                <div class="relative z-10">
                  <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2 isuzu-font">Today's Sales</h3>
                  <p class="text-4xl font-black tracking-tighter text-orange-500 leading-none group-hover:scale-105 transition-transform">{{ todaysTransactionOutCount }}</p>
                </div>
                <ArrowUpCircle class="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />
              </div>

              <div :class="[cardClass, 'rounded-2xl p-6 border relative overflow-hidden group']" :style="cardStyle">
                <h3 :class="['text-[10px] font-black uppercase tracking-[0.2em] mb-2 isuzu-font', subTextClass]">Total Qty Sold</h3>
                <p :class="['text-4xl font-black tracking-tighter leading-none', textClass, isDarkMode ? 'text-blue-400' : 'text-blue-600']">{{ todaysTransactionOutQty.toLocaleString() }}</p>
                <Package class="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500/5 rotate-12" />
              </div>

              <div :class="[cardClass, 'rounded-2xl p-6 border relative overflow-hidden group']" :style="cardStyle">
                <h3 :class="['text-[10px] font-black uppercase tracking-[0.2em] mb-2 isuzu-font', subTextClass]">Total Sales (₱)</h3>
                <p :class="['text-3xl font-black tracking-tighter leading-none', textClass, isDarkMode ? 'text-green-400' : 'text-green-600']">₱{{ todaysTransactionOutValue.toLocaleString() }}</p>
                <DollarSign class="absolute -right-4 -bottom-4 w-24 h-24 text-green-500/5 rotate-12" />
              </div>

              <div :class="[cardClass, 'rounded-2xl p-6 border relative overflow-hidden group']" :style="cardStyle">
                <h3 :class="['text-[10px] font-black uppercase tracking-[0.2em] mb-2 isuzu-font', isDarkMode ? 'text-yellow-400' : 'text-yellow-600']">Pending Sales</h3>
                <p :class="['text-4xl font-black tracking-tighter leading-none', isDarkMode ? 'text-yellow-400' : 'text-yellow-600']">{{ pendingTransactionOut }}</p>
                <Clock class="absolute -right-4 -bottom-4 w-24 h-24 text-yellow-500/5 rotate-12" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
            
            <div :class="[cardClass, 'rounded-2xl p-6 border-t-4 border-red-600 xl:col-span-2']" :style="cardStyle">
              <div class="flex items-center justify-between mb-6">
                <h2 :class="['text-lg font-black uppercase tracking-tighter isuzu-font flex items-center gap-2', textClass]">
                  <TrendingUp class="w-5 h-5 text-blue-600" />
                  Stock Flow <span :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">Analytics</span>
                </h2>
                <span :class="['text-[10px] font-black uppercase tracking-widest', subTextClass]">Last 7 Days</span>
              </div>
              <div class="h-[300px] w-full relative">
                <canvas ref="transactionChart"></canvas>
              </div>
            </div>

            <div :class="[cardClass, 'rounded-2xl p-6 border-t-4 border-red-600']" :style="cardStyle">
              <div class="flex items-center justify-between mb-6">
                <h2 :class="['text-lg font-black uppercase tracking-tighter isuzu-font flex items-center gap-2', textClass]">
                  <BarChart3 class="w-5 h-5 text-orange-600" />
                  Category <span :class="isDarkMode ? 'text-orange-400' : 'text-orange-600'">Sales</span>
                </h2>
              </div>
              <div class="h-[300px] w-full relative">
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
const themeClass = computed(() => isDarkMode.value ? 'text-white bg-neutral-900' : 'bg-gray-100 text-gray-900');
const themeStyle = computed(() => isDarkMode.value ? { backgroundColor: '#171717' } : {});
const cardClass = computed(() => isDarkMode.value ? 'text-white' : 'bg-white text-gray-900');
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


// Transaction Out calculations
const todaysTransactionOut = computed(() => {
  return transactionOutItems.value.filter(item => {
    const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
    return itemDate >= today;
  });
});

const todaysTransactionOutCount = computed(() => todaysTransactionOut.value.length);
const todaysTransactionOutQty = computed(() => {
  return todaysTransactionOut.value.reduce((sum, item) => sum + (item.quantity || 0), 0);
});
const todaysTransactionOutValue = computed(() => {
  return todaysTransactionOut.value.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
});
const pendingTransactionOut = computed(() => {
  return transactionOutItems.value.filter(item => item.statusOUT === 'Pending' || !item.statusOUT).length;
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

  // Inventory Status Chart
  statusChartInstance = new Chart(statusChart.value, {
    type: "doughnut",
    data: {
      labels: ["In Stock", "Low Stock", "Out of Stock"],
      datasets: [{ data: [inStock.value, lowStock.value, outOfStock.value], backgroundColor: ["#22c55e", "#eab308", "#ef4444"] }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });

  // Inventory by Category Chart
  const categories = {};
  inventoryItems.value.forEach(item => {
    const cat = item.category || "Uncategorized";
    categories[cat] = (categories[cat] || 0) + (item.quantity || 0);
  });

  categoryChartInstance = new Chart(categoryChart.value, {
    type: "bar",
    data: {
      labels: Object.keys(categories),
      datasets: [{ label: 'Quantity', data: Object.values(categories), backgroundColor: '#dc2626' }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });

  // Transaction In vs Out (Last 7 Days)
  const last7Days = [];
  const transInData = [];
  const transOutData = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    
    const dayTransIn = transactionInItems.value.filter(item => {
      const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
      return itemDate.toDateString() === date.toDateString();
    }).reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    const dayTransOut = transactionOutItems.value.filter(item => {
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
          { label: 'Transaction In', data: transInData, borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', fill: true, tension: 0.4 },
          { label: 'Transaction Out', data: transOutData, borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)', fill: true, tension: 0.4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
  }

  // Sales by Category
  const salesByCategory = {};
  transactionOutItems.value.forEach(item => {
    const cat = item.category || "Uncategorized";
    salesByCategory[cat] = (salesByCategory[cat] || 0) + (item.totalPrice || 0);
  });

  if (salesCategoryChart.value) {
    salesCategoryChartInstance = new Chart(salesCategoryChart.value, {
      type: "bar",
      data: {
        labels: Object.keys(salesByCategory),
        datasets: [{ label: 'Sales Value (₱)', data: Object.values(salesByCategory), backgroundColor: '#f97316' }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }

  // User Approval Status
  if (approvalChart.value) {
    approvalChartInstance = new Chart(approvalChart.value, {
      type: "pie",
      data: {
        labels: ["Pending", "Approved"],
        datasets: [{ data: [pendingUsersCount.value, approvedUsersCount.value], backgroundColor: ["#eab308", "#22c55e"] }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
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

// Watch transaction data and update transaction chart
watch([transactionInItems, transactionOutItems], () => {
  if (transactionChartInstance) {
    const last7Days = [];
    const transInData = [];
    const transOutData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      
      const dayTransIn = transactionInItems.value.filter(item => {
        const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        return itemDate.toDateString() === date.toDateString();
      }).reduce((sum, item) => sum + (item.quantity || 0), 0);
      
      const dayTransOut = transactionOutItems.value.filter(item => {
        const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        return itemDate.toDateString() === date.toDateString();
      }).reduce((sum, item) => sum + (item.quantity || 0), 0);
      
      transInData.push(dayTransIn);
      transOutData.push(dayTransOut);
    }
    
    transactionChartInstance.data.labels = last7Days;
    transactionChartInstance.data.datasets[0].data = transInData;
    transactionChartInstance.data.datasets[1].data = transOutData;
    transactionChartInstance.update('none');
  }
  
  // Update sales by category chart
  if (salesCategoryChartInstance) {
    const salesByCategory = {};
    transactionOutItems.value.forEach(item => {
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

</script>

<style scoped>
.chart-wrapper { position: relative; height: 250px; width: 100%; }
.chart-wrapper-small { height: 200px; }
@media (min-width: 640px) { .chart-wrapper { height: 280px; } .chart-wrapper-small { height: 220px; } }
@media (min-width: 1024px) { .chart-wrapper { height: 320px; } .chart-wrapper-small { height: 250px; } }
canvas { width: 100% !important; height: 100% !important; }
</style>
