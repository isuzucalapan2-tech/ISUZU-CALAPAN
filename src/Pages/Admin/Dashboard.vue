<template>
  <!-- Loading Screen -->
  <div v-if="isLoading" class="h-screen flex items-center justify-center">
    <Loaders />
  </div>

  <!-- MAIN CONTENT -->
  <div v-else :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col">
    <div class="flex-1 overflow-y-auto p-4 sm:p-6">
      <h1 :class="textClass" class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 border-l-4 border-red-600 pl-3 sm:pl-4 flex items-center gap-2">
        <LayoutDashboard class="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
        Dashboard
      </h1>

      <!-- ==================== INVENTORY SECTION ==================== -->
      <div class="mb-8 sm:mb-10">
        <div class="flex items-center gap-2 mb-4 sm:mb-5 pb-2 border-b-2 border-red-600">
          <Boxes class="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
          <h2 :class="textClass" class="text-xl sm:text-2xl font-bold">Inventory Overview</h2>
        </div>

        <!-- Inventory Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-6">

          <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 border-l-4 border-gray-500 flex items-center gap-2 sm:gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <Package class="w-7 h-7 sm:w-8 sm:h-8 text-gray-500 flex-shrink-0" />
            <div class="min-w-0">
              <h3 :class="subTextClass" class="text-xs truncate">Total Parts</h3>
              <p :class="textClass" class="text-lg sm:text-xl lg:text-2xl font-bold">{{ inventoryItems.length }}</p>
            </div>
          </div>

          <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 border-l-4 border-blue-500 flex items-center gap-2 sm:gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <DollarSign class="w-7 h-7 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
            <div class="min-w-0">
              <h3 class="text-xs text-blue-500 truncate">Total Value</h3>
              <p :class="textClass" class="text-lg sm:text-xl lg:text-2xl font-bold">₱{{ totalInventoryValue.toLocaleString() }}</p>
            </div>
          </div>

          <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 border-l-4 border-purple-500 flex items-center gap-2 sm:gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <TrendingUp class="w-7 h-7 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" />
            <div class="min-w-0">
              <h3 class="text-xs text-purple-500 truncate">Total Qty</h3>
              <p :class="textClass" class="text-lg sm:text-xl lg:text-2xl font-bold">{{ totalInventoryQuantity.toLocaleString() }}</p>
            </div>
          </div>

          <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 border-l-4 border-green-500 flex items-center gap-2 sm:gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <CheckCircle class="w-7 h-7 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
            <div class="min-w-0">
              <h3 class="text-xs text-green-500 truncate">In Stock</h3>
              <p class="text-lg sm:text-xl lg:text-2xl font-bold text-green-500">{{ inStock }}</p>
            </div>
          </div>

          <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 border-l-4 border-red-500 flex items-center gap-2 sm:gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">

            <XCircle class="w-7 h-7 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
            <div class="min-w-0">
              <h3 class="text-xs text-red-500 truncate">Out of Stock</h3>
              <p class="text-lg sm:text-xl lg:text-2xl font-bold text-red-500">{{ outOfStock }}</p>
            </div>
          </div>
        </div>

        <!-- Inventory Charts -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-4 sm:p-6 border-t-2 border-red-600 xl:col-span-1 hover:shadow-xl transition-all duration-300">
            <h2 :class="textClass" class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <PieChart class="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              Inventory Status
            </h2>
            <div class="chart-wrapper chart-wrapper-small">
              <canvas ref="statusChart"></canvas>
            </div>
          </div>

          <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-4 sm:p-6 border-t-2 border-red-600 xl:col-span-2 hover:shadow-xl transition-all duration-300">
            <h2 :class="textClass" class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <BarChart3 class="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              Inventory by Category
            </h2>
            <div class="chart-wrapper">
              <canvas ref="categoryChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== USER APPROVALS SECTION ==================== -->
      <div class="mb-8 sm:mb-10">
        <div class="flex items-center gap-2 mb-4 sm:mb-5 pb-2 border-b-2 border-yellow-600">
          <Users class="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600" />
          <h2 :class="textClass" class="text-xl sm:text-2xl font-bold">User Approvals</h2>
        </div>

        <!-- Approval Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 lg:p-6 border-l-4 border-yellow-500 flex items-center gap-2 sm:gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <UserX class="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 flex-shrink-0" />
            <div class="min-w-0">
              <h3 class="text-xs sm:text-sm text-yellow-500 truncate">Pending Approval</h3>
              <p :class="textClass" class="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-500">{{ pendingUsersCount }}</p>
            </div>
          </div>

          <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 lg:p-6 border-l-4 border-green-500 flex items-center gap-2 sm:gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <UserCheck class="w-8 h-8 sm:w-10 sm:h-10 text-green-500 flex-shrink-0" />
            <div class="min-w-0">
              <h3 class="text-xs sm:text-sm text-green-500 truncate">Approved Users</h3>
              <p :class="textClass" class="text-xl sm:text-2xl lg:text-3xl font-bold text-green-500">{{ approvedUsersCount }}</p>
            </div>
          </div>
        </div>

        <!-- Pending Users Table + Approval Chart -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <div v-if="pendingUsers.length > 0" :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-4 border-t-2 border-yellow-600 xl:col-span-2 hover:shadow-xl transition-all duration-300">
            <h3 :class="textClass" class="text-lg font-bold mb-3 flex items-center gap-2">
              <Clock class="w-5 h-5 text-yellow-600" />
              Pending Users ({{ pendingUsers.length }})
            </h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead :class="tableHeaderClass">
                  <tr>
                    <th class="p-3 text-sm">Name</th>
                    <th class="p-3 text-sm">Email</th>
                    <th class="p-3 text-sm">Account Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in pendingUsers.slice(0, 5)" :key="user.id" :class="tableRowClass" class="border-b border-gray-200 dark:border-gray-700">
                    <td :class="textClass" class="p-3 text-sm font-medium">{{ user.username }}</td>
                    <td :class="subTextClass" class="p-3 text-sm">{{ user.email }}</td>
                    <td class="p-3">
                      <span class="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 uppercase">{{ user.accountStatus }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-4 sm:p-6 border-t-2 border-yellow-600 hover:shadow-xl transition-all duration-300">
            <h2 :class="textClass" class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <PieChart class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              User Approval Status
            </h2>
            <div class="chart-wrapper chart-wrapper-small">
              <canvas ref="approvalChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== TRANSACTIONS SECTION ==================== -->
      <div class="mb-8 sm:mb-10">
        <div class="flex items-center gap-2 mb-4 sm:mb-5 pb-2 border-b-2 border-blue-600">
          <ArrowDownCircle class="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
          <ArrowUpCircle class="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" />
          <h2 :class="textClass" class="text-xl sm:text-2xl font-bold">Transactions Overview</h2>
        </div>

        <!-- Transaction In Cards -->
        <div class="mb-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h3 :class="textClass" class="text-lg font-semibold flex items-center gap-2 text-green-600">
              <ArrowDownCircle class="w-5 h-5" />
              Transaction In 
              <span class="text-sm font-normal text-gray-500">({{ transactionInFilter === 'today' ? 'Today' : transactionInFilter === 'week' ? 'This Week' : 'This Month' }})</span>
            </h3>
            <!-- Filter Buttons -->
            <div class="flex gap-2">
              <button 
                @click="transactionInFilter = 'today'"
                :class="transactionInFilter === 'today' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
                class="px-3 py-1 rounded text-sm font-medium transition-all"
              >
                Today
              </button>
              <button 
                @click="transactionInFilter = 'week'"
                :class="transactionInFilter === 'week' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
                class="px-3 py-1 rounded text-sm font-medium transition-all"
              >
                Week
              </button>
              <button 
                @click="transactionInFilter = 'month'"
                :class="transactionInFilter === 'month' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
                class="px-3 py-1 rounded text-sm font-medium transition-all"
              >
                Month
              </button>
            </div>
          </div>
          
          <!-- Status Summary Pills -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              To Review: {{ filteredTransactionInToReview }}
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Stock IN: {{ filteredTransactionInStockIn }}
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              Stock OUT: {{ filteredTransactionInStockOut }}
            </span>
          </div>
          
          <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 border-l-4 border-green-500 flex items-center gap-2 sm:gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <ArrowDownCircle class="w-7 h-7 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
              <div class="min-w-0">
                <h3 class="text-xs text-green-500 truncate">Total Records</h3>
                <p :class="textClass" class="text-lg sm:text-xl font-bold">{{ filteredTransactionInCount }}</p>
              </div>
            </div>

            <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 border-l-4 border-blue-500 flex items-center gap-2 sm:gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <Package class="w-7 h-7 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
              <div class="min-w-0">
                <h3 class="text-xs text-blue-500 truncate">Total Qty</h3>
                <p :class="textClass" class="text-lg sm:text-xl font-bold">{{ filteredTransactionInQty.toLocaleString() }}</p>
              </div>
            </div>

            <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 border-l-4 border-purple-500 flex items-center gap-2 sm:gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <DollarSign class="w-7 h-7 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" />
              <div class="min-w-0">
                <h3 class="text-xs text-purple-500 truncate">Total Value</h3>
                <p :class="textClass" class="text-lg sm:text-xl font-bold">₱{{ filteredTransactionInValue.toLocaleString() }}</p>
              </div>
            </div>

            <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 border-l-4 border-yellow-500 flex items-center gap-2 sm:gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <Clock class="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0" />
              <div class="min-w-0">
                <h3 class="text-xs text-yellow-500 truncate">To Review</h3>
                <p :class="textClass" class="text-lg sm:text-xl font-bold text-yellow-500">{{ filteredTransactionInToReview }}</p>
              </div>
            </div>

            <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 border-l-4 border-green-600 flex items-center gap-2 sm:gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <CheckCircle class="w-7 h-7 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
              <div class="min-w-0">
                <h3 class="text-xs text-green-600 truncate">Stock IN</h3>
                <p :class="textClass" class="text-lg sm:text-xl font-bold text-green-600">{{ filteredTransactionInStockIn }}</p>
              </div>
            </div>

            <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 border-l-4 border-red-500 flex items-center gap-2 sm:gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <XCircle class="w-7 h-7 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
              <div class="min-w-0">
                <h3 class="text-xs text-red-500 truncate">Stock OUT</h3>
                <p :class="textClass" class="text-lg sm:text-xl font-bold text-red-500">{{ filteredTransactionInStockOut }}</p>
              </div>
            </div>
          </div>
          
          <!-- Recent Transaction In Preview -->
          <div v-if="recentTransactionIn.length > 0" :class="cardClass" :style="cardStyle" class="mt-4 shadow rounded-lg p-4 border-t-2 border-green-600">
            <h4 :class="textClass" class="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp class="w-4 h-4" />
              Recent Transactions
            </h4>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead :class="tableHeaderClass">
                  <tr>
                    <th class="p-2">Part No</th>
                    <th class="p-2">Part Name</th>
                    <th class="p-2">Qty</th>
                    <th class="p-2">Status</th>
                    <th class="p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in recentTransactionIn.slice(0, 5)" :key="item.id" :class="tableRowClass" class="border-b border-gray-200 dark:border-gray-700">
                    <td :class="textClass" class="p-2 font-medium">{{ item.partNo }}</td>
                    <td :class="subTextClass" class="p-2">{{ item.partName }}</td>
                    <td :class="textClass" class="p-2">{{ item.quantity }}</td>
                    <td class="p-2">
                      <span :class="getTransactionInStatusClass(item.statusIN)" class="px-2 py-0.5 rounded text-xs font-medium uppercase">
                        {{ item.statusIN || 'To Review' }}
                      </span>
                    </td>
                    <td :class="subTextClass" class="p-2">{{ formatTransactionDate(item.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>


        <!-- Transaction Out Cards -->
        <div class="mb-6">
          <h3 :class="textClass" class="text-lg font-semibold mb-3 flex items-center gap-2 text-orange-600">
            <ArrowUpCircle class="w-5 h-5" />
            Transaction Out / Sales (Today's Outgoing)
          </h3>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 lg:p-6 border-l-4 border-orange-500 flex items-center gap-2 sm:gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <ArrowUpCircle class="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 flex-shrink-0" />
              <div class="min-w-0">
                <h3 class="text-xs sm:text-sm text-orange-500 truncate">Today's Sales</h3>
                <p :class="textClass" class="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-500">{{ todaysTransactionOutCount }}</p>
              </div>
            </div>

            <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 lg:p-6 border-l-4 border-blue-500 flex items-center gap-2 sm:gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <Package class="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 flex-shrink-0" />
              <div class="min-w-0">
                <h3 class="text-xs sm:text-sm text-blue-500 truncate">Total Qty Sold</h3>
                <p :class="textClass" class="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-500">{{ todaysTransactionOutQty.toLocaleString() }}</p>
              </div>
            </div>

            <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 lg:p-6 border-l-4 border-green-500 flex items-center gap-2 sm:gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <DollarSign class="w-8 h-8 sm:w-10 sm:h-10 text-green-500 flex-shrink-0" />
              <div class="min-w-0">
                <h3 class="text-xs sm:text-sm text-green-500 truncate">Total Sales (₱)</h3>
                <p :class="textClass" class="text-xl sm:text-2xl lg:text-3xl font-bold text-green-500">₱{{ todaysTransactionOutValue.toLocaleString() }}</p>
              </div>
            </div>

            <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-3 sm:p-4 lg:p-6 border-l-4 border-yellow-500 flex items-center gap-2 sm:gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <Clock class="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 flex-shrink-0" />
              <div class="min-w-0">
                <h3 class="text-xs sm:text-sm text-yellow-500 truncate">Pending Sales</h3>
                <p :class="textClass" class="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-500">{{ pendingTransactionOut }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Transaction Charts -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-4 sm:p-6 border-t-2 border-blue-600 xl:col-span-2 hover:shadow-xl transition-all duration-300">
            <h2 :class="textClass" class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <TrendingUp class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              Transaction In vs Out (Last 7 Days)
            </h2>
            <div class="chart-wrapper">
              <canvas ref="transactionChart"></canvas>
            </div>
          </div>

          <div :class="cardClass" :style="cardStyle" class="shadow rounded-lg p-4 sm:p-6 border-t-2 border-orange-600 hover:shadow-xl transition-all duration-300">
            <h2 :class="textClass" class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <BarChart3 class="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              Sales by Category
            </h2>
            <div class="chart-wrapper">
              <canvas ref="salesCategoryChart"></canvas>
            </div>
          </div>
        </div>
      </div>

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
  UserX
} from "lucide-vue-next";

import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

/* ===== THEME ===== */
const isDarkMode = computed(() => document.documentElement.classList.contains('dark'));
const themeClass = computed(() => isDarkMode.value ? 'text-white' : 'bg-gray-100 text-gray-900');
const themeStyle = computed(() => isDarkMode.value ? { backgroundColor: '#232323' } : {});
const cardClass = computed(() => isDarkMode.value ? 'text-white' : 'bg-white text-gray-900');
const cardStyle = computed(() => isDarkMode.value ? { backgroundColor: '#2a2a2a' } : {});
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
