<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <Loaders />
  </div>

  <div v-else :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col">
    <main class="flex-1 overflow-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold border-l-4 border-red-600 pl-4 flex items-center gap-2">
          <SettingsIcon class="w-6 h-6 text-red-600" /> Settings
        </h1>

        <div class="flex items-center gap-4">
          <div v-if="user" class="text-right">
            <p class="font-medium">{{ user.displayName || user.email }}</p>
            <p class="text-sm text-gray-500 capitalize">{{ userRole }}</p>
          </div>
          
          <button
            @click="handleLogout"
            :disabled="isLoggingOut"
            class="bg-red-600 text-white px-5 py-2 rounded flex items-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50 shadow-md"
          >
            <LogOutIcon class="w-5 h-5" /> 
            {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
          </button>
        </div>
      </div>

      <div class="flex space-x-4 mb-6 border-b border-gray-300">
        <button @click="activeTab = 'general'" :class="tabClass('general')" class="px-6 py-2 flex items-center gap-2 transition-all rounded-t">
          <UserIcon class="w-5 h-5" /> General
        </button>
        <button @click="activeTab = 'landing'" :class="tabClass('landing')" class="px-6 py-2 flex items-center gap-2 transition-all rounded-t">
          <LayoutIcon class="w-5 h-5" /> Landing Page Editor
        </button>
      </div>

      <Transition name="fade">
        <div v-if="isSaving" class="fixed top-20 right-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-3">
          <Loader2Icon class="w-5 h-5 animate-spin" /> Saving to Database...
        </div>
      </Transition>

      <Transition name="fade">
        <div v-if="saveSuccess" class="fixed top-20 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-3">
          <CheckCircleIcon class="w-5 h-5" /> Updated successfully!
        </div>
      </Transition>

      <div class="max-w-7xl mx-auto space-y-6 pb-20">
        <!-- General Tab -->
        <div v-if="activeTab === 'general'" class="animate-in fade-in duration-500">
          <div :class="cardClass" :style="cardStyle" class="border-l-4 border-red-600 shadow-lg">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <UserCogIcon class="w-5 h-5 text-red-600" /> Account & System
            </h2>
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-1">
                <label class="text-xs font-bold uppercase opacity-70">Company Name</label>
                <input v-model="settings.general.companyName" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 transition-all outline-none" placeholder="Enter Company Name" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold uppercase opacity-70">Company Email</label>
                <input v-model="settings.general.companyEmail" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 transition-all outline-none" placeholder="Enter Company Email" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold uppercase opacity-70">System Theme</label>
                <select v-model="settings.general.theme" @change="applyTheme(settings.general.theme)" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 transition-all outline-none">
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
            </div>
            <button @click="saveSettings" class="mt-8 bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md">
              <SaveIcon class="w-5 h-5" /> Save Preferences
            </button>
          </div>
        </div>

        <!-- Landing Page Editor Tab (STATIC) -->
        <div v-if="activeTab === 'landing'" class="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
          <div :class="cardClass" :style="cardStyle" class="border-l-4 border-yellow-500 shadow-lg">
            <div class="flex justify-between items-center mb-8 border-b pb-4">
              <h2 class="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
                <TagIcon class="w-7 h-7 text-yellow-500" /> Promos Manager
              </h2>
            </div>
            
            <div class="grid lg:grid-cols-2 gap-10">
              <!-- Static Car Promo -->
              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <h3 class="font-black text-lg text-red-600 flex items-center gap-2">🚗 Car Unit Promos</h3>
                  <button class="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200 cursor-not-allowed opacity-50 flex items-center gap-1">
                    <PlusIcon class="w-4 h-4" /> Add Car
                  </button>
                </div>
                <div class="relative p-5 bg-gray-50 border border-gray-200 rounded-2xl">
                  <input placeholder="Car Model Name" class="w-full bg-white text-gray-900 border rounded-lg px-3 py-2 text-sm font-bold outline-none" />
                  <textarea placeholder="Description / Features" rows="2" class="w-full bg-white text-gray-900 border rounded-lg px-3 py-2 text-xs outline-none mt-2"></textarea>
                  <input placeholder="Promo Details" class="w-full bg-white text-red-600 border border-red-100 rounded-lg px-3 py-2 text-sm font-black outline-none mt-2" />
                </div>
              </div>

              <!-- Static Parts Promo -->
              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <h3 class="font-black text-lg text-blue-600 flex items-center gap-2">⚙️ Parts Promos</h3>
                  <button class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 cursor-not-allowed opacity-50 flex items-center gap-1">
                    <PlusIcon class="w-4 h-4" /> Add Part
                  </button>
                </div>
                <div class="relative p-5 bg-gray-50 border border-gray-200 rounded-2xl">
                  <input placeholder="Part Name" class="w-full bg-white text-gray-900 border rounded-lg px-3 py-2 text-sm font-bold outline-none" />
                  <textarea placeholder="Service Details" rows="2" class="w-full bg-white text-gray-900 border rounded-lg px-3 py-2 text-xs outline-none mt-2"></textarea>
                  <input placeholder="Promo Details" class="w-full bg-white text-blue-600 border border-blue-100 rounded-lg px-3 py-2 text-sm font-black outline-none mt-2" />
                </div>
              </div>
            </div>

            <!-- Static Mission, Vision, Values -->
            <div :class="cardClass" :style="cardStyle" class="border-l-4 border-blue-500 shadow-lg mt-10">
              <h2 class="text-xl font-bold mb-6 flex items-center gap-2 uppercase">
                <TargetIcon class="w-5 h-5 text-blue-500" /> Mission, Vision & Values
              </h2>
              <div class="grid md:grid-cols-3 gap-8">
                <textarea placeholder="Mission Statement" rows="6" class="w-full p-4 bg-white border rounded-xl outline-none"></textarea>
                <textarea placeholder="Vision Statement" rows="6" class="w-full p-4 bg-white border rounded-xl outline-none"></textarea>
                <textarea placeholder="Core Values (Comma separated)" rows="6" class="w-full p-4 bg-white border rounded-xl outline-none"></textarea>
              </div>
            </div>

            <!-- Static About Us -->
            <div :class="cardClass" :style="cardStyle" class="border-l-4 border-green-500 shadow-lg mt-10">
              <h2 class="text-xl font-bold mb-6 flex items-center gap-2 uppercase">
                <InfoIcon class="w-5 h-5 text-green-500" /> About Us Content
              </h2>
              <textarea placeholder="About Us Text" rows="10" class="w-full p-4 bg-white border rounded-xl outline-none"></textarea>
              <div class="border-2 border-dashed rounded-2xl p-6 bg-white mt-4 text-center">
                <ImageIcon class="w-12 h-12 text-gray-300 mx-auto" />
                <p class="text-xs text-gray-400 mt-2">Static Image Placeholder</p>
              </div>
            </div>

            <div class="flex justify-center pt-5">
              <button class="bg-red-600 text-white px-12 py-5 rounded-full font-black text-lg shadow-2xl opacity-50 cursor-not-allowed flex items-center gap-3">
                <SaveIcon class="w-6 h-6" /> UPDATE LIVE PAGE
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAuth } from "../../composables/useAuth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../Firebase/Firebase";
import Loaders from "../../components/Loaders.vue";
import {
  SettingsIcon, LogOutIcon, UserIcon, LayoutIcon, UserCogIcon, 
  SaveIcon, TagIcon, TargetIcon, InfoIcon, Loader2Icon, 
  CheckCircleIcon, PlusIcon, Trash2Icon, ImageIcon
} from "lucide-vue-next";

