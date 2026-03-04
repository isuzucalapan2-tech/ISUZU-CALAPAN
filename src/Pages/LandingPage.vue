<template>
  <div class="font-sans text-neutral-800 overflow-x-hidden">

    <header class="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
      <div class="max-w-7xl mx-auto flex justify-between items-center py-2 px-4 md:px-6">
        
        <div class="flex items-center space-x-3">
          <img 
            src="/mdoLogo.png" 
            alt="Mina De Oro Motors Logo" 
            class="w-10 h-10 md:w-12 md:h-12 object-contain"
          />

          <div class="leading-tight">
            <h1 class="text-xs md:text-sm font-bold uppercase tracking-tight">
              <span class="text-blue-800">Mina</span>
              <span class="text-yellow-500"> De </span>
              <span class="text-red-600">Oro</span>
            </h1>
            <div class="w-full h-[1px] bg-neutral-300 my-0.5 md:my-1"></div>
            <p class="text-[8px] md:text-[10px] text-center font-bold text-neutral-900 uppercase tracking-[0.2em]">
              Motors
            </p>
          </div>
        </div>

        <nav class="flex space-x-4 md:space-x-8 isuzu-font text-[10px] md:text-xs uppercase font-black tracking-widest">
          <router-link to="/register" class="text-neutral-800 hover:text-red-600 transition">Sign Up</router-link>
          <router-link to="/login" class="text-neutral-800 hover:text-red-600 transition">Login</router-link>
        </nav>
      </div>
    </header>

    <div class="pt-14 md:pt-16">

      <section
        class="relative min-h-screen flex flex-col justify-center bg-cover bg-center overflow-hidden px-6 md:px-12 py-20"
        style="background-image: url('/LDbg.webp');"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/40"></div>
        
        <div class="absolute top-0 left-0 w-full z-0 opacity-30 hidden md:block">
          <svg viewBox="0 0 500 50" xmlns="http://www.w3.org/2000/svg" class="w-full">
            <path d="M0 15 H280 L330 45 H500" class="stroke-red-600 stroke-[1]" fill="none"/>
          </svg>
        </div>

        <div class="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div class="text-white space-y-6">
            <div class="space-y-2">
              <h1 class="uppercase leading-none isuzu-font">
                <span class="block text-5xl md:text-7xl lg:text-8xl tracking-tighter">ISUZU</span>
                <span class="block text-base md:text-2xl tracking-[0.3em] text-gray-300">CALAPAN CITY</span>
              </h1>
              <div class="w-20 md:w-32 h-1 bg-red-600"></div>
            </div>
            <p class="text-lg md:text-xl text-gray-300 font-medium max-w-sm leading-relaxed">
              Power You Can Trust. Performance You Deserve.
            </p>
          </div>

          <div class="flex flex-col lg:items-end space-y-4 md:space-y-6">
            <button v-for="link in navLinks" :key="link.id" 
              @click="scrollToSection(link.id)" 
              class="group flex items-center lg:flex-row-reverse gap-4"
            >
              <div class="w-12 h-[1px] bg-red-600 group-hover:w-20 transition-all duration-300"></div>
              <span class="text-white uppercase tracking-[0.2em] text-xs md:text-sm font-bold group-hover:text-red-500 transition-colors isuzu-font">
                {{ link.label }}
              </span>
            </button>
          </div>
        </div>

        <div class="mt-20 md:mt-auto max-w-7xl mx-auto w-full relative z-10 pb-10">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="card in heroCards" :key="card.title" class="bg-black/40 backdrop-blur-md p-5 rounded-xl border border-white/10 text-white hover:bg-black/60 transition-all">
              <h3 class="text-sm font-bold mb-3 uppercase tracking-wider text-red-500">{{ card.title }}</h3>
              <div class="w-10 h-[2px] bg-neutral-600 mb-4"></div>
              <p class="text-xs opacity-70 leading-relaxed">{{ card.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="promos" class="relative py-16 px-6 md:px-16 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <h2 class="text-2xl md:text-4xl text-black uppercase tracking-widest isuzu-font">Car Promos</h2>
            <div class="h-[2px] flex-1 bg-red-600 hidden md:block ml-8"></div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            <div v-for="car in carPromos" :key="car.name" class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all p-5 border border-gray-100">
              <div class="aspect-video flex items-center justify-center bg-gray-200 rounded-xl mb-5">
                <img v-if="car.image" :src="car.image" alt="Car Promo Image" class="w-full h-full object-cover rounded-xl" />
                <span v-else class="text-gray-400 font-bold text-xs uppercase tracking-widest">Image Coming Soon</span>
              </div>
              <h3 class="text-lg isuzu-font mb-2">{{ car.name }}</h3>
              <p class="text-xs text-neutral-500 mb-4">{{ car.description }}</p>
              <p class="text-red-600 font-black text-lg">{{ car.promo }}</p>
            </div>
          </div>

          <div class="flex flex-col md:flex-row-reverse md:items-center justify-between mb-10 gap-4">
            <h2 class="text-2xl md:text-4xl text-black uppercase tracking-widest isuzu-font">Parts Promos</h2>
            <div class="h-[2px] flex-1 bg-red-600 hidden md:block mr-8"></div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="part in partsPromos" :key="part.name" class="bg-neutral-800 text-white rounded-2xl p-6 hover:bg-neutral-900 transition-all">
              <div class="h-32 flex items-center justify-center bg-white/5 rounded-xl mb-5">
                <img v-if="part.image" :src="part.image" alt="Part Promo Image" class="w-full h-full object-cover rounded-xl" />
                <span v-else class="opacity-30 text-[10px] uppercase font-bold tracking-widest">Preview N/A</span>
              </div>
              <h3 class="font-bold text-base isuzu-font mb-2 text-red-500">{{ part.name }}</h3>
              <p class="text-xs opacity-60 mb-4">{{ part.description }}</p>
              <p class="text-lg font-black text-white">{{ part.promo }}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="mission-vision" class="py-20 px-6 md:px-16 bg-white">
        <div class="max-w-7xl mx-auto">
          <div class="w-20 h-1 bg-red-600 mb-6"></div>
          <h2 class="text-2xl md:text-4xl text-left mb-12 text-black uppercase tracking-widest isuzu-font">Mission & Vision</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gray-100 p-8 rounded-2xl hover:border-red-500 border-2 border-transparent transition-all">
              <h3 class="text-xl mb-4 text-red-600 font-black uppercase isuzu-font">Mission</h3>
              <p class="text-sm leading-relaxed text-gray-600">
                {{ brandIdentity.mission }}
              </p>
            </div>
            <div class="bg-gray-100 p-8 rounded-2xl hover:border-red-500 border-2 border-transparent transition-all">
              <h3 class="text-xl mb-4 text-red-600 font-black uppercase isuzu-font">Vision</h3>
              <p class="text-sm leading-relaxed text-gray-600">
                {{ brandIdentity.vision }}
              </p>
            </div>
            <div class="bg-neutral-900 text-white p-8 rounded-2xl">
              <h3 class="text-xl mb-6 text-red-500 font-black uppercase isuzu-font">Core Values</h3>
              <div class="text-[10px] md:text-xs grid grid-cols-2 gap-3 font-bold tracking-wider">
                <span v-for="val in brandIdentity.coreValues" :key="val" class="flex items-center gap-2">
                  <span class="w-1 h-1 bg-red-500"></span> {{ val }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- About Us Section -->
      <section id="about-us" class="py-20 px-6 md:px-16 bg-neutral-800 text-white">
        <div class="max-w-4xl mx-auto text-center space-y-10">
          <h2 class="text-2xl md:text-4xl uppercase tracking-widest isuzu-font">About Us</h2>
          <div class="space-y-6 text-sm md:text-base text-gray-300 leading-loose">
            <p>{{ aboutUs.aboutTextLine1 }}</p>
            <p>{{ aboutUs.aboutTextLine2 }}</p>
            <div class="pt-6">
              <p class="isuzu-font text-red-500 tracking-widest text-lg md:text-xl">{{ aboutUs.slogan }}</p>
            </div>
          </div>
        </div>
      </section>

      <footer class="bg-neutral-900 py-6 text-center border-t border-white/5">
        <p class="text-[10px] text-gray-500 uppercase tracking-[0.3em]">© 2026 Mina De Oro Motors. All Rights Reserved.</p>
      </footer>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../Firebase/Firebase";

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

let unsubscribe = null;

onMounted(() => {
  const landingDoc = doc(db, "settings", "landingPage");
  unsubscribe = onSnapshot(landingDoc, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      carPromos.value = Array.isArray(data.carPromos) ? JSON.parse(JSON.stringify(data.carPromos)) : [];
      partsPromos.value = Array.isArray(data.partsPromos) ? JSON.parse(JSON.stringify(data.partsPromos)) : [];
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
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
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