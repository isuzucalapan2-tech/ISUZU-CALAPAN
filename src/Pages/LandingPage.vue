<template>
  <div class="font-sans text-neutral-800">

    <!-- ================= HEADER / NAVBAR ================= -->
    <header class="fixed top-0 left-0 w-full bg-white z-50">
      <div class="max-w-7xl mx-auto flex justify-between py-1 pr-5 md:pr-1 pl-0">
        
        <!-- Logo + Brand (Sagad Left) -->
        <div class="flex items-center space-x-4">
          
          <!-- Logo Image -->
          <img 
            src="/mdoLogo.png" 
            alt="Mina De Oro Motors Logo" 
            class="w-12 h-12 object-contain"
          />

          <!-- Brand Text -->
          <div class="leading-tight">
            <h1 class="text-[10px] md:text-sm font-bold uppercase tracking-wide">
              <span class="text-blue-800">Mina</span>
              <span class="text-yellow-500"> De </span>
              <span class="text-red-600">Oro</span>
            </h1>

            <!-- Divider -->
            <div class="w-25 h-0.5 bg-neutral-700 my-1"></div>

            <p class="text-[6px] md:text-xs text-center font-semibold text-neutral-900 tracking-widest">
              Motors
            </p>
          </div>

        </div>

        <!-- Navigation -->
        <nav class="flex space-x-7 pr-0 relative top-3 isuzu-font">
          <router-link
            to="/register"
            class="text-neutral-800 hover:text-red-600 transition"
          >
            Sign Up
          </router-link>
          <router-link
            to="/login"
            class="text-neutral-800 hover:text-red-600 transition"
          >
            Login
          </router-link>
        </nav>

      </div>
    </header>

    <!-- Add padding-top so content isn't hidden under fixed header -->
    <div class="pt-10">

      <!-- ================= HERO ================= -->
      <section
        class="relative min-h-screen bg-cover bg-center overflow-hidden"
        style="background-image: url('/LDbg.webp');"
      >
        <!-- Dark Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50"></div>
        
        <!-- Top SVG -->
        <div class="absolute top-0 left-0 w-full z-0 opacity-50">
          <svg viewBox="0 0 500 50" xmlns="http://www.w3.org/2000/svg" class="w-full">
            <path 
              d="M0 15 H280 L330 45 H500" 
              class="stroke-red-600 stroke-[1]" 
              fill="none"
            />
          </svg>
        </div>
        

        <!-- LEFT SIDE TEXT -->
        <div class="relative z-10 max-w-2xl text-white px-6 md:px-12 pt-32 md:pt-40">
          <div class="mb-6">
            <h1 class="uppercase leading-none isuzu-font">
              <span class="block text-6xl md:text-6xl tracking-tight">
                I S U Z U
              </span>
              <span class="block text-xl md:text-[ypx] tracking-[0.4em] text-gray-300 mt-2">
                CALAPAN CITY
              </span>
            </h1>
          </div>

          <div class="w-60 h-0.5 bg-red-600/60 mb-6"></div>

          <p class="text-lg md:text-xl text-gray-300 font-semibold max-w-md">
            Power You Can Trust. Performance You Deserve.
          </p>
        </div>

        <!-- RIGHT SIDE BUTTONS (ABSOLUTE POSITION) -->
        <div class="absolute top-1/4 right-12 flex flex-col items-end space-y-6 z-10">
          <button @click="scrollToSection('promos')" class="group flex flex-col items-end">
            <span class="text-white uppercase tracking-[0.2em] text-sm md:text-base font-medium group-hover:text-red-500 transition-colors duration-300 isuzu-font">
              Promos
            </span>
          </button>

          <div class="w-16 h-[1px] bg-gray-500 opacity-50"></div>

          <button @click="scrollToSection('mission-vision')" class="group flex flex-col items-end">
            <span class="text-white uppercase tracking-[0.2em] text-sm md:text-base font-medium group-hover:text-red-500 transition-colors duration-300 isuzu-font">
              Mission & Vision
            </span>
          </button>

          <div class="w-24 h-[1px] bg-gray-500 opacity-50"></div>

          <button @click="scrollToSection('about-us')" class="group flex flex-col items-end">
            <span class="text-white uppercase tracking-[0.2em] text-sm md:text-base font-medium group-hover:text-red-500 transition-colors duration-300 isuzu-font">
              About Us
            </span>
          </button>
        </div>

        <!-- ================== BOTTOM TRANSPARENT CARDS ================== -->
        <div class="absolute bottom-30 left-1/2 transform -translate-x-1/2 w-full px-6 md:px-12 z-10">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">

            <div class="bg-black/40 backdrop-blur-none p-6 rounded-2xl text-white transition">
              <h3 class="text-xl font-bold mb-2">Eco-Friendly Vehicles</h3>

              <div class="w-73 h-0.5 bg-neutral-600 mb-6"></div>
              
              <p class="text-sm opacity-80">
                Our fleet is designed to maximize fuel efficiency and reduce carbon footprint.
              </p>
            </div>

            <div class="bg-black/40 backdrop-blur-none p-6 rounded-2xl text-white transition">
              <h3 class="text-xl font-bold mb-2">Community Events</h3>

              <div class="w-73 h-0.5 bg-neutral-600 mb-6"></div>

              <p class="text-sm opacity-80">
                Join our monthly car meetups and workshops in Calapan City and nearby areas.
              </p>
            </div>

            <div class="bg-black/40 backdrop-blur-none p-6 rounded-2xl text-white transition">
              <h3 class="text-xl font-bold mb-2">24/7 Customer Support</h3>

              <div class="w-73 h-0.5 bg-neutral-600 mb-6"></div>

              <p class="text-sm opacity-80">
                Our team is always ready to assist you with inquiries and emergency services.
              </p>
            </div>

            <div class="bg-black/40 backdrop-blur-none p-6 rounded-2xl text-white transition">
              <h3 class="text-xl font-bold mb-2">Certified Mechanics</h3>

              <div class="w-73 h-0.5 bg-neutral-600 mb-6"></div>

              <p class="text-sm opacity-80">
                Skilled professionals ensuring your vehicle receives top-notch maintenance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= PROMOS ================= -->
      <section id="promos" class="relative py-16 px-6 md:px-16 bg-white text-black relative min-h-screen bg-cover bg-center overflow-hidden;">

        <!-- Top SVG -->
        <div class="absolute top-0 left-0 w-full z-0 opacity-50">
          <svg viewBox="0 0 500 60" xmlns="http://www.w3.org/2000/svg" class="w-full">
            <path 
              d="M0 15 H280 L330 45 H500" 
              class="stroke-red-600 stroke-[1]" 
              fill="none"
            />
          </svg>
        </div>

        <!-- Section Title -->
        <h2 class="text-3xl md:text-4xl text-black text-left mb-12 uppercase tracking-widest isuzu-font">
          Car Promos
        </h2>

        <!-- Car Promos Grid -->
        <div class="mb-16 grid md:grid-cols-3 gap-8">
          <div v-for="car in carPromos" :key="car.name"
            class="bg-neutral-300 rounded-3xl overflow-hidden transition p-6 text-center">

            <div class="h-56 flex items-center justify-center bg-neutral-500 rounded-2xl mb-4">
              <span class="text-neutral-700">Not Available</span>
            </div>

            <h3 class="text-xl isuzu-font mb-2">{{ car.name }}</h3>
            <p class="text-sm text-neutral-800 mb-4">
              {{ car.description }}
            </p>
            <p class="text-red-500 font-bold text-lg">
              {{ car.promo }}
            </p>
          </div>
        </div>

        <div class="w-350 h-0.5 bg-red-600 mb-6"></div>

        <h2 class="text-3xl md:text-4xl text-right mb-12 uppercase tracking-widest isuzu-font">
          Parts Promos
        </h2>

        <!-- Parts Promos Grid -->
        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="part in partsPromos" :key="part.name"
            class="bg-neutral-300 rounded-3xl p-6 transition text-center">

            <div class="h-40 flex items-center justify-center bg-neutral-500 rounded-2xl mb-4">
              <span class="opacity-50">Not Available</span>
            </div>

            <h3 class="tfont-bold text-lg isuzu-font mb-2">
              {{ part.name }}
            </h3>
            <p class="text-sm opacity-80 mb-4">
              {{ part.description }}
            </p>
            <p class="fext-xl font-bold mb-3 text-red-500 ">
              {{ part.promo }}
            </p>
          </div>
        </div>

      </section>

      <!-- ================= MISSION & VISION ================= -->
      <section id="mission-vision" class="py-10 px-6 md:px-16 bg-white">

        <div class="w-350 h-0.5 bg-red-600 mb-6"></div>

        <h2 class="text-3xl md:text-4xl text-left mb-12 text-black uppercase tracking-widest  isuzu-font">
          Mission & Vision
        </h2>

        <div class="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">

          <div class="bg-neutral-300 text-neutral-700 p-8 rounded-3xl">
            <h3 class="text-2xl mb-4 text-red-500 isuzu-font">Mission</h3>
            <p class="leading-relaxed opacity-90">
              Improve transportation of commodities in/out of mindoro province. Provide excellent sales, aftersales, genuine parts and accesories
            </p>
          </div>

          <div class="bg-neutral-300 text-neutral-700 p-8 rounded-3xl">
            <h3 class="text-2xl mb-4 text-red-500 isuzu-font">Vision</h3>
            <p class="leading-relaxed opacity-90">
              Mina De Oro professes to bring Mindoro in becoming an 'ISUZU COUNTRY' and to contribute to the economic progress of the province.
            </p>
          </div>

          <div class="bg-neutral-300 text-neutral-700 p-8 rounded-3xl">
            <h3 class="text-2xl mb-6 text-red-500 isuzu-font">Core Values</h3>

            <div class="text-[13px] grid grid-cols-2 gap-x-10 gap-y-3 leading-relaxed">
              <span>• INNOVATION</span>
              <span>• PASSSION</span>
              <span>• INTEGRITY</span>
              <span>• TRUST</span>
              <span>• TEAMWORK</span>
              <span>• LOYALTY</span>
              <span>• LEADERSHIP</span>
              <span>• COMMITMENT</span>
            </div>
          </div>

        </div>
      </section>

      <!-- ================= ABOUT US ================= -->
      <section id="about-us" class="py-10 px-6 md:px-16 bg-neutral-700 text-white">
        <h2 class="text-3xl md:text-4xl text-center mb-12 uppercase tracking-widest isuzu-font">
          About Us
        </h2>

        <div class="max-w-4xl mx-auto space-y-8 text-center">
          
          <p class="text-base md:text-lg leading-relaxed opacity-90">
            Mina De Oro Motors has been serving Calapan City and the surrounding areas 
            with quality vehicles and exceptional customer service for many years. 
            Our mission is to provide reliable transportation solutions while ensuring 
            every customer receives personalized care and attention.
          </p>

          <p class="text-base md:text-lg leading-relaxed opacity-90">
            Our Inventory Management System ensures that our vehicle parts and accessories 
            are always organized and available, making it easier for our customers to 
            get what they need quickly and efficiently. We take pride in our commitment 
            to excellence and continuous improvement.
          </p>

          <p class="text-base md:text-lg leading-relaxed opacity-90">
            At Mina De Oro Motors, we believe in trust, transparency, and performance. 
            Every vehicle, every service, and every part is handled with care to deliver 
            the quality experience our customers deserve.
          </p>

        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const carPromos = [
  { name: "Soon", description: "Soon", promo: "Soon" },
  { name: "Soon", description: "Soon", promo: "Soon" },
  { name: "Soon", description: "Soon", promo: "Soon" },
];

const partsPromos = [
  { name: "Soon", description: "Soon", promo: "Soon" },
  { name: "Soon", description: "Soon", promo: "Soon" },
  { name: "Soon", description: "Soon", promo: "Soon" }
];

function scrollToAbout() {
    const aboutSection = document.querySelector('#about-us');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)

  if (section) {
    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}
</script>

<style scoped>
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>