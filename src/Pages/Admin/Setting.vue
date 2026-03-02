<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-white">
    <Loaders />
  </div>

  <div v-else :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col font-sans relative overflow-hidden bg-gray-70">
    
    <div class="absolute top-0 left-0 w-full z-0 opacity-10 pointer-events-none">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 15 H280 L330 45 H500" stroke="#cc0000" stroke-width="2" />
      </svg>
    </div>

    <header class="relative z-10 px-8 py-6 flex justify-between items-center bg-white/10 backdrop-blur-none">
      <div class="flex items-center gap-4">
        <div class="bg-red-600 p-2 rounded-lg">
          <SettingsIcon class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-black isuzu-font uppercase tracking-widest text-neutral-800">
            System <span class="text-red-600">Settings</span>
          </h1>
          <p class="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Administrator Console</p>
        </div>
      </div>

      <div class="flex items-center gap-6">
        <div v-if="user" class="hidden md:block text-right border-r pr-6 border-gray-300">
          <p class="text-sm font-bold text-neutral-800 uppercase tracking-tight">{{ user.displayName || user.email }}</p>
          <p class="text-[10px] text-red-600 font-bold uppercase tracking-widest">{{ userRole }}</p>
        </div>
        
        <button
          @click="handleLogout"
          :disabled="isLoggingOut"
          class="group flex items-center gap-2 bg-neutral-800 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all duration-300 shadow-lg disabled:opacity-50"
        >
          <LogOutIcon class="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
        </button>
      </div>
    </header>

    <main class="flex-1 relative z-10 overflow-auto">
      <div class="max-w-7xl mx-auto p-8">
        
        <div class="flex space-x-2 mb-8 bg-gray-200/50 p-1 rounded-2xl w-fit">
          <button 
            @click="activeTab = 'general'" 
            :class="activeTab === 'general' ? 'bg-white text-red-600 shadow-md' : 'text-gray-500 hover:text-neutral-800'"
            class="px-8 py-3 flex items-center gap-2 transition-all rounded-xl font-bold uppercase text-xs tracking-widest isuzu-font"
          >
            <UserIcon class="w-4 h-4" /> General
          </button>
          <button 
            @click="activeTab = 'landing'" 
            :class="activeTab === 'landing' ? 'bg-white text-red-600 shadow-md' : 'text-gray-500 hover:text-neutral-800'"
            class="px-8 py-3 flex items-center gap-2 transition-all rounded-xl font-bold uppercase text-xs tracking-widest isuzu-font"
          >
            <LayoutIcon class="w-4 h-4" /> Landing Editor
          </button>
        </div>

        <TransitionGroup name="slide-fade">
          <div v-if="isSaving" key="saving" class="fixed bottom-10 right-10 bg-neutral-800 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-4 border-b-4 border-blue-500">
            <Loader2Icon class="w-5 h-5 animate-spin text-blue-400" /> 
            <span class="text-sm font-bold uppercase tracking-widest">Syncing Database...</span>
          </div>
          <div v-if="saveSuccess" key="success" class="fixed bottom-10 right-10 bg-neutral-800 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-4 border-b-4 border-green-500">
            <CheckCircleIcon class="w-5 h-5 text-green-400" /> 
            <span class="text-sm font-bold uppercase tracking-widest">Settings Updated</span>
          </div>
        </TransitionGroup>

        <div class="space-y-8 pb-20">
          
          <div v-if="activeTab === 'general'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden">
              <div class="absolute top-0 right-0 p-4 opacity-5">
                <UserCogIcon class="w-32 h-32 text-neutral-900" />
              </div>

              <h2 class="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter text-neutral-800">
                <span class="w-2 h-8 bg-red-600 rounded-full"></span> Account & System
              </h2>

              <div class="grid md:grid-cols-2 gap-8 relative z-10">
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Company Name</label>
                  <input v-model="settings.general.companyName" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none font-medium text-neutral-800" />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Company Email</label>
                  <input v-model="settings.general.companyEmail" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none font-medium text-neutral-800" />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">System Theme</label>
                  <select v-model="settings.general.theme" @change="applyTheme(settings.general.theme)" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none font-bold text-neutral-800">
                    <option value="light">LIGHT MODE</option>
                    <option value="dark">DARK MODE</option>
                  </select>
                </div>
              </div>

              <div class="mt-12 pt-8 border-t border-gray-100">
                <button @click="saveSettings" class="bg-red-600 text-white px-10 py-4 rounded-full font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-red-200 isuzu-font text-sm">
                  <SaveIcon class="w-5 h-5" /> Save Preferences
                </button>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'landing'" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div class="bg-white rounded-3xl p-8 border border-gray-100">
              <h2 class="text-2xl font-black mb-10 flex items-center gap-3 uppercase tracking-tighter text-neutral-800 isuzu-font">
                <TagIcon class="w-7 h-7 text-red-600" /> 
                Promos <span class="text-red-600">Management</span>
              </h2>
              
              <div class="grid lg:grid-cols-2 gap-12">
                <div class="space-y-6">
                  <div class="flex items-center justify-between border-b pb-4">
                    <h3 class="font-black text-sm uppercase tracking-widest text-neutral-700 flex items-center gap-2 isuzu-font">
                      <span class="p-1.5 bg-red-100 text-red-600 rounded-lg"></span> Car Units
                    </h3>
                    <button class="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline opacity-50 cursor-not-allowed">Add New Unit</button>
                  </div>
                  <div class="group relative p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl hover:border-red-300 transition-colors">
                    <input placeholder="Car Model Name" class="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-tight outline-none focus:border-red-400" />
                    <textarea placeholder="Description / Features" rows="2" class="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-xs outline-none mt-3 focus:border-red-400"></textarea>
                    <div class="mt-3 flex items-center gap-2">
                        <span class="text-[10px] font-black text-red-600 uppercase tracking-widest whitespace-nowrap">Promo:</span>
                        <input placeholder="e.g. 100K DISCOUNT" class="w-full bg-red-50 text-red-600 border border-red-100 rounded-lg px-4 py-2 text-xs font-black outline-none" />
                    </div>
                  </div>
                </div>

                <div class="space-y-6">
                  <div class="flex items-center justify-between border-b pb-4">
                    <h3 class="font-black text-sm uppercase tracking-widest text-neutral-700 flex items-center gap-2 isuzu-font">
                      <span class="p-1.5 bg-blue-100 text-blue-600 rounded-lg"></span> After Sales
                    </h3>
                    <button class="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline opacity-50 cursor-not-allowed">Add New Service</button>
                  </div>
                  <div class="p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-300 transition-colors">
                    <input placeholder="Part Name / Service" class="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-tight outline-none focus:border-blue-400" />
                    <textarea placeholder="Service Details" rows="2" class="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-xs outline-none mt-3 focus:border-blue-400"></textarea>
                    <div class="mt-3 flex items-center gap-2">
                        <span class="text-[10px] font-black text-blue-600 uppercase tracking-widest whitespace-nowrap">Promo:</span>
                        <input placeholder="e.g. FREE CHECKUP" class="w-full bg-blue-50 text-blue-600 border border-blue-100 rounded-lg px-4 py-2 text-xs font-black outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-neutral-800 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
               <div class="absolute -bottom-10 -right-10 opacity-10">
                <TargetIcon class="w-64 h-64 text-white" />
              </div>
              <h2 class="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-widest relative z-10">
                <span class="w-2 h-8 bg-red-600 rounded-full"></span> Brand Identity
              </h2>
              <div class="grid md:grid-cols-3 gap-6 relative z-10">
                <div class="space-y-2">
                    <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Mission</label>
                    <textarea placeholder="Mission Statement" rows="5" class="w-full p-4 bg-neutral-700/50 border border-neutral-600 rounded-xl outline-none focus:border-red-500 text-sm leading-relaxed"></textarea>
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Vision</label>
                    <textarea placeholder="Vision Statement" rows="5" class="w-full p-4 bg-neutral-700/50 border border-neutral-600 rounded-xl outline-none focus:border-red-500 text-sm leading-relaxed"></textarea>
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Core Values</label>
                    <textarea placeholder="Values..." rows="5" class="w-full p-4 bg-neutral-700/50 border border-neutral-600 rounded-xl outline-none focus:border-red-500 text-sm leading-relaxed"></textarea>
                </div>
              </div>
            </div>

            <div class="flex justify-center pt-10">
              <button class="group bg-red-600 text-white px-16 py-5 rounded-full font-black text-xl shadow-[0_20px_50px_rgba(204,0,0,0.3)] transition-all opacity-50 cursor-not-allowed flex items-center gap-4 isuzu-font">
                <SaveIcon class="w-7 h-7" /> UPDATE LIVE WEBSITE
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div class="absolute bottom-0 left-0 w-full z-0 opacity-10 pointer-events-none transform rotate-180">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
        <path d="M0 45 H170 L220 15 H500" stroke="#cc0000" stroke-width="2" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useAuth } from "../../composables/useAuth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../Firebase/Firebase";
import Loaders from "../../components/Loaders.vue";

import {
  SettingsIcon, LogOutIcon, UserIcon,
  UserCogIcon, SaveIcon,
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
};

const settings = ref(JSON.parse(JSON.stringify(defaultSettings)));


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

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
input, textarea, select { background-color: white !important; color: #1a202c !important; }
.dark label { color: #a0aec0; }
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.4s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>