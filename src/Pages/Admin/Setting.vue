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
            <span class="text-sm font-bold uppercase tracking-widest">Syncing...</span>
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
            

            <!-- Car Promos Section -->
            <div class="bg-white rounded-3xl p-8 border border-gray-100">
              <div class="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <h2 class="text-2xl md:text-4xl text-black uppercase tracking-widest isuzu-font">Car Promos</h2>
                <div class="h-[2px] flex-1 bg-red-600 hidden md:block ml-8"></div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <div v-for="(car, idx) in landingCarPromos" :key="idx" class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all p-5 border border-gray-100">
                  <div class="aspect-video flex items-center justify-center bg-gray-200 rounded-xl mb-5 relative">
                    <input type="file" accept="image/*" @change="e => handleCarImageUpload(e, idx)" class="absolute top-2 right-2 w-7 h-7 opacity-0 cursor-pointer" title="Upload Image" />
                    <label class="absolute top-2 right-2 bg-white rounded-full p-1 shadow cursor-pointer" style="z-index:2;">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12V8a2 2 0 012-2h12a2 2 0 012 2v4M16 12l-4-4-4 4" /></svg>
                      <input type="file" accept="image/*" @change="e => handleCarImageUpload(e, idx)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </label>
                    <img v-if="car.image" :src="car.image" alt="Car Promo Image" class="w-full h-full object-cover rounded-xl" />
                    <span v-else class="text-gray-400 text-xs font-bold">IMAGE COMING SOON</span>
                  </div>
                  <input v-model="car.name" class="isuzu-font text-lg mb-2 font-bold w-full bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:border-red-500" placeholder="Car Name" type="text" />
                  <textarea v-model="car.description" class="text-xs text-neutral-500 mb-2 w-full bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:border-red-500 resize-none" placeholder="Description"></textarea>
                  <input v-model="car.promo" class="text-red-600 font-black text-lg w-full bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:border-red-500" placeholder="Promo" type="text" />
                  <button @click="removeCarPromo(idx)" class="mt-2 text-xs text-red-500 hover:underline">Remove</button>
                </div>
                <div class="flex items-center justify-center">
                  <button @click="addCarPromo" class="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition">+ Add Car Promo</button>
                </div>
              </div>
            </div>

            <hr class="my-8 border-red-600" />

            <!-- Parts Promos Section -->
            <div class="bg-white rounded-3xl p-8 border border-gray-100">
              <div class="flex flex-col md:flex-row-reverse md:items-center justify-between mb-10 gap-4">
                <h2 class="text-2xl md:text-4xl text-black uppercase tracking-widest isuzu-font">Parts Promos</h2>
                <div class="h-[2px] flex-1 bg-red-600 hidden md:block mr-8"></div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <div v-for="(part, idx) in landingPartsPromos" :key="idx" class="bg-neutral-800 text-white rounded-2xl p-6 hover:bg-neutral-900 transition-all">
                  <div class="h-32 flex items-center justify-center bg-white/5 rounded-xl mb-5 relative">
                    <input type="file" accept="image/*" @change="e => handlePartImageUpload(e, idx)" class="absolute top-2 right-2 w-7 h-7 opacity-0 cursor-pointer" title="Upload Image" />
                    <label class="absolute top-2 right-2 bg-white rounded-full p-1 shadow cursor-pointer" style="z-index:2;">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12V8a2 2 0 012-2h12a2 2 0 012 2v4M16 12l-4-4-4 4" /></svg>
                      <input type="file" accept="image/*" @change="e => handlePartImageUpload(e, idx)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </label>
                    <img v-if="part.image" :src="part.image" alt="Part Promo Image" class="w-full h-full object-cover rounded-xl" />
                    <span v-else class="text-gray-400 text-xs font-bold">PREVIEW N/A</span>
                  </div>
                  <input v-model="part.name" class="font-bold text-base isuzu-font mb-2 text-red-500 w-full bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:border-red-500" placeholder="Part Name" type="text" />
                  <textarea v-model="part.description" class="text-xs opacity-60 mb-2 w-full bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:border-red-500 resize-none" placeholder="Description"></textarea>
                  <input v-model="part.promo" class="text-lg font-black text-white w-full bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:border-red-500" placeholder="Promo" type="text" />
                  <button @click="removePartPromo(idx)" class="mt-2 text-xs text-red-400 hover:underline">Remove</button>
                </div>
                <div class="flex items-center justify-center">
                  <button @click="addPartPromo" class="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition">+ Add Part Promo</button>
                </div>
              </div>
            </div>

            <!-- Save Promos Button -->
            <div class="flex justify-end mt-8">
              <button @click="savePromos" :disabled="isSaving" class="bg-neutral-800 text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all duration-300 shadow-lg disabled:opacity-50">
                <SaveIcon class="w-4 h-4 inline-block mr-2" />
                {{ isSaving ? 'Saving...' : 'Save Promos' }}
              </button>
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
                  <textarea v-model="missionText" placeholder="Mission Statement" rows="5" class="w-full p-4 bg-neutral-700/50 border border-neutral-600 rounded-xl outline-none focus:border-red-500 text-sm leading-relaxed"></textarea>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Vision</label>
                  <textarea v-model="visionText" placeholder="Vision Statement" rows="5" class="w-full p-4 bg-neutral-700/50 border border-neutral-600 rounded-xl outline-none focus:border-red-500 text-sm leading-relaxed"></textarea>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Core Values</label>
                  <textarea v-model="valuesText" placeholder="Values..." rows="5" class="w-full p-4 bg-neutral-700/50 border border-neutral-600 rounded-xl outline-none focus:border-red-500 text-sm leading-relaxed"></textarea>
                </div>
              </div>
            </div>

            <!-- Editable About Us & Slogan Card -->
            <div v-if="activeTab === 'landing'" class="bg-white rounded-3xl p-8 border border-gray-100 mt-8">
              <h2 class="text-2xl font-black mb-10 flex items-center gap-3 uppercase tracking-tighter text-neutral-800 isuzu-font">
                <TagIcon class="w-7 h-7 text-red-600" /> 
                About Us <span class="text-red-600">Editor</span>
              </h2>
              <div class="space-y-6">
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">About Us Text (Line 1)</label>
                  <input v-model="aboutUsTextLine1" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium outline-none focus:border-red-400 mb-2" />
                </div>
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">About Us Text (Line 2)</label>
                  <input v-model="aboutUsTextLine2" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium outline-none focus:border-red-400" />
                </div>
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Slogan</label>
                  <input v-model="sloganText" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold outline-none focus:border-red-400" />
                  <div v-if="aboutUsSaveSuccess" class="mt-2 text-green-600 text-xs font-bold">Slogan updated!</div>
                  <div v-if="aboutUsSaveError" class="mt-2 text-red-600 text-xs font-bold">{{ aboutUsSaveError }}</div>
                </div>
                <div class="mt-8">
                  <h3 class="font-black text-sm uppercase tracking-widest text-neutral-700 mb-2">Preview:</h3>
                  <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p class="text-sm text-gray-700 mb-4 whitespace-pre-line">{{ aboutUsTextLine1 }}</p>
                    <p class="text-sm text-gray-700 mb-4 whitespace-pre-line">{{ aboutUsTextLine2 }}</p>
                    <p class="isuzu-font text-red-500 tracking-widest text-lg">{{ sloganText }}</p>
                  </div>
                </div>
              </div>
            </div>


            <div class="flex justify-center pt-10">
              <button @click="saveLandingContent" class="group bg-red-600 text-white px-16 py-5 rounded-full font-black text-xl shadow-[0_20px_50px_rgba(204,0,0,0.3)] transition-all flex items-center gap-4 isuzu-font">
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
import { ref, onMounted, computed } from "vue";
import { useAuth } from "../../composables/useAuth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../Firebase/Firebase";
import Loaders from "../../components/Loaders.vue";

