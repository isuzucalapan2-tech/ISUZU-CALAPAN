<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
    <div class="text-center">
      <div class="flex justify-center mb-6">
        <div class="p-4 bg-red-100 rounded-full">
          <CircleAlert :size="64" class="text-red-600" />
        </div>
      </div>

      <h1 class="text-9xl font-extrabold text-gray-900 tracking-widest isuzu-font">
        4<span class="text-red-600">o</span>4
      </h1>
      
      <div class="bg-indigo-600 px-4 text-sm text-white rounded rotate-12 absolute -mt-20 ml-32 hidden sm:block">
        Page Not Found
      </div>
      
      <p class="mt-4 text-gray-600 text-lg max-w-md mx-auto">
        Sorry, the page you are looking for doesn't exist or has been moved to another universe.
      </p>

      <div class="mt-10">
            <router-link 
            to="/" 
            class="group relative inline-flex items-center gap-3 px-8 py-3.5 overflow-hidden rounded-xl bg-slate-900 text-white transition-all duration-300 ease-out hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2"
            >
            <span class="absolute inset-0 w-full h-full bg-linear-to-br from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>
            
            <span class="relative flex items-center gap-2 text-sm tracking-wide uppercase isuzu-font">
                <Home 
                :size="18" 
                class="transition-transform duration-300 group-hover:-translate-y-0.5" 
                />
                Back to Home
            </span>
            </router-link>
        </div>
    </div>
  </div>
</template>

<script setup>
import { CircleAlert, Home } from 'lucide-vue-next';
</script>

<style scoped>
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>
