<template>
  <div class="flex h-screen bg-neutral-100 font-sans overflow-hidden">
    
    <aside class="hidden md:flex md:flex-col w-64 bg-neutral-900 text-white border-r border-neutral-900 shadow-2xl shrink-0">
      <div class="h-16 flex items-center px-8">
        <span class="text-xl font-black text-red-600 tracking-[0.2em] uppercase isuzu-font">ISUZU</span>
      </div>

      <nav class="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <p v-if="hasCoreModules" class="px-4 text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3">Core Modules</p>
        
        <router-link v-if="accessiblePages.dashboard" to="/admin/dashboard" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-neutral-400 font-bold transition-all duration-200 hover:bg-white/5 hover:text-white group" 
          active-class="!bg-neutral-800 !text-white !shadow-lg !translate-x-1">
          <LayoutDashboard class="w-4 h-4 transition-transform duration-300 group-hover:scale-110 shrink-0" /> 
          <span class="flex-1 text-left text-[10px] uppercase tracking-wider">Dashboard</span>
        </router-link>

        <router-link v-if="accessiblePages['user-management']" to="/admin/user-management" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-neutral-400 font-bold transition-all duration-200 hover:bg-white/5 hover:text-white group" 
          active-class="!bg-neutral-800 !text-white !shadow-lg !translate-x-1">
          <Users class="w-4 h-4 transition-transform duration-300 group-hover:scale-110 shrink-0" /> 
          <span class="flex-1 text-left text-[10px] uppercase tracking-wider">User Management</span>
        </router-link>

        <router-link v-if="accessiblePages.approve" to="/admin/approve" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-neutral-400 font-bold transition-all duration-200 hover:bg-white/5 hover:text-white group" 
          active-class="!bg-neutral-800 !text-white !shadow-lg !translate-x-1">
          <CheckSquare class="w-4 h-4 transition-transform duration-300 group-hover:scale-110 shrink-0" /> 
          <span class="flex-1 text-left text-[10px] uppercase tracking-wider">Approvals</span>
        </router-link>

        <div v-if="hasLogisticsSales" class="pt-6 pb-2">
          <p class="px-4 text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em]">Logistics & Sales</p>
        </div>

        <router-link v-if="accessiblePages.inventory" to="/admin/inventory" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-neutral-400 font-bold transition-all duration-200 hover:bg-white/5 hover:text-white group" 
          active-class="!bg-neutral-800 !text-white !shadow-lg !translate-x-1">
          <Package class="w-4 h-4 transition-transform duration-300 group-hover:scale-110 shrink-0" /> 
          <span class="flex-1 text-left text-[10px] uppercase tracking-wider">Inventory</span>
        </router-link>

        <router-link v-if="accessiblePages['transaction-in']" to="/admin/transaction-in" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-neutral-400 font-bold transition-all duration-200 hover:bg-white/5 hover:text-white group" 
          active-class="!bg-neutral-800 !text-white !shadow-lg !translate-x-1">
          <ArrowDownLeft class="w-4 h-4 text-emerald-500 transition-transform duration-300 group-hover:scale-110 shrink-0" /> 
          <span class="flex-1 text-left text-[10px] uppercase tracking-wider">Stock In</span>
        </router-link>

        <router-link v-if="accessiblePages['transaction-out']" to="/admin/transaction-out" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-neutral-400 font-bold transition-all duration-200 hover:bg-white/5 hover:text-white group" 
          active-class="!bg-neutral-800 !text-white !shadow-lg !translate-x-1">
          <ArrowUpRight class="w-4 h-4 text-red-500 transition-transform duration-300 group-hover:scale-110 shrink-0" /> 
          <span class="flex-1 text-left text-[10px] uppercase tracking-wider">Stock Out</span>
        </router-link>

        <router-link v-if="accessiblePages['sa-rotation']" to="/admin/sa-rotation" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-neutral-400 font-bold transition-all duration-200 hover:bg-white/5 hover:text-white group" 
          active-class="!bg-neutral-800 !text-white !shadow-lg !translate-x-1">
          <ShoppingCart class="w-4 h-4 text-white-500 transition-transform duration-300 group-hover:scale-110 shrink-0" /> 
          <span class="flex-1 text-left text-[10px] uppercase tracking-wider">Retail Orders</span>
        </router-link>

        <div v-if="hasHRAttendance" class="pt-6 pb-2">
          <p class="px-4 text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] text-left">HR & Attendance</p>
        </div>

        <router-link v-if="accessiblePages['isuzu-dtr']" to="/admin/isuzu-dtr" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-neutral-400 font-bold transition-all duration-200 hover:bg-white/5 hover:text-white group" 
          active-class="!bg-neutral-800 !text-white !shadow-lg !translate-x-1">
          <Clock class="w-4 h-4 text-white-500 transition-transform duration-300 group-hover:scale-110 shrink-0" /> 
          <span class="flex-1 text-left text-[10px] uppercase tracking-wider">DTR Management</span>
        </router-link>

        <div v-if="hasSystemControl" class="pt-6 pb-2">
          <p class="px-4 text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em]">System Control</p>
        </div>

        <router-link v-if="accessiblePages.settings" to="/admin/settings" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-neutral-400 font-bold transition-all duration-200 hover:bg-white/5 hover:text-white group" 
          active-class="!bg-neutral-800 !text-white !shadow-lg !translate-x-1">
          <Settings class="w-4 h-4 transition-transform duration-300 group-hover:scale-110 shrink-0" /> 
          <span class="flex-1 text-left text-[10px] uppercase tracking-wider">Settings</span>
        </router-link>

        <router-link v-if="isMasterAdmin" to="/admin/page-control" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-yellow-500/80 font-bold transition-all duration-200 hover:bg-white/5 hover:text-yellow-500 group border-l-2 border-transparent" 
          active-class="!bg-yellow-500/10 !text-yellow-500 !border-yellow-500 !rounded-r-lg !rounded-l-none !translate-x-1">
          <ShieldAlert class="w-4 h-4 transition-transform duration-300 group-hover:scale-110 shrink-0" /> 
          <span class="flex-1 text-left text-[10px] uppercase tracking-wider">Page Control</span>
        </router-link>
      </nav>
    </aside>

    <div class="flex-1 flex flex-col min-w-0 bg-neutral-100 relative">
      
      <header class="md:hidden h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 shrink-0 z-30">
        <span class="text-sm font-black text-red-600 tracking-widest isuzu-font">ISUZU</span>
        <div class="flex items-center gap-2">
          <router-link v-if="isMasterAdmin" to="/admin/page-control" class="p-2 text-yellow-500 hover:bg-white/5 rounded-lg active:scale-90 transition-transform">
            <ShieldAlert class="w-5 h-5" />
          </router-link>
          <router-link v-if="accessiblePages.settings" to="/admin/settings" class="p-2 text-neutral-400 hover:bg-white/5 rounded-lg active:scale-90 transition-transform">
            <Settings class="w-5 h-5" />
          </router-link>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto pb-28 md:pb-0">
        <router-view />
      </main>

      <nav v-if="!isLoading && visibleMobileNavItems.length > 0" class="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] bg-neutral-900 backdrop-blur-lg h-13 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 flex items-center justify-around px-2 border border-white/10">
        
        <!-- Dynamic Mobile Navigation Items - Only shows what user has access to -->
        <router-link 
          v-for="item in visibleMobileNavItems" 
          :key="item.id"
          :to="item.to" 
          class="flex flex-col items-center justify-center flex-1 text-neutral-500 transition-all duration-200 min-w-0" 
          :class="item.activeClass"
          :active-class="item.activeClass"
        >
          <component :is="item.icon" class="w-5 h-5" :class="item.iconClass" />
          <span class="text-[6px] mt-1 font-black uppercase tracking-tighter truncate px-1">{{ item.label }}</span>
        </router-link>

        <!-- Logistics Floating Action Button (if user has any logistics access) -->
        <div v-if="hasLogisticsSales" class="relative -mt-10 flex-shrink-0">
          <button @click="isLogisticsOpen = !isLogisticsOpen" 
            class="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-900/20 active:scale-90 transition-all duration-300 border-2 border-neutral-900"
            :class="{'rotate-45 bg-neutral-800! border-white/20': isLogisticsOpen}">
            <Plus class="w-8 h-8" />
          </button>
        </div>
      </nav>

      <!-- Loading State for Mobile Navigation -->
      <div v-if="isLoading" class="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] bg-neutral-900 backdrop-blur-lg h-13 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 flex items-center justify-center px-2 border border-white/10">
        <div class="flex items-center gap-2 text-neutral-500">
          <div class="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-[10px] font-bold uppercase tracking-wider">Loading...</span>
        </div>
      </div>

      <!-- Mobile Logistics Menu Overlay -->
      <div v-if="isLogisticsOpen" class="md:hidden fixed inset-0 bg-black/50 z-40" @click="isLogisticsOpen = false"></div>
      
      <div v-if="isLogisticsOpen" class="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 w-[85%] bg-neutral-900 rounded-2xl shadow-2xl z-50 p-4 border border-white/10">
        <div class="space-y-2">
          <p class="px-2 text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2">Logistics & Sales</p>
          
          <router-link v-if="accessiblePages.inventory" to="/admin/inventory" @click="isLogisticsOpen = false" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 font-bold transition-all hover:bg-white/5 hover:text-white">
            <Package class="w-5 h-5" /> 
            <span class="text-xs uppercase tracking-wider">Inventory</span>
          </router-link>

          <router-link v-if="accessiblePages['transaction-in']" to="/admin/transaction-in" @click="isLogisticsOpen = false" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 font-bold transition-all hover:bg-white/5 hover:text-white">
            <ArrowDownLeft class="w-5 h-5 text-emerald-500" /> 
            <span class="text-xs uppercase tracking-wider">Stock In</span>
          </router-link>

          <router-link v-if="accessiblePages['transaction-out']" to="/admin/transaction-out" @click="isLogisticsOpen = false" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 font-bold transition-all hover:bg-white/5 hover:text-white">
            <ArrowUpRight class="w-5 h-5 text-red-500" /> 
            <span class="text-xs uppercase tracking-wider">Stock Out</span>
          </router-link>

          <router-link v-if="accessiblePages['sa-rotation']" to="/admin/sa-rotation" @click="isLogisticsOpen = false" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 font-bold transition-all hover:bg-white/5 hover:text-white">
            <ShoppingCart class="w-5 h-5 text-white-500" /> 
            <span class="text-xs uppercase tracking-wider">Retail Orders</span>
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { usePermissions } from "../composables/usePermissions";
import { 
  LayoutDashboard, Users, CheckSquare, Package, 
  ArrowDownLeft, ArrowUpRight, ShoppingCart, Settings, 
  ShieldAlert, Plus, Clock
} from "lucide-vue-next";