import {
  SettingsIcon, LogOutIcon, UserIcon,
  UserCogIcon, SaveIcon,
  Loader2Icon, CheckCircleIcon, XCircleIcon
} from "lucide-vue-next";

// Add/Remove Car and Part Promo handlers
function addCarPromo() {
  landingCarPromos.value.push({
    name: "",
    description: "",
    promo: "",
    image: ""
  });
}

function addPartPromo() {
  landingPartsPromos.value.push({
    name: "",
    description: "",
    promo: "",
    image: ""
  });
}

function removeCarPromo(idx) {
  landingCarPromos.value.splice(idx, 1);
}

function removePartPromo(idx) {
  landingPartsPromos.value.splice(idx, 1);
}


// Promos Management State
const landingCarPromos = ref([]);
const landingPartsPromos = ref([]);

// Load promos from Firestore on mount
onMounted(async () => {
  // ...existing user/settings loading...
  try {
    const snap = await getDoc(doc(db, "settings", "landingPage"));
    if (snap.exists()) {
      const data = snap.data();
      landingCarPromos.value = Array.isArray(data.carPromos) ? JSON.parse(JSON.stringify(data.carPromos)) : [];
      landingPartsPromos.value = Array.isArray(data.partsPromos) ? JSON.parse(JSON.stringify(data.partsPromos)) : [];
      // ...load other landing fields...
    } else {
      // If no data, initialize with defaults
      landingCarPromos.value = [
        { name: "D-MAX Special", description: "Extreme durability meets comfort.", promo: "Low Downpayment", image: "" },
        { name: "mu-X Series", description: "Premium 7-seater family SUV.", promo: "Free 1yr Insurance", image: "" },
        { name: "Traviz", description: "The ultimate business partner.", promo: "Cash Discount", image: "" },
      ];
      landingPartsPromos.value = [
        { name: "Engine Oil", description: "Genuine Isuzu engine protection.", promo: "20% OFF", image: "" },
        { name: "Brake Pads", description: "Reliable stopping power.", promo: "Buy 1 Get 1 50%", image: "" },
        { name: "Filters", description: "Maintain air purity inside.", promo: "Bundle Deal", image: "" }
      ];
    }
  } catch (error) {
    console.error("Error loading promos:", error);
  }
  isLoading.value = false;
});

