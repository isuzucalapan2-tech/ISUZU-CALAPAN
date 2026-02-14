<template>
  <!-- 🔧 ADDED: Loading Screen -->
  <div v-if="isLoading" class="h-screen flex items-center justify-center">
    <Loaders />
  </div>

  <!-- MAIN CONTENT -->
  <div v-else :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col">

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto p-4 sm:p-6">
      <h1 :class="textClass" class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 border-l-4 border-red-600 pl-3 sm:pl-4 flex items-center gap-2">
        <LayoutDashboard class="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
        Dashboard
      </h1>

      <!-- Inventory Summary -->
      <div class="mb-6 sm:mb-8">
        <h2 :class="textClass" class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
          <Boxes class="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          Inventory Summary
        </h2>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">

          <div :class="cardClass" :style="cardStyle"
            class="shadow rounded-lg p-3 sm:p-4 lg:p-6 border-l-2 border-red-600 flex items-center gap-2 sm:gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <Package class="w-8 h-8 sm:w-10 sm:h-10 text-gray-600 flex-shrink-0" />
            <div class="min-w-0">
              <h3 :class="subTextClass" class="text-xs sm:text-sm truncate">Total Parts</h3>
              <p :class="textClass" class="text-xl sm:text-2xl lg:text-3xl font-bold">{{ inventoryItems.length }}</p>
            </div>
          </div>

          <div :class="cardClass" :style="cardStyle"
            class="shadow rounded-lg p-3 sm:p-4 lg:p-6 border-l-2 border-red-600 flex items-center gap-2 sm:gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <CheckCircle class="w-8 h-8 sm:w-10 sm:h-10 text-green-600 flex-shrink-0" />
            <div class="min-w-0">
              <h3 class="text-xs sm:text-sm text-green-600 truncate">In Stock</h3>
              <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{{ inStock }}</p>
            </div>
          </div>

          <div :class="cardClass" :style="cardStyle"
            class="shadow rounded-lg p-3 sm:p-4 lg:p-6 border-l-2 border-red-600 flex items-center gap-2 sm:gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <AlertTriangle class="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600 flex-shrink-0" />
            <div class="min-w-0">
              <h3 class="text-xs sm:text-sm text-yellow-600 truncate">Low Stock</h3>
              <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600">{{ lowStock }}</p>
            </div>
          </div>

          <div :class="cardClass" :style="cardStyle"
            class="shadow rounded-lg p-3 sm:p-4 lg:p-6 border-l-2 border-red-600 flex items-center gap-2 sm:gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <XCircle class="w-8 h-8 sm:w-10 sm:h-10 text-red-600 flex-shrink-0" />
            <div class="min-w-0">
              <h3 class="text-xs sm:text-sm text-red-600 truncate">Out of Stock</h3>
              <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">{{ outOfStock }}</p>
            </div>
          </div>

        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">

        <div :class="cardClass" :style="cardStyle"
          class="shadow rounded-lg p-4 sm:p-6 border-t-2 border-red-600 xl:col-span-1 hover:shadow-xl transition-all duration-300">
          <h2 :class="textClass" class="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <PieChart class="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            Inventory Status
          </h2>
          <div class="chart-wrapper chart-wrapper-small">
            <canvas ref="statusChart"></canvas>
          </div>
        </div>

        <div :class="cardClass" :style="cardStyle"
          class="shadow rounded-lg p-4 sm:p-6 border-t-2 border-red-600 xl:col-span-2 hover:shadow-xl transition-all duration-300">
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { useAuth } from "../../composables/useAuth";
import { db } from "../../Firebase/Firebase";
import { collection, getDocs } from "firebase/firestore";
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
} from "lucide-vue-next";

import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

/* ===== THEME APPLICATION ===== */
const applyTheme = (theme) => {
  const html = document.documentElement;
  html.classList.remove('dark', 'light');

  if (theme === 'dark') {
    html.classList.add('dark');
  } else if (theme === 'light') {
    html.classList.add('light');
  } else if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      html.classList.add('dark');
    } else {
      html.classList.add('light');
    }
  }
  localStorage.setItem('appTheme', theme);
};

/* ===== THEME ===== */
const isDarkMode = computed(() => document.documentElement.classList.contains('dark'));
const themeClass = computed(() => isDarkMode.value ? 'text-white' : 'bg-gray-100 text-gray-900');
const themeStyle = computed(() => isDarkMode.value ? { backgroundColor: '#232323' } : {});
const cardClass = computed(() => isDarkMode.value ? 'text-white' : 'bg-white text-gray-900');
const cardStyle = computed(() => isDarkMode.value ? { backgroundColor: '#2a2a2a' } : {});
const textClass = computed(() => isDarkMode.value ? 'text-white' : 'text-gray-800');
const subTextClass = computed(() => isDarkMode.value ? 'text-gray-300' : 'text-gray-600');

/* ===== STATE ===== */
const { user, isAuthenticated } = useAuth();
const isLoading = ref(true);

const inventoryItems = ref([]);
const statusChart = ref(null);
const categoryChart = ref(null);

let statusChartInstance = null;
let categoryChartInstance = null;

/* ===== COUNTS ===== */
const inStock = computed(() => inventoryItems.value.filter(i => i.status === "in-stock").length);
const lowStock = computed(() => inventoryItems.value.filter(i => i.status === "low").length);
const outOfStock = computed(() => inventoryItems.value.filter(i => i.status === "out").length);

/* ===== LOAD INVENTORY ===== */
const loadInventory = async (uid) => {
  try {
    const snapshot = await getDocs(collection(db, "users", uid, "inventory"));
    inventoryItems.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error loading inventory:", error);
  }
};

/* ===== INIT CHARTS ===== */
const initCharts = () => {
  if (!statusChart.value || !categoryChart.value) return;

  statusChartInstance?.destroy();
  categoryChartInstance?.destroy();

  statusChartInstance = new Chart(statusChart.value, {
    type: "doughnut",
    data: {
      labels: ["In Stock", "Low Stock", "Out of Stock"],
      datasets: [{
        data: [inStock.value, lowStock.value, outOfStock.value],
        backgroundColor: ["#22c55e", "#eab308", "#ef4444"]
      }],
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  const categories = {};
  inventoryItems.value.forEach(item => {
    const cat = item.category || "Uncategorized";
    categories[cat] = (categories[cat] || 0) + (item.quantity || 0);
  });

  categoryChartInstance = new Chart(categoryChart.value, {
    type: "bar",
    data: {
      labels: Object.keys(categories),
      datasets: [{ data: Object.values(categories) }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
};

/* ===== LIFECYCLE ===== */
onMounted(async () => {
  if (user.value) {
    await loadInventory(user.value.uid);
    isLoading.value = false;
    await nextTick();
    initCharts();
  }
});
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  height: 250px;
  width: 100%;
}

.chart-wrapper-small {
  height: 200px;
}

@media (min-width: 640px) {
  .chart-wrapper {
    height: 280px;
  }
  .chart-wrapper-small {
    height: 220px;
  }
}

@media (min-width: 1024px) {
  .chart-wrapper {
    height: 320px;
  }
  .chart-wrapper-small {
    height: 250px;
  }
}

canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
