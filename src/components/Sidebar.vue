<template>
  <div class="flex h-screen bg-neutral-100 font-sans overflow-hidden">
    
    <aside class="hidden md:flex md:flex-col w-64 bg-neutral-900/95 backdrop-blur-md text-white border-r border-neutral-800 shadow-2xl flex-shrink-0">
      
      <div class="h-16 flex items-center px-8 border-b border-neutral-800/30">
        <span class="text-xl font-black text-red-600 tracking-[0.2em] uppercase isuzu-font">
          ISUZU
        </span>
      </div>

      <nav class="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        
        <p class="px-4 text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 text-left">Core Modules</p>
        
        <router-link v-if="accessiblePages.dashboard" to="/admin/dashboard" class="nav-link group" active-class="nav-link-active">
          <LayoutDashboard class="nav-icon" /> 
          <span class="nav-text">Dashboard</span>
          <ChevronRight class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
        </router-link>

        <router-link v-if="accessiblePages['user-management']" to="/admin/user-management" class="nav-link group" active-class="nav-link-active">
          <Users class="nav-icon" /> 
          <span class="nav-text">User Management</span>
        </router-link>

        <router-link v-if="accessiblePages.approve" to="/admin/approve" class="nav-link group" active-class="nav-link-active">
          <CheckSquare class="nav-icon" /> 
          <span class="nav-text">Approvals</span>
        </router-link>

        <div class="pt-6 pb-2">
          <p class="px-4 text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] text-left">Logistics & Sales</p>
        </div>

        <router-link v-if="accessiblePages.inventory" to="/admin/inventory" class="nav-link group" active-class="nav-link-active">
          <Package class="nav-icon" /> 
          <span class="nav-text">Inventory Control</span>
        </router-link>

        <router-link v-if="accessiblePages['transaction-in']" to="/admin/transaction-in" class="nav-link group" active-class="nav-link-active">
          <ArrowDownLeft class="nav-icon text-emerald-500" /> 
          <span class="nav-text">Transaction In</span>
        </router-link>

        <router-link v-if="accessiblePages['transaction-out']" to="/admin/transaction-out" class="nav-link group" active-class="nav-link-active">
          <ArrowUpRight class="nav-icon text-red-500" /> 
          <span class="nav-text">Transaction Out</span>
        </router-link>

        <router-link v-if="accessiblePages['sa-rotation']" to="/admin/sa-rotation" class="nav-link group" active-class="nav-link-active">
          <ShoppingCart class="nav-icon" /> 
          <span class="nav-text">Retail Orders</span>
        </router-link>

        <div class="pt-6 pb-2">
          <p class="px-4 text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] text-left">System Control</p>
        </div>

        <router-link v-if="accessiblePages.settings" to="/admin/settings" class="nav-link group" active-class="nav-link-active">
          <Settings class="nav-icon" /> 
          <span class="nav-text">Settings</span>
        </router-link>

        <router-link v-if="isMasterAdmin" to="/admin/page-control" class="nav-link group border-l-2 border-transparent hover:border-yellow-500" active-class="nav-link-active-yellow">
          <ShieldAlert class="nav-icon text-yellow-500" /> 
          <span class="nav-text text-yellow-500">Page Control</span>
        </router-link>

      </nav>
    </aside>

    <div class="flex-1 flex flex-col min-w-0 bg-neutral-100">
      
      <header class="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6 md:hidden flex-shrink-0">
        <button @click="isOpen = true" class="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
          <Menu class="w-5 h-5 text-neutral-600" />
        </button>
        <span class="text-lg font-black text-red-600 tracking-widest isuzu-font">ISUZU</span>
        <div class="w-8"></div>
      </header>

      <main class="flex-1 overflow-y-auto p-0">
        <router-view />
      </main>
    </div>

    <transition name="fade">
      <div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"></div>
    </transition>

    <transition name="slide">
      <aside v-if="isOpen" class="fixed inset-y-0 left-0 w-64 bg-neutral-900 z-50 md:hidden flex flex-col shadow-2xl">
        <div class="h-14 flex items-center justify-between px-6 border-b border-neutral-800">
          <span class="text-lg font-black text-red-600 tracking-widest isuzu-font">ISUZU</span>
          <button @click="isOpen = false" class="text-neutral-400"><X class="w-5 h-5" /></button>
        </div>
        <div class="p-4 text-white text-[9px] opacity-50 uppercase tracking-widest">Menu</div>
        </aside>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { usePermissions } from "../composables/usePermissions";
import { 
  LayoutDashboard, Users, CheckSquare, Package, 
  ArrowDownLeft, ArrowUpRight, ShoppingCart, Settings, 
  ShieldAlert, Menu, X, ChevronRight
} from "lucide-vue-next";

const isOpen = ref(false);
const { canAccessPage, isMasterAdmin, fetchUserRoles } = usePermissions();

const accessiblePages = ref({
  dashboard: true, "user-management": true, approve: true, 
  inventory: true, "transaction-in": true, "transaction-out": true, 
  "sa-rotation": true, settings: true
});

onMounted(async () => {
  await fetchUserRoles();
  const pages = ["dashboard", "user-management", "approve", "inventory", "transaction-in", "transaction-out", "sa-rotation", "settings"];
  for (const page of pages) {
    accessiblePages.value[page] = await canAccessPage(page);
  }
});
</script>

<style scoped>
@reference "../style.css";

.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}

.nav-link {
  @apply flex items-center gap-3 px-4 py-2.5 rounded-lg text-neutral-400 font-bold transition-all duration-200 hover:bg-white/5 hover:text-white;
}

.nav-icon {
  @apply w-4 h-4 transition-transform duration-300 group-hover:scale-110 flex-shrink-0;
}

.nav-text {
  @apply flex-1 text-left text-[10px] uppercase tracking-wider;
}

/* Minimalist Active States */
.nav-link-active {
  @apply !bg-neutral-600 !text-neutral-300 !shadow-lg !scale-[1.01] !translate-x-1;
}

.nav-link-active-yellow {
  @apply !bg-yellow-500/10 !text-yellow-500 !border-l-2 !border-yellow-500 !rounded-r-lg !rounded-l-none;
}

.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
</style>

<style>
@font-face {
  font-family: 'IsuzuFont';
  src: url('@/assets/usuzi/usuzi.ttf') format('truetype');
}
</style>