// When uploading, update only the image for the selected promo
function handleCarImageUpload(e, idx) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 500 * 1024) { // 500KB limit example
    alert("Image too large! Please upload images under 500KB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    landingCarPromos.value[idx].image = ev.target.result;
    // Do NOT reload or reset promos here
    savePromos();
  };
  reader.readAsDataURL(file);
}

function handlePartImageUpload(e, idx) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 500 * 1024) { // 500KB limit example
    alert("Image too large! Please upload images under 500KB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    landingPartsPromos.value[idx].image = ev.target.result;
    savePromos();
  };
  reader.readAsDataURL(file);
}

async function savePromos() {
  isSaving.value = true;
  try {
    // Ensure all promos have image property
    landingCarPromos.value.forEach(car => { if (!('image' in car)) car.image = ''; });
    landingPartsPromos.value.forEach(part => { if (!('image' in part)) part.image = ''; });
    await setDoc(doc(db, "settings", "landingPage"), {
      carPromos: landingCarPromos.value,
      partsPromos: landingPartsPromos.value,
    }, { merge: true });
    saveSuccess.value = true;
    setTimeout(() => (saveSuccess.value = false), 3000);
  } catch (error) {
    saveError.value = "Failed to save promos";
  } finally {
    isSaving.value = false;
  }
}

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

// About Us & Slogan state
const aboutUsTextLine1 = ref("");
const aboutUsTextLine2 = ref("");
const sloganText = ref("");
const aboutUsSaveSuccess = ref(false);
const aboutUsSaveError = ref(null);


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


// Brand Identity state
const missionText = ref("");
const visionText = ref("");
const valuesText = ref("");
onMounted(async () => {
  // ...existing user/settings loading...
  try {
    const snap = await getDoc(doc(db, "settings", "landingPage"));
    if (snap.exists()) {
      const data = snap.data();
      landingCarPromos.value = Array.isArray(data.carPromos) ? JSON.parse(JSON.stringify(data.carPromos)) : [];
      landingPartsPromos.value = Array.isArray(data.partsPromos) ? JSON.parse(JSON.stringify(data.partsPromos)) : [];
      // Load About Us & Slogan from Firestore
      aboutUsTextLine1.value = data.aboutUsTextLine1 || "";
      aboutUsTextLine2.value = data.aboutUsTextLine2 || "";
      sloganText.value = data.sloganText || "";
      // Load Brand Identity from Firestore
      missionText.value = data.mission || "";
      visionText.value = data.vision || "";
      valuesText.value = Array.isArray(data.values) ? data.values.join("\n") : (data.values || "");
    } else {
      // If no data, initialize with blanks
      landingCarPromos.value = [];
      landingPartsPromos.value = [];
      aboutUsTextLine1.value = "";
      aboutUsTextLine2.value = "";
      sloganText.value = "";
      missionText.value = "";
      visionText.value = "";
      valuesText.value = "";
    }
  } catch (error) {
    console.error("Error loading promos:", error);
  }
  isLoading.value = false;
});


// Save all landing content (About Us, Slogan, Mission, Vision, Core Values) in settings/landingPage (global, not user-based)
const saveLandingContent = async () => {
  aboutUsSaveError.value = null;
  try {
    await setDoc(doc(db, "settings", "landingPage"), {
      aboutUsTextLine1: aboutUsTextLine1.value,
      aboutUsTextLine2: aboutUsTextLine2.value,
      sloganText: sloganText.value,
      mission: missionText.value,
      vision: visionText.value,
      values: valuesText.value,
    }, { merge: true });
    aboutUsSaveSuccess.value = true;
    setTimeout(() => (aboutUsSaveSuccess.value = false), 3000);
  } catch (error) {
    aboutUsSaveError.value = "Failed to save landing content";
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
      // Load About Us & Slogan
      const aboutSnap = await getDoc(doc(db, "users", user.value.uid, "settings", "aboutUs"));
      if (aboutSnap.exists()) {
        aboutUsText.value = aboutSnap.data().aboutUsText || aboutUsText.value;
        sloganText.value = aboutSnap.data().sloganText || sloganText.value;
      }
      // Load Brand Identity
      const brandSnap = await getDoc(doc(db, "users", user.value.uid, "settings", "brandIdentity"));
      if (brandSnap.exists()) {
        missionText.value = brandSnap.data().mission || missionText.value;
        visionText.value = brandSnap.data().vision || visionText.value;
        valuesText.value = brandSnap.data().values || valuesText.value;
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

<script>
const carUnitImage = ref(null);
const serviceImage = ref(null);

function onCarImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    carUnitImage.value = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function onServiceImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    serviceImage.value = ev.target.result;
  };
  reader.readAsDataURL(file);
}
</script>