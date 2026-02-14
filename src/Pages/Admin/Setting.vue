<template>
  <!-- 🔧 ADDED: Loading Screen -->
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <Loaders />
  </div>

  <!-- MAIN CONTENT -->
  <div v-else :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col">

    <!-- Main Content -->
    <main class="flex-1 overflow-auto p-6">

      <!-- Header with Logout -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold border-l-4 border-red-600 pl-4 flex items-center gap-2">
          <SettingsIcon class="w-6 h-6 text-red-600" /> Settings
        </h1>

        <div class="flex items-center gap-4">
          <!-- User Info -->
          <div v-if="user" class="text-right">
            <p class="font-medium">{{ user.displayName || user.email }}</p>
            <p class="text-sm text-gray-500 capitalize">{{ userRole }}</p>
          </div>
          
          <button
            @click="handleLogout"
            :disabled="isLoggingOut"
            class="bg-red-600 text-white px-5 py-2 rounded flex items-center gap-2 hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
          >
            <LogOutIcon class="w-5 h-5" /> 
            {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
          </button>
        </div>

      </div>

      <!-- Tabs -->
      <div class="flex space-x-4 mb-6 border-b border-gray-300">
        <button @click="activeTab = 'general'" :class="[tabClass('general'), tabHoverClass]" class="px-4 py-2 flex items-center gap-1 transition-all duration-200 rounded-t">
          <UserIcon class="w-5 h-5" /> General
        </button>
        <button @click="activeTab = 'inventory'" :class="[tabClass('inventory'), tabHoverClass]" class="px-4 py-2 flex items-center gap-1 transition-all duration-200 rounded-t">
          <PackageIcon class="w-5 h-5" /> Inventory
        </button>
        <button @click="activeTab = 'notifications'" :class="[tabClass('notifications'), tabHoverClass]" class="px-4 py-2 flex items-center gap-1 transition-all duration-200 rounded-t">
          <BellIcon class="w-5 h-5" /> Notifications
        </button>
        <button @click="activeTab = 'warehouse'" :class="[tabClass('warehouse'), tabHoverClass]" class="px-4 py-2 flex items-center gap-1 transition-all duration-200 rounded-t">
          <MapPinIcon class="w-5 h-5" /> Warehouse
        </button>
      </div>

      <!-- Status Messages -->
      <div v-if="isSaving" class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
        <Loader2Icon class="w-5 h-5 animate-spin" /> Saving settings...
      </div>

      <div v-if="saveSuccess" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
        <CheckCircleIcon class="w-5 h-5" /> Settings saved successfully!
      </div>

      <div v-if="saveError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
        <XCircleIcon class="w-5 h-5" /> {{ saveError }}
      </div>

      <!-- CONTENT -->
      <div class="space-y-6">

        <!-- General -->
        <div v-if="activeTab === 'general'">
          <div :class="cardClass" :style="cardStyle" class="border-l-2 border-red-600 hover:shadow-xl transition-all duration-300">

            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
              <UserCogIcon class="w-5 h-5" /> General Settings
            </h2>

            <div class="space-y-4">
              <input v-model="settings.general.companyName" class="w-full border rounded px-4 py-2" placeholder="Company Name" />
              <input v-model="settings.general.companyEmail" class="w-full border rounded px-4 py-2" placeholder="Company Email" />
              <input v-model="settings.general.phone" class="w-full border rounded px-4 py-2" placeholder="Phone Number" />

              <select v-model="settings.general.language" class="w-full border rounded px-4 py-2">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>

              <select v-model="settings.general.theme" class="w-full border rounded px-4 py-2">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>

              <button @click="saveSettings" class="bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <SaveIcon class="w-5 h-5" /> Save General Settings
              </button>

            </div>
          </div>
        </div>

        <!-- Inventory -->
        <div v-if="activeTab === 'inventory'">
          <div :class="cardClass" :style="cardStyle" class="border-l-2 border-red-600 hover:shadow-xl transition-all duration-300">

            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
              <PackageIcon class="w-5 h-5" /> Inventory Settings
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="number" v-model.number="settings.inventory.lowStockThreshold" class="border rounded px-4 py-2" placeholder="Low Stock Threshold" />
              <input type="number" v-model.number="settings.inventory.minReorderQty" class="border rounded px-4 py-2" placeholder="Min Reorder Qty" />
              <input type="number" v-model.number="settings.inventory.defaultReorderQty" class="border rounded px-4 py-2" placeholder="Default Reorder Qty" />
              <input type="number" v-model.number="settings.inventory.stockCheckInterval" class="border rounded px-4 py-2" placeholder="Stock Check Interval" />
            </div>

            <label class="flex items-center mt-4 gap-2">
              <input type="checkbox" v-model="settings.inventory.autoReorder" />
              Enable Auto Reorder
            </label>

            <button @click="saveSettings" class="mt-4 bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <SaveIcon class="w-5 h-5" /> Save Inventory Settings
            </button>

          </div>
        </div>

        <!-- Notifications -->
        <div v-if="activeTab === 'notifications'">
          <div :class="cardClass" :style="cardStyle" class="border-l-2 border-red-600 hover:shadow-xl transition-all duration-300">

            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
              <BellRingIcon class="w-5 h-5" /> Notification Settings
            </h2>

            <div v-for="(label, key) in notificationLabels" :key="key" class="flex justify-between p-4 bg-gray-50 rounded mb-2 hover:bg-gray-100 transition-all duration-200 cursor-pointer">
              <span>{{ label }}</span>
              <input type="checkbox" v-model="settings.notifications[key]" />
            </div>


            <button @click="saveSettings" class="mt-4 bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <SaveIcon class="w-5 h-5" /> Save Notification Settings
            </button>

          </div>
        </div>

        <!-- Warehouse -->
        <div v-if="activeTab === 'warehouse'">
          <div :class="cardClass" :style="cardStyle" class="border-l-2 border-red-600 hover:shadow-xl transition-all duration-300">

            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPinIcon class="w-5 h-5" /> Warehouse Locations
            </h2>

            <div v-for="(wh, i) in settings.warehouse.locations" :key="i" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 hover:bg-gray-50 p-2 rounded transition-all duration-200">
              <input v-model="wh.name" class="border rounded px-3 py-2 hover:shadow-sm transition-all duration-200" placeholder="Name" />
              <input v-model="wh.location" class="border rounded px-3 py-2 hover:shadow-sm transition-all duration-200" placeholder="Location" />
              <div class="flex gap-2">
                <input v-model.number="wh.capacity" type="number" class="border rounded px-3 py-2 w-full hover:shadow-sm transition-all duration-200" placeholder="Capacity" />
                <button @click="removeWarehouse(i)" class="bg-red-600 text-white px-3 rounded hover:bg-red-700 hover:shadow-lg transition-all duration-200">
                  X
                </button>
              </div>
            </div>


            <button @click="addWarehouse" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              Add Warehouse
            </button>

            <button @click="saveSettings" class="ml-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              Save Warehouse Settings
            </button>

          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useAuth } from "../../composables/useAuth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../Firebase/Firebase";
