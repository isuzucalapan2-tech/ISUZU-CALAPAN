<template>
  <div class="font-sans text-neutral-800 overflow-x-hidden bg-white">
    
    <header class="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100">
      <div class="max-w-7xl mx-auto flex justify-between items-center py-3 px-4 md:px-6">
        <div class="flex items-center space-x-3">
          <img src="/mdoLogo.png" alt="Logo" class="w-10 h-10 object-contain" />
          <div class="leading-tight">
            <h1 class="text-xs md:text-sm font-bold uppercase tracking-tight">
              <span class="text-blue-800">Mina</span>
              <span class="text-yellow-500"> De </span>
              <span class="text-red-600">Oro</span>
            </h1>
            <p class="text-[8px] md:text-[10px] font-bold text-neutral-900 uppercase tracking-[0.2em]">Motors inc.</p>
          </div>
        </div>

        <nav class="flex space-x-4 isuzu-font text-[10px] md:text-xs uppercase font-black tracking-widest">
          <router-link to="/register" class="text-neutral-800 hover:text-red-600 transition">Sign Up</router-link>
          <router-link to="/login" class="text-neutral-800 hover:text-red-600 transition">Login</router-link>
        </nav>
      </div>
    </header>

    <div class="pt-14 md:pt-0">

      <section id="hero" class="relative min-h-[75vh] md:min-h-screen flex flex-col bg-cover bg-center overflow-hidden" style="background-image: url('/LDbg.webp');">
        <div class="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-neutral-900"></div>
        
        <div class="absolute top-16 md:top-24 left-0 w-full z-0 opacity-70 pointer-events-none">
          <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full scale-150 md:scale-100">
            <path d="M-50 40 L150 40 L190 25 L550 25" stroke="#DC2626" stroke-width="1.5" />
          </svg>
        </div>

        <div class="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex-grow flex flex-col justify-end md:justify-center pt-52 md:pt-72 pb-20 md:pb-32">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            <div class="text-white space-y-4 text-center md:text-left">
              <div class="space-y-1 inline-block md:block">
                <h1 class="uppercase leading-none isuzu-font">
                  <span class="block text-5xl md:text-8xl tracking-tighter">ISUZU</span>
                  <span class="block text-xs md:text-2xl tracking-[0.4em] text-red-500 font-bold">CALAPAN CITY</span>
                </h1>
                <div class="w-full h-1 bg-red-600 mt-3 md:w-24"></div>
              </div>
              <p class="text-sm md:text-xl text-gray-300 font-medium max-w-md mx-auto md:mx-0 leading-relaxed">
                Power You Can Trust. Performance You Deserve.
              </p>
            </div>

            <div class="hidden md:flex flex-col items-end gap-6">
              <button v-for="link in navLinks" :key="link.id" @click="scrollToSection(link.id)" class="group flex items-center flex-row-reverse gap-4">
                <div class="w-12 h-[1px] bg-red-600 group-hover:w-20 transition-all duration-300"></div>
                <span class="text-white uppercase tracking-[0.2em] text-sm font-bold group-hover:text-red-500 transition-colors isuzu-font">{{ link.label }}</span>
              </button>
            </div>
          </div>

          <div class="mt-12 md:mt-16 overflow-x-auto pb-4 no-scrollbar">
            <div class="flex md:grid md:grid-cols-4 gap-4 min-w-[700px] md:min-w-full">
              <div v-for="card in heroCards" :key="card.title" class="flex-1 bg-white/5 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/10 text-white hover:bg-white/10 transition-all">
                <h3 class="text-[9px] md:text-[10px] font-black mb-2 uppercase tracking-widest text-red-500">{{ card.title }}</h3>
                <p class="text-[10px] md:text-[11px] opacity-70 leading-relaxed">{{ card.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="promos" class="relative py-20 px-6 md:px-16 bg-neutral-50 overflow-hidden">
        <div class="max-w-7xl mx-auto relative z-10">
          <div class="text-center md:text-left mb-12">
            <p class="text-red-600 text-xs font-black tracking-[0.3em] uppercase mb-2">Exclusives</p>
            <h2 class="text-3xl md:text-4xl text-black uppercase tracking-tighter isuzu-font font-black">
              Car <span class="text-red-600">Promos</span>
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            <div v-for="car in carPromos" :key="car.name" class="bg-white rounded-3xl overflow-hidden shadow-xl shadow-neutral-200/50 group">
              <div class="aspect-[16/10] bg-neutral-100 overflow-hidden relative">
                <img v-if="car.image" :src="car.image" class="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <div v-else class="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-neutral-400">Preview N/A</div>
                <div class="absolute top-4 right-4 bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase italic">{{ car.promo }}</div>
              </div>
              <div class="p-6">
                <h3 class="text-sm font-black isuzu-font uppercase tracking-wider mb-2">{{ car.name }}</h3>
                <p class="text-xs text-neutral-500 font-medium mb-4 line-clamp-2">{{ car.description }}</p>
                <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{{ car.promoLabel || 'Limited Time Offer' }}</div>
              </div>
            </div>
          </div>

          <div class="text-center md:text-left mb-12">
            <p class="text-red-600 text-xs font-black tracking-[0.3em] uppercase mb-2">Maintenance</p>
            <h2 class="text-3xl md:text-4xl text-black uppercase tracking-tighter isuzu-font font-black">
              Parts <span class="text-red-600">Promos</span>
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="part in partsPromos" :key="part.name" class="bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800">
              <div class="aspect-video bg-neutral-800 relative">
                <img v-if="part.image" :src="part.image" class="w-full h-full object-cover opacity-80" />
                <div class="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent"></div>
              </div>
              <div class="p-6 -mt-10 relative z-10">
                <h3 class="text-sm font-black isuzu-font uppercase text-red-500 mb-2">{{ part.name }}</h3>
                <p class="text-xs text-neutral-400 mb-4">{{ part.description }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-bold text-neutral-600 uppercase">{{ part.partsType }}</span>
                  <span class="text-white font-black italic">{{ part.promo }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="mission-vision" class="py-24 px-6 md:px-16 bg-white overflow-hidden relative">
        <div class="absolute top-0 right-0 w-1/2 h-full bg-neutral-50 -skew-x-12 translate-x-20 z-0 hidden md:block"></div>
        <div class="max-w-7xl mx-auto relative z-10">
          <div class="mb-16">
            <div class="w-12 h-1 bg-red-600 mb-4"></div>
            <h2 class="text-3xl md:text-5xl font-black uppercase tracking-tighter isuzu-font">Mission <span class="text-neutral-300">&</span> Vision</h2>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="p-10 rounded-3xl bg-neutral-50 border border-neutral-100 transition">
              <h3 class="text-xl mb-4 text-black font-black uppercase isuzu-font">Mission</h3>
              <p class="text-sm leading-relaxed text-neutral-600 italic">"{{ brandIdentity.mission }}"</p>
            </div>
            <div class="p-10 rounded-3xl bg-neutral-50 border border-neutral-100 transition">
              <h3 class="text-xl mb-4 text-black font-black uppercase isuzu-font">Vision</h3>
              <p class="text-sm leading-relaxed text-neutral-600 italic">"{{ brandIdentity.vision }}"</p>
            </div>
            <div class="bg-neutral-900 text-white p-10 rounded-3xl shadow-2xl">
              <h3 class="text-xl mb-8 text-red-500 font-black uppercase isuzu-font tracking-widest">Core Values</h3>
              <div class="grid grid-cols-1 gap-4 font-bold tracking-widest text-[10px] uppercase">
                <span v-for="val in brandIdentity.coreValues" :key="val" class="flex items-center gap-3">
                  <span class="w-1.5 h-1.5 bg-red-600 rounded-full"></span> {{ val }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about-us" class="relative py-24 px-6 md:px-16 bg-neutral-900 text-white flex items-center overflow-hidden">
        <div class="max-w-4xl mx-auto text-center space-y-12 relative z-10">
          <h2 class="text-3xl md:text-5xl uppercase tracking-widest isuzu-font font-black">About <span class="text-red-600">Us</span></h2>
          <div class="space-y-8 text-sm md:text-lg text-neutral-400 leading-loose max-w-3xl mx-auto">
            <p class="first-letter:text-5xl first-letter:text-red-600 first-letter:font-black first-letter:mr-3 first-letter:float-left">{{ aboutUs.aboutTextLine1 }}</p>
            <p>{{ aboutUs.aboutTextLine2 }}</p>
            <div class="pt-8">
              <p class="isuzu-font text-white border-y border-white/10 py-6 tracking-[0.4em] text-xl md:text-2xl uppercase">{{ aboutUs.slogan }}</p>
            </div>
          </div>
        </div>
      </section>

      <footer class="bg-neutral-950 py-12 pb-32 md:pb-12 text-center border-t border-white/5">
        <p class="text-[10px] text-neutral-600 uppercase tracking-[0.4em]">© 2026 Mina De Oro Motors. All Rights Reserved.</p>
      </footer>

      <nav class="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/90 backdrop-blur-xl h-16 rounded-2xl shadow-2xl z-[60] flex items-center justify-around px-4 border border-white/20">
        <button @click="scrollToSection('hero')" class="flex flex-col items-center gap-1 text-neutral-400 hover:text-red-600 transition">
          <Home class="w-5 h-5" />
          <span class="text-[8px] font-black uppercase">Home</span>
        </button>
        <button @click="scrollToSection('promos')" class="flex flex-col items-center gap-1 text-neutral-400 hover:text-red-600 transition">
          <Tag class="w-5 h-5" />
          <span class="text-[8px] font-black uppercase">Promos</span>
        </button>
        <button @click="scrollToSection('mission-vision')" class="flex flex-col items-center gap-1 text-neutral-400 hover:text-red-600 transition">
          <Target class="w-5 h-5" />
          <span class="text-[8px] font-black uppercase">Goal</span>
        </button>
        <button @click="scrollToSection('about-us')" class="flex flex-col items-center gap-1 text-neutral-400 hover:text-red-600 transition">
          <Info class="w-5 h-5" />
          <span class="text-[8px] font-black uppercase">About</span>
        </button>
      </nav>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Firebase/Firebase";
import { Home, Tag, Target, Info, ChevronUp } from "lucide-vue-next";

const navLinks = [
  { id: 'promos', label: 'Promos' },
  { id: 'mission-vision', label: 'Mission & Vision' },
  { id: 'about-us', label: 'About Us' }
];

const heroCards = [
  { title: "Eco-Friendly", desc: "Fleet designed to maximize fuel efficiency and reduce carbon footprint." },
  { title: "Community", desc: "Join monthly car meetups and workshops in Calapan City." },
  { title: "24/7 Support", desc: "Ready to assist you with inquiries and emergency services." },
  { title: "Mechanics", desc: "Skilled professionals ensuring top-notch maintenance." }
];

const carPromos = ref([]);
const partsPromos = ref([]);
const brandIdentity = ref({ mission: "", vision: "", coreValues: [] });
const aboutUs = ref({ aboutTextLine1: "", aboutTextLine2: "", slogan: "" });

onMounted(async () => {
  try {
    const snap = await getDoc(doc(db, "settings", "landingPage"));
    if (snap.exists()) {
      const data = snap.data();
      // Load all non-image fields from Firestore
      carPromos.value = Array.isArray(data.carPromos) ? JSON.parse(JSON.stringify(data.carPromos)) : [];
      // Ensure promoLabel default
      carPromos.value.forEach(car => {
        if (!('promoLabel' in car)) car.promoLabel = 'Special Offer';
      });
      partsPromos.value = Array.isArray(data.partsPromos) ? JSON.parse(JSON.stringify(data.partsPromos)) : [];
      // Ensure partsType default
      partsPromos.value.forEach(part => {
        if (!('partsType' in part)) part.partsType = 'Genuine Parts';
      });
      brandIdentity.value.mission = data.mission || "";
      brandIdentity.value.vision = data.vision || "";
      brandIdentity.value.coreValues = Array.isArray(data.values) ? data.values : (data.values ? data.values.split("\n").filter(v => v.trim() !== "") : []);
      aboutUs.value.aboutTextLine1 = data.aboutUsTextLine1 || "";
      aboutUs.value.aboutTextLine2 = data.aboutUsTextLine2 || "";
      aboutUs.value.slogan = data.sloganText || "";

      // Load base64 images from localStorage if present
      const localCarPromos = JSON.parse(localStorage.getItem('carPromosImages') || '[]');
      carPromos.value.forEach((car, idx) => {
        if (localCarPromos[idx] && localCarPromos[idx].image) {
          car.image = localCarPromos[idx].image;
        }
      });
      // Ensure parts promos images are synced and shown
      const localPartsPromos = JSON.parse(localStorage.getItem('partsPromosImages') || '[]');
      partsPromos.value.forEach((part, idx) => {
        if (localPartsPromos[idx] && localPartsPromos[idx].image) {
          part.image = localPartsPromos[idx].image;
        }
      });
    }
  } catch (error) {
    console.error("Error fetching landing page data:", error);
  }
});

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section) {
    const offset = 80; // Offset for fixed header
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = section.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}
</script>

<style scoped>
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}

/* Ensure font fallback if IsuzuFont fails */
@font-face {
  font-family: 'IsuzuFont';
  src: local('Impact'), local('Arial Black');
  font-display: swap;
}
</style>