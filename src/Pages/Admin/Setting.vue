<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-white px-4">
    <Loaders />
  </div>

  <div v-else :class="themeClass" :style="themeStyle" class="min-h-screen flex flex-col font-sans relative overflow-hidden bg-gray-50">
    
    <div class="absolute top-0 left-0 w-full z-0 opacity-10 pointer-events-none">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
        <path d="M0 15 H280 L330 45 H500" stroke="#cc0000" stroke-width="2" />
      </svg>
    </div>

    <header class="relative z-10 px-4 py-4 md:px-8 md:py-6 flex flex-col sm:flex-row justify-between items-center gap-4 backdrop-blur-none border-b border-gray-200 sm:border-none">
      <div class="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
        <div class="bg-red-600 p-2 rounded-lg shrink-0">
          <SettingsIcon class="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div>
          <h1 class="text-lg md:text-2xl font-black isuzu-font uppercase tracking-widest text-neutral-800 leading-tight">
            System <span class="text-red-600">Settings</span>
          </h1>
          <p class="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">System Configuration</p>
        </div>
      </div>

      <div class="flex items-center justify-between sm:justify-end gap-4 md:gap-6 w-full sm:w-auto">
        <div v-if="user" class="text-right border-r pr-4 md:pr-6 border-gray-300">
          <p class="text-xs md:text-sm font-bold text-neutral-800 uppercase tracking-tight truncate max-w-30 md:max-w-none">
            {{ user.displayName || user.email }}
          </p>
          <p class="text-[8px] md:text-[10px] text-red-600 font-bold uppercase tracking-widest">{{ userRole }}</p>
        </div>
        
        <button
          @click="handleLogout"
          :disabled="isLoggingOut"
          class="group flex items-center gap-2 bg-red-600 text-white px-4 py-2 md:px-6 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all duration-300 disabled:opacity-50 shrink-0"
        >
          <LogOutIcon class="w-3 h-3 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" /> 
          {{ isLoggingOut ? '...' : 'Logout' }}
        </button>
      </div>
    </header>

    <main class="flex-1 relative z-10 overflow-x-hidden overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 py-6 md:p-8">
        
        <div class="flex space-x-2 mb-8 bg-neutral-400/20 p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar">
          <button 
            @click="activeTab = 'general'" 
            :class="activeTab === 'general' ? 'bg-white text-red-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'"
            class="px-4 py-2.5 md:px-8 md:py-3 flex items-center gap-2 transition-all rounded-xl font-bold uppercase text-[10px] md:text-xs tracking-widest isuzu-font whitespace-nowrap"
          >
            <UserIcon class="w-3.5 h-3.5 md:w-4 md:h-4" /> General
          </button>
          <button 
            @click="activeTab = 'landing'" 
            :class="activeTab === 'landing' ? 'bg-white text-red-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'"
            class="px-4 py-2.5 md:px-8 md:py-3 flex items-center gap-2 transition-all rounded-xl font-bold uppercase text-[10px] md:text-xs tracking-widest isuzu-font whitespace-nowrap"
          >
            <LayoutIcon class="w-3.5 h-3.5 md:w-4 md:h-4" /> Landing Editor
          </button>
          <button 
            @click="activeTab = 'database'" 
            :class="activeTab === 'database' ? 'bg-white text-red-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'"
            class="px-4 py-2.5 md:px-8 md:py-3 flex items-center gap-2 transition-all rounded-xl font-bold uppercase text-[10px] md:text-xs tracking-widest isuzu-font whitespace-nowrap"
          >
            <DatabaseIcon class="w-3.5 h-3.5 md:w-4 md:h-4" /> Database
          </button>
          <button 
            @click="activeTab = 'roleposition'" 
            :class="activeTab === 'roleposition' ? 'bg-white text-red-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'"
            class="px-4 py-2.5 md:px-8 md:py-3 flex items-center gap-2 transition-all rounded-xl font-bold uppercase text-[10px] md:text-xs tracking-widest isuzu-font whitespace-nowrap"
          >
            <ShieldIcon class="w-3.5 h-3.5 md:w-4 md:h-4" /> Role & Position
          </button>
        </div>

        <TransitionGroup name="slide-fade">
          <div v-if="isSaving" key="saving" class="fixed bottom-4 right-4 md:bottom-10 md:right-10 bg-neutral-800 text-white px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-2xl z-50 flex items-center gap-3 md:gap-4 border-b-4 border-blue-500">
            <Loader2Icon class="w-4 h-4 md:w-5 md:h-5 animate-spin text-blue-400" /> 
            <span class="text-[10px] md:text-sm font-bold uppercase tracking-widest">Saving...</span>
          </div>
          <div v-if="saveSuccess" key="success" class="fixed bottom-4 right-4 md:bottom-10 md:right-10 bg-neutral-800 text-white px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-2xl z-50 flex items-center gap-3 md:gap-4 border-b-4 border-green-500">
            <CheckCircleIcon class="w-4 h-4 md:w-5 md:h-5 text-green-400" /> 
            <span class="text-[10px] md:text-sm font-bold uppercase tracking-widest">Promos Updated</span>
          </div>
        </TransitionGroup>

        <div class="space-y-6 md:space-y-8 pb-20">
          
          <div v-if="activeTab === 'general'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 md:p-10 relative overflow-hidden max-w-2xl border border-gray-200">
              <div class="absolute top-0 right-0 p-4 opacity-5 hidden sm:block">
                <Settings2Icon class="w-24 h-24 md:w-32 md:h-32 text-neutral-900" />
              </div>

              <h2 class="text-lg md:text-xl font-black mb-6 md:mb-10 flex items-center gap-3 uppercase tracking-tighter text-neutral-800">
                <span class="w-1.5 h-6 md:w-2 md:h-8 bg-red-600 rounded-full"></span> Interface Preferences
              </h2>

              <div class="relative z-10 space-y-6 md:space-y-8">
                <div class="flex items-center justify-between p-4 md:p-6 rounded-2xl bg-white/50 border border-gray-100">
                  <div class="flex items-center gap-3 md:gap-4">
                    <div class="p-2 md:p-3 bg-white rounded-full border border-neutral-300 shrink-0">
                      <SunIcon v-if="settings.general.theme === 'light'" class="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
                      <MoonIcon v-else class="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p class="text-[10px] md:text-sm font-black uppercase tracking-widest text-neutral-800">System Theme</p>
                      <p class="text-[9px] md:text-xs text-gray-500">Toggle visual modes</p>
                    </div>
                  </div>
                  
                  <button 
                    @click="settings.general.theme = settings.general.theme === 'light' ? 'dark' : 'light'; applyTheme(settings.general.theme)"
                    class="relative inline-flex h-7 w-12 md:h-8 md:w-14 items-center rounded-full transition-colors duration-300 focus:outline-none shrink-0"
                    :class="settings.general.theme === 'dark' ? 'border border-neutral-600 bg-neutral-400' : 'border border-neutral-400 bg-neutral-400'"
                  >
                    <span
                      :class="settings.general.theme === 'dark' ? 'translate-x-6 md:translate-x-7' : 'translate-x-1'"
                      class="inline-block h-5 w-5 md:h-6 md:w-6 transform rounded-full bg-white shadow-md transition-transform duration-300"
                    />
                  </button>
                </div>

                <div class="pt-4">
                  <button @click="saveSettings" class="w-full sm:w-auto bg-red-600 text-white px-8 py-3.5 md:px-10 md:py-4 rounded-full font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 isuzu-font text-xs md:text-sm shadow-lg hover:bg-red-700">
                    <SaveIcon class="w-4 h-4 md:w-5 md:h-5" /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'landing'" class="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div class="bg-white/40 backdrop-blur-sm rounded-3xl p-5 md:p-8 border border-gray-200">
              <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-4">
                <h2 class="text-2xl md:text-4xl text-black uppercase tracking-widest isuzu-font">Car Promos</h2>
                <div class="h-0.5 flex-1 bg-red-600 hidden md:block ml-8"></div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
                <div v-for="(car, idx) in landingCarPromos" :key="idx" class="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm flex flex-col">
                  <div class="w-full h-40 md:h-48 flex items-center justify-center bg-gray-100 relative group shrink-0">
                    <label class="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12V8a2 2 0 012-2h12a2 2 0 012 2v4M16 12l-4-4-4 4" />
                      </svg>
                      <input type="file" accept="image/*" @change="e => handleCarImageUpload(e, idx)" class="hidden" />
                    </label>
                    <img v-if="car.image" :src="car.image" alt="Car Promo Image" class="w-full h-full object-cover" />
                    <span v-else class="text-gray-400 text-[10px] font-bold">IMAGE COMING SOON</span>
                  </div>

                  <div class="p-4 md:p-5 space-y-3 flex-1 flex flex-col">
                    <input v-model="car.name" class="isuzu-font text-base md:text-lg font-bold w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-red-500" placeholder="Car Name" />
                    <textarea v-model="car.description" class="text-xs text-neutral-500 w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-red-500 resize-none h-20" placeholder="Description"></textarea>
                    <input v-model="car.promo" class="text-red-600 font-black text-base md:text-lg w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-red-500" placeholder="Promo" />
                    <input v-model="car.promoLabel" class="text-[10px] font-black text-neutral-400 uppercase tracking-widest w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-red-500" placeholder="Label (e.g. Special Offer)" />
                    <button @click="removeCarPromo(idx)" class="mt-auto pt-2 text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-tighter self-start">Remove</button>
                  </div>
                </div>

                <div class="flex items-center justify-center min-h-50 border-2 border-dashed border-neutral-300 rounded-2xl bg-white/30">
                  <button @click="addCarPromo" class="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-red-700 transition shadow-md">+ Add Car Promo</button>
                </div>
              </div>
            </div>

            <div class="bg-white/40 backdrop-blur-sm rounded-3xl p-5 md:p-8 border border-gray-200">
              <div class="flex flex-col md:flex-row-reverse md:items-center justify-between mb-8 md:mb-10 gap-4">
                <h2 class="text-2xl md:text-4xl text-black uppercase tracking-widest isuzu-font">Parts Promos</h2>
                <div class="h-0.5 flex-1 bg-red-600 hidden md:block mr-8"></div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
                <div v-for="(part, idx) in landingPartsPromos" :key="idx" class="bg-neutral-800 text-white rounded-2xl overflow-hidden hover:bg-neutral-900 transition-all flex flex-col">
                  <div class="w-full h-36 md:h-40 flex items-center justify-center bg-white/10 relative group shrink-0">
                    <label class="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12V8a2 2 0 012-2h12a2 2 0 012 2v4M16 12l-4-4-4 4" />
                      </svg>
                      <input type="file" accept="image/*" @change="e => handlePartImageUpload(e, idx)" class="hidden" />
                    </label>
                    <img v-if="part.image" :src="part.image" alt="Part Promo Image" class="w-full h-full object-cover" />
                    <span v-else class="text-gray-400 text-[10px] font-bold">PREVIEW N/A</span>
                  </div>

                  <div class="p-5 md:p-6 space-y-3 flex-1 flex flex-col">
                    <input v-model="part.name" class="font-bold text-sm md:text-base isuzu-font text-red-500 w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-3 py-2 outline-none focus:border-red-500" placeholder="Part Name" />
                    <textarea v-model="part.description" class="text-xs opacity-60 w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-3 py-2 outline-none focus:border-red-500 resize-none h-16" placeholder="Description"></textarea>
                    <input v-model="part.promo" class="text-base md:text-lg font-black text-white w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-3 py-2 outline-none focus:border-red-500" placeholder="Promo" />
                    <select v-model="part.partsType" class="text-[10px] font-black uppercase tracking-widest w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-3 py-2 outline-none focus:border-red-500">
                      <option value="Genuine Parts">Genuine Parts</option>
                      <option value="Best Value Parts">Best Value Parts</option>
                      <option value="Select Parts">Select Parts</option>
                    </select>
                    <button @click="removePartPromo(idx)" class="mt-auto pt-2 text-[10px] text-red-400 hover:underline self-start uppercase font-bold">Remove</button>
                  </div>
                </div>

                <div class="flex items-center justify-center min-h-50 border-2 border-dashed border-neutral-500/30 rounded-2xl">
                  <button @click="addPartPromo" class="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-red-700 transition shadow-md">+ Add Part Promo</button>
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row justify-end gap-4 mt-8">
              <button @click="savePromos" :disabled="isSaving" class="w-full sm:w-auto bg-neutral-800 text-white px-8 py-3.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all duration-300 shadow-lg disabled:opacity-50 flex justify-center items-center">
                <SaveIcon class="w-4 h-4 mr-2" />
                {{ isSaving ? 'Saving...' : 'Draft Save' }}
              </button>
            </div>

            <div class="bg-neutral-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
              <div class="absolute -bottom-10 -right-10 opacity-10 pointer-events-none">
                <TargetIcon class="w-48 h-48 md:w-64 md:h-64 text-white" />
              </div>
              <h2 class="text-lg md:text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-widest relative z-10">
                <span class="w-1.5 h-6 md:w-2 md:h-8 bg-red-600 rounded-full"></span> Brand Identity
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div class="space-y-2">
                  <label class="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Mission</label>
                  <textarea v-model="missionText" placeholder="Mission Statement" rows="4" class="w-full p-4 bg-neutral-700/50 border border-neutral-600 rounded-xl outline-none focus:border-red-500 text-xs md:text-sm leading-relaxed"></textarea>
                </div>
                <div class="space-y-2">
                  <label class="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Vision</label>
                  <textarea v-model="visionText" placeholder="Vision Statement" rows="4" class="w-full p-4 bg-neutral-700/50 border border-neutral-600 rounded-xl outline-none focus:border-red-500 text-xs md:text-sm leading-relaxed"></textarea>
                </div>
                <div class="space-y-2">
                  <label class="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Core Values</label>
                  <textarea v-model="valuesText" placeholder="Values..." rows="4" class="w-full p-4 bg-neutral-700/50 border border-neutral-600 rounded-xl outline-none focus:border-red-500 text-xs md:text-sm leading-relaxed"></textarea>
                </div>
              </div>
            </div>

            <div class="bg-white/40 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-gray-200 mt-8">
              <h2 class="text-xl md:text-2xl font-black mb-8 md:mb-10 flex items-center gap-3 uppercase tracking-tighter text-neutral-800 isuzu-font">
                <TagIcon class="w-6 h-6 md:w-7 md:h-7 text-red-600" /> 
                About Us <span class="text-red-600">Editor</span>
              </h2>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                <div class="space-y-6">
                  <div>
                    <label class="block text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">About Us Text (Line 1)</label>
                    <input v-model="aboutUsTextLine1" class="w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-xs md:text-sm font-medium outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label class="block text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">About Us Text (Line 2)</label>
                    <input v-model="aboutUsTextLine2" class="w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-xs md:text-sm font-medium outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label class="block text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">Slogan</label>
                    <input v-model="sloganText" class="w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-sm md:text-base font-bold outline-none focus:border-red-500" />
                    <p v-if="aboutUsSaveSuccess" class="mt-2 text-green-600 text-[10px] font-bold">Slogan updated!</p>
                  </div>
                </div>

                <div class="bg-white/50 p-6 md:p-8 rounded-2xl border border-neutral-200">
                  <h3 class="font-black text-[10px] uppercase tracking-widest text-neutral-400 mb-4">Live Preview</h3>
                  <div class="space-y-4">
                    <p class="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ aboutUsTextLine1 }}</p>
                    <p class="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ aboutUsTextLine2 }}</p>
                    <p class="isuzu-font text-red-600 tracking-[0.15em] text-base md:text-xl font-black mt-6">{{ sloganText }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-center pt-10 pb-16">
              <button @click="saveLandingContent" class="group w-full sm:w-auto bg-red-600 text-white px-8 md:px-16 py-4 md:py-6 rounded-full font-black text-base md:text-xl shadow-[0_20px_50px_rgba(204,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(204,0,0,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 isuzu-font">
                <SaveIcon class="w-5 h-5 md:w-7 md:h-7" /> UPDATE LIVE WEBSITE
              </button>
            </div>

          </div>

          <div v-if="activeTab === 'database'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 md:p-10 relative overflow-hidden max-w-4xl border border-gray-200">
              <div class="absolute top-0 right-0 p-4 opacity-5 hidden sm:block">
                <DatabaseIcon class="w-24 h-24 md:w-32 md:h-32 text-neutral-900" />
              </div>

              <h2 class="text-lg md:text-xl font-black mb-6 md:mb-10 flex items-center gap-3 uppercase tracking-tighter text-neutral-800">
                <span class="w-1.5 h-6 md:w-2 md:h-8 bg-red-600 rounded-full"></span> Database Synchronization
              </h2>

              <div class="relative z-10 space-y-6 md:space-y-8">
                <div class="p-4 md:p-6 rounded-2xl bg-white/50 border border-gray-100">
                  <div class="flex items-center gap-3 md:gap-4 mb-4">
                    <div class="p-2 md:p-3 bg-neutral-900 rounded-full border border-neutral-300 shrink-0">
                      <RefreshCw class="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <p class="text-[10px] md:text-sm font-black uppercase tracking-widest text-neutral-800">Firestore to MySQL Sync</p>
                      <p class="text-[9px] md:text-xs text-gray-500">Synchronize Firestore data to MySQL database</p>
                    </div>
                  </div>
                  
                  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
                    <div v-if="syncing" class="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                      <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                      </span>
                      <span class="text-[9px] font-black uppercase tracking-widest text-yellow-600">Database Handshake in Progress</span>
                    </div>
                    <div v-else class="text-[9px] md:text-xs text-gray-400">
                      Last sync: <span class="font-bold text-neutral-600">Not available</span>
                    </div>

                    <button
                      @click="runSync"
                      :disabled="syncing"
                      class="group relative overflow-hidden flex items-center gap-3 bg-neutral-900 dark:bg-red-600 text-white px-6 py-3 rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed border border-white/10"
                    >
                      <div class="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <RefreshCw 
                        :class="['w-4 h-4 transition-transform duration-700', syncing ? 'animate-spin' : 'group-hover:rotate-180']" 
                      />
                      
                      <span class="text-[11px] font-black uppercase tracking-[0.2em] isuzu-font relative z-10">
                        <span v-if="!syncing">Sync Firestore <span class="text-red-500 dark:text-red-200">to MySQL</span></span>
                        <span v-else>Processing Data Transfer...</span>
                      </span>
                    </button>
                  </div>
                </div>

                <div class="p-4 md:p-6 rounded-2xl bg-neutral-800 text-white border border-neutral-700">
                  <h3 class="text-[10px] md:text-xs font-black uppercase tracking-widest mb-3 text-gray-400">Sync Information</h3>
                  <p class="text-xs md:text-sm leading-relaxed text-gray-300">
                    This operation will synchronize all Firestore data to the MySQL database. 
                    This includes inventory items, transactions, user data, and system configurations.
                    The process may take a few minutes depending on the data size.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'roleposition'" class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <!-- Roles Management Section -->
            <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 md:p-10 relative overflow-hidden border border-gray-200">
              <div class="absolute top-0 right-0 p-4 opacity-5 hidden sm:block">
                <ShieldIcon class="w-24 h-24 md:w-32 md:h-32 text-neutral-900" />
              </div>

              <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-10 gap-4">
                <h2 class="text-lg md:text-xl font-black flex items-center gap-3 uppercase tracking-tighter text-neutral-800">
                  <span class="w-1.5 h-6 md:w-2 md:h-8 bg-red-600 rounded-full"></span> Roles Management
                </h2>
                <button 
                  @click="showAddRoleModal = true"
                  type="button"
                  class="relative bg-green-600 text-white px-4 py-3 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-green-700 active:bg-green-800 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px] shadow-md hover:shadow-lg whitespace-nowrap select-none touch-manipulation w-full sm:w-auto cursor-pointer"
                >
                  <PlusIcon class="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" /> 
                  <span>Add Role</span>
                </button>
              </div>

              <div class="relative z-10">
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="border-b border-gray-200">
                        <th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Role Name</th>
                        <th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="role in roles" :key="role.id" class="border-b border-gray-100 hover:bg-gray-50/50">
                        <td class="py-3 px-4">
                          <input 
                            v-if="editingRole && editingRole.id === role.id"
                            v-model="editingRole.roleName"
                            class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-red-500"
                          />
                          <span v-else class="text-sm font-medium text-neutral-800">{{ role.roleName }}</span>
                        </td>
                        <td class="py-3 px-4 text-right">
                          <div class="flex items-center justify-end gap-2">
                            <button 
                              v-if="editingRole && editingRole.id === role.id"
                              @click="saveRoleEdit"
                              class="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                            >
                              <CheckCircleIcon class="w-4 h-4" />
                            </button>
                            <button 
                              v-if="editingRole && editingRole.id === role.id"
                              @click="cancelRoleEdit"
                              class="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                            >
                              <XIcon class="w-4 h-4" />
                            </button>
                            <button 
                              v-else
                              @click="startEditRole(role)"
                              class="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                              <PencilIcon class="w-4 h-4" />
                            </button>
                            <button 
                              @click="deleteRole(role)"
                              class="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                              <TrashIcon class="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="roles.length === 0">
                        <td colspan="2" class="py-8 text-center text-gray-400 text-sm">No roles found</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Positions Management Section -->
            <div class="bg-white/40 backdrop-blur-sm rounded-2xl p-6 md:p-10 relative overflow-hidden border border-gray-200">
              <div class="absolute top-0 right-0 p-4 opacity-5 hidden sm:block">
                <UserIcon class="w-24 h-24 md:w-32 md:h-32 text-neutral-900" />
              </div>

              <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-10 gap-4">
                <h2 class="text-lg md:text-xl font-black flex items-center gap-3 uppercase tracking-tighter text-neutral-800">
                  <span class="w-1.5 h-6 md:w-2 md:h-8 bg-red-600 rounded-full"></span> Positions Management
                </h2>
                <button 
                  @click="showAddPositionModal = true"
                  type="button"
                  class="relative bg-green-600 text-white px-4 py-3 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-green-700 active:bg-green-800 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px] shadow-md hover:shadow-lg whitespace-nowrap select-none touch-manipulation w-full sm:w-auto cursor-pointer"
                >
                  <PlusIcon class="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" /> 
                  <span>Add Position</span>
                </button>
              </div>

              <div class="relative z-10">
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="border-b border-gray-200">
                        <th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Position Name</th>
                        <th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="position in positions" :key="position.id" class="border-b border-gray-100 hover:bg-gray-50/50">
                        <td class="py-3 px-4">
                          <input 
                            v-if="editingPosition && editingPosition.id === position.id"
                            v-model="editingPosition.position"
                            class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-red-500"
                          />
                          <span v-else class="text-sm font-medium text-neutral-800">{{ position.position }}</span>
                        </td>
                        <td class="py-3 px-4 text-right">
                          <div class="flex items-center justify-end gap-2">
                            <button 
                              v-if="editingPosition && editingPosition.id === position.id"
                              @click="savePositionEdit"
                              class="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                            >
                              <CheckCircleIcon class="w-4 h-4" />
                            </button>
                            <button 
                              v-if="editingPosition && editingPosition.id === position.id"
                              @click="cancelPositionEdit"
                              class="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                            >
                              <XIcon class="w-4 h-4" />
                            </button>
                            <button 
                              v-else
                              @click="startEditPosition(position)"
                              class="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                              <PencilIcon class="w-4 h-4" />
                            </button>
                            <button 
                              @click="deletePosition(position)"
                              class="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                              <TrashIcon class="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="positions.length === 0">
                        <td colspan="2" class="py-8 text-center text-gray-400 text-sm">No positions found</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>

    <!-- Add Role Modal - Moved outside main container -->
    <div v-if="showAddRoleModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-black uppercase tracking-tight text-neutral-800">Add New Role</h3>
          <button @click="showAddRoleModal = false" class="p-2 hover:bg-gray-100 rounded-lg transition">
            <XIcon class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Role Name</label>
            <input 
              v-model="newRoleName"
              placeholder="e.g., Manager, Supervisor"
              class="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-red-500"
            />
          </div>
          <div class="flex gap-3 pt-4">
            <button 
              @click="showAddRoleModal = false"
              class="flex-1 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border border-gray-200 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button 
              @click="addRole"
              :disabled="!newRoleName.trim()"
              class="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition disabled:opacity-50"
            >
              Add Role
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Position Modal - Moved outside main container -->
    <div v-if="showAddPositionModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-black uppercase tracking-tight text-neutral-800">Add New Position</h3>
          <button @click="showAddPositionModal = false" class="p-2 hover:bg-gray-100 rounded-lg transition">
            <XIcon class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Position Name</label>
            <input 
              v-model="newPositionName"
              placeholder="e.g., Sales Associate, Technician"
              class="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-red-500"
            />
          </div>
          <div class="flex gap-3 pt-4">
            <button 
              @click="showAddPositionModal = false"
              class="flex-1 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border border-gray-200 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button 
              @click="addPosition"
              :disabled="!newPositionName.trim()"
              class="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition disabled:opacity-50"
            >
              Add Position
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="absolute bottom-0 left-0 w-full z-0 opacity-10 pointer-events-none transform rotate-180">
      <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
        <path d="M0 45 H170 L220 15 H500" stroke="#cc0000" stroke-width="2" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAuth } from "../../composables/useAuth";
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../../Firebase/Firebase";
import Loaders from "../../components/Loaders.vue";

