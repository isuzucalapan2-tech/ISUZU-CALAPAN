<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
    <div class="text-center">
      <div class="flex justify-center mb-6">
        <div class="p-4 bg-amber-100 rounded-full">
          <LockKeyhole :size="64" class="text-amber-600" />
        </div>
      </div>

      <h1 class="text-9xl font-extrabold text-gray-900 tracking-widest isuzu-font">
        4<span class="text-amber-600">0</span>1
      </h1>
      
      <div class="bg-indigo-600 px-4 text-sm text-white rounded -rotate-12 absolute -mt-20 ml-32 hidden sm:block">
        Unauthorized Access
      </div>
      
      <p class="mt-4 text-gray-600 text-lg max-w-md mx-auto">
        Whoops! You need to be logged in to view this page. Please sign in to continue.
      </p>

      <div class="mt-10">
        <router-link to="/login" class="group relative inline-flex items-center gap-3 px-8 py-3.5 overflow-hidden rounded-xl bg-slate-900 text-white transition-all duration-300 ease-out hover:ring-2 hover:ring-amber-500 hover:ring-offset-2">
          <span class="absolute inset-0 w-full h-full bg-linear-to-br from-amber-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>
          <span class="relative flex items-center gap-2 text-sm tracking-wide uppercase isuzu-font">
            <LogIn :size="18" />
            Return
          </span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { LockKeyhole, LogIn } from 'lucide-vue-next';
</script>

<style scoped>
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>
