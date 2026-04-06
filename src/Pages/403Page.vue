<template>
  <div class="min-h-screen bg-[#111111] flex flex-col items-center justify-center px-6 text-center font-sans">

    <div class="relative flex flex-col items-center">
      
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-[15rem] md:text-[25rem] font-light text-white/5 select-none leading-none isuzu-font">
          4O3
        </span>
      </div>

      <div class="relative z-10">

        <h1 class="text-3xl md:text-4xl font-light text-[#eeeeee] mb-4">
          Access Forbidden
        </h1>

        <div class="space-y-4">
          <p class="text-[#999999] text-sm md:text-base max-w-sm mx-auto">
            You do not have the necessary permissions to access this specific area of our service.
          </p>

          <p class="mt-8">
            <router-link 
              to="/" 
              class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-500 transition-colors text-sm md:text-base font-medium"
            >
              <ShieldCheckIcon :size="18" />
              Here is a link to the home
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
ShieldCheck as ShieldCheckIcon
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