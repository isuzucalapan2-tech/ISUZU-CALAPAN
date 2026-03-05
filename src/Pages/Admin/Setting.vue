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

    <header class="relative z-10 px-8 py-6 flex justify-between items-center backdrop-blur-none">
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
          class="group flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all duration-300 disabled:opacity-50"
        >
          <LogOutIcon class="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
        </button>
      </div>
    </header>

    <main class="flex-1 relative z-10 overflow-auto">
      <div class="max-w-7xl mx-auto p-8">
        
        <div class="flex space-x-2 mb-8 bg-neutral-400/50 p-1 rounded-2xl w-fit">
          <button 
            @click="activeTab = 'general'" 
            :class="activeTab === 'general' ? 'bg-white text-red-600 ' : 'text-neutral-500 hover:text-neutral-800'"
            class="px-8 py-3 flex items-center gap-2 transition-all rounded-xl font-bold uppercase text-xs tracking-widest isuzu-font"
          >
            <UserIcon class="w-4 h-4" /> General
          </button>
          <button 
            @click="activeTab = 'landing'" 
            :class="activeTab === 'landing' ? 'bg-white text-red-600' : 'text-neutral-500 hover:text-neutral-800'"
            class="px-8 py-3 flex items-center gap-2 transition-all rounded-xl font-bold uppercase text-xs tracking-widest isuzu-font"
          >
            <LayoutIcon class="w-4 h-4" /> Landing Editor
          </button>
        </div>

        <TransitionGroup name="slide-fade">
          <div v-if="isSaving" key="saving" class="fixed bottom-10 right-10 bg-neutral-800 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-4 border-b-4 border-blue-500">
            <Loader2Icon class="w-5 h-5 animate-spin text-blue-400" /> 
            <span class="text-sm font-bold uppercase tracking-widest">Saving...</span>
          </div>
          <div v-if="saveSuccess" key="success" class="fixed bottom-10 right-10 bg-neutral-800 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-4 border-b-4 border-green-500">
            <CheckCircleIcon class="w-5 h-5 text-green-400" /> 
            <span class="text-sm font-bold uppercase tracking-widest">Promos Updated</span>
          </div>
        </TransitionGroup>

        <div class="space-y-8 pb-20">
          <div v-if="activeTab === 'general'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="rounded-2xl p-10 relative overflow-hidden max-w-2xl">
              <div class="absolute top-0 right-0 p-4 opacity-5">
                <Settings2Icon class="w-32 h-32 text-neutral-900" />
              </div>

              <h2 class="text-xl font-black mb-10 flex items-center gap-3 uppercase tracking-tighter text-neutral-800">
                <span class="w-2 h-8 bg-red-600 rounded-full"></span> Interface Preferences
              </h2>

              <div class="relative z-10 space-y-8">
                <div class="flex items-center justify-between p-6 rounded-2xl border border-neutral-100">
                  <div class="flex items-center gap-4">
                    <div class="p-3 bg-white rounded-full border border-neutral-500">
                      <SunIcon v-if="settings.general.theme === 'light'" class="w-6 h-6 text-yellow-500" />
                      <MoonIcon v-else class="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p class="text-sm font-black uppercase tracking-widest text-neutral-800">System Theme</p>
                      <p class="text-xs text-gray-500">Toggle between Light and Dark visual modes</p>
                    </div>
                  </div>
                  
                  <button 
                    @click="settings.general.theme = settings.general.theme === 'light' ? 'dark' : 'light'; applyTheme(settings.general.theme)"
                    class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none"
                    :class="settings.general.theme === 'dark' ? 'border border-neutral-600 bg-gradient-to-r from-indigo-900 via-blue-600/40 to-black-900' : 'border border-neutral-400 bg-gradient-to-r from-neutral-200 to-yellow-600'"
                  >
                    <span
                      :class="settings.general.theme === 'dark' ? 'translate-x-7' : 'translate-x-1'"
                      class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-md"
                    />
                  </button>
                </div>

                <div class="pt-6 border-t border-gray-100">
                  <button @click="saveSettings" class="bg-red-600 text-white px-10 py-4 rounded-full font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-3 isuzu-font text-sm">
                    <SaveIcon class="w-5 h-5" /> Save
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'landing'" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            

            <!-- Car Promos Section -->
            <div class="bg-white rounded-3xl p-8 bg-white/10 backdrop-blur-none">
              <div class="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <h2 class="text-2xl md:text-4xl text-black uppercase tracking-widest isuzu-font">Car Promos</h2>
                <div class="h-[2px] flex-1 bg-red-600 hidden md:block ml-8"></div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                <div v-for="(car, idx) in landingCarPromos" :key="idx" 
                  class="group bg-white rounded-2xl overflow-hidden border border-neutral-700 duration-300 flex flex-col"
                >
                  <div class="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    <img v-if="car.image" :src="car.image" alt="Car Promo Image" 
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <span class="text-gray-400 text-xs font-bold tracking-widest uppercase">Image Coming Soon</span>
                    </div>

                    <label class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 cursor-pointer hover:bg-red-600 hover:text-white transition-colors z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12V8a2 2 0 012-2h12a2 2 0 012 2v4M16 12l-4-4-4 4" />
                      </svg>
                      <input type="file" accept="image/*" @change="e => handleCarImageUpload(e, idx)" class="hidden" />
                    </label>

                    <div class="absolute bottom-0 left-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-tighter">
                      Special Promo
                    </div>
                  </div>

                  <div class="p-5 flex flex-col flex-grow space-y-3">
                    <div>
                      <label class="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Model Name</label>
                      <input v-model="car.name" 
                        class="isuzu-font text-lg font-bold w-full bg-neutral-50 border border-neutral-500/40 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-red-500 transition-all" 
                        placeholder="Ex: ISUZU D-MAX" type="text" 
                      />
                    </div>

                    <div>
                      <label class="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Details</label>
                      <textarea v-model="car.description" 
                        class="text-xs text-neutral-600 w-full bg-neutral-50 border border-neutral-500/40 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-red-500 resize-none h-20 transition-all" 
                        placeholder="Add specifications or promo details..."
                      ></textarea>
                    </div>

                    <div>
                      <label class="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Offer / Monthly</label>
                      <input v-model="car.promo" 
                        class="text-red-600 font-black text-xl w-full bg-red-50/50 border border-neutral-500/40 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-red-500 transition-all" 
                        placeholder="₱ 15,000 / month" type="text" 
                      />
                    </div>

                    <div class="pt-2 flex justify-between items-center">
                      <button @click="removeCarPromo(idx)" class="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Card
                      </button>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-center min-h-[300px] border-2 border-dashed border-neutral-300 rounded-2xl hover:border-red-500 transition-colors group">
                  <button @click="addCarPromo" class="flex flex-col items-center gap-3">
                    <div class="p-4 bg-neutral-100 rounded-full group-hover:bg-red-100 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-neutral-400 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span class="text-xs font-bold uppercase tracking-widest text-neutral-500 group-hover:text-red-600">Add New Promo</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Parts Promos Section -->
            <div class="bg-white rounded-3xl p-8 bg-white/10 backdrop-blur-none">
              <div class="flex flex-col md:flex-row-reverse md:items-center justify-between mb-10 gap-4">
                <h2 class="text-2xl md:text-4xl text-black uppercase tracking-widest isuzu-font">Parts Promos</h2>
                <div class="h-[2px] flex-1 bg-red-600 hidden md:block mr-8"></div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                <div v-for="(part, idx) in landingPartsPromos" :key="idx" 
                  class="group bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-700 hover:bg-neutral-900 transition-all duration-300 flex flex-col"
                >
                  <div class="relative h-48 bg-neutral-700 overflow-hidden">
                    <img v-if="part.image" :src="part.image" alt="Part Promo Image" 
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <span class="text-neutral-500 text-[10px] font-bold tracking-widest uppercase">Preview N/A</span>
                    </div>

                    <label class="absolute top-3 right-3 bg-neutral-900/80 backdrop-blur-md text-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-red-600 transition-colors z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12V8a2 2 0 012-2h12a2 2 0 012 2v4M16 12l-4-4-4 4" />
                      </svg>
                      <input type="file" accept="image/*" @change="e => handlePartImageUpload(e, idx)" class="hidden" />
                    </label>
                    
                    <div class="absolute bottom-0 left-0 bg-neutral-900 text-red-500 text-[10px] font-bold px-3 py-1 uppercase tracking-tighter border-tr border-neutral-700">
                      Genuine Parts
                    </div>
                  </div>

                  <div class="p-6 flex flex-col flex-grow space-y-4">
                    <div>
                      <label class="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Item Name</label>
                      <input v-model="part.name" 
                        class="isuzu-font text-base font-bold w-full bg-neutral-900/50 border border-neutral-700 text-red-500 rounded-lg px-3 py-2 outline-none focus:border-red-600 transition-all" 
                        placeholder="Part Name" type="text" 
                      />
                    </div>

                    <div>
                      <label class="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Specifications</label>
                      <textarea v-model="part.description" 
                        class="text-xs text-neutral-300 w-full bg-neutral-900/50 border border-neutral-700 rounded-lg px-3 py-2 outline-none focus:border-red-600 resize-none h-20 transition-all" 
                        placeholder="Description"
                      ></textarea>
                    </div>

                    <div>
                      <label class="text-[10px] uppercase font-bold text-neutral-500 mb-1 block">Current Offer</label>
                      <input v-model="part.promo" 
                        class="text-lg font-black text-white w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 outline-none focus:border-red-600 transition-all" 
                        placeholder="Promo Price" type="text" 
                      />
                    </div>

                    <div class="pt-2">
                      <button @click="removePartPromo(idx)" class="text-[10px] font-bold text-neutral-500 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove Item
                      </button>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-center min-h-[400px] border-2 border-dashed border-neutral-700 rounded-2xl hover:border-red-600 transition-all group cursor-pointer" @click="addPartPromo">
                  <div class="flex flex-col items-center gap-3">
                    <div class="p-4 bg-neutral-800 rounded-full group-hover:bg-red-600 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-neutral-500 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span class="text-xs font-bold uppercase tracking-widest text-neutral-500 group-hover:text-red-500">Add Part Promo</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Save Promos Button -->
            <div class="flex justify-end mt-8">
              <button @click="savePromos" :disabled="isSaving" class="bg-red-600 hover:bg-neutral-900 text-white px-8 py-3 rounded-full text-lg font-bold uppercase tracking-widest duration-300disabled:opacity-50">
                <SaveIcon class="w-8 h-8 inline-block mr-2" />
                {{ isSaving ? 'Saving...' : 'Save Promos' }}
              </button>
            </div>

            <div class="bg-neutral-700 rounded-3xl border border-neutral-800 p-8 text-white relative overflow-hidden">
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
            <div v-if="activeTab === 'landing'" class="bg-white rounded-3xl p-8 bg-white/10  backdrop-blur-none">
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
              <button @click="saveLandingContent" class="group bg-red-600 text-white px-16 py-5 rounded-full font-black text-xl flex items-center gap-4 isuzu-font">
                <SaveIcon class="w-7 h-7" /> Save Changes
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
  Loader2Icon, CheckCircleIcon, XCircleIcon,
  MoonIcon, SunIcon
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