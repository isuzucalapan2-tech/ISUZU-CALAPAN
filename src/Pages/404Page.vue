<template>
  <div class="min-h-screen bg-[#111111] flex flex-col items-center justify-center px-6 text-center font-sans">

    <div class="relative flex flex-col items-center">
      
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-[15rem] md:text-[25rem] font-light text-white/5 select-none leading-none isuzu-font">
          4O4
        </span>
      </div>

      <div class="relative z-10">
        
        <h1 class="text-3xl md:text-4xl font-light text-white mb-4">
          Page Not Found
        </h1>

        <div class="space-y-4">
          <p class="text-[#999999] text-sm md:text-base max-w-xs mx-auto">
            Oops! It seems the page you are looking for has moved or no longer exists.
          </p>

          <p class="mt-8">
            <router-link 
              to="/" 
              class="inline-flex items-center gap-2 text-[#0063dc] hover:text-[#2d88ff] transition-colors text-sm md:text-base font-medium"
            >
              <HouseIcon :size="18" />
              Return to the home
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  House as HouseIcon, 
} from 'lucide-vue-next';
</script>

<style scoped>
div {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>