import {
  SettingsIcon, LogOutIcon, UserIcon,
  UserCogIcon, SaveIcon,
  Loader2Icon, CheckCircleIcon, XCircleIcon,
  MoonIcon, SunIcon, LayoutIcon, Database as DatabaseIcon, RefreshCw,
  ShieldIcon, PlusIcon, PencilIcon, TrashIcon, XIcon
} from "lucide-vue-next";

// Add/Remove Car and Part Promo handlers
function addCarPromo() {
  landingCarPromos.value.push({
    name: "",
    description: "",
    promo: "",
    promoLabel: "Special Offer",
    image: ""
  });
}

function addPartPromo() {
  landingPartsPromos.value.push({
    name: "",
    description: "",
    promo: "",
    partsType: "Genuine Parts",
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
      landingCarPromos.value.forEach(car => {
        if (!('promoLabel' in car)) car.promoLabel = 'Special Offer';
      });
      landingPartsPromos.value = Array.isArray(data.partsPromos) ? JSON.parse(JSON.stringify(data.partsPromos)) : [];
      landingPartsPromos.value.forEach(part => {
        if (!('partsType' in part)) part.partsType = 'Genuine Parts';
      });
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
    landingCarPromos.value.forEach(car => {
      if (!('image' in car)) car.image = '';
      if (!('promoLabel' in car)) car.promoLabel = 'Special Offer';
    });
    landingPartsPromos.value.forEach(part => {
      if (!('image' in part)) part.image = '';
      if (!('partsType' in part)) part.partsType = 'Genuine Parts';
    });
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
const syncing = ref(false);

/* ===== ROLE & POSITION MANAGEMENT ===== */
const roles = ref([]);
const positions = ref([]);
const newRoleName = ref("");
const newPositionName = ref("");
const editingRole = ref(null);
const editingPosition = ref(null);
const showAddRoleModal = ref(false);
const showAddPositionModal = ref(false);

// Fetch roles from Role_Access collection
const fetchRoles = async () => {
  try {
    const roleSnapshot = await getDocs(collection(db, 'Role_Access'));
    roles.value = roleSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).filter(role => role.roleName);
  } catch (err) {
    console.error('Error fetching roles:', err);
  }
};

// Fetch positions from Position_Access collection
const fetchPositions = async () => {
  try {
    const positionSnapshot = await getDocs(collection(db, 'Position_Access'));
    positions.value = positionSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).filter(position => position.position);
  } catch (err) {
    console.error('Error fetching positions:', err);
  }
};

// Get next role ID (101, 102, 103...)
const getNextRoleId = () => {
  let maxId = 100;
  roles.value.forEach(role => {
    const match = role.id.match(/(\d+)$/);
    if (match) {
      const id = parseInt(match[1]);
      if (id > maxId) maxId = id;
    }
  });
  return maxId + 1;
};

// Get next position ID (201, 202, 203...)
const getNextPositionId = () => {
  let maxId = 200;
  positions.value.forEach(position => {
    const match = position.id.match(/(\d+)$/);
    if (match) {
      const id = parseInt(match[1]);
      if (id > maxId) maxId = id;
    }
  });
  return maxId + 1;
};

// Helper function to convert text to title case (sentence case)
const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// Add new role
const addRole = async () => {
  if (!newRoleName.value.trim()) return;
  
  try {
    const formattedRoleName = toTitleCase(newRoleName.value.trim());
    const nextId = getNextRoleId();
    const roleKey = formattedRoleName.toLowerCase().replace(/\s+/g, '&');
    const docId = `isuzu&calapan&${roleKey}${nextId}`;
    
    await setDoc(doc(db, 'Role_Access', docId), {
      roleName: formattedRoleName
    });
    
    await fetchRoles();
    newRoleName.value = "";
    showAddRoleModal.value = false;
    alert('Role added successfully!');
  } catch (err) {
    console.error('Error adding role:', err);
    alert('Failed to add role');
  }
};

// Add new position
const addPosition = async () => {
  if (!newPositionName.value.trim()) return;
  
  try {
    const formattedPositionName = toTitleCase(newPositionName.value.trim());
    const nextId = getNextPositionId();
    const docId = `isuzu$calapan$position${nextId}`;
    
    await setDoc(doc(db, 'Position_Access', docId), {
      position: formattedPositionName
    });
    
    await fetchPositions();
    newPositionName.value = "";
    showAddPositionModal.value = false;
    alert('Position added successfully!');
  } catch (err) {
    console.error('Error adding position:', err);
    alert('Failed to add position');
  }
};

// Start editing role
const startEditRole = (role) => {
  editingRole.value = { ...role };
};

// Cancel role edit
const cancelRoleEdit = () => {
  editingRole.value = null;
};

// Save role edit
const saveRoleEdit = async () => {
  if (!editingRole.value || !editingRole.value.roleName.trim()) return;
  
  try {
    const formattedRoleName = toTitleCase(editingRole.value.roleName.trim());
    await setDoc(doc(db, 'Role_Access', editingRole.value.id), {
      roleName: formattedRoleName
    });
    
    await fetchRoles();
    editingRole.value = null;
    alert('Role updated successfully!');
  } catch (err) {
    console.error('Error updating role:', err);
    alert('Failed to update role');
  }
};

// Start editing position
const startEditPosition = (position) => {
  editingPosition.value = { ...position };
};

// Cancel position edit
const cancelPositionEdit = () => {
  editingPosition.value = null;
};

// Save position edit
const savePositionEdit = async () => {
  if (!editingPosition.value || !editingPosition.value.position.trim()) return;
  
  try {
    const formattedPositionName = toTitleCase(editingPosition.value.position.trim());
    await setDoc(doc(db, 'Position_Access', editingPosition.value.id), {
      position: formattedPositionName
    });
    
    await fetchPositions();
    editingPosition.value = null;
    alert('Position updated successfully!');
  } catch (err) {
    console.error('Error updating position:', err);
    alert('Failed to update position');
  }
};

// Delete role
const deleteRole = async (role) => {
  if (!confirm(`Are you sure you want to delete the role "${role.roleName}"?`)) return;
  
  try {
    await deleteDoc(doc(db, 'Role_Access', role.id));
    await fetchRoles();
    alert('Role deleted successfully!');
  } catch (err) {
    console.error('Error deleting role:', err);
    alert('Failed to delete role');
  }
};

// Delete position
const deletePosition = async (position) => {
  if (!confirm(`Are you sure you want to delete the position "${position.position}"?`)) return;
  
  try {
    await deleteDoc(doc(db, 'Position_Access', position.id));
    await fetchPositions();
    alert('Position deleted successfully!');
  } catch (err) {
    console.error('Error deleting position:', err);
    alert('Failed to delete position');
  }
};

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

// Database sync function
const runSync = async () => {
  syncing.value = true;
  try {
    const response = await fetch('/api/sync', { method: 'POST' });
    const result = await response.json();
    if (result.success) {
      alert('Database sync completed successfully!');
    } else {
      alert('Sync failed: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Sync error:', error);
    alert('Sync failed: ' + error.message);
  } finally {
    syncing.value = false;
  }
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
  
  // Fetch roles and positions
  await fetchRoles();
  await fetchPositions();
  
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