const isLogisticsOpen = ref(false);
const { canAccessPage, isMasterAdmin, fetchUserRoles } = usePermissions();

const accessiblePages = ref({
  dashboard: false, "user-management": false, approve: false,
  inventory: false, "transaction-in": false, "transaction-out": false, 
  "sa-rotation": false, "isuzu-dtr": false, settings: false
});

const isLoading = ref(true);

// Computed properties for section visibility
const hasCoreModules = computed(() => {
  return accessiblePages.value.dashboard || 
         accessiblePages.value['user-management'] || 
         accessiblePages.value.approve;
});

const hasLogisticsSales = computed(() => {
  return accessiblePages.value.inventory || 
         accessiblePages.value['transaction-in'] || 
         accessiblePages.value['transaction-out'] || 
         accessiblePages.value['sa-rotation'];
});

const hasHRAttendance = computed(() => {
  return accessiblePages.value['isuzu-dtr'];
});

const hasSystemControl = computed(() => {
  return accessiblePages.value.settings || isMasterAdmin.value;
});

// Dynamic mobile navigation items - filtered by user permissions
const visibleMobileNavItems = computed(() => {
  const allMobileNavItems = [
    {
      id: 'dashboard',
      to: '/admin/dashboard',
      icon: LayoutDashboard,
      label: 'Home',
      activeClass: '!text-white-500 scale-110',
      iconClass: '',
      permission: () => accessiblePages.value.dashboard
    },
    {
      id: 'user-management',
      to: '/admin/user-management',
      icon: Users,
      label: 'Users',
      activeClass: '!text-white-500 scale-110',
      iconClass: '',
      permission: () => accessiblePages.value['user-management']
    },
    {
      id: 'approve',
      to: '/admin/approve',
      icon: CheckSquare,
      label: 'Approvals',
      activeClass: '!text-white-500 scale-110',
      iconClass: '',
      permission: () => accessiblePages.value.approve
    },
    {
      id: 'sa-rotation',
      to: '/admin/sa-rotation',
      icon: ShoppingCart,
      label: 'Retail',
      activeClass: '!text-white-500 scale-110',
      iconClass: 'text-white-500',
      permission: () => accessiblePages.value['sa-rotation']
    },
    {
      id: 'isuzu-dtr',
      to: '/admin/isuzu-dtr',
      icon: Clock,
      label: 'DTR',
      activeClass: '!text-white-500 scale-110',
      iconClass: 'text-white-500',
      permission: () => accessiblePages.value['isuzu-dtr']
    }
  ];
  
  // Filter items based on user permissions
  return allMobileNavItems.filter(item => item.permission());
});

onMounted(async () => {
  await fetchUserRoles();
  const pages = ["dashboard", "user-management", "approve", "inventory", "transaction-in", "transaction-out", "sa-rotation", "isuzu-dtr", "settings"];
  
  // Check all permissions in parallel for faster loading
  const results = await Promise.all(
    pages.map(page => canAccessPage(page))
  );
  
  pages.forEach((page, index) => {
    accessiblePages.value[page] = results[index];
  });
  
  isLoading.value = false;
});
</script>

<style scoped>
.isuzu-font { font-family: 'IsuzuFont', sans-serif; }

.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }

/* Vue Animations */
.pop-enter-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-leave-active { transition: all 0.2s ease-in; }
.pop-enter-from { opacity: 0; transform: translate(-50%, 30px) scale(0.5); }
.pop-leave-to { opacity: 0; transform: translate(-50%, 20px) scale(0.8); }
</style>

<style>
@font-face {
  font-family: 'IsuzuFont';
  src: url('@/assets/usuzi/usuzi.ttf') format('truetype');
}
</style>