import Loaders from "../../components/Loaders.vue";

import {
  SettingsIcon, LogOutIcon, UserIcon, PackageIcon, BellIcon, MapPinIcon,
  UserCogIcon, SaveIcon, BellRingIcon,
  Loader2Icon, CheckCircleIcon, XCircleIcon
} from "lucide-vue-next";

/* ===== AUTH ===== */
const { user, userRole, logout } = useAuth();

/* ===== STATE ===== */
const activeTab = ref("general");
const isLoading = ref(true);
const isLoggingOut = ref(false);
const isSaving = ref(false);
const saveSuccess = ref(false);
const saveError = ref(null);

/* ===== SETTINGS ===== */
const defaultSettings = {
  general: { companyName: "", companyEmail: "", phone: "", language: "en", theme: "light" },
  inventory: { lowStockThreshold: 50, minReorderQty: 100, defaultReorderQty: 500, stockCheckInterval: 7, autoReorder: true },
  notifications: { emailNotifications: true, lowStockAlerts: true, reorderNotifications: true, systemUpdates: true },
  warehouse: { locations: [] },
};

const settings = ref(JSON.parse(JSON.stringify(defaultSettings)));

const notificationLabels = {
  emailNotifications: "Email Notifications",
  lowStockAlerts: "Low Stock Alerts",
  reorderNotifications: "Reorder Notifications",
  systemUpdates: "System Updates",
};

/* ===== THEME ===== */
const themeClass = computed(() =>
  settings.value.general.theme === "dark"
    ? "text-white"
    : "bg-gray-100 text-gray-900"
);

const themeStyle = computed(() =>
  settings.value.general.theme === "dark"
    ? { backgroundColor: "#232323" }
    : {}
);

const cardClass = computed(() =>
  settings.value.general.theme === "dark"
    ? "p-6 rounded shadow"
    : "bg-white p-6 rounded shadow"
);

const cardStyle = computed(() =>
  settings.value.general.theme === "dark"
    ? { backgroundColor: "#2a2a2a" }
    : {}
);

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

/* ===== METHODS ===== */
const saveSettings = async () => {
  if (!user.value) return;
  
  isSaving.value = true;
  saveError.value = null;
  
  try {
    await setDoc(doc(db, "users", user.value.uid, "settings", "preferences"), settings.value);
    applyTheme(settings.value.general.theme);
    saveSuccess.value = true;
    setTimeout(() => (saveSuccess.value = false), 3000);
  } catch (error) {
    saveError.value = "Failed to save settings";
  } finally {
    isSaving.value = false;
  }
};

const addWarehouse = () => {
  settings.value.warehouse.locations.push({ name: "", location: "", capacity: 0 });
};

const removeWarehouse = (i) => {
  settings.value.warehouse.locations.splice(i, 1);
};

const handleLogout = async () => {
  isLoggingOut.value = true;
  await logout();
  isLoggingOut.value = false;
};

/* ===== LIFECYCLE ===== */
onMounted(async () => {
  if (user.value) {
    try {
      const snap = await getDoc(doc(db, "users", user.value.uid, "settings", "preferences"));
      if (snap.exists()) {
        settings.value = snap.data();
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }
  isLoading.value = false;
});

const tabClass = (tab) =>
  activeTab.value === tab
    ? "text-blue-600 border-b-2 border-blue-600"
    : "text-gray-600";

const tabHoverClass = computed(() =>
  settings.value.general.theme === "dark"
    ? "hover:bg-gray-700 hover:text-blue-400"
    : "hover:bg-gray-100 hover:text-blue-700"
);

</script>
