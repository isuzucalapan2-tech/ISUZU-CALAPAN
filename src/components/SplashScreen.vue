<template>
  <transition name="fade">
    <div v-if="isVisible" class="fixed inset-0 z-100 bg-black flex flex-col justify-between items-center py-16 px-6 overflow-hidden select-none">
      
      <div class="absolute inset-0 z-0 opacity-[0.07]" 
           style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 20px 20px;">
      </div>

      <div class="relative z-10 flex flex-col items-center justify-center grow gap-6">
        
        <img src="/mdoLogo_black.png" alt="Mina De Oro Logo" 
             class="w-28 h-28 md:w-36 md:h-36 object-contain animate-pulse-slow" />

      </div>

      <div class="relative z-10 text-center isuzu-font mt-auto">
        <h1 class="text-sm md:text-2xl tracking-tighter font-black text-red-600 uppercase">ISUZU</h1>
        <p class="text-[5px] md:text-[7px] tracking-[0.4em] text-neutral-500 font-bold uppercase">Calapan City</p>
      </div>

    </div>
  </transition>
</template>

<script setup>
defineProps({
  isVisible: {
    type: Boolean,
    required: true,
    default: true
  }
});
</script>

<style scoped>
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}

@font-face {
  font-family: 'IsuzuFont';
  src: local('Impact'), local('Arial Black');
  font-display: swap;
}

.animate-pulse-slow {
  animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.96);
  }
}

/* Vue Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>