/* ===== AUTH ===== */
const { user, userRole, logout } = useAuth();

/* ===== UI STATE ===== */
const activeTab = ref("general");
const isLoading = ref(true);
const isLoggingOut = ref(false);
const isSaving = ref(false);
const saveSuccess = ref(false);

/* ===== SETTINGS STATE ===== */
const settings = ref({
  general: { companyName: "", companyEmail: "", theme: "light" },
  landing: {
    carPromos: [],
    partsPromos: [],
    mission: "",
    vision: "",
    coreValues: [],
    aboutText: "",
    aboutImage: null
  }
});

/* ===== THEME LOGIC ===== */
const applyTheme = (theme) => {
  const html = document.documentElement;
  html.classList.remove('dark', 'light');
  if (theme === 'dark') html.classList.add('dark');
  else html.classList.add('light');
  localStorage.setItem('appTheme', theme);
};

const themeClass = computed(() => settings.value.general.theme === "dark" ? "bg-[#121212] text-white" : "bg-gray-100 text-gray-900");
const themeStyle = computed(() => ({}));
const cardClass = computed(() => settings.value.general.theme === "dark" ? "p-8 rounded-3xl bg-[#1e1e1e]" : "bg-white p-8 rounded-3xl");
const cardStyle = computed(() => ({}));

/* ===== ACTIONS ===== */
const saveSettings = async () => {
  if (!user.value) return;
  isSaving.value = true;
  
  try {
    const userPrefRef = doc(db, "users", user.value.uid, "settings", "preferences");
    await setDoc(userPrefRef, { 
      general: settings.value.general 
    }, { merge: true });

    const landingRef = doc(db, "settings", "landingPage");
    await setDoc(landingRef, settings.value.landing, { merge: true });

    saveSuccess.value = true;
    setTimeout(() => (saveSuccess.value = false), 3000);
  } catch (error) {
    console.error("Critical Save Error:", error);
    alert("Database access denied. Check your Firestore rules or internet connection.");
  } finally {
    isSaving.value = false;
  }
};

const handleLogout = async () => {
  isLoggingOut.value = true;
  await logout();
  isLoggingOut.value = false;
};

/* ===== LOAD DATA ===== */
onMounted(async () => {
  if (user.value) {
    try {
      const userSnap = await getDoc(doc(db, "users", user.value.uid, "settings", "preferences"));
      if (userSnap.exists()) {
        settings.value.general = userSnap.data().general;
        if (settings.value.general.theme) applyTheme(settings.value.general.theme);
      }

      const landingSnap = await getDoc(doc(db, "settings", "landingPage"));
      if (landingSnap.exists()) {
        settings.value.landing = landingSnap.data();
      }
    } catch (error) {
      console.error("Load error:", error);
    }
  }
  isLoading.value = false;
});

const tabClass = (tab) =>
  activeTab.value === tab
    ? "bg-red-600 text-white shadow-lg"
    : "text-gray-500 hover:bg-gray-200";
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
input, textarea, select { background-color: white !important; color: #1a202c !important; }
.dark label { color: #a0aec0; }
</style>